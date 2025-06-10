import { TrenesApiService } from './trenes-api-service';
import { EstacionesHelper } from '../helpers/estaciones-helper';
import { Arribo, Estacion } from '../types/api-types';

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
export class HorariosService {
  private apiService: TrenesApiService;
  
  constructor() {
    this.apiService = new TrenesApiService();
  }

  /**
   * Busca una estación por nombre, intentando diferentes estrategias
   */
  async buscarEstacion(nombreEstacion: string): Promise<BusquedaEstacionResult | null> {
    if (!nombreEstacion) return null;
    
    // Normalizar el nombre para búsqueda
    const nombreNormalizado = EstacionesHelper.getNombreNormalizado(nombreEstacion);
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
      const idConocido = EstacionesHelper.getIdEstacionComun(nombreNormalizado);
      if (idConocido) {
        console.log(`Encontrada estación en mapa con ID: ${idConocido}`);
        return {
          id: idConocido,
          nombre: nombreEstacion,
          encontradoEn: 'mapa'
        };
      }
      
      // 3. Buscar coincidencia aproximada
      const idAproximado = EstacionesHelper.buscarCoincidenciaAproximada(nombreNormalizado);
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
    } catch (error) {
      console.error(`Error buscando estación:`, error);
      return null;
    }
  }

  /**
   * Obtiene horarios de trenes para una estación
   */
  async obtenerHorarios(options: HorariosOptions): Promise<Arribo[]> {
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
        hasta: estacionDestino?.id,
        fecha: options.fecha || fecha,
        hora: options.hora || hora,
        cantidad: options.cantidad || 3
      });
      
      return arribos;
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      return [];
    }
  }
  
  /**
   * Obtiene el próximo tren desde una estación
   */
  async obtenerProximoTren(estacion: string): Promise<Arribo | null> {
    const arribos = await this.obtenerHorarios({ estacion, cantidad: 1 });
    return arribos.length > 0 ? arribos[0] : null;
  }
  
  /**
   * Obtiene el próximo tren entre dos estaciones
   */
  async obtenerProximoTrenEntreEstaciones(origen: string, destino: string): Promise<Arribo | null> {
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
  async obtenerHorariosMañana(estacion: string): Promise<Arribo[]> {
    const fechaMañana = this.apiService.getTomorrowDate();
    return this.obtenerHorarios({
      estacion,
      fecha: fechaMañana,
      hora: '05:00', // Asumimos primer tren temprano
      cantidad: 1
    });
  }
  
  /**
   * Formatea un horario para presentación al usuario
   */
  formatearHorario(arribo: Arribo): string {
    return arribo.horario ? 
      this.apiService.formatHorarioForDisplay(arribo.horario) : 
      (arribo.hora || 'No disponible');
  }
}
