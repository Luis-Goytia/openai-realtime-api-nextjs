"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target,
  FileText,
  Mic,
  Volume2,
  CheckCircle,
  Sparkles
} from "lucide-react"

interface ModalNotificationProps {
  type: 'campaign' | 'notes' | 'commands'
  isVisible: boolean
}

export function ModalNotification({ type, isVisible }: ModalNotificationProps) {
  const [step, setStep] = useState(0)

  const config = {
    campaign: {
      title: "Creador de Campañas",
      icon: <Target className="h-5 w-5" />,
      color: "bg-blue-500",
      steps: [
        "Habla para llenar el nombre de la campaña",
        "Describe tu audiencia objetivo",
        "Menciona el presupuesto y duración",
        "Di los objetivos y canales de marketing"
      ]
    },
    notes: {
      title: "Asistente de Notas",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-green-500",
      steps: [
        "Habla para crear el título de la nota",
        "Dicta el contenido de tu nota",
        "Menciona las etiquetas que quieres agregar",
        "Edita o gestiona notas existentes"
      ]
    },
    commands: {
      title: "Asistente de Comandos",
      icon: <Mic className="h-5 w-5" />,
      color: "bg-purple-500",
      steps: [
        "Explora comandos por categorías",
        "Aprende nuevos comandos de voz",
        "Ve ejemplos de uso práctico",
        "Descubre funcionalidades avanzadas"
      ]
    }
  }

  const currentConfig = config[type] || config.campaign // Fallback a campaign si type es inválido

  useEffect(() => {
    if (isVisible && currentConfig) {
      setStep(0)
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev < currentConfig.steps.length - 1) {
            return prev + 1
          } else {
            clearInterval(interval)
            return prev
          }
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isVisible, currentConfig])

  if (!isVisible || !currentConfig) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${currentConfig.color} text-white`}>
                {currentConfig.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {currentConfig.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  ¡Perfecto! El asistente está listo para escucharte.
                </p>

                <div className="space-y-2">
                  {currentConfig.steps.map((stepText, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                        index <= step 
                          ? 'text-blue-700 font-medium' 
                          : 'text-gray-400'
                      }`}
                    >
                      {index <= step ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span>{stepText}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Volume2 className="h-3 w-3" />
                  <span>Habla claramente para mejor reconocimiento</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
