import { Estacion } from '../types/api-types';
/**
 * Clase helper para el manejo de estaciones y sus nombres
 */
export declare class EstacionesHelper {
    private static readonly NOMBRES_ALTERNATIVOS;
    private static readonly ESTACIONES_COMUNES;
    /**
     * Normaliza un nombre de estación (quita acentos, convierte a minúsculas)
     */
    static normalizarNombre(nombre: string): string;
    /**
     * Busca un nombre alternativo para una estación
     */
    static getNombreNormalizado(nombre: string): string;
    /**
     * Obtiene el ID conocido de una estación común
     */
    static getIdEstacionComun(nombre: string): string | null;
    /**
     * Encuentra coincidencias aproximadas en el mapa de estaciones comunes
     */
    static buscarCoincidenciaAproximada(nombre: string): string | null;
    /**
     * Encuentra la mejor coincidencia entre un conjunto de estaciones
     */
    static encontrarMejorCoincidencia(nombre: string, estaciones: Estacion[]): Estacion | null;
}
