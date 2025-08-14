"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FloatingVoiceChat } from "@/components/floating-voice-chat"
import { useTranslations } from "@/components/translations-context"
import { useCampaignsWebRTC } from "@/hooks/use-campaigns-webrtc"
import { Confetti } from "@/components/ui/confetti"
import { 
  ArrowLeft, 
  Plus, 
  Target, 
  Save, 
  Trash2,
  Search,
  Filter,
  Users,
  Calendar,
  DollarSign
} from "lucide-react"
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

export default function CampaignsPage() {
  const { t } = useTranslations()
  
  // Usar el hook de WebRTC para campañas
  const {
    isSessionActive,
    isListening,
    startSession,
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
    goHome
  } = useCampaignsWebRTC()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  
  // Estado para confeti
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Estados locales para los campos
  const [localTitle, setLocalTitle] = useState("")
  const [localDescription, setLocalDescription] = useState("")
  const [localTargetAudience, setLocalTargetAudience] = useState("")
  const [localBudget, setLocalBudget] = useState("")
  const [localStartDate, setLocalStartDate] = useState("")
  const [localEndDate, setLocalEndDate] = useState("")

  // Activar sesión automáticamente al entrar a la página
  useEffect(() => {
    startSession()
    toast.success("¡Bienvenido a la página de Campañas! 🎯", {
      description: "El asistente de voz está activo. Di 'crear campaña' para empezar."
    })
  }, []) // Solo se ejecuta una vez al montar el componente

  // Escuchar eventos de guardado para confeti
  useEffect(() => {
    const handleCampaignSaved = () => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }

    document.addEventListener('campaignSaved', handleCampaignSaved)
    
    return () => {
      document.removeEventListener('campaignSaved', handleCampaignSaved)
    }
  }, [])

  // Escuchar eventos de voz para actualizar campos
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const { field, text } = event.detail
      
      if (field === 'title') {
        setLocalTitle(text)
      } else if (field === 'description') {
        setLocalDescription(text)
      } else if (field === 'targetAudience') {
        setLocalTargetAudience(text)
      } else if (field === 'budget') {
        setLocalBudget(text)
      } else if (field === 'startDate') {
        setLocalStartDate(text)
      } else if (field === 'endDate') {
        setLocalEndDate(text)
      } else if (field === 'save') {
        // Presionar automáticamente el botón de guardar
        handleSaveCampaign()
      }
    }

    document.addEventListener('voiceInputToCampaigns', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToCampaigns', handleVoiceInput as EventListener)
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

  // Función local para guardar campaña
  const handleSaveCampaign = () => {
    if (!localTitle || !localDescription) {
      toast.error("La campaña debe tener título y descripción")
      return
    }

    // Llamar a la función del hook sin argumentos (obtendrá datos del DOM)
    saveCampaign()
    
    // Limpiar campos locales
    setLocalTitle("")
    setLocalDescription("")
    setLocalTargetAudience("")
    setLocalBudget("")
    setLocalStartDate("")
    setLocalEndDate("")
  }

  // Filtrar campañas
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus.length === 0 || 
                         selectedStatus.includes(campaign.status)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
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
                  Gestor de Campañas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona tus campañas de marketing con comandos de voz
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={createCampaign}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Campaña
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Creación */}
          {isCreatingCampaign && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Creando Nueva Campaña
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Título de la Campaña
                    </label>
                    <Input
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      placeholder="Di el título de tu campaña..."
                      className={`mt-1 ${currentField === 'title' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">
                      Descripción
                    </label>
                    <Textarea
                      value={localDescription}
                      onChange={(e) => setLocalDescription(e.target.value)}
                      placeholder="Di la descripción de tu campaña..."
                      rows={4}
                      className={`mt-1 ${currentField === 'description' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Audiencia Objetivo
                    </label>
                    <Input
                      value={localTargetAudience}
                      onChange={(e) => setLocalTargetAudience(e.target.value)}
                      placeholder="Di la audiencia objetivo..."
                      className={`mt-1 ${currentField === 'targetAudience' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Presupuesto
                      </label>
                      <Input
                        value={localBudget}
                        onChange={(e) => setLocalBudget(e.target.value)}
                        placeholder="Di el presupuesto..."
                        className={`mt-1 ${currentField === 'budget' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Fecha de Inicio
                      </label>
                      <Input
                        type="date"
                        value={localStartDate}
                        onChange={(e) => setLocalStartDate(e.target.value)}
                        className={`mt-1 ${currentField === 'startDate' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Fecha de Fin
                    </label>
                    <Input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => setLocalEndDate(e.target.value)}
                      className={`mt-1 ${currentField === 'endDate' && isProcessingVoice ? 'border-purple-500 bg-purple-50' : ''}`}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCampaign} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Campaña
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setLocalTitle("")
                        setLocalDescription("")
                        setLocalTargetAudience("")
                        setLocalBudget("")
                        setLocalStartDate("")
                        setLocalEndDate("")
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Campañas */}
          <div className={`${isCreatingCampaign ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mis Campañas ({filteredCampaigns.length})
                </CardTitle>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar campañas..."
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
                {filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay campañas creadas</p>
                    <p className="text-sm">Di "crear campaña" para empezar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCampaigns.map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{campaign.title}</h3>
                                <Badge 
                                  variant={
                                    campaign.status === 'active' ? 'default' :
                                    campaign.status === 'completed' ? 'secondary' :
                                    campaign.status === 'paused' ? 'destructive' : 'outline'
                                  }
                                >
                                  {campaign.status === 'draft' ? 'Borrador' :
                                   campaign.status === 'active' ? 'Activa' :
                                   campaign.status === 'completed' ? 'Completada' : 'Pausada'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {campaign.targetAudience}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {campaign.budget}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {campaign.startDate} - {campaign.endDate}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCampaign(campaign.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Flotante */}
      <FloatingVoiceChat
        isActive={isSessionActive}
        isListening={isListening}
        onClick={handleFloatingChatClick}
        currentRoute="/campaigns"
      />

      {/* Confeti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
