"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface UseNotesWebRTCReturn {
  isSessionActive: boolean
  isListening: boolean
  startSession: () => void
  stopSession: () => void
  currentTranscription: string
  isProcessingVoice: boolean
  currentField: string
  notes: Note[]
  currentNote: Partial<Note>
  isCreatingNote: boolean
  createNote: () => void
  saveNote: () => void
  deleteNote: (id: string) => void
  goHome: () => void
  setNoteTitle: (params: { title: string }) => { success: boolean; title: string; message: string }
  setNoteContent: (params: { content: string }) => { success: boolean; content: string; message: string }
  addNoteTag: (params: { tag: string }) => { success: boolean; tag: string; message: string }
}

export function useNotesWebRTC(): UseNotesWebRTCReturn {
  
  // Estados de WebRTC
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [currentField, setCurrentField] = useState("")
  
  // Usar el sistema real de WebRTC
  const {
    isSessionActive,
    startSession,
    stopSession,
    registerFunction
  } = useWebRTCAudioSession("ash", tools, { notes: true })
  
  // Función personalizada para iniciar sesión sin toast
  const startSessionSilent = () => {
    startSession()
  }
  
  // Estados de notas
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    tags: []
  })
  const [isCreatingNote, setIsCreatingNote] = useState(false)

  // Registrar funciones específicas para notas
  useEffect(() => {
    registerFunction('createNote', createNote)
    registerFunction('saveNote', saveNote)
    registerFunction('goHome', goHome)
    registerFunction('setNoteTitle', setNoteTitle)
    registerFunction('setNoteContent', setNoteContent)
    registerFunction('addNoteTag', addNoteTag)
  }, []) // Solo se ejecuta una vez al montar el componente

  // Función para volver al home
  const goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  // Función para crear nota
  const createNote = () => {
    setIsCreatingNote(true)
    setCurrentNote({ title: "", content: "", tags: [] })
    toast.success("¡Creando nueva nota! 📝", {
      description: "Di el título y contenido de tu nota."
    })
  }

  // Función para guardar nota
  const saveNote = (noteData?: { title: string; content: string; tags?: string[] }) => {
    const title = noteData?.title || currentNote.title
    const content = noteData?.content || currentNote.content
    const tags = noteData?.tags || currentNote.tags || []
    
    if (!title || !content) {
      toast.error("La nota debe tener título y contenido")
      return
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setNotes(prev => [newNote, ...prev])
    setCurrentNote({ title: "", content: "", tags: [] })
    setIsCreatingNote(false)
    
    // Animación de confirmación
    toast.success("¡Nota guardada exitosamente! 💾", {
      description: `"${newNote.title}" ha sido guardada.`,
      duration: 3000
    })
    
    // Disparar evento para confeti
    const event = new CustomEvent('noteSaved')
    document.dispatchEvent(event)
    
    // Disparar evento para presionar botón automáticamente
    const saveEvent = new CustomEvent('voiceInputToNotes', {
      detail: { field: 'save' }
    })
    document.dispatchEvent(saveEvent)
    
    return { 
      success: true, 
      note: newNote, 
      message: `¡Perfecto! He guardado la nota "${newNote.title}" exitosamente. La nota está ahora en tu lista de notas.` 
    }
  }

  // Función para eliminar nota
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
    toast.success("Nota eliminada")
  }

  // Función para que la IA establezca el título
  const setNoteTitle = ({ title }: { title: string }) => {
    setCurrentField('title')
    setIsProcessingVoice(true)
    setCurrentTranscription(title)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToNotes', {
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

  // Función para que la IA establezca el contenido
  const setNoteContent = ({ content }: { content: string }) => {
    setCurrentField('content')
    setIsProcessingVoice(true)
    setCurrentTranscription(content)
    
    // Disparar evento para actualizar campo
    const event = new CustomEvent('voiceInputToNotes', {
      detail: { field: 'content', text: content }
    })
    document.dispatchEvent(event)
    
    toast.success("Contenido establecido", {
      description: `El contenido ha sido agregado a la nota.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, content, message: `He establecido el contenido de la nota.` }
  }

  // Función para que la IA agregue etiquetas
  const addNoteTag = ({ tag }: { tag: string }) => {
    setCurrentNote(prev => ({ 
      ...prev, 
      tags: [...(prev.tags || []), tag]
    }))
    setCurrentField('tags')
    setIsProcessingVoice(true)
    setCurrentTranscription(tag)
    
    toast.success("Etiqueta agregada", {
      description: `"${tag}" ha sido agregada como etiqueta.`
    })
    
    setTimeout(() => {
      setIsProcessingVoice(false)
      setCurrentTranscription("")
    }, 2000)
    
    return { success: true, tag, message: `He agregado "${tag}" como etiqueta.` }
  }

  // Procesar transcripción de voz
  const processVoiceInput = (text: string) => {
    console.log('Processing voice input:', text)
    setIsProcessingVoice(true)
    setCurrentTranscription(text)
    
    // Procesar comandos de navegación
    if (text.toLowerCase().includes('volver') || text.toLowerCase().includes('home') || text.toLowerCase().includes('inicio')) {
      goHome()
      return
    }
    
    // Procesar comandos de notas
    if (text.toLowerCase().includes('crear nota') || text.toLowerCase().includes('nueva nota')) {
      createNote()
      return
    }
    
    if (text.toLowerCase().includes('guardar') || text.toLowerCase().includes('save')) {
      saveNote()
      return
    }
    
    // Procesar contenido de nota si estamos creando una
    if (isCreatingNote) {
      if (text.toLowerCase().includes('título') || text.toLowerCase().includes('titulo') || text.toLowerCase().includes('nombre')) {
        setCurrentField('title')
        setCurrentNote(prev => ({ ...prev, title: text }))
      } else if (text.toLowerCase().includes('contenido') || text.toLowerCase().includes('texto') || text.toLowerCase().includes('nota')) {
        setCurrentField('content')
        setCurrentNote(prev => ({ ...prev, content: text }))
      } else if (text.toLowerCase().includes('etiqueta') || text.toLowerCase().includes('tag')) {
        setCurrentField('tags')
        const newTag = text.replace(/etiqueta|tag/gi, '').trim()
        if (newTag) {
          setCurrentNote(prev => ({ 
            ...prev, 
            tags: [...(prev.tags || []), newTag]
          }))
        }
      } else {
        // Si no hay campo específico, llenar el campo actual
        if (currentField === 'title') {
          setCurrentNote(prev => ({ ...prev, title: text }))
        } else if (currentField === 'content') {
          setCurrentNote(prev => ({ ...prev, content: text }))
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
      const { text } = event.detail
      processVoiceInput(text)
    }

    document.addEventListener('voiceInputToNotes', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToNotes', handleVoiceInput as EventListener)
    }
  }, [])

  return {
    isSessionActive,
    isListening: isSessionActive,
    startSession: startSessionSilent,
    stopSession,
    currentTranscription,
    isProcessingVoice,
    currentField,
    notes,
    currentNote,
    isCreatingNote,
    createNote,
    saveNote,
    deleteNote,
    goHome,
    setNoteTitle,
    setNoteContent,
    addNoteTag
  }
}
