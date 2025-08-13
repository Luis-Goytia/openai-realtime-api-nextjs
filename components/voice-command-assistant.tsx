"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  X, 
  Target,
  FileText,
  Calendar,
  BarChart3,
  Globe,
  Copy,
  Clock,
  Palette,
  PartyPopper,
  Download,
  Users,
  Settings
} from "lucide-react"

interface VoiceCommandAssistantProps {
  isActive: boolean
  onClose: () => void
}

interface Command {
  id: string
  phrase: string
  description: string
  category: string
  icon: React.ReactNode
}

export function VoiceCommandAssistant({ isActive, onClose }: VoiceCommandAssistantProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const commands: Command[] = [
    // Campañas y Marketing
    {
      id: "create-campaign",
      phrase: "Crear campaña",
      description: "Abre el asistente interactivo para crear campañas de marketing",
      category: "marketing",
      icon: <Target className="h-4 w-4" />
    },
    {
      id: "generate-report",
      phrase: "Generar reporte de [tipo]",
      description: "Crea reportes automáticos (ventas, marketing, financiero, etc.)",
      category: "marketing",
      icon: <BarChart3 className="h-4 w-4" />
    },
    
    // Notas y Productividad
    {
      id: "take-notes",
      phrase: "Tomar notas",
      description: "Abre el asistente de notas por voz con autocompletado",
      category: "productivity",
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: "schedule-meeting",
      phrase: "Programar reunión",
      description: "Agenda una nueva reunión con detalles específicos",
      category: "productivity",
      icon: <Calendar className="h-4 w-4" />
    },
    
    // Herramientas Básicas
    {
      id: "get-time",
      phrase: "¿Qué hora es?",
      description: "Obtiene la hora actual en tu zona horaria",
      category: "basic",
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: "change-theme",
      phrase: "Cambiar tema",
      description: "Alterna entre modo claro y oscuro",
      category: "basic",
      icon: <Palette className="h-4 w-4" />
    },
    {
      id: "party-mode",
      phrase: "Iniciar modo fiesta",
      description: "Activa animaciones y efectos especiales",
      category: "basic",
      icon: <PartyPopper className="h-4 w-4" />
    },
    
    // Navegación y Web
    {
      id: "launch-website",
      phrase: "Llévame a [sitio web]",
      description: "Abre un sitio web en una nueva pestaña",
      category: "web",
      icon: <Globe className="h-4 w-4" />
    },
    {
      id: "scrape-website",
      phrase: "Extraer contenido de [URL]",
      description: "Extrae y analiza contenido de una página web",
      category: "web",
      icon: <Download className="h-4 w-4" />
    },
    
    // Utilidades
    {
      id: "copy-clipboard",
      phrase: "Copiar [texto] al portapapeles",
      description: "Copia texto específico al portapapeles",
      category: "utilities",
      icon: <Copy className="h-4 w-4" />
    },
    {
      id: "help",
      phrase: "Ayuda",
      description: "Muestra esta lista de comandos disponibles",
      category: "utilities",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const categories = [
    { id: "all", name: "Todos", icon: <Mic className="h-4 w-4" /> },
    { id: "marketing", name: "Marketing", icon: <Target className="h-4 w-4" /> },
    { id: "productivity", name: "Productividad", icon: <FileText className="h-4 w-4" /> },
    { id: "basic", name: "Básicas", icon: <Settings className="h-4 w-4" /> },
    { id: "web", name: "Web", icon: <Globe className="h-4 w-4" /> },
    { id: "utilities", name: "Utilidades", icon: <Copy className="h-4 w-4" /> }
  ]

  const filteredCommands = selectedCategory === "all" 
    ? commands 
    : commands.filter(cmd => cmd.category === selectedCategory)

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
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Asistente de Comandos por Voz
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Categorías */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Comandos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommands.map((command) => (
                <Card key={command.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {command.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {command.category}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        "{command.phrase}"
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {command.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Consejos de uso */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💡 Consejos para usar comandos por voz:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Habla claramente y a un ritmo normal</li>
                  <li>• Usa frases completas para mejor reconocimiento</li>
                  <li>• Puedes combinar comandos: "Crear campaña y luego tomar notas"</li>
                  <li>• Di "Ayuda" en cualquier momento para ver esta lista</li>
                  <li>• Los comandos funcionan en español e inglés</li>
                </ul>
              </CardContent>
            </Card>

            {/* Ejemplos de uso */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  🎯 Ejemplos de uso:
                </h4>
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>Marketing:</strong> "Crear campaña para lanzar nuestro nuevo producto"</p>
                  <p><strong>Productividad:</strong> "Tomar notas sobre la reunión de hoy"</p>
                  <p><strong>Análisis:</strong> "Generar reporte de ventas del último mes"</p>
                  <p><strong>Organización:</strong> "Programar reunión con el equipo para mañana"</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
