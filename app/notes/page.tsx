"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FloatingVoiceChat } from "@/components/floating-voice-chat"
import { useTranslations } from "@/components/translations-context"
import { useNotesWebRTC } from "@/hooks/use-notes-webrtc"
import { Confetti } from "@/components/ui/confetti"
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Save, 
  Trash2,
  Search,
  Filter
} from "lucide-react"
import { toast } from "sonner"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export default function NotesPage() {
  const router = useRouter()
  const { t } = useTranslations()
  
  // Usar el hook de WebRTC para notas
  const {
    isSessionActive,
    isListening,
    startSession,
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
  } = useNotesWebRTC()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Estado para confeti
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Estados locales para los campos
  const [localTitle, setLocalTitle] = useState("")
  const [localContent, setLocalContent] = useState("")

  // Activar sesión automáticamente al entrar a la página
  useEffect(() => {
    startSession()
    toast.success("¡Bienvenido a la página de Notas! 📝", {
      description: "El asistente de voz está activo. Di 'crear nota' para empezar."
    })
  }, []) // Solo se ejecuta una vez al montar el componente



  // Escuchar eventos de guardado para confeti
  useEffect(() => {
    const handleNoteSaved = () => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }

    document.addEventListener('noteSaved', handleNoteSaved)
    
    return () => {
      document.removeEventListener('noteSaved', handleNoteSaved)
    }
  }, [])

  // Función para el chat flotante
  const handleFloatingChatClick = () => {
    if (isSessionActive) {
      stopSession()
    } else {
      startSession()
    }
  }

  // Función local para guardar nota
  const handleSaveNote = () => {
    if (!localTitle || !localContent) {
      toast.error("La nota debe tener título y contenido")
      return
    }

    // Crear la nota con los campos locales
    const newNote = {
      title: localTitle,
      content: localContent,
      tags: []
    }
    
    // Llamar a la función del hook sin argumentos (obtendrá datos del DOM)
    saveNote()
    
    // Limpiar campos locales
    setLocalTitle("")
    setLocalContent("")
  }

  // Escuchar eventos de voz para actualizar campos
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const { field, text } = event.detail
      
      if (field === 'title') {
        setLocalTitle(text)
      } else if (field === 'content') {
        setLocalContent(text)
      } else if (field === 'save') {
        // Presionar automáticamente el botón de guardar
        handleSaveNote()
      }
    }

    document.addEventListener('voiceInputToNotes', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToNotes', handleVoiceInput as EventListener)
    }
  }, [])





  // Filtrar notas
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => note.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={goHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Asistente de Notas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona tus notas con comandos de voz
                </p>
              </div>
            </div>
            
                          <div className="flex gap-2">
                <Button
                  onClick={createNote}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Nota
                </Button>
                <Button
                  onClick={() => {
                    if (isSessionActive) {
                      stopSession()
                    } else {
                      startSession()
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSessionActive ? "Detener IA" : "Activar IA"}
                </Button>
              </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Creación/Edición */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isCreatingNote ? "Creando Nueva Nota" : "Crear Nota"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreatingNote ? (
                  <>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        Título
                        {currentField === 'title' && isProcessingVoice && (
                          <Badge variant="secondary" className="text-xs">
                            IA escribiendo...
                          </Badge>
                        )}
                      </label>
                      <Input
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder="Di el título de tu nota..."
                        className={`mt-1 ${currentField === 'title' && isProcessingVoice ? 'border-blue-500 bg-blue-50' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        Contenido
                        {currentField === 'content' && isProcessingVoice && (
                          <Badge variant="secondary" className="text-xs">
                            IA escribiendo...
                          </Badge>
                        )}
                      </label>
                      <Textarea
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        placeholder="Di el contenido de tu nota..."
                        rows={8}
                        className={`mt-1 ${currentField === 'content' && isProcessingVoice ? 'border-blue-500 bg-blue-50' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        Etiquetas
                        {currentField === 'tags' && isProcessingVoice && (
                          <Badge variant="secondary" className="text-xs">
                            IA agregando...
                          </Badge>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentNote.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNote} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Guardar Nota
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setLocalTitle("")
                          setLocalContent("")
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Di &quot;crear nota&quot; para empezar a escribir
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Notas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Notas ({filteredNotes.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar notas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredNotes.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{note.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-3">
                              {note.content}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {note.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? "No se encontraron notas" : "No hay notas aún"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat de voz flotante */}
      <FloatingVoiceChat
        isSessionActive={isSessionActive}
        onStartStopClick={handleFloatingChatClick}
        currentTranscription={currentTranscription}
        isListening={isListening}
        isProcessing={isProcessingVoice}
        currentField={currentField}
        activeModal="notes"
      />

      {/* Confeti cuando se guarda una nota */}
      {showConfetti && <Confetti />}
    </div>
  )
}
