"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Mic, 
  MicOff, 
  Volume2,
  MessageSquare,
  X,
  Minimize2,
  Maximize2
} from "lucide-react"


interface FloatingVoiceChatProps {
  isSessionActive: boolean
  onStartStopClick: () => void
  currentTranscription: string
  isListening: boolean
  isProcessing: boolean
  currentField?: string
  activeModal?: 'campaign' | 'notes' | null
}

export function FloatingVoiceChat({
  isSessionActive,
  onStartStopClick,
  currentTranscription,
  isListening,
  isProcessing,
  currentField,
  activeModal
}: FloatingVoiceChatProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentRoute, setCurrentRoute] = useState("")

  // Detectar la ruta actual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentRoute(window.location.pathname)
    }
  }, [])

  const getModalName = () => {
    // Si hay un modal activo, usar ese
    if (activeModal) {
      switch (activeModal) {
        case 'campaign': return 'Creador de Campañas'
        case 'notes': return 'Página de Notas'
        default: return null
      }
    }
    
    // Si no hay modal, detectar por ruta
    if (currentRoute === '/notes') {
      return 'Página de Notas'
    }
    
    return 'Asistente Principal'
  }

  const getFieldName = () => {
    if (!currentField) return null
    
    const fieldNames: Record<string, string> = {
      'name': 'Nombre de la Campaña',
      'description': 'Descripción',
      'targetAudience': 'Audiencia Objetivo',
      'budget': 'Presupuesto',
      'duration': 'Duración',
      'objectives': 'Objetivos',
      'channels': 'Canales',
      'title': 'Título de la Nota',
      'content': 'Contenido',
      'tags': 'Etiquetas'
    }
    
    return fieldNames[currentField] || currentField
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className={`shadow-xl border-2 transition-all duration-300 ${
          isListening ? 'border-green-500 bg-green-50' : 
          isProcessing ? 'border-blue-500 bg-blue-50' : 
          'border-gray-200'
        }`}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  isListening ? 'bg-green-500' : 
                  isProcessing ? 'bg-blue-500' : 
                  'bg-gray-500'
                } text-white`}>
                  <Mic className="h-4 w-4" />
                </div>
                              <div>
                <h3 className="font-semibold text-sm">Asistente de Voz</h3>
                {activeModal && (
                  <p className="text-xs text-muted-foreground">
                    {getModalName()}
                  </p>
                )}

              </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Status and Controls */}
            <div className="space-y-3">
              {/* Current Field Indicator */}
              {currentField && (
                <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-lg">
                  <Volume2 className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-700">
                    Llenando: <strong>{getFieldName()}</strong>
                  </span>
                </div>
              )}

              {/* Transcription */}
              {currentTranscription && (
                <div className="p-2 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <strong>Transcripción:</strong> {currentTranscription}
                  </p>
                </div>
              )}

              {/* Main Control Button */}
              <Button
                onClick={onStartStopClick}
                className={`w-full ${
                  isListening ? 'bg-red-500 hover:bg-red-600' : 
                  'bg-primary hover:bg-primary/90'
                }`}
                disabled={isProcessing}
              >
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Detener</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>{isSessionActive ? 'Hablar' : 'Iniciar'}</span>
                    </>
                  )}
                </div>
              </Button>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  {isListening ? 'Escuchando...' : 
                   isProcessing ? 'Procesando...' : 
                   isSessionActive ? 'Listo' : 'Desconectado'}
                </Badge>
              </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t"
              >
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold">Instrucciones:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Habla claramente para mejor reconocimiento</li>
                    <li>• Menciona el campo que quieres llenar</li>
                    <li>• Los campos se llenan automáticamente</li>
                    {activeModal && (
                      <li>• Modal activo: {getModalName()}</li>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
