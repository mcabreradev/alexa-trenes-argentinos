import * as Alexa from 'ask-sdk-core';
import { RequestHandler, HandlerInput, ErrorHandler } from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import { loadAplDocument } from './apl-utils';

// Importar nuestros servicios y helpers
import { HorariosService } from './services/horarios-service';
import { AlexaSlotHelper } from './helpers/alexa-slot-helper';

// Crear instancia del servicio de horarios
const horariosService = new HorariosService();

/**
 * Handler para obtener el próximo tren desde una estación
 */
const GetNextTrainIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextTrainIntent';
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    // Extraer el valor del slot origen usando nuestro helper
    const origen = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'origen');
    console.log('GetNextTrainIntent - Origen final:', origen);

    if (!origen) {
      return handlerInput.responseBuilder
        .speak('No entendí la estación de origen, ¿podés repetir? Por favor di el nombre de una estación como Retiro o Tigre.')
        .reprompt('¿Desde qué estación querés viajar? Por ejemplo, Retiro o Constitución.')
        .getResponse();
    }

    // Usar nuestro servicio para obtener el próximo tren
    const proximoTren = await horariosService.obtenerProximoTren(origen);

    if (!proximoTren) {
      // Mensaje más amigable cuando no se encuentran horarios
      const respuesta = `Lo siento, no pude encontrar información de horarios para trenes desde ${origen} en este momento. Puede que no haya servicios programados o que haya un problema con el sistema de consulta. ¿Querés intentar con otra estación?`;
      
      return handlerInput.responseBuilder
        .speak(respuesta)
        .reprompt('¿Desde qué otra estación querés saber el horario?')
        .getResponse();
    }

    // Formatear el horario para presentación
    const horaSalida = horariosService.formatearHorario(proximoTren);
    const destino = proximoTren.destino || 'final de línea';
    
    const respuesta = `El próximo tren desde ${origen} sale a las ${horaSalida} con destino a ${destino}.`;
    
    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        // Cargar documento APL
        const aplDocument = loadAplDocument();
        
        if (aplDocument) {
          // Datos para el APL
          const aplData = {
            trains: [
              {
                horaSalida: horaSalida,
                destino: destino
              }
            ]
          };
          
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: aplDocument,
            datasources: aplData
          });
        }
      } catch (error) {
        console.error('Error al cargar APL:', error);
      }
    }

    return handlerInput.responseBuilder
      .speak(respuesta)
      .withSimpleCard('Horarios de Trenes', respuesta)
      .getResponse();
  }
};

/**
 * Handler para obtener trenes entre dos estaciones
 */
const GetTrainBetweenStationsIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTrainBetweenStationsIntent';
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    // Extraer valores de slots usando nuestro helper
    const { origen, destino } = AlexaSlotHelper.getSlotValues(
      handlerInput.requestEnvelope, ['origen', 'destino']
    );
    
    console.log('GetTrainBetweenStationsIntent - Slots finales:', { origen, destino });

    if (!origen || !destino) {
      let mensaje = 'No entendí ';
      if (!origen) mensaje += 'la estación de origen';
      if (!origen && !destino) mensaje += ' ni ';
      if (!destino) mensaje += 'la estación de destino';
      mensaje += '. Por favor di algo como "tren de Retiro a Tigre".';
      
      return handlerInput.responseBuilder
        .speak(mensaje)
        .reprompt('¿Entre qué estaciones querés viajar? Por ejemplo, "tren de Retiro a Tigre".')
        .getResponse();
    }

    // Usar nuestro servicio para obtener el próximo tren entre estaciones
    const tren = await horariosService.obtenerProximoTrenEntreEstaciones(origen, destino);

    if (!tren) {
      const respuesta = `Lo siento, no encontré información de trenes desde ${origen} hasta ${destino} en este momento. Puede que no haya servicios directos entre estas estaciones o que el sistema de consulta tenga un problema. ¿Querés intentar con otras estaciones?`;
      
      return handlerInput.responseBuilder
        .speak(respuesta)
        .reprompt('¿Entre qué otras estaciones querés consultar?')
        .getResponse();
    }

    // Formatear el horario para presentación
    const horaSalida = horariosService.formatearHorario(tren);
    
    const respuesta = `El próximo tren desde ${origen} a ${destino} sale a las ${horaSalida}.`;
    
    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        const aplDocument = loadAplDocument();
        
        if (aplDocument) {
          const aplData = {
            trains: [
              {
                horaSalida: horaSalida,
                origen: origen,
                destino: destino
              }
            ]
          };
          
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: aplDocument,
            datasources: aplData
          });
        }
      } catch (error) {
        console.error('Error al cargar APL:', error);
      }
    }

    return handlerInput.responseBuilder
      .speak(respuesta)
      .withSimpleCard('Horarios de Trenes', respuesta)
      .getResponse();
  }
};

