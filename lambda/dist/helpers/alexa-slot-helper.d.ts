import { RequestEnvelope } from 'ask-sdk-model';
/**
 * Helper para extraer y manejar valores de slots de Alexa
 */
export declare class AlexaSlotHelper {
    /**
     * Extrae el valor de un slot, intentando usar las resoluciones si están disponibles
     */
    static getSlotValue(requestEnvelope: RequestEnvelope, slotName: string): string | null;
    /**
     * Extrae múltiples slots a la vez
     * @returns Objeto con los valores de los slots solicitados
     */
    static getSlotValues(requestEnvelope: RequestEnvelope, slotNames: string[]): Record<string, string | null>;
    /**
     * Extrae un valor de fecha (puede ser relativo como "mañana" o específico)
     */
    static getDateSlotValue(requestEnvelope: RequestEnvelope, slotName: string): Date | null;
    /**
     * Extrae un valor de hora
     */
    static getTimeSlotValue(requestEnvelope: RequestEnvelope, slotName: string): string | null;
}
