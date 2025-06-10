"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstacionesHelper = void 0;
/**
 * Clase helper para el manejo de estaciones y sus nombres
 */
class EstacionesHelper {
    /**
     * Normaliza un nombre de estación (quita acentos, convierte a minúsculas)
     */
    static normalizarNombre(nombre) {
        if (!nombre)
            return '';
        return nombre.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }
    /**
     * Busca un nombre alternativo para una estación
     */
    static getNombreNormalizado(nombre) {
        const normalizado = this.normalizarNombre(nombre);
        return this.NOMBRES_ALTERNATIVOS[normalizado] || normalizado;
    }
    /**
     * Obtiene el ID conocido de una estación común
     */
    static getIdEstacionComun(nombre) {
        const normalizado = this.getNombreNormalizado(nombre);
        return this.ESTACIONES_COMUNES[normalizado] || null;
    }
    /**
     * Encuentra coincidencias aproximadas en el mapa de estaciones comunes
     */
    static buscarCoincidenciaAproximada(nombre) {
        const normalizado = this.getNombreNormalizado(nombre);
        // Buscar coincidencia exacta primero
        if (this.ESTACIONES_COMUNES[normalizado]) {
            return this.ESTACIONES_COMUNES[normalizado];
        }
        // Buscar coincidencia parcial
        for (const [key, id] of Object.entries(this.ESTACIONES_COMUNES)) {
            if (normalizado.includes(key) || key.includes(normalizado)) {
                return id;
            }
        }
        return null;
    }
    /**
     * Encuentra la mejor coincidencia entre un conjunto de estaciones
     */
    static encontrarMejorCoincidencia(nombre, estaciones) {
        if (!estaciones || estaciones.length === 0)
            return null;
        const normalizado = this.getNombreNormalizado(nombre);
        // Buscar coincidencia exacta
        const exacta = estaciones.find(e => this.normalizarNombre(e.nombre) === normalizado);
        if (exacta)
            return exacta;
        // Buscar coincidencia parcial
        const parcial = estaciones.find(e => this.normalizarNombre(e.nombre).includes(normalizado) ||
            normalizado.includes(this.normalizarNombre(e.nombre)));
        return parcial || null;
    }
}
exports.EstacionesHelper = EstacionesHelper;
// Mapa de nombres alternativos para estaciones
EstacionesHelper.NOMBRES_ALTERNATIVOS = {
    'plaza once': 'once',
    'once de septiembre': 'once',
    'constitucion': 'constitución',
    'estacion constitucion': 'constitución',
    'estacion retiro': 'retiro',
    'terminal retiro': 'retiro',
    'estacion tigre': 'tigre',
    'estacion haedo': 'haedo',
    'estacion temperley': 'temperley',
    'estacion moron': 'morón',
    'estacion palermo': 'palermo',
    'estacion belgrano': 'belgrano',
    'estacion villa urquiza': 'villa urquiza',
    'estacion san isidro': 'san isidro',
    'estacion quilmes': 'quilmes',
    'estacion avellaneda': 'avellaneda',
    'estacion la plata': 'la plata',
    // Más estaciones populares
    'buenos aires': 'buenos aires',
    'villa ballester': 'villa ballester',
    'san miguel': 'san miguel',
    'jose c. paz': 'josé c. paz',
    'pilar': 'pilar',
    'tortuguitas': 'tortuguitas',
    'grand bourg': 'grand bourg',
    'del viso': 'del viso',
    'moreno': 'moreno',
};
// Mapa de IDs conocidos para estaciones comunes
EstacionesHelper.ESTACIONES_COMUNES = {
    'retiro': 'RTR',
    'tigre': 'TIG',
    'constitucion': 'CST',
    'constitución': 'CST',
    'once': 'ONC',
    'temperley': 'TMP',
    'haedo': 'HAE',
    'moron': 'MOR',
    'morón': 'MOR',
    'palermo': 'PAL',
    'belgrano': 'BEL',
    'villa urquiza': 'VUR',
    'san isidro': 'SIS',
    'quilmes': 'QUI',
    'avellaneda': 'AVE',
    'la plata': 'LPL',
    'buenos aires': 'BUE',
    'moreno': 'MOR',
    'josé c. paz': 'JCP',
    'jose c. paz': 'JCP',
    'pilar': 'PIL',
};
