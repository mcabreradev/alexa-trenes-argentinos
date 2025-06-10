"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlexaSlotHelper = void 0;
/**
 * Helper para extraer y manejar valores de slots de Alexa
 */
class AlexaSlotHelper {
    /**
     * Extrae el valor de un slot, intentando usar las resoluciones si están disponibles
     */
    static getSlotValue(requestEnvelope, slotName) {
        try {
            const slot = requestEnvelope.request &&
                'intent' in requestEnvelope.request &&
                requestEnvelope.request.intent &&
                requestEnvelope.request.intent.slots &&
                requestEnvelope.request.intent.slots[slotName];
            if (!slot)
                return null;
            // Log para depuración
            console.log(`Slot completo ${slotName}:`, JSON.stringify(slot));
            // Primero intentar con resoluciones (valores canónicos)
            if (slot.resolutions &&
                slot.resolutions.resolutionsPerAuthority &&
                slot.resolutions.resolutionsPerAuthority.length > 0) {
                const resolution = slot.resolutions.resolutionsPerAuthority[0];
                if (resolution.status.code === 'ER_SUCCESS_MATCH' &&
                    resolution.values &&
                    resolution.values.length > 0) {
                    const valor = resolution.values[0].value.name;
                    console.log(`Usando valor resuelto del slot ${slotName}:`, valor);
                    return valor;
                }
            }
            // Si no hay resoluciones, usar el valor directo
            if (slot.value) {
                console.log(`Usando valor directo del slot ${slotName}:`, slot.value);
                return slot.value;
            }
            return null;
        }
        catch (error) {
            console.error(`Error extrayendo slot ${slotName}:`, error);
            return null;
        }
    }
    /**
     * Extrae múltiples slots a la vez
     * @returns Objeto con los valores de los slots solicitados
     */
    static getSlotValues(requestEnvelope, slotNames) {
        const result = {};
        for (const slotName of slotNames) {
            result[slotName] = this.getSlotValue(requestEnvelope, slotName);
        }
        return result;
    }
    /**
     * Extrae un valor de fecha (puede ser relativo como "mañana" o específico)
     */
    static getDateSlotValue(requestEnvelope, slotName) {
        const rawValue = this.getSlotValue(requestEnvelope, slotName);
        if (!rawValue)
            return null;
        try {
            // Si es una fecha específica (YYYY-MM-DD)
            if (rawValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return new Date(rawValue);
            }
            // Si es "mañana"
            if (rawValue.toLowerCase().includes('mañana') ||
                rawValue.toLowerCase().includes('manana')) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow;
            }
            // Si es "hoy"
            if (rawValue.toLowerCase().includes('hoy')) {
                return new Date();
            }
            return null;
        }
        catch (error) {
            console.error(`Error procesando fecha del slot ${slotName}:`, error);
            return null;
        }
    }
    /**
     * Extrae un valor de hora
     */
    static getTimeSlotValue(requestEnvelope, slotName) {
        const rawValue = this.getSlotValue(requestEnvelope, slotName);
        if (!rawValue)
            return null;
        try {
            // Si ya tiene formato HH:MM
            if (rawValue.match(/^\d{1,2}:\d{2}$/)) {
                // Asegurar que tenga dos dígitos en la hora
                const [hours, minutes] = rawValue.split(':');
                return `${hours.padStart(2, '0')}:${minutes}`;
            }
            return null;
        }
        catch (error) {
            console.error(`Error procesando hora del slot ${slotName}:`, error);
            return null;
        }
    }
}
exports.AlexaSlotHelper = AlexaSlotHelper;
