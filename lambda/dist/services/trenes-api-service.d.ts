import { Estacion, EstacionParams, ArriboParams, Arribo, Ramal } from '../types/api-types';
/**
 * Servicio para realizar llamadas a la API de Trenes Argentinos
 */
export declare class TrenesApiService {
    private baseUrl;
    private fallbackUrl;
    private timeoutMs;
    constructor(config?: {
        BASE_URL: string;
        FALLBACK_URL: string;
        TIMEOUT_MS: number;
    });
    /**
     * Ejecuta una llamada a la API con manejo de timeout y fallback
     */
    private fetchWithFallback;
    /**
     * Busca estaciones por nombre o ramal
     */
    getEstaciones(params?: EstacionParams): Promise<Estacion[]>;
    /**
     * Obtiene los ramales disponibles
     */
    getRamales(): Promise<Ramal[]>;
    /**
     * Obtiene arribos/horarios para una estación
     */
    getArribos(params: ArriboParams): Promise<Arribo[]>;
    /**
     * Formatea un objeto de fecha para la API (YYYY-MM-DD)
     */
    formatDate(date: Date): string;
    /**
     * Formatea un objeto de hora para la API (HH:MM)
     */
    formatTime(date: Date): string;
    /**
     * Obtiene fecha y hora actuales formateadas para la API
     */
    getCurrentDateTime(): {
        fecha: string;
        hora: string;
    };
    /**
     * Obtiene la fecha de mañana formateada para la API
     */
    getTomorrowDate(): string;
    /**
     * Formatea un horario ISO para presentarlo al usuario (HH:MM)
     */
    formatHorarioForDisplay(horarioIso: string): string;
}
