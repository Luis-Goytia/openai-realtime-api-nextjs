"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  X, 
  FileText,
  Volume2,
  Edit,
  Trash2,
  Download
} from "lucide-react"
import { toast } from "sonner"

interface VoiceNotesProps {
  isActive: boolean
  onClose: () => void
}

interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  tags: string[]
}

export function VoiceNotes({ 
  isActive, 
  onClose
}: VoiceNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note>({
    id: "",
    title: "",
    content: "",
    timestamp: "",
    tags: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [currentField, setCurrentField] = useState<"title" | "content" | "tags">("content")
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)

  const predefinedTags = [
    "Importante",
    "Urgente",
    "Ideas",
    "Tareas",
    "Reunión",
    "Proyecto",
    "Personal",
    "Trabajo"
  ]

  const handleFieldFocus = (field: "title" | "content" | "tags") => {
    setCurrentField(field)
    setTranscription("")
  }





  const saveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) {
      toast.error("La nota debe tener al menos un título o contenido")
      return
    }

    const newNote: Note = {
      ...currentNote,
      id: currentNote.id || Date.now().toString(),
      timestamp: currentNote.timestamp || new Date().toISOString()
    }

    if (isEditing) {
      setNotes(prev => prev.map(note => 
        note.id === newNote.id ? newNote : note
      ))
      setIsEditing(false)
    } else {
      setNotes(prev => [...prev, newNote])
    }

    setCurrentNote({
      id: "",
      title: "",
      content: "",
      timestamp: "",
      tags: []
    })

    toast.success("Nota guardada exitosamente!")
  }

  const editNote = (note: Note) => {
    setCurrentNote(note)
    setIsEditing(true)
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
    toast.success("Nota eliminada")
  }

  const addTag = (tag: string) => {
    if (!currentNote.tags.includes(tag)) {
      setCurrentNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setCurrentNote(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `notas-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success("Notas exportadas")
  }

  // Mostrar estadísticas de notas
  const getNotesStats = () => {
    const totalNotes = notes.length
    const notesWithTags = notes.filter(note => note.tags.length > 0).length
    const totalTags = notes.reduce((acc, note) => acc + note.tags.length, 0)
    
    return { totalNotes, notesWithTags, totalTags }
  }

  useEffect(() => {
    // Escuchar eventos de transcripción de voz
    const handleVoiceInput = (event: CustomEvent) => {
      const { text } = event.detail;
      console.log('Voice Notes received voice input:', text);
      
      setIsProcessingVoice(true);
      
      // Procesar el texto para determinar qué campo llenar
      if (text.toLowerCase().includes('título') || text.toLowerCase().includes('titulo') || text.toLowerCase().includes('nombre')) {
        setCurrentField('title');
        setCurrentNote(prev => ({ ...prev, title: text }));
      } else if (text.toLowerCase().includes('contenido') || text.toLowerCase().includes('nota') || text.toLowerCase().includes('texto')) {
        setCurrentField('content');
        setCurrentNote(prev => ({ ...prev, content: prev.content + ' ' + text }));
      } else if (text.toLowerCase().includes('etiqueta') || text.toLowerCase().includes('tag')) {
        setCurrentField('tags');
        handleVoiceInput(text);
      } else {
        // Si no hay campo específico, llenar el campo actual
        if (currentField) {
          handleVoiceInput(text);
        }
      }
      
      // Mostrar indicador de procesamiento por 2 segundos
      setTimeout(() => setIsProcessingVoice(false), 2000);
    };

    document.addEventListener('voiceInputToNotes', handleVoiceInput as EventListener);

    return () => {
      document.removeEventListener('voiceInputToNotes', handleVoiceInput as EventListener);
    };
  }, [currentField]);

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Asistente de Notas por Voz
              </CardTitle>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getNotesStats().totalNotes} notas
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getNotesStats().totalTags} etiquetas
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportNotes}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de creación/edición */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Editar Nota" : "Nueva Nota"}
                </h3>
                
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Título
                    {currentField === "title" && (
                      <Badge variant="secondary" className="ml-2">
                        Escuchando...
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="title"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                    onFocus={() => handleFieldFocus("title")}
                    placeholder="Di el título de tu nota..."
                    className="w-full"
                  />
                </div>

                {/* Contenido */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Contenido
                    {currentField === "content" && (
                      <Badge variant="secondary" className="ml-2">
                        Escuchando...
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    id="content"
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                    onFocus={() => handleFieldFocus("content")}
                    placeholder="Di el contenido de tu nota..."
                    rows={8}
                    className="w-full"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Etiquetas
                    {currentField === "tags" && (
                      <Badge variant="secondary" className="ml-2">
                        Escuchando...
                      </Badge>
                    )}
                  </Label>
                  <Input
                    value=""
                    onChange={() => {}}
                    onFocus={() => handleFieldFocus("tags")}
                    placeholder="Di las etiquetas para tu nota..."
                    className="w-full"
                  />
                  
                  {/* Tags actuales */}
                  <div className="flex flex-wrap gap-2">
                    {currentNote.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Tags predefinidos */}
                  <div className="flex flex-wrap gap-1">
                    {predefinedTags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Indicador de procesamiento de voz */}
                {isProcessingVoice && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">
                        <Volume2 className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 font-medium">
                        Procesando voz... Los campos se están llenando automáticamente
                      </p>
                    </div>
                  </div>
                )}

                {/* Transcripción en tiempo real */}
                {transcription && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Transcripción:</strong> {transcription}
                    </p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-4">
                  {isEditing && (
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false)
                      setCurrentNote({
                        id: "",
                        title: "",
                        content: "",
                        timestamp: "",
                        tags: []
                      })
                    }}>
                      Cancelar
                    </Button>
                  )}
                  <Button onClick={saveNote} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? "Actualizar" : "Guardar"} Nota
                  </Button>
                </div>
              </div>

              {/* Panel de notas existentes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mis Notas</h3>
                
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay notas aún. ¡Crea tu primera nota!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notes.map((note) => (
                      <Card key={note.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{note.title || "Sin título"}</h4>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editNote(note)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                          {note.content || "Sin contenido"}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
