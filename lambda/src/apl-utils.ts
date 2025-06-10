// Add Node.js require function declaration
declare function require(moduleName: string): any;

// Use require instead of import for Node.js modules
const fs = require('fs');
const path = require('path');

// Ensure __dirname is available in TypeScript
declare const __dirname: string;
// Ensure console is available
declare const console: {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
  info: (message?: any, ...optionalParams: any[]) => void;
};

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
export const loadAplDocument = (): AplDocument | null => {
  try {
    // Paths adjusted for the new structure with dist/ folder

    // Intento 1: Desde la carpeta skill (desde dist/)
    const skillAplPath = path.resolve(__dirname, '../../../skill/apl-documents/train-schedule-apl.json');

    if (fs.existsSync(skillAplPath)) {
      console.log('Cargando APL desde la carpeta skill');
      return JSON.parse(fs.readFileSync(skillAplPath, 'utf8'));
    }

    // Intento 2: Desde la carpeta lambda/apl-documents (desde dist/)
    const lambdaAplPath = path.resolve(__dirname, '../../apl-documents/train-schedule-apl.json');

    if (fs.existsSync(lambdaAplPath)) {
      console.log('Cargando APL desde la carpeta lambda');
      return JSON.parse(fs.readFileSync(lambdaAplPath, 'utf8'));
    }

    // Intento 3: Usando una ruta relativa al archivo principal
    const rootPath = path.resolve(__dirname, '../..');
    const rootAplPath = path.join(rootPath, 'apl-documents/train-schedule-apl.json');

    if (fs.existsSync(rootAplPath)) {
      console.log('Cargando APL desde la raíz del proyecto');
      return JSON.parse(fs.readFileSync(rootAplPath, 'utf8'));
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

  } catch (error) {
    console.error('Error cargando documento APL:', error);
    return null;
  }
};