/**
 * Handler para obtener el primer tren mañana
 */
const GetFirstTrainTomorrowIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetFirstTrainTomorrowIntent';
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    // Extraer el valor del slot origen
    const origen = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'origen');
    console.log('GetFirstTrainTomorrowIntent - Origen final:', origen);

    if (!origen) {
      return handlerInput.responseBuilder
        .speak('No entendí desde qué estación querés consultar el primer tren de mañana. Por favor di el nombre de una estación como Retiro o Tigre.')
        .reprompt('¿Desde qué estación querés saber el primer tren de mañana?')
        .getResponse();
    }

    // Usar nuestro servicio para obtener el primer tren de mañana
    const trenesMañana = await horariosService.obtenerHorariosMañana(origen);

    if (!trenesMañana || trenesMañana.length === 0) {
      const respuesta = `Lo siento, no pude encontrar información sobre el primer tren de mañana desde ${origen}. Puede que aún no esté disponible la programación o que haya un problema con el sistema de consulta.`;
      
      return handlerInput.responseBuilder
        .speak(respuesta)
        .reprompt('¿Querés consultar el primer tren desde otra estación?')
        .getResponse();
    }

    // Formatear el horario para presentación
    const primerTren = trenesMañana[0];
    const horaSalida = horariosService.formatearHorario(primerTren);
    const destino = primerTren.destino || 'final de línea';
    
    const respuesta = `El primer tren de mañana desde ${origen} sale a las ${horaSalida} con destino a ${destino}.`;
    
    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        const aplDocument = loadAplDocument();
        
        if (aplDocument) {
          const aplData = {
            trains: [
              {
                horaSalida: horaSalida,
                destino: destino,
                mensaje: "Primer tren de mañana"
              }
            ]
          };
          
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: aplDocument,
            datasources: aplData
          });
        }
      } catch (error) {
        console.error('Error al cargar APL:', error);
      }
    }

    return handlerInput.responseBuilder
      .speak(respuesta)
      .withSimpleCard('Primer Tren de Mañana', respuesta)
      .getResponse();
  }
};

/**
 * Handler para la ayuda
 */
const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput: HandlerInput): Response {
    const speakOutput = 'Puedo darte información sobre horarios de trenes en Argentina. ' +
                        'Puedes preguntarme cosas como "¿cuándo sale el próximo tren desde Retiro?", ' +
                        '"¿a qué hora es el tren de Constitución a Temperley?" o ' +
                        '"¿cuál es el primer tren mañana desde Once?". ¿Qué quieres saber?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

/**
 * Handler para cancelar
 */
const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput: HandlerInput): Response {
    const speakOutput = '¡Hasta pronto! Si necesitas consultar horarios de trenes, aquí estaré.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

/**
 * Handler para intents no reconocidos
 */
const FallbackIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput: HandlerInput): Response {
    const speakOutput = 'Lo siento, no entendí lo que querías hacer. ' +
                        'Puedes preguntarme sobre horarios de trenes, por ejemplo: ' +
                        '"¿cuándo sale el próximo tren desde Retiro?" o ' +
                        '"¿a qué hora es el tren de Constitución a Temperley?".';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Qué horario de tren quieres consultar?')
      .getResponse();
  }
};

/**
 * Handler para errores
 */
const ErrorHandler: ErrorHandler = {
  canHandle(): boolean {
    return true;
  },
  handle(handlerInput: HandlerInput, error: Error): Response {
    console.error('Error manejado:', error);
    
    const speakOutput = 'Lo siento, ha ocurrido un error al procesar tu solicitud. ' +
                        'Por favor, inténtalo nuevamente en unos minutos.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

/**
 * Handler para cuando la sesión se inicia
 */
const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput: HandlerInput): Response {
    const speakOutput = 'Bienvenido a Horarios de Trenes Argentinos. ' +
                        'Puedes preguntarme por el próximo tren desde una estación, ' +
                        'horarios entre dos estaciones o el primer tren de mañana. ' +
                        '¿Qué deseas consultar?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Qué horario de tren quieres consultar?')
      .getResponse();
  }
};

/**
 * Handler para cuando termina la sesión
 */
const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput: HandlerInput): Response {
    // TypeScript no reconoce la propiedad reason en el tipo genérico Request
    // Pero sabemos que para SessionEndedRequest, esta propiedad existe
    const request = handlerInput.requestEnvelope.request as any;
    console.log(`Sesión finalizada: ${request.reason || 'Sin razón especificada'}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

// Exportar el skill handler
export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNextTrainIntentHandler,
    GetTrainBetweenStationsIntentHandler,
    GetFirstTrainTomorrowIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
