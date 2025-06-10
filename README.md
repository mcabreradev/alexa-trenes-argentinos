# Alexa Skill - Trenes Argentinos

Este proyecto es una skill de Alexa que permite a los usuarios consultar horarios de trenes en Argentina. Utiliza una API personalizada para obtener información sobre estaciones, horarios y servicios de trenes.

## Características

- Consulta de próximos trenes desde una estación específica
- Búsqueda de horarios entre dos estaciones
- Información sobre el primer tren de mañana
- Soporte para visualización en dispositivos con pantalla (APL)
- Manejo de nombres alternativos de estaciones
- Sistema de fallback robusto cuando la API principal no responde
- Procesamiento inteligente de consultas por voz

## Estructura del Proyecto

```
alexa-trenes-argentinos/
├── lambda/                   # Código de backend (AWS Lambda)
│   ├── apl-documents/        # Documentos APL para visualización
│   │   └── train-schedule-apl.json
│   ├── src/                  # Código fuente
│   │   ├── helpers/          # Utilidades y funciones auxiliares
│   │   │   ├── alexa-slot-helper.ts    # Manejo de slots de Alexa
│   │   │   └── estaciones-helper.ts    # Procesamiento de nombres de estaciones
│   │   ├── services/         # Servicios para lógica de negocio
│   │   │   ├── horarios-service.ts     # Servicio de horarios
│   │   │   └── trenes-api-service.ts   # Cliente de API
│   │   ├── types/            # Definiciones de tipos TypeScript
│   │   │   └── api-types.ts            # Interfaces y tipos para la API
│   │   ├── apl-utils.js      # Utilidades para APL
│   │   └── index.js          # Punto de entrada principal
│   ├── package.json          # Dependencias y scripts
│   └── tsconfig.json         # Configuración de TypeScript
└── skill/                    # Configuración de la skill
    ├── models/               # Modelos de interacción
    │   └── es-ES.json        # Modelo en español
    └── skill.json            # Configuración general de la skill
```

## Tecnologías

- **Node.js**: Entorno de ejecución
- **TypeScript**: Para tipado estático y mejor mantenibilidad
- **Alexa Skills Kit (ASK)**: SDK para desarrollo de skills
- **APL (Alexa Presentation Language)**: Para interfaces visuales
- **API REST**: Comunicación con el servicio de horarios

## Modelo de Interacción

La skill cuenta con los siguientes intents principales:

### GetNextTrainIntent

Permite consultar el próximo tren desde una estación.

**Ejemplos de frases:**
- "Cuándo sale el próximo tren en Retiro"
- "Horario de trenes en Constitución"
- "Próximo tren desde Tigre"

### GetTrainBetweenStationsIntent

Busca horarios de trenes entre dos estaciones.

**Ejemplos de frases:**
- "Tren de Retiro a Tigre"
- "Horarios entre Constitución y Temperley"
- "Cuándo sale el tren de Once a Moreno"

### GetFirstTrainTomorrowIntent

Obtiene información sobre el primer tren de mañana desde una estación.

**Ejemplos de frases:**
- "Primer tren mañana desde Retiro"
- "A qué hora sale el primer tren mañana en Constitución"
- "Horarios de mañana en Palermo"

## Servicios y Componentes

### TrenesApiService

Servicio encargado de la comunicación con la API de trenes. Maneja:
- Timeout de peticiones (5 segundos)
- Fallback a endpoint alternativo
- Manejo de errores y formatos de respuesta variados
- Formateo de fechas y horas

```typescript
const apiService = new TrenesApiService();
const estaciones = await apiService.getEstaciones({ nombre: 'Retiro' });
```

### HorariosService

Servicio de alto nivel para consulta de horarios que simplifica las operaciones comunes:
- Búsqueda de estaciones por nombre con múltiples estrategias
- Obtención de próximos trenes
- Consulta de horarios entre estaciones
- Información de trenes para el día siguiente

```typescript
const horariosService = new HorariosService();
const proximoTren = await horariosService.obtenerProximoTren('Retiro');
```

### EstacionesHelper

Utilidad para trabajar con nombres de estaciones:
- Normalización de nombres (quitar acentos, minúsculas)
- Mapeo de nombres alternativos (ej. "Plaza Once" → "Once")
- Búsqueda aproximada cuando no hay coincidencia exacta
- Respaldo con IDs conocidos para estaciones populares

```typescript
const idEstacion = EstacionesHelper.buscarCoincidenciaAproximada('Estaciòn Retíro');
// Devuelve: "RTR"
```

### AlexaSlotHelper

Facilita la extracción de valores de slots de Alexa:
- Prioriza valores resueltos sobre valores directos
- Manejo de fechas y horas relativas ("mañana", "hoy")
- Extracción múltiple de slots en una sola operación

```typescript
const origen = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'origen');
```

## Visualización con APL

La skill incluye soporte para dispositivos con pantalla mediante APL (Alexa Presentation Language). 
Los documentos APL se encuentran en `lambda/apl-documents/` y muestran información visual sobre:

- Horario de salida
- Estación de origen y destino
- Mensaje contextual

## API y Endpoints

El servicio utiliza una API personalizada que actúa como proxy de la API oficial de Trenes Argentinos:

- **BASE URL**: `https://ariedro.dev/api-trenes`
- **ENDPOINTS**:
  - `/infraestructura/estaciones`: Información sobre estaciones
  - `/infraestructura/ramales`: Información sobre ramales
  - `/arribos/estacion/{id}`: Horarios de arribos a una estación

## Despliegue

Para desplegar la skill, siga estos pasos:

1. **Instalar dependencias**:
   ```bash
   cd lambda && pnpm install
   ```

2. **Compilar TypeScript**:
   ```bash
   pnpm build
   ```

3. **Crear paquete para Lambda**:
   ```bash
   pnpm run deploy
   ```
   Esto generará un archivo `alexa-trenes-argentinos.zip` en la carpeta `lambda`.

4. **Subir a AWS Lambda**:
   - Cree una función Lambda en AWS
   - Suba el archivo zip generado
   - Configure el handler como `index.handler`

5. **Configurar la Skill**:
   - Cree una nueva skill en [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   - Importe el modelo de interacción desde `skill/models/es-ES.json`
   - Configure el endpoint de Lambda

## Desarrollo Local

Para desarrollar y probar localmente:

1. **Instalar dependencias**:
   ```bash
   cd lambda && pnpm install
   ```

2. **Compilar en modo watch**:
   ```bash
   pnpm tsc --watch
   ```

3. **Pruebas locales**:
   ```bash
   node -e "const { HorariosService } = require('./src/services/horarios-service.js'); const service = new HorariosService(); async function test() { const result = await service.obtenerProximoTren('Retiro'); console.log(result); } test().catch(console.error);"
   ```

## Manejo de Errores

La skill está diseñada para manejar varios escenarios de error:

- Timeout en peticiones a la API (5 segundos)
- Fallback a endpoint alternativo cuando el principal falla
- Mapeo de estaciones conocidas cuando la API no las encuentra
- Mensajes amigables cuando no hay horarios disponibles
- FallbackIntent para cuando Alexa no entiende la consulta

## Contribución

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, contactar a:
- Autor: [Tu Nombre]
- Email: [tu.email@ejemplo.com]

---

Desarrollado con ❤️ para facilitar la consulta de horarios de trenes en Argentina.
