# API y Modelo de Datos - Alexa Skill Trenes Argentinos

Este documento detalla la API utilizada por la skill y los modelos de datos asociados.

## API de Trenes Argentinos

La skill utiliza una API personalizada que actúa como proxy a la API oficial de Trenes Argentinos.

### URL Base

```
https://ariedro.dev/api-trenes
```

### Autenticación

La API no requiere autenticación (es de acceso público).

### Parámetros Globales

- `formato`: Opcional. Formato de respuesta (`json` por defecto)
- `timeout`: Opcional. Tiempo máximo de espera en ms (por defecto 5000)

### Endpoints

#### 1. Consulta de Estaciones

**Endpoint**: `/infraestructura/estaciones`

**Método**: GET

**Parámetros**:
- `nombre`: Opcional. Filtrar por nombre de estación
- `ramal`: Opcional. Filtrar por código de ramal

**Respuesta Exitosa** (200 OK):
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

**Respuesta de Error** (400, 404, 500):
```json
{
  "error": true,
  "mensaje": "Descripción del error"
}
```

**Ejemplo de Uso**:
```typescript
const estaciones = await apiService.getEstaciones({ nombre: 'Retiro' });
```

#### 2. Consulta de Ramales

**Endpoint**: `/infraestructura/ramales`

**Método**: GET

**Parámetros**:
- `id`: Opcional. Filtrar por ID de ramal
- `nombre`: Opcional. Filtrar por nombre de ramal

**Respuesta Exitosa** (200 OK):
```json
[
  {
    "id": "R1",
    "nombre": "Ramal Tigre",
    "estaciones": ["RTR", "PAL", "BEL", "NUN", "COL", "OLI", "SIS", "TIG"]
  }
]
```

**Ejemplo de Uso**:
```typescript
const ramales = await apiService.getRamales({ id: 'R1' });
```

#### 3. Arribos a Estación

**Endpoint**: `/arribos/estacion/{id}`

**Método**: GET

**Parámetros de Ruta**:
- `id`: Obligatorio. ID de la estación (ej: "RTR")

**Parámetros de Query**:
- `fecha`: Opcional. Fecha en formato YYYY-MM-DD (hoy por defecto)
- `hora`: Opcional. Hora a partir de la cual buscar, formato HH:MM (hora actual por defecto)
- `limite`: Opcional. Número máximo de resultados (10 por defecto)

**Respuesta Exitosa** (200 OK):
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

**Ejemplo de Uso**:
```typescript
const arribos = await apiService.getArribos('RTR', {
  fecha: '2025-06-09',
  hora: '14:00',
  limite: 5
});
```

#### 4. Horarios entre Estaciones

**Endpoint**: `/horarios/{origen}/{destino}`

**Método**: GET

**Parámetros de Ruta**:
- `origen`: Obligatorio. ID de la estación de origen
- `destino`: Obligatorio. ID de la estación de destino

**Parámetros de Query**:
- `fecha`: Opcional. Fecha en formato YYYY-MM-DD
- `hora`: Opcional. Hora a partir de la cual buscar
- `limite`: Opcional. Número máximo de resultados

**Respuesta Exitosa** (200 OK): Similar a Arribos

**Ejemplo de Uso**:
```typescript
const horarios = await apiService.getHorarios('RTR', 'TIG', {
  fecha: '2025-06-09'
});
```

## Modelos de Datos

### Estación

```typescript
interface Estacion {
  id: string;       // Identificador único de la estación
  nombre: string;   // Nombre de la estación
  ramal: string;    // Código del ramal al que pertenece
}
```

### Ramal

```typescript
interface Ramal {
  id: string;           // Identificador único del ramal
  nombre: string;       // Nombre descriptivo del ramal
  estaciones: string[]; // Array de IDs de estaciones en orden
}
```

### Arribo/Servicio

```typescript
interface Arribo {
  ramal: string;           // Código del ramal
  estacionOrigen: string;  // ID de la estación de origen
  estacionDestino: string; // ID de la estación de destino
  horaSalida: string;      // Hora de salida (formato HH:MM)
  horaLlegada: string;     // Hora de llegada (formato HH:MM)
  servicioId: string;      // Identificador único del servicio
  fechaServicio: string;   // Fecha del servicio (formato YYYY-MM-DD)
}
```

### Opciones de Consulta

```typescript
interface EstacionesOptions {
  nombre?: string;  // Filtrar por nombre
  ramal?: string;   // Filtrar por ramal
}

interface RamalesOptions {
  id?: string;      // Filtrar por ID
  nombre?: string;  // Filtrar por nombre
}

interface ArribosOptions {
  fecha?: string;   // Fecha en formato YYYY-MM-DD
  hora?: string;    // Hora en formato HH:MM
  limite?: number;  // Número máximo de resultados
}

interface HorariosOptions {
  estacion: string;  // Estación de origen o consulta
  destino?: string;  // Estación de destino (opcional)
  fecha?: string;    // Fecha (YYYY-MM-DD)
  hora?: string;     // Hora (HH:MM)
  cantidad?: number; // Límite de resultados
}
```

## Estrategias de Manejo de Errores

### Tipos de Errores

1. **Errores de Red**: Timeouts, problemas de conectividad
2. **Errores de API**: Respuestas 4xx o 5xx
3. **Errores de Datos**: Formato inesperado, datos faltantes

### Implementación

El servicio `TrenesApiService` implementa varias estrategias para manejar errores:

```typescript
// Ejemplo simplificado
async function callApi(endpoint: string, params: Record<string, any>): Promise<any> {
  try {
    // 1. Timeout configurable
    const timeoutMs = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      // otras opciones...
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 2. Manejo de errores HTTP
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // 3. Fallback a endpoints alternativos
    if (this.fallbackEnabled) {
      return this.callFallbackApi(endpoint, params);
    }
    throw error;
  }
}
```

## Mapeo de Nombres de Estaciones

La skill mantiene un mapa de nombres alternativos para mejorar el reconocimiento:

```typescript
// Ejemplo de mapeo en EstacionesHelper
private static readonly NOMBRES_ALTERNATIVOS: Record<string, string> = {
  'plaza once': 'once',
  'once de septiembre': 'once',
  'constitucion': 'constitución',
  'estacion retiro': 'retiro',
  // y más...
};
```

## Técnicas de Optimización

1. **Caché de Resultados**: Almacenamiento temporal de resultados frecuentes
2. **Procesamiento Paralelo**: Consultas simultáneas cuando se necesitan datos de múltiples fuentes
3. **Mapa de IDs Conocidos**: Evitar llamadas a API para estaciones populares

## Extensión del Modelo

Para añadir nuevos tipos de datos o endpoints:

1. Definir la interfaz en `api-types.ts`
2. Implementar el método correspondiente en `trenes-api-service.ts`
3. Exponer funcionalidad de alto nivel en `horarios-service.ts`
4. Actualizar los handlers en `index.ts` para usar la nueva funcionalidad
