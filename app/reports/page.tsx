"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FloatingVoiceChat } from "@/components/floating-voice-chat"
import { useTranslations } from "@/components/translations-context"
import { useReportsWebRTC } from "@/hooks/use-reports-webrtc"
import { Confetti } from "@/components/ui/confetti"
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  Save, 
  Trash2,
  Search,
  Filter,
  FileText,
  Calendar,
  TrendingUp,
  Download,
  Target
} from "lucide-react"
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

export default function ReportsPage() {
  const { t } = useTranslations()
  
  // Usar el hook de WebRTC para reportes
  const {
    isSessionActive,
    isListening,
    startSession,
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
    goToNotes
  } = useReportsWebRTC()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string[]>([])
  
  // Estado para confeti
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Estados locales para los campos
  const [localTitle, setLocalTitle] = useState("")
  const [localType, setLocalType] = useState("")
  const [localContent, setLocalContent] = useState("")
  const [localData, setLocalData] = useState("")

  // Activar sesión automáticamente al entrar a la página
  useEffect(() => {
    startSession()
    toast.success("¡Bienvenido al Asistente de Reportes! 📊", {
      description: "Di 'crear reporte', 'ir a campañas', 'ir a notas' o 'volver al home'."
    })
  }, []) // Solo se ejecuta una vez al montar el componente

  // Escuchar eventos de guardado para confeti
  useEffect(() => {
    const handleReportSaved = () => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }

    document.addEventListener('reportSaved', handleReportSaved)
    
    return () => {
      document.removeEventListener('reportSaved', handleReportSaved)
    }
  }, [])

  // Escuchar eventos de voz para actualizar campos
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const { field, text } = event.detail
      
      if (field === 'title') {
        setLocalTitle(text)
      } else if (field === 'type') {
        setLocalType(text)
      } else if (field === 'content') {
        setLocalContent(text)
      } else if (field === 'data') {
        setLocalData(text)
      } else if (field === 'save') {
        // Presionar automáticamente el botón de guardar
        handleSaveReport()
      }
    }

    document.addEventListener('voiceInputToReports', handleVoiceInput as EventListener)
    
    return () => {
      document.removeEventListener('voiceInputToReports', handleVoiceInput as EventListener)
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

  // Función local para guardar reporte
  const handleSaveReport = () => {
    if (!localTitle || !localType) {
      toast.error("El reporte debe tener título y tipo")
      return
    }

    // Llamar a la función del hook sin argumentos (obtendrá datos del DOM)
    saveReport()
    
    // Limpiar campos locales
    setLocalTitle("")
    setLocalType("")
    setLocalContent("")
    setLocalData("")
  }

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType.length === 0 || 
                       selectedType.includes(report.type)
    return matchesSearch && matchesType
  })

  const reportTypes = [
    { value: 'ventas', label: 'Ventas', color: 'bg-green-100 text-green-800' },
    { value: 'marketing', label: 'Marketing', color: 'bg-blue-100 text-blue-800' },
    { value: 'financiero', label: 'Financiero', color: 'bg-purple-100 text-purple-800' },
    { value: 'proyecto', label: 'Proyecto', color: 'bg-orange-100 text-orange-800' },
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
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
                  Generador de Reportes
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genera reportes automáticos con comandos de voz
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={createReport}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Reporte
              </Button>

              <Button
                variant="outline"
                onClick={goToCampaigns}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Campañas
              </Button>
              <Button
                variant="outline"
                onClick={goToNotes}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Notas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Información del Asistente */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Asistente de Reportes Especializado</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h3 className="font-medium mb-2">📊 Comandos de Reportes:</h3>
                  <ul className="space-y-1">
                    <li>• "crear reporte" - Abre formulario de reporte</li>
                    <li>• "el título es..." - Establece título</li>
                    <li>• "el tipo es..." - Establece tipo</li>
                    <li>• "guardar" - Guarda el reporte</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🧭 Comandos de Navegación:</h3>
                  <ul className="space-y-1">
                    <li>• "ir a campañas" - Navega a campañas</li>
                    <li>• "ir a notas" - Navega a notas</li>
                    <li>• "volver al home" - Regresa al inicio</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Creación */}
          {isCreatingReport && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Creando Nuevo Reporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Título del Reporte
                    </label>
                    <Input
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      placeholder="Di el título de tu reporte..."
                      className={`mt-1 ${currentField === 'title' && isProcessingVoice ? 'border-green-500 bg-green-50' : ''}`}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">
                      Tipo de Reporte
                    </label>
                    <select
                      value={localType}
                      onChange={(e) => setLocalType(e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-md ${currentField === 'type' && isProcessingVoice ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                    >
                      <option value="">Selecciona un tipo...</option>
                      {reportTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Contenido
                    </label>
                    <Textarea
                      value={localContent}
                      onChange={(e) => setLocalContent(e.target.value)}
                      placeholder="Di el contenido del reporte..."
                      rows={4}
                      className={`mt-1 ${currentField === 'content' && isProcessingVoice ? 'border-green-500 bg-green-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Datos Adicionales
                    </label>
                    <Textarea
                      value={localData}
                      onChange={(e) => setLocalData(e.target.value)}
                      placeholder="Di datos adicionales para el reporte..."
                      rows={3}
                      className={`mt-1 ${currentField === 'data' && isProcessingVoice ? 'border-green-500 bg-green-50' : ''}`}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveReport} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Generar Reporte
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setLocalTitle("")
                        setLocalType("")
                        setLocalContent("")
                        setLocalData("")
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Reportes */}
          <div className={`${isCreatingReport ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Mis Reportes ({filteredReports.length})
                </CardTitle>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar reportes..."
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
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay reportes generados</p>
                    <p className="text-sm">Di "crear reporte" para empezar</p>
                    <p className="text-xs mt-2">También puedes decir "ir a campañas" o "ir a notas"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{report.title}</h3>
                                <Badge 
                                  variant={
                                    report.status === 'generated' ? 'default' :
                                    report.status === 'exported' ? 'secondary' : 'outline'
                                  }
                                >
                                  {report.status === 'draft' ? 'Borrador' :
                                   report.status === 'generated' ? 'Generado' : 'Exportado'}
                                </Badge>
                                <Badge className={reportTypes.find(t => t.value === report.type)?.color}>
                                  {reportTypes.find(t => t.value === report.type)?.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{report.content}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {report.data || 'Sin datos adicionales'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {report.createdAt.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteReport(report.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
        currentRoute="/reports"
      />

      {/* Confeti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
