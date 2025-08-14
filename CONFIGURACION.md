# Configuración de OpenAI Realtime API

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# API Key de OpenAI (requerido)
OPENAI_API_KEY=tu-api-key-aqui

# Modelo de OpenAI (opcional - por defecto: gpt-4o-realtime-preview-2025-06-03)
OPENAI_MODEL=gpt-4o-realtime-preview-2025-06-03
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-realtime-preview-2025-06-03

# Velocidad de respuesta (opcional - por defecto: 1.1)
# Rango: 0.25 a 4.0
# - 0.25: Muy lento
# - 1.0: Normal
# - 2.0: Rápido
# - 4.0: Muy rápido
OPENAI_SPEED=1.1
NEXT_PUBLIC_OPENAI_SPEED=1.1

# Temperatura/Creatividad (opcional - por defecto: 0.7)
# Rango: 0.0 a 2.0
# - 0.0: Muy determinista, respuestas consistentes
# - 0.7: Balanceado (recomendado)
# - 1.0: Más creativo
# - 2.0: Muy creativo, respuestas variadas
OPENAI_TEMPERATURE=0.7
NEXT_PUBLIC_OPENAI_TEMPERATURE=0.7

# Firecrawl API (opcional)
NEXT_PUBLIC_FIRECRAWL_API_KEY=tu-firecrawl-key-aqui
```

## Parámetros Explicados

### 🎯 Modelo (`OPENAI_MODEL`)

- **`gpt-4o-realtime-preview-2025-06-03`** (actual) - Modelo más reciente
- **`gpt-4o-realtime-preview-2024-12-17`** - Versión anterior
- **`gpt-4o-realtime-preview-2024-11-06`** - Versión más antigua

### ⚡ Velocidad (`OPENAI_SPEED`)

Controla qué tan rápido responde el asistente de voz:

- **0.25** - Muy lento, pero muy claro
- **0.5** - Lento
- **1.0** - Velocidad normal
- **1.1** - Ligeramente más rápido (recomendado)
- **2.0** - Rápido
- **4.0** - Muy rápido

### 🌡️ Temperatura (`OPENAI_TEMPERATURE`)

Controla la creatividad y variabilidad de las respuestas:

- **0.0** - Muy determinista, siempre responde igual
- **0.3** - Poco creativo, respuestas consistentes
- **0.7** - Balanceado (recomendado)
- **1.0** - Creativo
- **2.0** - Muy creativo, respuestas muy variadas

## Ubicaciones en el Código

### Servidor (API Route)

- **Archivo:** `app/api/session/route.ts`
- **Líneas:** 15-20
- **Variables:** `OPENAI_MODEL`, `OPENAI_SPEED`, `OPENAI_TEMPERATURE`

### Cliente (WebRTC Hook)

- **Archivo:** `hooks/use-webrtc.ts`
- **Líneas:** 478-481
- **Variables:** `NEXT_PUBLIC_OPENAI_MODEL`, `NEXT_PUBLIC_OPENAI_SPEED`, `NEXT_PUBLIC_OPENAI_TEMPERATURE`

### Transcripción (Whisper)

- **Archivo:** `hooks/use-webrtc.ts`
- **Líneas:** 82-84
- **Modelo:** `whisper-1-large-v3`

## Ejemplos de Configuración

### Para Respuestas Rápidas y Creativas

```env
OPENAI_SPEED=2.0
OPENAI_TEMPERATURE=1.0
```

### Para Respuestas Lentas y Deterministas

```env
OPENAI_SPEED=0.5
OPENAI_TEMPERATURE=0.3
```

### Para Respuestas Balanceadas (Recomendado)

```env
OPENAI_SPEED=1.1
OPENAI_TEMPERATURE=0.7
```

## Notas Importantes

1. **Variables del Cliente:** Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el navegador
2. **Variables del Servidor:** Las variables sin `NEXT_PUBLIC_` solo son visibles en el servidor
3. **Reinicio:** Después de cambiar las variables de entorno, reinicia el servidor de desarrollo
4. **Validación:** Los valores se validan automáticamente en el rango permitido por OpenAI
