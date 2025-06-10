/**
 * Definición de tipos para la API de Trenes Argentinos
 */

// Tipos para estaciones
export interface Estacion {
  id: string;
  nombre: string;
  ramal?: string;
  latitud?: number;
  longitud?: number;
}

// Tipos para ramales
export interface Ramal {
  id: string;
  nombre: string;
  color?: string;
  estaciones?: Estacion[];
}

// Tipos para horarios/arribos
export interface Arribo {
  id?: string;
  horario: string;       // formato ISO (YYYY-MM-DDThh:mm:ss)
  hora?: string;         // formato hh:mm (alternativo)
  destino?: string;      // nombre de la estación destino
  destinoId?: string;    // ID de la estación destino
  origen?: string;       // nombre de la estación origen
  origenId?: string;     // ID de la estación origen
  ramal?: string;        // nombre del ramal
  ramalId?: string;      // ID del ramal
  estado?: string;       // estado del tren (en horario, demorado, etc.)
}

// Parámetros para consulta de estaciones
export interface EstacionParams {
  nombre?: string;       // nombre completo o parcial para filtrar
  ramal?: string;        // ID del ramal para filtrar
}

// Parámetros para consulta de arribos
export interface ArriboParams {
  estacionId: string;    // ID de la estación
  hasta?: string;        // ID de la estación destino (opcional)
  fecha?: string;        // YYYY-MM-DD (por defecto hoy)
  hora?: string;         // HH:MM (por defecto ahora)
  cantidad?: number;     // Número de resultados a devolver
}

// Tipos de respuesta de error
export interface ApiError {
  error: string;
  message: string;
  status?: number;
}

// Endpoints disponibles como constantes
export const ApiEndpoints = {
  ESTACIONES: '/infraestructura/estaciones',
  RAMALES: '/infraestructura/ramales',
  ARRIBOS_ESTACION: '/arribos/estacion',
} as const;
