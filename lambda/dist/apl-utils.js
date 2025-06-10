"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAplDocument = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Carga un documento APL para renderizar en dispositivos con pantalla
 * @returns El documento APL o null si no se puede cargar
 */
const loadAplDocument = () => {
    try {
        // Primero intentamos cargar el documento APL desde la ruta relativa a la carpeta skill
        const skillAplPath = path.resolve(__dirname, '../../skill/apl-documents/train-schedule-apl.json');
        if (fs.existsSync(skillAplPath)) {
            console.log('Cargando APL desde la carpeta skill');
            return JSON.parse(fs.readFileSync(skillAplPath, 'utf8'));
        }
        // Si no existe, intentamos con una copia local en la carpeta lambda
        const lambdaAplPath = path.resolve(__dirname, '../apl-documents/train-schedule-apl.json');
        if (fs.existsSync(lambdaAplPath)) {
            console.log('Cargando APL desde la carpeta lambda');
            return JSON.parse(fs.readFileSync(lambdaAplPath, 'utf8'));
        }
        // Si no podemos cargar el APL, creamos un documento básico
        console.log('No se encontró el documento APL, usando plantilla básica');
        return {
            "type": "APL",
            "version": "2023.2",
            "theme": "dark",
            "mainTemplate": {
                "parameters": ["trains"],
                "items": [
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "Text",
                                "text": "Horarios de Trenes",
                                "fontSize": "32dp",
                                "color": "#FFFFFF"
                            },
                            {
                                "type": "Sequence",
                                "data": "${trains}",
                                "items": [
                                    {
                                        "type": "Frame",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "text": "Hora: ${horaSalida}",
                                                "fontSize": "24dp"
                                            },
                                            {
                                                "type": "Text",
                                                "text": "Destino: ${destino}",
                                                "fontSize": "20dp"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }
    catch (error) {
        console.error('Error cargando documento APL:', error);
        return null;
    }
};
exports.loadAplDocument = loadAplDocument;
