"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrenesApiService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const api_types_1 = require("../types/api-types");
// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'https://ariedro.dev/api-trenes',
    FALLBACK_URL: 'https://ariedro.dev/api-trenes',
    TIMEOUT_MS: 5000,
};
/**
 * Servicio para realizar llamadas a la API de Trenes Argentinos
 */
class TrenesApiService {
    constructor(config = API_CONFIG) {
        this.baseUrl = config.BASE_URL;
        this.fallbackUrl = config.FALLBACK_URL;
        this.timeoutMs = config.TIMEOUT_MS;
    }
    /**
     * Ejecuta una llamada a la API con manejo de timeout y fallback
     */
    async fetchWithFallback(endpoint, useBase = true) {
        const url = `${useBase ? this.baseUrl : this.fallbackUrl}${endpoint}`;
        console.log(`Llamando a API: ${url}`);
        // Configurar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await (0, node_fetch_1.default)(url, { signal: controller.signal });
            clearTimeout(timeoutId); // Limpiar timeout después de la respuesta
            if (!response.ok) {
                console.error(`Error en API (${response.status}): ${response.statusText}`);
                // Si es el endpoint principal y falla, intentar con fallback
                if (useBase && this.baseUrl !== this.fallbackUrl) {
                    console.log('Intentando con endpoint de respaldo...');
                    return this.fetchWithFallback(endpoint, false);
                }
                throw new Error(`Error en API: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId); // Limpiar timeout en caso de error
            if (error.name === 'AbortError') {
                console.error('La petición se abortó por timeout');
            }
            else {
                console.error('Error en API:', error);
            }
            // Si es el endpoint principal y falla, intentar con fallback
            if (useBase && this.baseUrl !== this.fallbackUrl) {
                console.log('Intentando con endpoint de respaldo después de error...');
                return this.fetchWithFallback(endpoint, false);
            }
            throw error;
        }
    }
    /**
     * Busca estaciones por nombre o ramal
     */
    async getEstaciones(params) {
        let endpointPath = String(api_types_1.ApiEndpoints.ESTACIONES);
        const queryParams = [];
        if (params === null || params === void 0 ? void 0 : params.nombre) {
            queryParams.push(`nombre=${encodeURIComponent(params.nombre)}`);
        }
        if (params === null || params === void 0 ? void 0 : params.ramal) {
            queryParams.push(`ramal=${encodeURIComponent(params.ramal)}`);
        }
        if (queryParams.length > 0) {
            endpointPath = `${endpointPath}?${queryParams.join('&')}`;
        }
        return this.fetchWithFallback(endpointPath);
    }
    /**
     * Obtiene los ramales disponibles
     */
    async getRamales() {
        return this.fetchWithFallback(String(api_types_1.ApiEndpoints.RAMALES));
    }
    /**
     * Obtiene arribos/horarios para una estación
     */
    async getArribos(params) {
        let endpointPath = `${String(api_types_1.ApiEndpoints.ARRIBOS_ESTACION)}/${params.estacionId}`;
        const queryParams = [];
        if (params.hasta) {
            queryParams.push(`hasta=${encodeURIComponent(params.hasta)}`);
        }
        if (params.fecha) {
            queryParams.push(`fecha=${encodeURIComponent(params.fecha)}`);
        }
        if (params.hora) {
            queryParams.push(`hora=${encodeURIComponent(params.hora)}`);
        }
        if (params.cantidad) {
            queryParams.push(`cantidad=${params.cantidad}`);
        }
        if (queryParams.length > 0) {
            endpointPath += `?${queryParams.join('&')}`;
        }
        const result = await this.fetchWithFallback(endpointPath);
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(result)) {
            return result;
        }
        else if (result && 'trenes' in result && Array.isArray(result.trenes)) {
            return result.trenes;
        }
        return [];
    }
    /**
     * Formatea un objeto de fecha para la API (YYYY-MM-DD)
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    /**
     * Formatea un objeto de hora para la API (HH:MM)
     */
    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    }
    /**
     * Obtiene fecha y hora actuales formateadas para la API
     */
    getCurrentDateTime() {
        const now = new Date();
        return {
            fecha: this.formatDate(now),
            hora: this.formatTime(now)
        };
    }
    /**
     * Obtiene la fecha de mañana formateada para la API
     */
    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.formatDate(tomorrow);
    }
    /**
     * Formatea un horario ISO para presentarlo al usuario (HH:MM)
     */
    formatHorarioForDisplay(horarioIso) {
        try {
            // Si es un formato ISO completo (YYYY-MM-DDThh:mm:ss)
            if (horarioIso.includes('T')) {
                return horarioIso.split('T')[1].slice(0, 5);
            }
            // Si es solo hora (hh:mm:ss)
            else if (horarioIso.includes(':')) {
                return horarioIso.slice(0, 5);
            }
            return horarioIso;
        }
        catch (error) {
            console.error('Error formateando horario:', error);
            return horarioIso;
        }
    }
}
exports.TrenesApiService = TrenesApiService;
