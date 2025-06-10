# Guía de Extensión - Alexa Skill Trenes Argentinos

Este documento proporciona instrucciones detalladas para extender la skill con nuevas funcionalidades.

## Añadir un Nuevo Intent

Para agregar una nueva intención a la skill (por ejemplo, consultar el estado de un tren):

### 1. Actualizar el Modelo de Interacción

Editar `skill/models/es-ES.json`:

```json
{
  "interactionModel": {
    "languageModel": {
      "intents": [
        // Intents existentes...
        {
          "name": "GetTrainStatusIntent",
          "slots": [
            {
              "name": "trainId",
              "type": "AMAZON.NUMBER"
            }
          ],
          "samples": [
            "estado del tren {trainId}",
            "cómo va el tren {trainId}",
            "información del tren {trainId}",
            "está a horario el tren {trainId}"
          ]
        }
      ]
    }
  }
}
```

### 2. Implementar el Handler

En `src/index.ts`, añadir un nuevo handler:

```typescript
const GetTrainStatusIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTrainStatusIntent';
  },
  async handle(handlerInput: HandlerInput) {
    try {
      // Extraer el ID del tren del slot
      const trainId = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'trainId');

      if (!trainId) {
        return handlerInput.responseBuilder
          .speak('No he entendido qué tren quieres consultar. Por favor, dime el número del tren.')
          .reprompt('¿Qué número de tren quieres consultar?')
          .getResponse();
      }

      // Obtener el estado del tren usando el servicio
      const horariosService = new HorariosService();
      const estadoTren = await horariosService.obtenerEstadoTren(trainId);

      // Construir la respuesta
      let speechText = '';
      if (estadoTren) {
        speechText = `El tren ${trainId} ${estadoTren.estado}. ${estadoTren.mensaje}`;
      } else {
        speechText = `No he podido encontrar información sobre el tren ${trainId}.`;
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Estado del Tren', speechText)
        .getResponse();
    } catch (error) {
      console.error('Error en GetTrainStatusIntent:', error);
      return handlerInput.responseBuilder
        .speak('Lo siento, ha ocurrido un error al consultar el estado del tren.')
        .getResponse();
    }
  }
};

// Añadir el handler a la skill
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNextTrainIntentHandler,
    GetTrainBetweenStationsIntentHandler,
    GetFirstTrainTomorrowIntentHandler,
    GetTrainStatusIntentHandler, // Nuevo handler
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### 3. Implementar la Funcionalidad en el Servicio

En `src/services/horarios-service.ts`, añadir un nuevo método:

```typescript
/**
 * Información sobre el estado de un tren
 */
interface EstadoTren {
  id: string;        // ID del tren
  estado: string;    // Estado (a tiempo, demorado, cancelado)
  demora: number;    // Minutos de demora (0 si está a tiempo)
  mensaje: string;   // Mensaje descriptivo
}

// Añadir al HorariosService
async obtenerEstadoTren(trainId: string): Promise<EstadoTren | null> {
  try {
    // Llamar a la API para obtener el estado
    const estadoResponse = await this.apiService.getEstadoTren(trainId);

    if (!estadoResponse) return null;

    // Formatear la respuesta
    return {
      id: trainId,
      estado: this.traducirEstado(estadoResponse.status),
      demora: estadoResponse.delay || 0,
      mensaje: this.generarMensajeEstado(estadoResponse)
    };
  } catch (error) {
    console.error(`Error obteniendo estado del tren ${trainId}:`, error);
    return null;
  }
}

// Métodos auxiliares
private traducirEstado(status: string): string {
  switch (status) {
    case 'ON_TIME': return 'está a tiempo';
    case 'DELAYED': return 'está demorado';
    case 'CANCELLED': return 'ha sido cancelado';
    default: return 'estado desconocido';
  }
}

