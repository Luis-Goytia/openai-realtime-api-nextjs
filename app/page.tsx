"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { Welcome } from "@/components/welcome"
import { VoiceSelector } from "@/components/voice-select"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { TokenUsageDisplay } from "@/components/token-usage"
import { MessageControls } from "@/components/message-controls"
import { ToolsEducation } from "@/components/tools-education"
import { TextInput } from "@/components/text-input"
import { CampaignCreator } from "@/components/campaign-creator"
import { VoiceCommandAssistant } from "@/components/voice-command-assistant"
import { ModalNotification } from "@/components/modal-notification"
import { FloatingVoiceChat } from "@/components/floating-voice-chat"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"


const App: React.FC = () => {
  // State for voice selection
  const [voice, setVoice] = useState("ash")
  
  // State for interactive components
  const [showCampaignCreator, setShowCampaignCreator] = useState(false)
  const [showCommandAssistant, setShowCommandAssistant] = useState(false)
  const [isListeningForComponent, setIsListeningForComponent] = useState(false)
  const [notificationType, setNotificationType] = useState<'campaign' | 'commands' | null>(null)
  const [currentField, setCurrentField] = useState<string>("")
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)

  // WebRTC Audio Session Hook para el botón principal
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
    startSession,
    stopSession
  } = useWebRTCAudioSession(voice, tools, {
    campaign: showCampaignCreator
  })

  // Estado para el chat flotante
  const [floatingChatActive, setFloatingChatActive] = useState(false)

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: 'getCurrentTime',
        backgroundFunction: 'changeBackgroundColor',
        partyFunction: 'partyMode',
        launchWebsite: 'launchWebsite', 
        copyToClipboard: 'copyToClipboard',
        scrapeWebsite: 'scrapeWebsite',
        createCampaign: 'createCampaign',
        openVoiceNotes: 'openVoiceNotes',
        generateReport: 'generateReport',
        scheduleMeeting: 'scheduleMeeting',
        showHelp: 'showHelp'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions])

  // Handle voice input for interactive components
  const handleVoiceInput = (text: string) => {
    // Process voice input for campaign creator
    if (showCampaignCreator) {
      // Enviar el texto al componente de campañas
      const event = new CustomEvent('voiceInputToCampaign', { 
        detail: { text, timestamp: Date.now() }
      });
      document.dispatchEvent(event);
      return
    }
  }

  // Función para el chat flotante
  const handleFloatingChatClick = () => {
    if (floatingChatActive) {
      // Si está activo, detener
      setFloatingChatActive(false)
      setIsProcessingVoice(false)
      setCurrentTranscription("")
      setCurrentField("")
      setIsListeningForComponent(false)
      
      // Detener la sesión de WebRTC
      stopSession()
    } else {
      // Si no está activo, iniciar
      setFloatingChatActive(true)
      
      // Iniciar la sesión de WebRTC
      startSession()
      
      // Si hay modales abiertos, activar el modo de componentes
      if (showCampaignCreator) {
        setIsListeningForComponent(true)
      }
    }
  }

  // Escuchar eventos personalizados para abrir modales
  useEffect(() => {
    const handleOpenCampaignCreator = () => {
      setShowCampaignCreator(true)
      // Solo activar el chat flotante si no está activo
      if (!floatingChatActive) {
        setFloatingChatActive(true)
        // Iniciar la sesión de WebRTC si no está activa
        if (!isSessionActive) {
          startSession()
        }
      }
      setIsListeningForComponent(true)
      setNotificationType('campaign')
      // Cerrar notificación después de 8 segundos
      setTimeout(() => setNotificationType(null), 8000)
    }



    const handleOpenCommandAssistant = () => {
      setShowCommandAssistant(true)
      setNotificationType('commands')
      // Cerrar notificación después de 8 segundos
      setTimeout(() => setNotificationType(null), 8000)
    }

    // Agregar event listeners
    document.addEventListener('openCampaignCreator', handleOpenCampaignCreator)
    document.addEventListener('openCommandAssistant', handleOpenCommandAssistant)

    // Cleanup
    return () => {
      document.removeEventListener('openCampaignCreator', handleOpenCampaignCreator)
      document.removeEventListener('openCommandAssistant', handleOpenCommandAssistant)
    }
  }, [])

  // Escuchar eventos para actualizar el chat flotante
  useEffect(() => {
    const handleUpdateFloatingChat = (event: CustomEvent) => {
      const { transcription, field, isProcessing } = event.detail;
      
      // Actualizar siempre si el chat flotante está activo
      if (floatingChatActive) {
        if (transcription !== undefined) {
          setCurrentTranscription(transcription);
        }
        
        if (field !== undefined) {
          setCurrentField(field);
        }
        
        if (isProcessing !== undefined) {
          setIsProcessingVoice(isProcessing);
        }
      }
    };

    document.addEventListener('updateFloatingChat', handleUpdateFloatingChat as EventListener);

    return () => {
      document.removeEventListener('updateFloatingChat', handleUpdateFloatingChat as EventListener);
    };
  }, [floatingChatActive]);

  return (
    <main className="h-full">
      <motion.div 
        className="container flex flex-col items-center justify-center mx-auto max-w-3xl my-20 p-12 border rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Welcome />
        
        <motion.div 
          className="w-full max-w-md bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <VoiceSelector value={voice} onValueChange={setVoice} />
          
          <div className="flex flex-col items-center gap-4">
            <BroadcastButton 
              isSessionActive={isSessionActive} 
              onClick={handleStartStopClick}
            />
          </div>
          {msgs.length > 4 && <TokenUsageDisplay messages={msgs} />}
          {status && (
            <motion.div 
              className="w-full flex flex-col gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageControls conversation={conversation} msgs={msgs} />
              <TextInput 
                onSubmit={sendTextMessage}
                disabled={!isSessionActive}
              />
            </motion.div>
          )}
        </motion.div>
        
        {status && <StatusDisplay status={status} />}
        <div className="w-full flex flex-col items-center gap-4">
          <ToolsEducation />
        </div>
      </motion.div>

      {/* Interactive Components */}
      <CampaignCreator
        isActive={showCampaignCreator}
        onClose={() => {
          setShowCampaignCreator(false)
          setIsListeningForComponent(false)
          // El chat flotante permanece activo pero en modo normal
        }}
        onVoiceInput={handleVoiceInput}
        isListening={isListeningForComponent && showCampaignCreator}
      />



      <VoiceCommandAssistant
        isActive={showCommandAssistant}
        onClose={() => setShowCommandAssistant(false)}
      />

      {/* Notificación de modal activo */}
      {notificationType && (
        <ModalNotification
          type={notificationType}
          isVisible={true}
        />
      )}

      {/* Chat de voz flotante */}
      <FloatingVoiceChat
        isSessionActive={floatingChatActive}
        onStartStopClick={handleFloatingChatClick}
        currentTranscription={currentTranscription}
        isListening={floatingChatActive && isSessionActive}
        isProcessing={isProcessingVoice}
        currentField={currentField}
        activeModal={showCampaignCreator ? 'campaign' : null}
      />
    </main>
  )
}

export default App;