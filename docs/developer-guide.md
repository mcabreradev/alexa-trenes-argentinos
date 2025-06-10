# Guía del Desarrollador - Alexa Skill Trenes Argentinos

Este documento proporciona información detallada para desarrolladores que deseen contribuir o mantener la skill de Alexa para Trenes Argentinos.

## Configuración del Entorno de Desarrollo

### Requisitos Previos

- Node.js v14 o superior
- pnpm (recomendado) o npm
- TypeScript 4.9 o superior
- AWS CLI (para despliegues)
- Cuenta de Desarrollador de Amazon Alexa

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd alexa-trenes-argentinos
   ```

2. Instalar dependencias:
   ```bash
   cd lambda
   pnpm install
   ```

3. Compilar el proyecto:
   ```bash
   pnpm build
   ```

4. Ejecutar pruebas:
   ```bash
   pnpm test
   ```

## Estructura del Proyecto

### Lambda (Backend)

El código del backend se encuentra en la carpeta `lambda/`:

- `src/`: Código fuente TypeScript
  - `index.ts`: Punto de entrada principal y definición de handlers de Alexa
  - `helpers/`: Utilidades auxiliares
    - `alexa-slot-helper.ts`: Manejo de slots de Alexa
    - `estaciones-helper.ts`: Procesamiento de nombres de estaciones
  - `services/`: Servicios de negocio
    - `horarios-service.ts`: Lógica de consulta de horarios
    - `trenes-api-service.ts`: Cliente para API de trenes
  - `types/`: Definiciones de tipos TypeScript
    - `api-types.ts`: Interfaces para respuestas de API

- `tests/`: Pruebas unitarias
  - Estructura espejo de `src/`
  - `mocks/`: Objetos mock para pruebas

- `apl-documents/`: Plantillas APL para interfaces visuales

### Skill (Configuración)

La configuración de la skill se encuentra en la carpeta `skill/`:

- `skill.json`: Configuración general de la skill
- `models/`: Modelos de interacción
  - `es-ES.json`: Modelo en español

## Flujo de Trabajo de Desarrollo

### Ciclo de Desarrollo

1. **Modificar código**: Realizar cambios en archivos `.ts` en `lambda/src/`
2. **Compilar**: Ejecutar `pnpm build` o `pnpm watch` para compilación automática
3. **Probar**: Ejecutar `pnpm test` para verificar que no se rompió nada
4. **Desplegar**: Generar paquete con `pnpm deploy`

### Pruebas Locales

Para probar la funcionalidad sin desplegar:

```typescript
// Probar HorariosService
const { HorariosService } = require('./dist/services/horarios-service');
const service = new HorariosService();
async function test() {
  const result = await service.obtenerProximoTren('Retiro');
  console.log(result);
}
test().catch(console.error);
```

### Buenas Prácticas

- **Tipado estricto**: Usar TypeScript con configuración estricta
- **Manejo de errores**: Capturar y manejar todas las excepciones
- **Logging**: Usar `console.log/error` para información relevante
- **Pruebas**: Mantener cobertura de pruebas alta (>80%)
- **Comentarios**: Documentar funciones y métodos con JSDoc

## Arquitectura

### Componentes Principales

1. **Handlers de Alexa** (`index.ts`)
   - Manejan intents y eventos del ciclo de vida
   - Delegan lógica de negocio a servicios

2. **HorariosService** (`horarios-service.ts`)
   - Servicio de alto nivel para consultas de horarios
   - Implementa lógica de búsqueda y fallback

3. **TrenesApiService** (`trenes-api-service.ts`)
   - Cliente para API de Trenes Argentinos
   - Maneja timeout, reintentos y errores

4. **Helpers**
   - `EstacionesHelper`: Procesamiento de nombres de estaciones
   - `AlexaSlotHelper`: Extracción de valores de slots

### Flujo de Datos

```
Alexa Request → Handlers → HorariosService → TrenesApiService → API externa
                   ↓
                Helpers
                   ↓
Alexa Response ← Handlers ← Datos procesados ← Datos crudos
```

## API de Trenes

### Endpoints Principales

- **Estaciones**: `/infraestructura/estaciones`
- **Ramales**: `/infraestructura/ramales`
- **Arribos**: `/arribos/estacion/{id}`
- **Horarios**: `/horarios/{origen}/{destino}`

### Modelos de Datos

Principales interfaces en `api-types.ts`:

```typescript
interface Estacion {
  id: string;      // Código único (ej: "RTR")
  nombre: string;  // Nombre (ej: "Retiro")
  ramal: string;   // Código de ramal (ej: "R1")
}

interface Arribo {
  ramal: string;           // Código de ramal
  estacionOrigen: string;  // Estación de salida
  estacionDestino: string; // Estación de llegada
  horaSalida: string;      // Hora de salida (HH:MM)
  horaLlegada: string;     // Hora de llegada (HH:MM)
  servicioId: string;      // ID del servicio
  fechaServicio: string;   // Fecha (YYYY-MM-DD)
}
```

## Despliegue

### Generación de Paquete

El script `scripts/optimize-deploy.sh` genera un paquete optimizado:

1. Compila el código TypeScript
2. Elimina dependencias de desarrollo
3. Crea un archivo ZIP con solo lo necesario
4. Excluye archivos innecesarios para reducir tamaño

### Actualización de AWS Lambda

1. Acceder a la consola de AWS Lambda
2. Seleccionar la función existente
3. Cargar el archivo ZIP generado
4. Guardar los cambios

### Actualización del Modelo de Interacción

1. Acceder a Alexa Developer Console
2. Ir a "Build" → "Interaction Model"
3. Usar "JSON Editor" para cargar `skill/models/es-ES.json`
4. Guardar y construir el modelo

## Resolución de Problemas

### Errores Comunes

- **Timeouts en API**: Verificar conectividad y aumentar timeout si es necesario
- **Nombres de estaciones no reconocidos**: Añadir al mapa de nombres alternativos
- **Problemas con la compilación**: Verificar errores de TypeScript

### Depuración

- Habilitar logs detallados en Lambda
- Usar CloudWatch para revisar registros
- Probar localmente antes de desplegar

## Recursos Adicionales

- [Alexa Skills Kit SDK para Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- [Documentación de Alexa Presentation Language (APL)](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/understand-apl.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
