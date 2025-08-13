"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  Save, 
  X, 
  Play, 
  Pause, 
  Volume2,
  Target,
  Users,
  Calendar,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"

interface CampaignCreatorProps {
  isActive: boolean
  onClose: () => void
  onVoiceInput: (text: string) => void
  isListening: boolean
}

interface CampaignData {
  name: string
  description: string
  targetAudience: string
  budget: string
  duration: string
  objectives: string[]
  channels: string[]
}

export function CampaignCreator({ 
  isActive, 
  onClose, 
  onVoiceInput, 
  isListening 
}: CampaignCreatorProps) {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "",
    description: "",
    targetAudience: "",
    budget: "",
    duration: "",
    objectives: [],
    channels: []
  })

  const [currentField, setCurrentField] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const objectives = [
    "Aumentar ventas",
    "Generar leads",
    "Mejorar brand awareness",
    "Fidelizar clientes",
    "Lanzar producto",
    "Promocionar evento"
  ]

  const channels = [
    "Redes Sociales",
    "Email Marketing",
    "Google Ads",
    "Facebook Ads",
    "Instagram Ads",
    "LinkedIn Ads",
    "YouTube Ads",
    "Influencers"
  ]

  const handleFieldFocus = (fieldName: string) => {
    setCurrentField(fieldName)
    setTranscription("")
  }

  const handleVoiceInput = (text: string) => {
    if (!currentField) return

    setCampaignData(prev => {
      const updated = { ...prev }
      
      switch (currentField) {
        case "name":
          updated.name = text
          break
        case "description":
          updated.description = text
          break
        case "targetAudience":
          updated.targetAudience = text
          break
        case "budget":
          updated.budget = text
          break
        case "duration":
          updated.duration = text
          break
        case "objectives":
          // Buscar objetivos en el texto
          const foundObjectives = objectives.filter(obj => 
            text.toLowerCase().includes(obj.toLowerCase())
          )
          if (foundObjectives.length > 0) {
            updated.objectives = [...new Set([...prev.objectives, ...foundObjectives])]
          }
          break
        case "channels":
          // Buscar canales en el texto
          const foundChannels = channels.filter(channel => 
            text.toLowerCase().includes(channel.toLowerCase())
          )
          if (foundChannels.length > 0) {
            updated.channels = [...new Set([...prev.channels, ...foundChannels])]
          }
          break
      }
      
      return updated
    })

    setTranscription("")
    setCurrentField("")
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // Aquí podrías enviar el audio a un servicio de transcripción
        // Por ahora simulamos la transcripción
        const mockTranscription = "Campaña de lanzamiento de producto para jóvenes de 18-25 años"
        handleVoiceInput(mockTranscription)
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success("Grabando... Habla ahora")
    } catch (error) {
      toast.error("Error al acceder al micrófono")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const removeObjective = (objective: string) => {
    setCampaignData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj !== objective)
    }))
  }

  const removeChannel = (channel: string) => {
    setCampaignData(prev => ({
      ...prev,
      channels: prev.channels.filter(ch => ch !== channel)
    }))
  }

  const saveCampaign = () => {
    toast.success("Campaña guardada exitosamente!")
    console.log("Campaña guardada:", campaignData)
  }

  useEffect(() => {
    // Escuchar eventos de transcripción de voz
    const handleVoiceInput = (event: CustomEvent) => {
      const { text } = event.detail;
      console.log('Campaign Creator received voice input:', text);
      
      setIsProcessingVoice(true);
      
      // Enviar evento al componente principal para actualizar el chat flotante
      const updateEvent = new CustomEvent('updateFloatingChat', {
        detail: { 
          transcription: text, 
          field: currentField, 
          isProcessing: true 
        }
      });
      document.dispatchEvent(updateEvent);
      
      // Procesar el texto para determinar qué campo llenar
      if (text.toLowerCase().includes('nombre') || text.toLowerCase().includes('título')) {
        setCurrentField('name');
        setCampaignData(prev => ({ ...prev, name: text }));
        
        // Actualizar el campo en el chat flotante
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'name', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('descripción') || text.toLowerCase().includes('descripcion')) {
        setCurrentField('description');
        setCampaignData(prev => ({ ...prev, description: text }));
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'description', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('audiencia') || text.toLowerCase().includes('objetivo')) {
        setCurrentField('targetAudience');
        setCampaignData(prev => ({ ...prev, targetAudience: text }));
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'targetAudience', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('presupuesto') || text.toLowerCase().includes('dinero')) {
        setCurrentField('budget');
        setCampaignData(prev => ({ ...prev, budget: text }));
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'budget', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('duración') || text.toLowerCase().includes('duracion') || text.toLowerCase().includes('tiempo')) {
        setCurrentField('duration');
        setCampaignData(prev => ({ ...prev, duration: text }));
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'duration', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('objetivo') || text.toLowerCase().includes('meta')) {
        setCurrentField('objectives');
        handleVoiceInput(text);
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'objectives', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else if (text.toLowerCase().includes('canal') || text.toLowerCase().includes('redes') || text.toLowerCase().includes('social')) {
        setCurrentField('channels');
        handleVoiceInput(text);
        
        const fieldEvent = new CustomEvent('updateFloatingChat', {
          detail: { field: 'channels', transcription: text }
        });
        document.dispatchEvent(fieldEvent);
      } else {
        // Si no hay campo específico, llenar el campo actual
        if (currentField) {
          handleVoiceInput(text);
        }
      }
      
      // Mostrar indicador de procesamiento por 2 segundos
      setTimeout(() => {
        setIsProcessingVoice(false);
        
        // Limpiar el estado del chat flotante
        const clearEvent = new CustomEvent('updateFloatingChat', {
          detail: { transcription: '', isProcessing: false }
        });
        document.dispatchEvent(clearEvent);
      }, 2000);
    };

    document.addEventListener('voiceInputToCampaign', handleVoiceInput as EventListener);

    return () => {
      document.removeEventListener('voiceInputToCampaign', handleVoiceInput as EventListener);
    };
  }, [currentField]);

  // Mostrar progreso de completado
  const getCompletionProgress = () => {
    const fields = [
      campaignData.name,
      campaignData.description,
      campaignData.targetAudience,
      campaignData.budget,
      campaignData.duration,
      campaignData.objectives.length,
      campaignData.channels.length
    ]
    const completedFields = fields.filter(field => 
      typeof field === 'string' ? field.trim() !== '' : field > 0
    ).length
    return Math.round((completedFields / fields.length) * 100)
  }

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Creador de Campañas
              </CardTitle>
              <Badge variant="secondary" className="ml-2">
                {getCompletionProgress()}% completado
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Nombre de la Campaña */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Nombre de la Campaña
                {currentField === "name" && (
                  <Badge variant="secondary" className="ml-2">
                    Escuchando...
                  </Badge>
                )}
              </Label>
              <Input
                id="name"
                value={campaignData.name}
                onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                onFocus={() => handleFieldFocus("name")}
                placeholder="Di el nombre de tu campaña..."
                className="w-full"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Descripción
                {currentField === "description" && (
                  <Badge variant="secondary" className="ml-2">
                    Escuchando...
                  </Badge>
                )}
              </Label>
              <Textarea
                id="description"
                value={campaignData.description}
                onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                onFocus={() => handleFieldFocus("description")}
                placeholder="Describe tu campaña..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Audiencia Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Audiencia Objetivo
                {currentField === "targetAudience" && (
                  <Badge variant="secondary" className="ml-2">
                    Escuchando...
                  </Badge>
                )}
              </Label>
              <Input
                id="targetAudience"
                value={campaignData.targetAudience}
                onChange={(e) => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                onFocus={() => handleFieldFocus("targetAudience")}
                placeholder="Describe tu audiencia objetivo..."
                className="w-full"
              />
            </div>

            {/* Presupuesto y Duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Presupuesto
                  {currentField === "budget" && (
                    <Badge variant="secondary" className="ml-2">
                      Escuchando...
                    </Badge>
                  )}
                </Label>
                <Input
                  id="budget"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, budget: e.target.value }))}
                  onFocus={() => handleFieldFocus("budget")}
                  placeholder="Ej: $5000 USD"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Duración
                  {currentField === "duration" && (
                    <Badge variant="secondary" className="ml-2">
                      Escuchando...
                    </Badge>
                  )}
                </Label>
                <Input
                  id="duration"
                  value={campaignData.duration}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, duration: e.target.value }))}
                  onFocus={() => handleFieldFocus("duration")}
                  placeholder="Ej: 30 días"
                  className="w-full"
                />
              </div>
            </div>

            {/* Objetivos */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objetivos
                {currentField === "objectives" && (
                  <Badge variant="secondary" className="ml-2">
                    Escuchando...
                  </Badge>
                )}
              </Label>
              <Input
                value=""
                onChange={() => {}}
                onFocus={() => handleFieldFocus("objectives")}
                placeholder="Di los objetivos de tu campaña..."
                className="w-full"
              />
              <div className="flex flex-wrap gap-2">
                {campaignData.objectives.map((objective, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeObjective(objective)}>
                    {objective} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Canales */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Canales de Marketing
                {currentField === "channels" && (
                  <Badge variant="secondary" className="ml-2">
                    Escuchando...
                  </Badge>
                )}
              </Label>
              <Input
                value=""
                onChange={() => {}}
                onFocus={() => handleFieldFocus("channels")}
                placeholder="Di los canales que quieres usar..."
                className="w-full"
              />
              <div className="flex flex-wrap gap-2">
                {campaignData.channels.map((channel, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeChannel(channel)}>
                    {channel} <X className="h-3 w-3 ml-1" />
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

            {/* Vista previa de la campaña */}
            {getCompletionProgress() > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    📋 Vista Previa de la Campaña
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    {campaignData.name && (
                      <p><strong>Nombre:</strong> {campaignData.name}</p>
                    )}
                    {campaignData.description && (
                      <p><strong>Descripción:</strong> {campaignData.description}</p>
                    )}
                    {campaignData.targetAudience && (
                      <p><strong>Audiencia:</strong> {campaignData.targetAudience}</p>
                    )}
                    {campaignData.budget && (
                      <p><strong>Presupuesto:</strong> {campaignData.budget}</p>
                    )}
                    {campaignData.duration && (
                      <p><strong>Duración:</strong> {campaignData.duration}</p>
                    )}
                    {campaignData.objectives.length > 0 && (
                      <p><strong>Objetivos:</strong> {campaignData.objectives.join(', ')}</p>
                    )}
                    {campaignData.channels.length > 0 && (
                      <p><strong>Canales:</strong> {campaignData.channels.join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={saveCampaign} 
                className="flex items-center gap-2"
                disabled={getCompletionProgress() === 0}
              >
                <Save className="h-4 w-4" />
                Guardar Campaña
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
