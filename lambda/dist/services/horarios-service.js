"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorariosService = void 0;
const trenes_api_service_1 = require("./trenes-api-service");
const estaciones_helper_1 = require("../helpers/estaciones-helper");
/**
 * Servicio para consultar horarios de trenes
 */
class HorariosService {
    constructor() {
        this.apiService = new trenes_api_service_1.TrenesApiService();
    }
    /**
     * Busca una estación por nombre, intentando diferentes estrategias
     */
    async buscarEstacion(nombreEstacion) {
        if (!nombreEstacion)
            return null;
        // Normalizar el nombre para búsqueda
        const nombreNormalizado = estaciones_helper_1.EstacionesHelper.getNombreNormalizado(nombreEstacion);
        console.log(`Buscando estación: "${nombreEstacion}" (normalizado: "${nombreNormalizado}")`);
        try {
            // 1. Intentar buscar en la API
            const estaciones = await this.apiService.getEstaciones({
                nombre: nombreNormalizado
            });
            if (estaciones && estaciones.length > 0) {
                console.log(`Encontrada estación con ID: ${estaciones[0].id}`);
                return {
                    id: estaciones[0].id,
                    nombre: estaciones[0].nombre,
                    encontradoEn: 'api'
                };
            }
            // 2. Buscar en el mapa de estaciones comunes
            const idConocido = estaciones_helper_1.EstacionesHelper.getIdEstacionComun(nombreNormalizado);
            if (idConocido) {
                console.log(`Encontrada estación en mapa con ID: ${idConocido}`);
                return {
                    id: idConocido,
                    nombre: nombreEstacion,
                    encontradoEn: 'mapa'
                };
            }
            // 3. Buscar coincidencia aproximada
            const idAproximado = estaciones_helper_1.EstacionesHelper.buscarCoincidenciaAproximada(nombreNormalizado);
            if (idAproximado) {
                console.log(`Coincidencia aproximada encontrada con ID: ${idAproximado}`);
                return {
                    id: idAproximado,
                    nombre: nombreEstacion,
                    encontradoEn: 'aproximado'
                };
            }
            console.log(`No se encontró ninguna coincidencia para: ${nombreEstacion}`);
            return null;
        }
        catch (error) {
            console.error(`Error buscando estación:`, error);
            return null;
        }
    }
    /**
     * Obtiene horarios de trenes para una estación
     */
    async obtenerHorarios(options) {
        try {
            // Buscar estación origen
            const estacionOrigen = await this.buscarEstacion(options.estacion);
            if (!estacionOrigen) {
                console.log(`No se pudo encontrar la estación origen: ${options.estacion}`);
                return [];
            }
            // Si hay destino, buscarlo también
            let estacionDestino = null;
            if (options.destino) {
                estacionDestino = await this.buscarEstacion(options.destino);
                if (!estacionDestino) {
                    console.log(`No se pudo encontrar la estación destino: ${options.destino}`);
                    return [];
                }
            }
            // Preparar los parámetros de consulta
            const { fecha, hora } = this.apiService.getCurrentDateTime();
            // Consultar horarios
            const arribos = await this.apiService.getArribos({
                estacionId: estacionOrigen.id,
                hasta: estacionDestino === null || estacionDestino === void 0 ? void 0 : estacionDestino.id,
                fecha: options.fecha || fecha,
                hora: options.hora || hora,
                cantidad: options.cantidad || 3
            });
            return arribos;
        }
        catch (error) {
            console.error('Error obteniendo horarios:', error);
            return [];
        }
    }
    /**
     * Obtiene el próximo tren desde una estación
     */
    async obtenerProximoTren(estacion) {
        const arribos = await this.obtenerHorarios({ estacion, cantidad: 1 });
        return arribos.length > 0 ? arribos[0] : null;
    }
    /**
     * Obtiene el próximo tren entre dos estaciones
     */
    async obtenerProximoTrenEntreEstaciones(origen, destino) {
        const arribos = await this.obtenerHorarios({
            estacion: origen,
            destino: destino,
            cantidad: 1
        });
        return arribos.length > 0 ? arribos[0] : null;
    }
    /**
     * Obtiene horarios para mañana
     */
    async obtenerHorariosMañana(estacion) {
        const fechaMañana = this.apiService.getTomorrowDate();
        return this.obtenerHorarios({
            estacion,
            fecha: fechaMañana,
            hora: '05:00',
            cantidad: 1
        });
    }
    /**
     * Formatea un horario para presentación al usuario
     */
    formatearHorario(arribo) {
        return arribo.horario ?
            this.apiService.formatHorarioForDisplay(arribo.horario) :
            (arribo.hora || 'No disponible');
    }
}
exports.HorariosService = HorariosService;
