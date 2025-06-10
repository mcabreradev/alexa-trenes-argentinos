import { Arribo } from '../types/api-types';
/**
 * Interfaz para opciones de consulta de horarios
 */
export interface HorariosOptions {
    estacion: string;
    destino?: string;
    fecha?: string;
    hora?: string;
    cantidad?: number;
}
/**
 * Interfaz para resultado de búsqueda de estación
 */
interface BusquedaEstacionResult {
    id: string;
    nombre: string;
    encontradoEn: 'api' | 'mapa' | 'aproximado';
}
/**
 * Servicio para consultar horarios de trenes
 */
export declare class HorariosService {
    private apiService;
    constructor();
    /**
     * Busca una estación por nombre, intentando diferentes estrategias
     */
    buscarEstacion(nombreEstacion: string): Promise<BusquedaEstacionResult | null>;
    /**
     * Obtiene horarios de trenes para una estación
     */
    obtenerHorarios(options: HorariosOptions): Promise<Arribo[]>;
    /**
     * Obtiene el próximo tren desde una estación
     */
    obtenerProximoTren(estacion: string): Promise<Arribo | null>;
    /**
     * Obtiene el próximo tren entre dos estaciones
     */
    obtenerProximoTrenEntreEstaciones(origen: string, destino: string): Promise<Arribo | null>;
    /**
     * Obtiene horarios para mañana
     */
    obtenerHorariosMañana(estacion: string): Promise<Arribo[]>;
    /**
     * Formatea un horario para presentación al usuario
     */
    formatearHorario(arribo: Arribo): string;
}
export {};
