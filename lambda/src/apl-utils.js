const fs = require('fs');
const path = require('path');

// Utilidad para cargar documentos APL
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

  } catch (error) {
    console.error('Error cargando documento APL:', error);
    return null;
  }
};

module.exports = {
  loadAplDocument
};
