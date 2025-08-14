"use client"

import { useState, useEffect } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { toast } from "sonner"

interface Campaign {
  id: string
  title: string
  description: string
  targetAudience: string
  budget: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
}

interface UseCampaignsWebRTCReturn {
  isSessionActive: boolean
  isListening: boolean
  startSession: () => void
  stopSession: () => void
  currentTranscription: string
  isProcessingVoice: boolean
  currentField: string | null
  campaigns: Campaign[]
  currentCampaign: Campaign
  isCreatingCampaign: boolean
  createCampaign: () => void
  saveCampaign: (campaignData?: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  goHome: () => void
  setCampaignTitle: (params: { title: string }) => void
  setCampaignDescription: (params: { description: string }) => void
  setCampaignTargetAudience: (params: { targetAudience: string }) => void
  setCampaignBudget: (params: { budget: string }) => void
  setCampaignStartDate: (params: { startDate: string }) => void
  setCampaignEndDate: (params: { endDate: string }) => void
}

export function useCampaignsWebRTC(): UseCampaignsWebRTCReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>({
    id: "",
    title: "",
    description: "",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [currentField, setCurrentField] = useState<string | null>(null)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")

  // Usar el hook de WebRTC principal
  const {
    isSessionActive,
    startSession: startSessionOriginal,
    stopSession,
    registerFunction
  } = useWebRTCAudioSession("ash", [], { campaign: true })

  // Wrapper para evitar el toast automático
  const startSessionSilent = () => {
    startSessionOriginal()
  }

  // Función para ir al home
  const goHome = () => {
    window.location.href = "/"
  }

  // Función para crear campaña
  const createCampaign = () => {
    setIsCreatingCampaign(true)
    setCurrentCampaign({
      id: "",
      title: "",
      description: "",
      targetAudience: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    toast.success("¡Creando nueva campaña! 🎯", {
      description: "Di el título y descripción de tu campaña."
    })
  }

  // Función para guardar campaña
  const saveCampaign = (campaignData?: Partial<Campaign>) => {
    // Si no hay datos proporcionados, intentar obtener del DOM
    if (!campaignData) {
      // Intentar obtener datos directamente del DOM
      const titleInput = document.querySelector('input[placeholder*="título"], input[placeholder*="title"]') as HTMLInputElement
      const descriptionTextarea = document.querySelector('textarea[placeholder*="descripción"], textarea[placeholder*="description"]') as HTMLTextAreaElement
      const targetAudienceInput = document.querySelector('input[placeholder*="audiencia"], input[placeholder*="audience"]') as HTMLInputElement
      const budgetInput = document.querySelector('input[placeholder*="presupuesto"], input[placeholder*="budget"]') as HTMLInputElement
      const startDateInput = document.querySelector('input[type="date"]:nth-of-type(1)') as HTMLInputElement
      const endDateInput = document.querySelector('input[type="date"]:nth-of-type(2)') as HTMLInputElement
      
      const title = titleInput?.value || currentCampaign.title
      const description = descriptionTextarea?.value || currentCampaign.description
      const targetAudience = targetAudienceInput?.value || currentCampaign.targetAudience
      const budget = budgetInput?.value || currentCampaign.budget
      const startDate = startDateInput?.value || currentCampaign.startDate
      const endDate = endDateInput?.value || currentCampaign.endDate
      
      if (!title || !description) {
        toast.error("La campaña debe tener título y descripción")
        return
      }

      const newCampaign: Campaign = {
        id: Date.now().toString(),
        title,
        description,
        targetAudience,
        budget,
        startDate,
        endDate,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setCampaigns(prev => [newCampaign, ...prev])
      setCurrentCampaign({
        id: "",
        title: "",
        description: "",
        targetAudience: "",
        budget: "",
        startDate: "",
        endDate: "",
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setIsCreatingCampaign(false)
      
      // Limpiar campos del DOM
      if (titleInput) titleInput.value = ""
      if (descriptionTextarea) descriptionTextarea.value = ""
      if (targetAudienceInput) targetAudienceInput.value = ""
      if (budgetInput) budgetInput.value = ""
      if (startDateInput) startDateInput.value = ""
      if (endDateInput) endDateInput.value = ""
      
      toast.success("¡Campaña guardada exitosamente! 🎯", {
        description: `"${newCampaign.title}" ha sido guardada.`,
        duration: 3000
      })
      
      const event = new CustomEvent('campaignSaved')
      document.dispatchEvent(event)
      
      return
    }
    
    const title = campaignData.title || currentCampaign.title
    const description = campaignData.description || currentCampaign.description
    const targetAudience = campaignData.targetAudience || currentCampaign.targetAudience
    const budget = campaignData.budget || currentCampaign.budget
    const startDate = campaignData.startDate || currentCampaign.startDate
    const endDate = campaignData.endDate || currentCampaign.endDate
    
    if (!title || !description) {
      toast.error("La campaña debe tener título y descripción")
      return
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      title,
      description,
      targetAudience,
      budget,
      startDate,
      endDate,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCampaigns(prev => [newCampaign, ...prev])
    setCurrentCampaign({
      id: "",
      title: "",
      description: "",
      targetAudience: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    setIsCreatingCampaign(false)
    
    toast.success("¡Campaña guardada exitosamente! 🎯", {
      description: `"${newCampaign.title}" ha sido guardada.`,
      duration: 3000
    })
    
    const event = new CustomEvent('campaignSaved')
    document.dispatchEvent(event)
  }

  // Función para eliminar campaña
  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
    toast.success("Campaña eliminada")
  }

  // Función para que la IA establezca el título
  const setCampaignTitle = ({ title }: { title: string }) => {
    setCurrentField('title')
    setIsProcessingVoice(true)
    setCurrentTranscription(title)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
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

  // Función para que la IA establezca la descripción
  const setCampaignDescription = ({ description }: { description: string }) => {
    setCurrentField('description')
    setIsProcessingVoice(true)
    setCurrentTranscription(description)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
      detail: { field: 'description', text: description }
    })
    document.dispatchEvent(event)
    
    toast.success("Descripción establecida", {
      description: `La descripción ha sido agregada a la campaña.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, description, message: `He establecido la descripción de la campaña.` }
  }

  // Función para que la IA establezca la audiencia objetivo
  const setCampaignTargetAudience = ({ targetAudience }: { targetAudience: string }) => {
    setCurrentField('targetAudience')
    setIsProcessingVoice(true)
    setCurrentTranscription(targetAudience)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
      detail: { field: 'targetAudience', text: targetAudience }
    })
    document.dispatchEvent(event)
    
    toast.success("Audiencia objetivo establecida", {
      description: `"${targetAudience}" ha sido establecida como audiencia objetivo.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, targetAudience, message: `He establecido la audiencia objetivo como "${targetAudience}".` }
  }

  // Función para que la IA establezca el presupuesto
  const setCampaignBudget = ({ budget }: { budget: string }) => {
    setCurrentField('budget')
    setIsProcessingVoice(true)
    setCurrentTranscription(budget)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
      detail: { field: 'budget', text: budget }
    })
    document.dispatchEvent(event)
    
    toast.success("Presupuesto establecido", {
      description: `"${budget}" ha sido establecido como presupuesto.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, budget, message: `He establecido el presupuesto como "${budget}".` }
  }

  // Función para que la IA establezca la fecha de inicio
  const setCampaignStartDate = ({ startDate }: { startDate: string }) => {
    setCurrentField('startDate')
    setIsProcessingVoice(true)
    setCurrentTranscription(startDate)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
      detail: { field: 'startDate', text: startDate }
    })
    document.dispatchEvent(event)
    
    toast.success("Fecha de inicio establecida", {
      description: `"${startDate}" ha sido establecida como fecha de inicio.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, startDate, message: `He establecido la fecha de inicio como "${startDate}".` }
  }

  // Función para que la IA establezca la fecha de fin
  const setCampaignEndDate = ({ endDate }: { endDate: string }) => {
    setCurrentField('endDate')
    setIsProcessingVoice(true)
    setCurrentTranscription(endDate)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToCampaigns', {
      detail: { field: 'endDate', text: endDate }
    })
    document.dispatchEvent(event)
    
    toast.success("Fecha de fin establecida", {
      description: `"${endDate}" ha sido establecida como fecha de fin.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, endDate, message: `He establecido la fecha de fin como "${endDate}".` }
  }

  // Procesar transcripción de voz
  const processVoiceInput = (text: string) => {
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
    
    // Procesar comandos de campañas
    if (text.toLowerCase().includes('crear campaña') || text.toLowerCase().includes('nueva campaña')) {
      createCampaign()
      return
    }
    
    if (text.toLowerCase().includes('guardar') || text.toLowerCase().includes('save')) {
      // Disparar evento para que el componente guarde con los campos locales
      const event = new CustomEvent('voiceInputToCampaigns', {
        detail: { field: 'save' }
      })
      document.dispatchEvent(event)
      return
    }
    
    // Procesar contenido de campaña si estamos creando una
    if (isCreatingCampaign) {
      if (text.toLowerCase().includes('título') || text.toLowerCase().includes('titulo') || text.toLowerCase().includes('nombre')) {
        setCurrentField('title')
        setCurrentCampaign(prev => ({ ...prev, title: text }))
      } else if (text.toLowerCase().includes('descripción') || text.toLowerCase().includes('descripcion') || text.toLowerCase().includes('texto')) {
        setCurrentField('description')
        setCurrentCampaign(prev => ({ ...prev, description: text }))
      } else if (text.toLowerCase().includes('audiencia') || text.toLowerCase().includes('objetivo') || text.toLowerCase().includes('target')) {
        setCurrentField('targetAudience')
        setCurrentCampaign(prev => ({ ...prev, targetAudience: text }))
      } else if (text.toLowerCase().includes('presupuesto') || text.toLowerCase().includes('budget')) {
        setCurrentField('budget')
        setCurrentCampaign(prev => ({ ...prev, budget: text }))
      } else if (text.toLowerCase().includes('fecha inicio') || text.toLowerCase().includes('inicio')) {
        setCurrentField('startDate')
        setCurrentCampaign(prev => ({ ...prev, startDate: text }))
      } else if (text.toLowerCase().includes('fecha fin') || text.toLowerCase().includes('fin')) {
        setCurrentField('endDate')
        setCurrentCampaign(prev => ({ ...prev, endDate: text }))
      } else {
        // Si no hay campo específico, llenar el campo actual
        if (currentField === 'title') {
          setCurrentCampaign(prev => ({ ...prev, title: text }))
        } else if (currentField === 'description') {
          setCurrentCampaign(prev => ({ ...prev, description: text }))
        } else if (currentField === 'targetAudience') {
          setCurrentCampaign(prev => ({ ...prev, targetAudience: text }))
        } else if (currentField === 'budget') {
          setCurrentCampaign(prev => ({ ...prev, budget: text }))
        } else if (currentField === 'startDate') {
          setCurrentCampaign(prev => ({ ...prev, startDate: text }))
        } else if (currentField === 'endDate') {
          setCurrentCampaign(prev => ({ ...prev, endDate: text }))
        }
      }
    }
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
  }

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

    document.addEventListener('voiceInputToCampaigns', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToCampaigns', handleVoiceInput as EventListener)
    }
  }, [isCreatingCampaign, currentField])

  // Registrar funciones con el sistema WebRTC
  useEffect(() => {
    if (isSessionActive) {
      // Registrar las funciones de campañas
      registerFunction('createCampaign', createCampaign)
      registerFunction('saveCampaign', saveCampaign)
      registerFunction('goHome', goHome)
      registerFunction('setCampaignTitle', setCampaignTitle)
      registerFunction('setCampaignDescription', setCampaignDescription)
      registerFunction('setCampaignTargetAudience', setCampaignTargetAudience)
      registerFunction('setCampaignBudget', setCampaignBudget)
      registerFunction('setCampaignStartDate', setCampaignStartDate)
      registerFunction('setCampaignEndDate', setCampaignEndDate)
    }
  }, [isSessionActive, registerFunction])

  return {
    isSessionActive,
    isListening: isSessionActive,
    startSession: startSessionSilent,
    stopSession,
    currentTranscription,
    isProcessingVoice,
    currentField,
    campaigns,
    currentCampaign,
    isCreatingCampaign,
    createCampaign,
    saveCampaign,
    deleteCampaign,
    goHome,
    setCampaignTitle,
    setCampaignDescription,
    setCampaignTargetAudience,
    setCampaignBudget,
    setCampaignStartDate,
    setCampaignEndDate
  }
}
