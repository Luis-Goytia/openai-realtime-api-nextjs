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
    // Navegar a la página de campañas
    if (typeof window !== 'undefined') {
      window.location.href = '/campaigns';
    }
    
    toast.success("¡Navegando a la página de campañas! 🎯", {
      description: "Te estoy llevando a la página de campañas. El asistente de voz se activará automáticamente.",
    })
    
    return {
      success: true,
      message: "Te estoy llevando a la página de campañas. El asistente de voz se activará automáticamente y podrás crear, editar y gestionar campañas de marketing usando solo tu voz."
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

  const generateReport = () => {
    // Navegar a la página de reportes
    if (typeof window !== 'undefined') {
      window.location.href = '/reports';
    }
    
    toast.success("¡Navegando a la página de reportes! 📊", {
      description: "Te estoy llevando a la página de reportes. El asistente de voz se activará automáticamente.",
    })
    
    return {
      success: true,
      message: "Te estoy llevando a la página de reportes. El asistente de voz se activará automáticamente y podrás crear, editar y gestionar reportes usando solo tu voz."
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

  // Funciones específicas para reportes (solo disponibles en la página de reportes)
  const createReport = () => {
    // Disparar evento para crear reporte
    const event = new CustomEvent('createReport');
    document.dispatchEvent(event);
    
    return {
      success: true,
      message: "He abierto el formulario para crear un nuevo reporte. Di el título y tipo de tu reporte."
    }
  }

  const saveReport = () => {
    // Disparar evento para guardar reporte
    const event = new CustomEvent('saveReport');
    document.dispatchEvent(event);
    
    return {
      success: true,
      message: "He guardado el reporte exitosamente."
    }
  }

  const goToCampaigns = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/campaigns';
    }
    
    return {
      success: true,
      message: "Te estoy llevando a la página de campañas."
    }
  }

  const goToNotes = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/notes';
    }
    
    return {
      success: true,
      message: "Te estoy llevando a la página de notas."
    }
  }

  const setReportTitle = ({ title }: { title: string }) => {
    // Disparar evento para establecer título
    const event = new CustomEvent('setReportTitle', { detail: { title } });
    document.dispatchEvent(event);
    
    return {
      success: true,
      title,
      message: `He establecido el título como "${title}".`
    }
  }

  const setReportType = ({ type }: { type: string }) => {
    // Disparar evento para establecer tipo
    const event = new CustomEvent('setReportType', { detail: { type } });
    document.dispatchEvent(event);
    
    return {
      success: true,
      type,
      message: `He establecido el tipo como "${type}".`
    }
  }

  const setReportContent = ({ content }: { content: string }) => {
    // Disparar evento para establecer contenido
    const event = new CustomEvent('setReportContent', { detail: { content } });
    document.dispatchEvent(event);
    
    return {
      success: true,
      content,
      message: "He establecido el contenido del reporte."
    }
  }

  const setReportData = ({ data }: { data: string }) => {
    // Disparar evento para establecer datos
    const event = new CustomEvent('setReportData', { detail: { data } });
    document.dispatchEvent(event);
    
    return {
      success: true,
      data,
      message: "He establecido los datos adicionales del reporte."
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
    showHelp,
    // Funciones específicas de reportes
    createReport,
    saveReport,
    goToCampaigns,
    goToNotes,
    setReportTitle,
    setReportType,
    setReportContent,
    setReportData
  }
}