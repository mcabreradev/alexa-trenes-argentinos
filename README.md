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
│   ├── src/                  # Código fuente TypeScript
│   │   ├── helpers/          # Utilidades y funciones auxiliares
│   │   │   ├── alexa-slot-helper.ts    # Manejo de slots de Alexa
│   │   │   └── estaciones-helper.ts    # Procesamiento de nombres de estaciones
│   │   ├── services/         # Servicios para lógica de negocio
│   │   │   ├── horarios-service.ts     # Servicio de horarios
│   │   │   └── trenes-api-service.ts   # Cliente de API
│   │   ├── types/            # Definiciones de tipos TypeScript
│   │   │   └── api-types.ts            # Interfaces y tipos para la API
│   │   ├── apl-utils.ts      # Utilidades para APL
│   │   └── index.ts          # Punto de entrada principal
│   ├── dist/                 # Código JavaScript compilado
│   │   ├── helpers/          # Versiones compiladas de los helpers
│   │   ├── services/         # Versiones compiladas de los servicios
│   │   └── types/            # Versiones compiladas de los tipos
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
- **Jest**: Framework para pruebas unitarias

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

### Endpoints

1. **Estaciones**
   - URL: `/infraestructura/estaciones`
   - Método: `GET`
   - Parámetros:
     - `nombre` (opcional): Filtrar por nombre de estación
     - `ramal` (opcional): Filtrar por ramal
   - Respuesta:
     ```json
     [
       {
         "id": "RTR",
         "nombre": "Retiro",
         "ramal": "R1"
       },
       {
         "id": "CST",
         "nombre": "Constitución",
         "ramal": "R2"
       }
     ]
     ```

2. **Ramales**
   - URL: `/infraestructura/ramales`
   - Método: `GET`
   - Parámetros:
     - `id` (opcional): Filtrar por ID de ramal
     - `nombre` (opcional): Filtrar por nombre de ramal
   - Respuesta:
     ```json
     [
       {
         "id": "R1",
         "nombre": "Ramal Tigre",
         "estaciones": ["RTR", "PAL", "TIG"]
       },
       {
         "id": "R2",
         "nombre": "Ramal Lomas de Zamora",
         "estaciones": ["CST", "AVE", "LDZ"]
       }
     ]
     ```

3. **Arribos a Estación**
   - URL: `/arribos/estacion/{id}`
   - Método: `GET`
   - Parámetros:
     - `fecha` (opcional): Fecha en formato YYYY-MM-DD
     - `hora` (opcional): Hora en formato HH:MM
     - `limite` (opcional): Límite de resultados
   - Respuesta:
     ```json
     [
       {
         "ramal": "R1",
         "estacionOrigen": "RTR",
         "estacionDestino": "TIG",
         "horaSalida": "14:30",
         "horaLlegada": "15:15",
         "servicioId": "S123",
         "fechaServicio": "2025-06-09"
       }
     ]
     ```

4. **Horarios entre Estaciones**
   - URL: `/horarios/{origen}/{destino}`
   - Método: `GET`
   - Parámetros:
     - `fecha` (opcional): Fecha en formato YYYY-MM-DD
     - `hora` (opcional): Hora a partir de la cual buscar
     - `limite` (opcional): Límite de resultados
   - Respuesta: Similar a Arribos

### Manejo de Errores

La API devuelve códigos de estado HTTP estándar:
- `200 OK`: Respuesta exitosa
- `400 Bad Request`: Error en los parámetros
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

Los errores incluyen un mensaje descriptivo:
```json
{
  "error": true,
  "mensaje": "Descripción del error"
}
```

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
   - Configure el handler como `dist/index.handler`

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
   pnpm watch
   ```

3. **Ejecutar pruebas unitarias**:
   ```bash
   pnpm test
   ```

4. **Ver cobertura de pruebas**:
   ```bash
   pnpm test:coverage
   ```

5. **Pruebas locales**:
   ```bash
   # Usando el servicio compilado
   node -e "const { HorariosService } = require('./dist/services/horarios-service'); const service = new HorariosService(); async function test() { const result = await service.obtenerProximoTren('Retiro'); console.log(result); } test().catch(console.error);"
   
   # O ejecutando la aplicación completa
   pnpm start
   ```

## Pruebas Unitarias

El proyecto incluye pruebas unitarias completas para todos los componentes principales:

- **Helpers**: Pruebas para `AlexaSlotHelper` y `EstacionesHelper`
- **Servicios**: Pruebas para `TrenesApiService` y `HorariosService`

Las pruebas están organizadas en la carpeta `tests/` con una estructura que refleja la estructura de `src/`:

```
tests/
├── helpers/
│   ├── alexa-slot-helper.test.ts
│   └── estaciones-helper.test.ts
├── services/
│   ├── horarios-service.test.ts
│   └── trenes-api-service.test.ts
└── mocks/
    ├── api-types.mock.ts
    └── request-envelope.mock.ts
```

Para ejecutar las pruebas:

```bash
pnpm test                 # Ejecutar todas las pruebas
pnpm test:watch           # Ejecutar en modo watch (para desarrollo)
pnpm test:coverage        # Generar informe de cobertura
```

### Mocking

- Se utiliza Jest para mockear dependencias externas como `node-fetch`
- Se mockea `TrenesApiService` en las pruebas de `HorariosService`
- Uso de mocks para `RequestEnvelope` de Alexa en las pruebas de helpers

### Cobertura

El proyecto tiene como objetivo mantener una cobertura de pruebas superior al 80% para todos los archivos excepto los tipos.

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

## Documentación Detallada

Para más información sobre el desarrollo, consulta la documentación detallada:

- [Guía del Desarrollador](docs/developer-guide.md) - Configuración, arquitectura y buenas prácticas
- [Referencia de API](docs/api-reference.md) - Detalles sobre endpoints y modelos de datos
- [Guía de Extensión](docs/extension-guide.md) - Cómo añadir nuevas funcionalidades
- [Referencia Rápida](docs/quick-reference.md) - Comandos y ejemplos comunes

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, contactar a:
- Autor: Miguelangel Cabrera
- Email: mcabrera.dev@gmail.com

---

Desarrollado con ❤️ para facilitar la consulta de horarios de trenes en Argentina.
