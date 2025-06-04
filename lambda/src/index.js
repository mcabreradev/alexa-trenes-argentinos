// export const handler = async (event) => {
//   // TODO implement
//   const response = {
//     statusCode: 200,
//     body: JSON.stringify('Hello from Lambda!'),
//   };
//   return response;
// };

// // src/index.js

const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');

const PRIMARY_ENDPOINT = 'https://q577sqkq5cdxxskrjl4nwvy2prcgdnew22u7pdkxucauf4ae2fcq.ssh.surf';
const FALLBACK_ENDPOINT = 'https://ariedro.dev/api-trenes';

const getEstacionId = async (nombreEstacion) => {
  try {
    const response = await fetch(`${PRIMARY_ENDPOINT}/infraestructura/estaciones?nombre=${encodeURIComponent(nombreEstacion)}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) return data[0].id;
    throw new Error('No match');
  } catch (e) {
    const fallback = await fetch(`${FALLBACK_ENDPOINT}/infraestructura/estaciones?nombre=${encodeURIComponent(nombreEstacion)}`);
    const data = await fallback.json();
    return data[0]?.id || null;
  }
};

const getHorarioTren = async (origen, destino) => {
  try {
    const origenId = await getEstacionId(origen);
    const destinoId = destino ? await getEstacionId(destino) : null;
    if (!origenId) return null;

    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().slice(0, 5);

    const url = destinoId
      ? `${PRIMARY_ENDPOINT}/arribos/estacion/${origenId}?hasta=${destinoId}&fecha=${fecha}&hora=${hora}&cantidad=3`
      : `${PRIMARY_ENDPOINT}/arribos/estacion/${origenId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (e) {
    return null;
  }
};

const GetNextTrainIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextTrainIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const origen = slots.origen?.value;

    if (!origen) {
      return handlerInput.responseBuilder
        .speak('No entendí la estación de origen, ¿podés repetir?')
        .reprompt('¿Desde qué estación querés viajar?')
        .getResponse();
    }

    const tren = await getHorarioTren(origen);

    if (!tren) {
      return handlerInput.responseBuilder
        .speak(`No encontré horarios para ${origen}. ¿Querés intentar con otra estación?`)
        .reprompt('¿Desde qué estación querés saber el horario?')
        .getResponse();
    }

    const horaSalida = tren.horario.split('T')[1].slice(0, 5);
    const respuesta = `El próximo tren desde ${origen} sale a las ${horaSalida}.`;

    return handlerInput.responseBuilder
      .speak(respuesta)
      .withSimpleCard('Horarios de Trenes', respuesta)
      .getResponse();
  }
};

const GetTrainBetweenStationsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTrainBetweenStationsIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const origen = slots.origen?.value;
    const destino = slots.destino?.value;

    if (!origen || !destino) {
      return handlerInput.responseBuilder
        .speak('Necesito saber tanto la estación de origen como la de destino. ¿Podés repetir?')
        .reprompt('¿Desde qué estación a cuál querés viajar?')
        .getResponse();
    }

    const tren = await getHorarioTren(origen, destino);

    if (!tren) {
      return handlerInput.responseBuilder
        .speak(`No encontré horarios de ${origen} a ${destino}. ¿Querés intentar con otra ruta?`)
        .reprompt('¿Desde qué estación a cuál querés viajar?')
        .getResponse();
    }

    const horaSalida = tren.horario.split('T')[1].slice(0, 5);
    const respuesta = `El próximo tren desde ${origen} hacia ${destino} sale a las ${horaSalida}.`;

    return handlerInput.responseBuilder
      .speak(respuesta)
      .withSimpleCard('Horarios de Trenes', respuesta)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Bienvenido a Horarios de Trenes. Podés preguntar por los horarios de una estación como "¿Cuándo sale el próximo tren en Retiro?" o entre dos estaciones como "¿Cuándo pasa el tren desde Retiro a Tigre?"';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Desde qué estación querés saber el horario?')
      .getResponse();
  }
};

const FallbackHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) !== 'GetNextTrainIntent'
      && Alexa.getIntentName(handlerInput.requestEnvelope) !== 'GetTrainBetweenStationsIntent'
      && Alexa.getIntentName(handlerInput.requestEnvelope) !== 'AMAZON.StopIntent'
      && Alexa.getIntentName(handlerInput.requestEnvelope) !== 'AMAZON.HelpIntent'
      && Alexa.getIntentName(handlerInput.requestEnvelope) !== 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'No entendí lo que dijiste. Probá preguntando: ¿Cuándo pasa el tren desde Retiro a Tigre?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Desde qué estación querés saber el horario?')
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Ocurrió un error consultando los horarios. Intentalo más tarde.')
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNextTrainIntentHandler,
    GetTrainBetweenStationsIntentHandler,
    FallbackHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
