# OpenAI Realtime API - Chat de Voz Interactivo

Un chat de voz avanzado que utiliza la API en tiempo real de OpenAI con WebRTC, ahora con funcionalidades interactivas por voz para crear campañas, tomar notas y más.

## 🚀 Nuevas Funcionalidades Interactivas

### 🎯 Creador de Campañas por Voz

- **Comando:** "Crear campaña"
- **Funcionalidad:** Abre un asistente interactivo para crear campañas de marketing completas
- **Características:**
  - Autocompletado por voz en todos los campos
  - Campos: Nombre, Descripción, Audiencia Objetivo, Presupuesto, Duración
  - Selección automática de objetivos y canales de marketing
  - Interfaz intuitiva con indicadores de grabación

### 📝 Asistente de Notas por Voz

- **Comando:** "Tomar notas"
- **Funcionalidad:** Sistema completo de notas con autocompletado por voz
- **Características:**
  - Creación de notas con título, contenido y etiquetas
  - Edición y gestión de notas existentes
  - Etiquetas predefinidas (Importante, Urgente, Ideas, etc.)
  - Exportación de notas en formato JSON
  - Interfaz dividida: creación y visualización

### 📚 Asistente de Comandos por Voz

- **Comando:** "Ayuda"
- **Funcionalidad:** Muestra todos los comandos disponibles organizados por categorías
- **Categorías:**
  - **Marketing:** Crear campañas, generar reportes
  - **Productividad:** Tomar notas, programar reuniones
  - **Básicas:** Hora, cambiar tema, modo fiesta
  - **Web:** Abrir sitios, extraer contenido
  - **Utilidades:** Copiar al portapapeles, ayuda

### 📊 Generador de Reportes

- **Comando:** "Generar reporte de [tipo]"
- **Tipos disponibles:** ventas, marketing, financiero, proyecto, general
- **Funcionalidad:** Crea reportes automáticos con análisis y recomendaciones

### 📅 Programador de Reuniones

- **Comando:** "Programar reunión"
- **Funcionalidad:** Agenda reuniones con título, fecha y participantes
- **Características:** Confirmación automática por email

## 🛠️ Funcionalidades Existentes

### Herramientas Básicas

- **Obtener hora:** "¿Qué hora es?"
- **Cambiar tema:** "Cambiar tema" o "Cambiar a modo oscuro/claro"
- **Modo fiesta:** "Iniciar modo fiesta" (animaciones y confeti)

### Navegación Web

- **Abrir sitio:** "Llévame a [sitio web]"
- **Extraer contenido:** "Extraer contenido de [URL]"

### Utilidades

- **Copiar al portapapeles:** "Copiar [texto] al portapapeles"

## 🎨 Características de la Interfaz

### Diseño Moderno

- Interfaz responsive con Tailwind CSS
- Componentes shadcn/ui para una experiencia consistente
- Animaciones suaves con Framer Motion
- Modo oscuro/claro

### Experiencia de Usuario

- Indicadores visuales de grabación
- Transcripción en tiempo real
- Toast notifications para feedback
- Modales interactivos para funcionalidades avanzadas

### Accesibilidad

- Soporte completo para español
- Comandos de voz intuitivos
- Interfaz adaptativa para diferentes dispositivos

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Cuenta de OpenAI con acceso a la API Realtime

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/openai-realtime-api-nextjs.git
cd openai-realtime-api-nextjs

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Configuración

Edita `.env.local` y agrega tu API key de OpenAI:

```env
OPENAI_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_FIRECRAWL_API_KEY=tu-firecrawl-key-aqui
```

### Ejecución

```bash
# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start
```

## 🎯 Ejemplos de Uso

### Flujo de Trabajo Típico

1. **Iniciar sesión:** Haz clic en "Iniciar Transmisión"
2. **Crear campaña:** Di "Crear campaña"
3. **Completar campos:** Habla para llenar cada campo automáticamente
4. **Tomar notas:** Di "Tomar notas" para documentar ideas
5. **Generar reporte:** Di "Generar reporte de marketing"
6. **Programar reunión:** Di "Programar reunión"

### Comandos Avanzados

```bash
# Combinar comandos
"Crear campaña para lanzar nuestro nuevo producto y luego tomar notas"

# Comandos específicos
"Generar reporte de ventas del último mes"
"Programar reunión con el equipo para mañana a las 10 AM"
"Tomar notas sobre la reunión de hoy"
```

## 🏗️ Arquitectura

### Componentes Principales

- `CampaignCreator`: Creador interactivo de campañas
- `VoiceNotes`: Sistema de notas por voz
- `VoiceCommandAssistant`: Asistente de comandos
- `useWebRTCAudioSession`: Hook principal para WebRTC
- `useToolsFunctions`: Hook para funciones de herramientas

### Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Estilos:** Tailwind CSS, shadcn/ui
- **Animaciones:** Framer Motion
- **Audio:** WebRTC, MediaRecorder API
- **IA:** OpenAI Realtime API

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- OpenAI por la API Realtime
- shadcn/ui por los componentes
- La comunidad de Next.js
- Todos los contribuidores

---

**¡Disfruta creando campañas y tomando notas con solo tu voz! 🎤✨**
