"use client"

import { useState, useEffect, useCallback } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { toast } from "sonner"

interface Report {
  id: string
  title: string
  type: 'ventas' | 'marketing' | 'financiero' | 'proyecto' | 'general'
  content: string
  data: string
  status: 'draft' | 'generated' | 'exported'
  createdAt: Date
  updatedAt: Date
}

interface UseReportsWebRTCReturn {
  isSessionActive: boolean
  isListening: boolean
  startSession: () => void
  stopSession: () => void
  currentTranscription: string
  isProcessingVoice: boolean
  currentField: string | null
  reports: Report[]
  currentReport: Report
  isCreatingReport: boolean
  createReport: () => void
  saveReport: (reportData?: Partial<Report>) => void
  deleteReport: (id: string) => void
  goHome: () => void
  goToCampaigns: () => void
  goToNotes: () => void
  setReportTitle: (params: { title: string }) => void
  setReportType: (params: { type: string }) => void
  setReportContent: (params: { content: string }) => void
  setReportData: (params: { data: string }) => void
}

export function useReportsWebRTC(): UseReportsWebRTCReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [currentReport, setCurrentReport] = useState<Report>({
    id: "",
    title: "",
    type: 'general',
    content: "",
    data: "",
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  
  // Log para debuggear el estado
  useEffect(() => {
    console.log("isCreatingReport changed to:", isCreatingReport)
  }, [isCreatingReport])
  const [currentField, setCurrentField] = useState<string | null>(null)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")

  // Usar el hook de WebRTC principal
  const {
    isSessionActive,
    startSession: startSessionOriginal,
    stopSession,
    registerFunction
  } = useWebRTCAudioSession("ash", [], { report: true })

  // Wrapper para evitar el toast automático
  const startSessionSilent = () => {
    startSessionOriginal()
  }

  // Función para ir al home
  const goHome = () => {
    window.location.href = "/"
  }

  // Función para ir a campañas
  const goToCampaigns = () => {
    window.location.href = "/campaigns"
  }

  // Función para ir a notas
  const goToNotes = () => {
    window.location.href = "/notes"
  }

  // Función para crear reporte
  const createReport = () => {
    console.log("createReport called - setting isCreatingReport to true")
    setIsCreatingReport(true)
    setCurrentReport({
      id: "",
      title: "",
      type: 'general',
      content: "",
      data: "",
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    toast.success("¡Creando nuevo reporte! 📊", {
      description: "Di el título y tipo de tu reporte."
    })
  }

  // Función para guardar reporte
  const saveReport = (reportData?: Partial<Report>) => {
    // Si no hay datos proporcionados, intentar obtener del DOM
    if (!reportData) {
      // Intentar obtener datos directamente del DOM
      const titleInput = document.querySelector('input[placeholder*="título"], input[placeholder*="title"]') as HTMLInputElement
      const typeSelect = document.querySelector('select') as HTMLSelectElement
      const contentTextarea = document.querySelector('textarea[placeholder*="contenido"], textarea[placeholder*="content"]') as HTMLTextAreaElement
      const dataTextarea = document.querySelector('textarea[placeholder*="datos"], textarea[placeholder*="data"]') as HTMLTextAreaElement
      
      const title = titleInput?.value || currentReport.title
      const type = typeSelect?.value || currentReport.type
      const content = contentTextarea?.value || currentReport.content
      const data = dataTextarea?.value || currentReport.data
      
      if (!title || !type) {
        toast.error("El reporte debe tener título y tipo")
        return
      }

      const newReport: Report = {
        id: Date.now().toString(),
        title,
        type: type as Report['type'],
        content,
        data,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setReports(prev => [newReport, ...prev])
      setCurrentReport({
        id: "",
        title: "",
        type: 'general',
        content: "",
        data: "",
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setIsCreatingReport(false)
      
      // Limpiar campos del DOM
      if (titleInput) titleInput.value = ""
      if (typeSelect) typeSelect.value = ""
      if (contentTextarea) contentTextarea.value = ""
      if (dataTextarea) dataTextarea.value = ""
      
      toast.success("¡Reporte generado exitosamente! 📊", {
        description: `"${newReport.title}" ha sido generado.`,
        duration: 3000
      })
      
      const event = new CustomEvent('reportSaved')
      document.dispatchEvent(event)
      
      return
    }
    
    const title = reportData.title || currentReport.title
    const type = reportData.type || currentReport.type
    const content = reportData.content || currentReport.content
    const data = reportData.data || currentReport.data
    
    if (!title || !type) {
      toast.error("El reporte debe tener título y tipo")
      return
    }

    const newReport: Report = {
      id: Date.now().toString(),
      title,
      type: type as Report['type'],
      content,
      data,
      status: 'generated',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setReports(prev => [newReport, ...prev])
    setCurrentReport({
      id: "",
      title: "",
      type: 'general',
      content: "",
      data: "",
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    setIsCreatingReport(false)
    
    toast.success("¡Reporte generado exitosamente! 📊", {
      description: `"${newReport.title}" ha sido generado.`,
      duration: 3000
    })
    
    const event = new CustomEvent('reportSaved')
    document.dispatchEvent(event)
  }

  // Función para eliminar reporte
  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id))
    toast.success("Reporte eliminado")
  }

  // Función para que la IA establezca el título
  const setReportTitle = ({ title }: { title: string }) => {
    setCurrentField('title')
    setIsProcessingVoice(true)
    setCurrentTranscription(title)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToReports', {
      detail: { field: 'title', text: title }
    })
    document.dispatchEvent(event)
    
    toast.success("Título establecido", {
      description: `"${title}" ha sido agregado como título.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, title, message: `He establecido el título como "${title}".` }
  }

  // Función para que la IA establezca el tipo
  const setReportType = ({ type }: { type: string }) => {
    setCurrentField('type')
    setIsProcessingVoice(true)
    setCurrentTranscription(type)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToReports', {
      detail: { field: 'type', text: type }
    })
    document.dispatchEvent(event)
    
    toast.success("Tipo establecido", {
      description: `"${type}" ha sido establecido como tipo de reporte.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, type, message: `He establecido el tipo como "${type}".` }
  }

  // Función para que la IA establezca el contenido
  const setReportContent = ({ content }: { content: string }) => {
    setCurrentField('content')
    setIsProcessingVoice(true)
    setCurrentTranscription(content)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToReports', {
      detail: { field: 'content', text: content }
    })
    document.dispatchEvent(event)
    
    toast.success("Contenido establecido", {
      description: `El contenido ha sido agregado al reporte.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, content, message: `He establecido el contenido del reporte.` }
  }

  // Función para que la IA establezca los datos
  const setReportData = ({ data }: { data: string }) => {
    setCurrentField('data')
    setIsProcessingVoice(true)
    setCurrentTranscription(data)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToReports', {
      detail: { field: 'data', text: data }
    })
    document.dispatchEvent(event)
    
    toast.success("Datos establecidos", {
      description: `Los datos adicionales han sido agregados al reporte.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, data, message: `He establecido los datos adicionales del reporte.` }
  }

  // Procesar transcripción de voz
  const processVoiceInput = useCallback((text: string) => {
    // Validar que text no sea undefined o null
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input:', text)
      return
    }
    
    console.log('Processing voice input:', text)
    setIsProcessingVoice(true)
    setCurrentTranscription(text)
    
    // Procesar comandos de navegación
    if (text.toLowerCase().includes('volver') || text.toLowerCase().includes('home') || text.toLowerCase().includes('inicio')) {
      goHome()
      return
    }
    
    if (text.toLowerCase().includes('ir a campañas') || text.toLowerCase().includes('campañas') || text.toLowerCase().includes('marketing')) {
      goToCampaigns()
      return
    }
    
    if (text.toLowerCase().includes('ir a notas') || text.toLowerCase().includes('notas')) {
      goToNotes()
      return
    }
    
    // Procesar comandos de reportes
    if (text.toLowerCase().includes('crear reporte') || text.toLowerCase().includes('nuevo reporte')) {
      console.log("Voice command detected: crear reporte")
      createReport()
      return
    }
    
    if (text.toLowerCase().includes('guardar') || text.toLowerCase().includes('save')) {
      // Disparar evento para que el componente guarde con los campos locales
      const event = new CustomEvent('voiceInputToReports', {
        detail: { field: 'save' }
      })
      document.dispatchEvent(event)
      return
    }
    
    // Procesar contenido de reporte si estamos creando uno
    if (isCreatingReport) {
      if (text.toLowerCase().includes('título') || text.toLowerCase().includes('titulo') || text.toLowerCase().includes('nombre')) {
        setCurrentField('title')
        setCurrentReport(prev => ({ ...prev, title: text }))
      } else if (text.toLowerCase().includes('tipo')) {
        setCurrentField('type')
        setCurrentReport(prev => ({ ...prev, type: text as Report['type'] }))
      } else if (text.toLowerCase().includes('contenido') || text.toLowerCase().includes('texto')) {
        setCurrentField('content')
        setCurrentReport(prev => ({ ...prev, content: text }))
      } else if (text.toLowerCase().includes('datos') || text.toLowerCase().includes('data')) {
        setCurrentField('data')
        setCurrentReport(prev => ({ ...prev, data: text }))
      } else {
        // Si no hay campo específico, llenar el campo actual
        if (currentField === 'title') {
          setCurrentReport(prev => ({ ...prev, title: text }))
        } else if (currentField === 'type') {
          setCurrentReport(prev => ({ ...prev, type: text as Report['type'] }))
        } else if (currentField === 'content') {
          setCurrentReport(prev => ({ ...prev, content: text }))
        } else if (currentField === 'data') {
          setCurrentReport(prev => ({ ...prev, data: text }))
        }
      }
    }
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
  }, [isCreatingReport, currentField])

  // Escuchar transcripción de voz del sistema WebRTC
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const { text, field } = event.detail
      
      // Si es un evento de campo específico (como 'save'), no procesar como texto
      if (field) {
        return
      }
      
      // Si hay texto, procesarlo
      if (text && typeof text === 'string') {
        processVoiceInput(text)
      }
    }

    document.addEventListener('voiceInputToReports', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToReports', handleVoiceInput as EventListener)
    }
  }, [isCreatingReport, currentField, processVoiceInput])

  // Escuchar eventos personalizados para funciones de reportes
  useEffect(() => {
    const handleCreateReport = () => {
      console.log("Event received: createReport")
      createReport()
    }

    const handleSaveReport = () => {
      console.log("Event received: saveReport")
      saveReport()
    }

    const handleSetReportTitle = (event: CustomEvent) => {
      console.log("Event received: setReportTitle", event.detail)
      const { title } = event.detail
      setReportTitle({ title })
    }

    const handleSetReportType = (event: CustomEvent) => {
      console.log("Event received: setReportType", event.detail)
      const { type } = event.detail
      setReportType({ type })
    }

    const handleSetReportContent = (event: CustomEvent) => {
      console.log("Event received: setReportContent", event.detail)
      const { content } = event.detail
      setReportContent({ content })
    }

    const handleSetReportData = (event: CustomEvent) => {
      console.log("Event received: setReportData", event.detail)
      const { data } = event.detail
      setReportData({ data })
    }

    // Registrar listeners
    document.addEventListener('createReport', handleCreateReport)
    document.addEventListener('saveReport', handleSaveReport)
    document.addEventListener('setReportTitle', handleSetReportTitle as EventListener)
    document.addEventListener('setReportType', handleSetReportType as EventListener)
    document.addEventListener('setReportContent', handleSetReportContent as EventListener)
    document.addEventListener('setReportData', handleSetReportData as EventListener)
    
    return () => {
      document.removeEventListener('createReport', handleCreateReport)
      document.removeEventListener('saveReport', handleSaveReport)
      document.removeEventListener('setReportTitle', handleSetReportTitle as EventListener)
      document.removeEventListener('setReportType', handleSetReportType as EventListener)
      document.removeEventListener('setReportContent', handleSetReportContent as EventListener)
      document.removeEventListener('setReportData', handleSetReportData as EventListener)
    }
  }, [])

  // No necesitamos registrar funciones aquí, usaremos eventos personalizados

  return {
    isSessionActive,
    isListening: isSessionActive,
    startSession: startSessionSilent,
    stopSession,
    currentTranscription,
    isProcessingVoice,
    currentField,
    reports,
    currentReport,
    isCreatingReport,
    createReport,
    saveReport,
    deleteReport,
    goHome,
    goToCampaigns,
    goToNotes,
    setReportTitle,
    setReportType,
    setReportContent,
    setReportData
  }
}
