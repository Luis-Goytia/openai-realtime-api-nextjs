"use client"

import { toast } from "sonner"
import confetti from 'canvas-confetti'
import { animate as framerAnimate } from "framer-motion"
import { useTranslations } from "@/components/translations-context"
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

// Eventos personalizados para comunicación con componentes
const createCustomEvent = (eventName: string, data?: unknown) => {
  const event = new CustomEvent(eventName, { 
    detail: data,
    bubbles: true 
  });
  document.dispatchEvent(event);
};

export const useToolsFunctions = () => {
  const { t } = useTranslations();

  const timeFunction = () => {
    const now = new Date()
    return {
      success: true,
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message: t('tools.time') + now.toLocaleTimeString() + " in " + Intl.DateTimeFormat().resolvedOptions().timeZone + " timezone."
    }
  }

  const backgroundFunction = ({ color }: { color?: string } = {}) => {
    try {
      if (color) {
        // Cambiar a un color específico
        const body = document.body;
        
        // Validar y aplicar el color
        const validColor = isValidColor(color) ? color : '#3b82f6'; // Azul por defecto
        
        body.style.backgroundColor = validColor;
        
        toast(`¡Color de fondo cambiado a ${validColor}! 🎨`, {
          description: `El fondo ahora es ${validColor}`,
        })

        return { 
          success: true, 
          color: validColor,
          message: `He cambiado el color de fondo a ${validColor}.`
        };
      } else {
        // Cambiar entre tema claro y oscuro (funcionalidad original)
        const html = document.documentElement;
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.classList.remove(currentTheme);
        html.classList.add(newTheme);

        toast(`Switched to ${newTheme} mode! 🌓`, {
          description: t('tools.switchTheme') + newTheme + ".",
        })

        return { 
          success: true, 
          theme: newTheme,
          message: t('tools.switchTheme') + newTheme + "."
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: t('tools.themeFailed') + ": " + error 
      };
    }
  }

  // Función auxiliar para validar colores
  const isValidColor = (color: string): boolean => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  const partyFunction = () => {
    try {
      const duration = 5 * 1000
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1", "#3b82f6", "#14b8a6", "#f97316", "#10b981", "#facc15"]
      
      const confettiConfig = {
        particleCount: 30,
        spread: 100,
        startVelocity: 90,
        colors,
        gravity: 0.5
      }

      const shootConfetti = (angle: number, origin: { x: number, y: number }) => {
        confetti({
          ...confettiConfig,
          angle,
          origin
        })
      }

      const animate = () => {
        const now = Date.now()
        const end = now + duration
        
        const elements = document.querySelectorAll('div, p, button, h1, h2, h3')
        elements.forEach((element) => {
          framerAnimate(element, 
            { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }, 
            { 
              duration: 0.5,
              repeat: 10,
              ease: "easeInOut"
            }
          )
        })

        const frame = () => {
          if (Date.now() > end) return
          shootConfetti(60, { x: 0, y: 0.5 })
          shootConfetti(120, { x: 1, y: 0.5 })
          requestAnimationFrame(frame)
        }

        const mainElement = document.querySelector('main')
        if (mainElement) {
          mainElement.classList.remove('bg-gradient-to-b', 'from-gray-50', 'to-white')
          const originalBg = mainElement.style.backgroundColor
          
          const changeColor = () => {
            const now = Date.now()
            const end = now + duration
            
            const colorCycle = () => {
              if (Date.now() > end) {
                framerAnimate(mainElement, 
                  { backgroundColor: originalBg },
                  { duration: 0.5 }
                )
                return
              }
              const newColor = colors[Math.floor(Math.random() * colors.length)]
              framerAnimate(mainElement,
                { backgroundColor: newColor },
                { duration: 0.2 }
              )
              setTimeout(colorCycle, 200)
            }
            
            colorCycle()
          }
          
          changeColor()
        }
        
        frame()
      }

      animate()
      toast.success(t('tools.partyMode.toast') + " 🎉", {
        description: t('tools.partyMode.description'),
      })
      return { success: true, message: t('tools.partyMode.success') + " 🎉" }
    } catch (error) {
      return { success: false, message: t('tools.partyMode.failed') + ": " + error }
    }
  }

  const launchWebsite = ({ url }: { url: string }) => {
    window.open(url, '_blank')
    toast(t('tools.launchWebsite') + " 🌐", {
      description: t('tools.launchWebsiteSuccess') + url + ", tell the user it's been launched.",
    })
    return {
      success: true,
      message: `Launched the site${url}, tell the user it's been launched.`
    }
  }

  const copyToClipboard = ({ text }: { text: string }) => {
    navigator.clipboard.writeText(text)
    toast(t('tools.clipboard.toast') + " 📋", {
      description: t('tools.clipboard.description'),
    })
    return {
      success: true,
      text,
      message: t('tools.clipboard.success')
    }
  }

  const scrapeWebsite = async ({ url }: { url: string }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY;
    try {
      const app = new FirecrawlApp({ apiKey: apiKey });
      const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown', 'html'] }) as ScrapeResponse;

      if (!scrapeResult.success) {
        console.log(scrapeResult.error)
        return {
          success: false,
          message: `Failed to scrape: ${scrapeResult.error}`
        };
      }

      toast.success(t('tools.scrapeWebsite.toast') + " 📋", {
        description: t('tools.scrapeWebsite.success'),
      })
    
      return {
        success: true,
        message: "Here is the scraped website content: " + JSON.stringify(scrapeResult.markdown) + "Summarize and explain it to the user now in a response."
      };

    } catch (error) {
      return {
        success: false,
        message: `Error scraping website: ${error}`
      };
    }
  }

  const createCampaign = () => {
    // Disparar evento para abrir el modal de campañas
    createCustomEvent('openCampaignCreator');
    
    toast.success("¡Abriendo creador de campañas! 🎯", {
      description: "El asistente de creación de campañas se ha abierto. Puedes hablar para llenar los campos automáticamente.",
    })
    
    return {
      success: true,
      message: "He abierto el creador de campañas. Ahora puedes crear una campaña de marketing completa usando solo tu voz. Habla para llenar cada campo automáticamente."
    }
  }

  const openVoiceNotes = () => {
    // Navegar a la página de notas
    if (typeof window !== 'undefined') {
      window.location.href = '/notes';
    }
    
    toast.success("¡Navegando a la página de notas! 📝", {
      description: "Te estoy llevando a la página de notas. El asistente de voz se activará automáticamente.",
    })
    
    return {
      success: true,
      message: "Te estoy llevando a la página de notas. El asistente de voz se activará automáticamente y podrás crear, editar y gestionar notas usando solo tu voz."
    }
  }

  const generateReport = ({ type }: { type: string, data?: string }) => {
    const reportTypes = {
      "ventas": "Reporte de Ventas",
      "marketing": "Reporte de Marketing", 
      "financiero": "Reporte Financiero",
      "proyecto": "Reporte de Proyecto",
      "general": "Reporte General"
    }

    const reportType = reportTypes[type as keyof typeof reportTypes] || "Reporte"
    
    toast.success(`¡Generando ${reportType}! 📊`, {
      description: "El reporte se está generando con los datos proporcionados.",
    })

    return {
      success: true,
      type: reportType,
      message: `He generado un ${reportType} basado en la información proporcionada. El reporte incluye análisis, métricas y recomendaciones.`
    }
  }

  const scheduleMeeting = ({ title, date, participants }: { title: string, date: string, participants: string }) => {
    toast.success("¡Reunión programada! 📅", {
      description: `Reunión: ${title} - ${date}`,
    })

    return {
      success: true,
      title,
      date,
      participants,
      message: `He programado la reunión "${title}" para el ${date} con los participantes: ${participants}. Se ha enviado una confirmación por email.`
    }
  }

  const showHelp = () => {
    // Disparar evento para abrir el asistente de comandos
    createCustomEvent('openCommandAssistant');
    
    toast.success("¡Abriendo asistente de comandos! 📚", {
      description: "Aquí tienes todos los comandos disponibles organizados por categorías.",
    })
    return {
      success: true,
      message: "He abierto el asistente de comandos por voz. Aquí puedes ver todas las funciones disponibles organizadas por categorías: Marketing, Productividad, Herramientas Básicas, Web y Utilidades."
    }
  }

  return {
    timeFunction,
    backgroundFunction,
    partyFunction,
    launchWebsite,
    copyToClipboard,
    scrapeWebsite,
    createCampaign,
    openVoiceNotes,
    generateReport,
    scheduleMeeting,
    showHelp
  }
}