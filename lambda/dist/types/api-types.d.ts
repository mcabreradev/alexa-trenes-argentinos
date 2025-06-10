/**
 * Definición de tipos para la API de Trenes Argentinos
 */
export interface Estacion {
    id: string;
    nombre: string;
    ramal?: string;
    latitud?: number;
    longitud?: number;
}
export interface Ramal {
    id: string;
    nombre: string;
    color?: string;
    estaciones?: Estacion[];
}
export interface Arribo {
    id?: string;
    horario: string;
    hora?: string;
    destino?: string;
    destinoId?: string;
    origen?: string;
    origenId?: string;
    ramal?: string;
    ramalId?: string;
    estado?: string;
}
export interface EstacionParams {
    nombre?: string;
    ramal?: string;
}
export interface ArriboParams {
    estacionId: string;
    hasta?: string;
    fecha?: string;
    hora?: string;
    cantidad?: number;
}
export interface ApiError {
    error: string;
    message: string;
    status?: number;
}
export declare const ApiEndpoints: {
    readonly ESTACIONES: "/infraestructura/estaciones";
    readonly RAMALES: "/infraestructura/ramales";
    readonly ARRIBOS_ESTACION: "/arribos/estacion";
};
