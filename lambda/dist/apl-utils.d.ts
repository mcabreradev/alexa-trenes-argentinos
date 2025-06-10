/**
 * Tipo para la estructura básica de documento APL
 */
interface AplDocument {
    type: string;
    version: string;
    theme: string;
    mainTemplate: {
        parameters: string[];
        items: any[];
    };
}
/**
 * Carga un documento APL para renderizar en dispositivos con pantalla
 * @returns El documento APL o null si no se puede cargar
 */
export declare const loadAplDocument: () => AplDocument | null;
export {};