private generarMensajeEstado(estadoResponse: any): string {
  if (estadoResponse.status === 'ON_TIME') {
    return 'El tren circula según el horario previsto.';
  } else if (estadoResponse.status === 'DELAYED') {
    return `El tren tiene una demora de ${estadoResponse.delay} minutos.`;
  } else if (estadoResponse.status === 'CANCELLED') {
    return `El servicio ha sido cancelado. ${estadoResponse.reason || ''}`;
  }
  return '';
}
```

### 4. Actualizar el Cliente API

En `src/services/trenes-api-service.ts`, añadir el método para llamar al endpoint:

```typescript
/**
 * Obtiene el estado de un tren específico
 * @param trainId ID del tren
 */
async getEstadoTren(trainId: string): Promise<any> {
  const url = `${this.apiBaseUrl}/estado/tren/${encodeURIComponent(trainId)}`;

  try {
    const response = await this.makeRequest(url);
    return response;
  } catch (error) {
    console.error(`Error obteniendo estado del tren ${trainId}:`, error);
    throw new Error(`Error consultando estado del tren: ${error.message}`);
  }
}
```

### 5. Actualizar los Tipos

En `src/types/api-types.ts`, añadir la interfaz:

```typescript
export interface EstadoTren {
  id: string;        // ID del tren
  status: string;    // Estado (ON_TIME, DELAYED, CANCELLED)
  delay?: number;    // Minutos de demora (si aplica)
  reason?: string;   // Razón de cancelación o demora
  updatedAt: string; // Timestamp de última actualización
}
```

## Añadir Soporte para una Nueva Visualización APL

Para mejorar la experiencia en dispositivos con pantalla:

### 1. Crear el Documento APL

En `apl-documents/`, crear `train-status-apl.json`:

```json
{
  "type": "APL",
  "version": "1.8",
  "mainTemplate": {
    "parameters": [
      "payload"
    ],
    "items": [
      {
        "type": "Container",
        "width": "100%",
        "height": "100%",
        "background": "#f7f7f7",
        "items": [
          {
            "type": "Container",
            "width": "100%",
            "height": "100vh",
            "direction": "column",
            "justifyContent": "center",
            "alignItems": "center",
            "items": [
              {
                "type": "Text",
                "text": "${payload.trainData.title}",
                "fontSize": "2.5vw",
                "fontWeight": "bold",
                "textAlign": "center",
                "color": "#2c3e50"
              },
              {
                "type": "Text",
                "text": "${payload.trainData.status}",
                "fontSize": "6vw",
                "fontWeight": "bold",
                "textAlign": "center",
                "color": "${payload.trainData.statusColor}"
              },
              {
                "type": "Text",
                "text": "${payload.trainData.message}",
                "fontSize": "2vw",
                "textAlign": "center",
                "color": "#7f8c8d",
                "paddingTop": "3vh"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 2. Actualizar las Utilidades APL

En `src/apl-utils.ts`, añadir una función para generar el documento:

```typescript
/**
 * Genera documento APL para estado de trenes
 */
export function generateTrainStatusAPL(trainId: string, estado: EstadoTren): any {
  // Determinar color según estado
  let statusColor = '#2ecc71'; // Verde para a tiempo
  if (estado.estado.includes('demorado')) {
    statusColor = '#f39c12'; // Amarillo para demorado
  } else if (estado.estado.includes('cancelado')) {
    statusColor = '#e74c3c'; // Rojo para cancelado
  }

  return {
    type: 'Alexa.Presentation.APL.RenderDocument',
    token: 'trainStatusToken',
    document: require('../apl-documents/train-status-apl.json'),
    datasources: {
      trainData: {
        title: `Tren ${trainId}`,
        status: estado.estado.toUpperCase(),
        message: estado.mensaje,
        statusColor: statusColor
      }
    }
  };
}
```

### 3. Actualizar el Handler para Usar APL

Modificar el handler para incluir el documento APL:

```typescript
// En el handler GetTrainStatusIntent
if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
  const aplDirective = generateTrainStatusAPL(trainId, estadoTren);
  handlerInput.responseBuilder.addDirective(aplDirective);
}
```

## Añadir Persistencia de Datos

Para recordar las preferencias del usuario entre sesiones:

### 1. Instalar Dependencias Adicionales

```bash
pnpm add ask-sdk-s3-persistence-adapter
```

### 2. Configurar Adaptador de Persistencia

En `src/index.ts`:

```typescript
import { S3PersistenceAdapter } from 'ask-sdk-s3-persistence-adapter';

// Crear adaptador de persistencia
const persistenceAdapter = new S3PersistenceAdapter({
  bucketName: process.env.S3_PERSISTENCE_BUCKET || 'alexa-trenes-argentinos-bucket',
  pathPrefix: 'user-preferences'
});

// Usar en el skillBuilder
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    // handlers...
  )
  .withPersistenceAdapter(persistenceAdapter)
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### 3. Implementar la Persistencia en un Intent

```typescript
// Ejemplo para guardar la estación favorita
const SaveFavoriteStationIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaveFavoriteStationIntent';
  },
  async handle(handlerInput: HandlerInput) {
    const estacion = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'estacion');

    if (!estacion) {
      return handlerInput.responseBuilder
        .speak('No he entendido qué estación quieres guardar como favorita.')
        .reprompt('¿Qué estación quieres guardar como favorita?')
        .getResponse();
    }

    // Guardar en persistencia
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

    sessionAttributes.favoriteStation = estacion;
    attributesManager.setPersistentAttributes(sessionAttributes);

    await attributesManager.savePersistentAttributes();

    const speechText = `He guardado ${estacion} como tu estación favorita.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Estación Favorita', speechText)
      .getResponse();
  }
};
```

## Integración con una Nueva API

Para integrar con una API adicional (por ejemplo, clima):

### 1. Crear un Nuevo Servicio

En `src/services/clima-service.ts`:

```typescript
import fetch from 'node-fetch';

export interface ClimaResponse {
  temperatura: number;
  condicion: string;
  probabilidadLluvia: number;
}

export class ClimaService {
  private apiBaseUrl = 'https://api.ejemplo.com/clima';

  /**
   * Obtiene condiciones climáticas para una ubicación
   */
  async getClimaParaUbicacion(ciudad: string): Promise<ClimaResponse | null> {
    try {
      const url = `${this.apiBaseUrl}?ciudad=${encodeURIComponent(ciudad)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        timeout: 3000
      });

      if (!response.ok) {
        throw new Error(`Error en API de clima: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperatura: data.temperatura,
        condicion: data.condicion,
        probabilidadLluvia: data.probabilidadLluvia
      };
    } catch (error) {
      console.error('Error obteniendo clima:', error);
      return null;
    }
  }
}
```

### 2. Integrarlo con el Servicio Existente

En `src/services/horarios-service.ts`:

```typescript
import { ClimaService } from './clima-service';

// En la clase HorariosService
private climaService: ClimaService;

constructor() {
  this.apiService = new TrenesApiService();
  this.climaService = new ClimaService();
}

/**
 * Obtiene información combinada de horario y clima
 */
async obtenerHorarioYClima(estacion: string): Promise<any> {
  // Obtener en paralelo para mayor eficiencia
  const [horarioPromise, climaPromise] = await Promise.all([
    this.obtenerProximoTren(estacion),
    this.climaService.getClimaParaUbicacion('Buenos Aires')
  ]);

  const horario = await horarioPromise;
  const clima = await climaPromise;

  return {
    horario,
    clima
  };
}
```

## Implementar un Nuevo Flujo de Conversación

Para crear un flujo con múltiples turnos:

### 1. Definir el Flujo en el Modelo

Añadir intents en `skill/models/es-ES.json`:

```json
{
  "name": "PlanTripIntent",
  "slots": [],
  "samples": [
    "planificar un viaje",
    "quiero planear un viaje",
    "ayúdame a planificar un viaje en tren"
  ]
},
{
  "name": "OriginStationIntent",
  "slots": [
    {
      "name": "origen",
      "type": "STATION_LIST"
    }
  ],
  "samples": [
    "desde {origen}",
    "quiero salir desde {origen}",
    "la estación de origen es {origen}"
  ]
},
{
  "name": "DestinationStationIntent",
  "slots": [
    {
      "name": "destino",
      "type": "STATION_LIST"
    }
  ],
  "samples": [
    "hasta {destino}",
    "quiero llegar a {destino}",
    "la estación de destino es {destino}"
  ]
}
```

### 2. Implementar los Handlers con Estado de Diálogo

En `src/index.ts`:

```typescript
// Estado del viaje
const TripStates = {
  INIT: 'INIT',
  COLLECTING_ORIGIN: 'COLLECTING_ORIGIN',
  COLLECTING_DESTINATION: 'COLLECTING_DESTINATION',
  COLLECTING_DATE: 'COLLECTING_DATE',
  COMPLETE: 'COMPLETE'
};

const PlanTripIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlanTripIntent';
  },
  handle(handlerInput: HandlerInput) {
    // Iniciar flujo de planificación
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.tripState = TripStates.COLLECTING_ORIGIN;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const speechText = 'Vamos a planificar tu viaje en tren. ¿Desde qué estación quieres salir?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const OriginStationIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'OriginStationIntent'
          || (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
              && sessionAttributes.tripState === TripStates.COLLECTING_ORIGIN));
  },
  handle(handlerInput: HandlerInput) {
    const origen = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'origen');

    // Guardar en sesión
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.origen = origen;
    sessionAttributes.tripState = TripStates.COLLECTING_DESTINATION;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const speechText = `Estación de origen: ${origen}. ¿A qué estación quieres llegar?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('¿A qué estación quieres llegar?')
      .getResponse();
  }
};

// Continuar con los demás handlers del flujo...
```

## Mejoras en la Experiencia de Usuario

### 1. Añadir Variedad de Respuestas

Crear un helper para respuestas variadas:

```typescript
// En un nuevo archivo src/helpers/response-helper.ts
export class ResponseHelper {
  // Diferentes formas de responder para no ser repetitivo
  private static readonly PROXIMOS_TRENES_RESPONSES = [
    "El próximo tren sale a las {hora}.",
    "Tienes un tren a las {hora}.",
    "El siguiente tren está programado para las {hora}.",
    "Hay un tren disponible a las {hora}."
  ];

  /**
   * Obtiene una respuesta aleatoria del conjunto disponible
   */
  static getRandomResponse(responseSet: string[], replacements: Record<string, string>): string {
    const randomIndex = Math.floor(Math.random() * responseSet.length);
    let response = responseSet[randomIndex];

    // Aplicar reemplazos
    Object.entries(replacements).forEach(([key, value]) => {
      response = response.replace(`{${key}}`, value);
    });

    return response;
  }

  /**
   * Obtiene una respuesta para próximos trenes
   */
  static getProximosTrenesResponse(hora: string): string {
    return this.getRandomResponse(this.PROXIMOS_TRENES_RESPONSES, { hora });
  }
}
```

### 2. Implementar SSML para Mejorar la Voz

```typescript
// Ejemplo de uso de SSML para pausas y énfasis
const speechText = `<speak>
  El próximo tren desde ${estacion} sale a las
  <emphasis level="moderate">${horaSalida}</emphasis>.
  <break time="500ms"/>
  Llegará a ${destino} a las ${horaLlegada}.
</speak>`;

return handlerInput.responseBuilder
  .speak(speechText)
  .getResponse();
```

### 3. Personalizar las Respuestas por Hora del Día

```typescript
// Personalización por hora del día
function getSaludoHorario(): string {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) {
    return 'Buenos días';
  } else if (hora >= 12 && hora < 20) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
}

// En el handler
const saludo = getSaludoHorario();
const speechText = `${saludo}. El próximo tren desde ${estacion} sale a las ${horaSalida}.`;
```

## Incorporar Seguimiento de Analíticas

Para analizar el uso de la skill:

```typescript
// En index.ts, agregar middleware para analíticas
const LoggingRequestInterceptor = {
  process(handlerInput: HandlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);

    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
    const intentName = requestType === 'IntentRequest' ?
      Alexa.getIntentName(handlerInput.requestEnvelope) : '';

    // Aquí podrías enviar a un servicio de analíticas externo
    console.log(`INTENT = ${intentName}`);

    return;
  }
};

// Añadir al skillBuilder
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(/* handlers... */)
  .addRequestInterceptors(LoggingRequestInterceptor)
  .lambda();
```
