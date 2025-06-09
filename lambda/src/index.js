const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');
const { loadAplDocument } = require('./apl-utils');

// Actualizado para usar solo el endpoint de respaldo como principal ya que el otro podría estar caído
const PRIMARY_ENDPOINT = 'https://ariedro.dev/api-trenes';
const FALLBACK_ENDPOINT = 'https://ariedro.dev/api-trenes';

const getEstacionId = async (nombreEstacion) => {
  if (!nombreEstacion) return null;

  // Normalizar el nombre de la estación (quitar acentos, convertir a minúsculas)
  const normalizedNombre = nombreEstacion.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  console.log(`Buscando estación: "${nombreEstacion}" (normalizado: "${normalizedNombre}")`);

  // Mapa de nombres alternativos a nombres normalizados
  const alternativeNames = {
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
  };

  // Si el nombre normalizado tiene una alternativa, usarla
  const nombreBusqueda = alternativeNames[normalizedNombre] || normalizedNombre;
  console.log(`Nombre de búsqueda final: ${nombreBusqueda}`);

  try {
    // Intentar con el endpoint principal
    console.log(`Consultando endpoint principal para: ${nombreBusqueda}`);
    const response = await fetch(`${PRIMARY_ENDPOINT}/infraestructura/estaciones?nombre=${encodeURIComponent(nombreBusqueda)}`);
    const data = await response.json();
    console.log(`Respuesta del endpoint principal:`, JSON.stringify(data));

    if (Array.isArray(data) && data.length > 0) {
      console.log(`Encontrada estación con ID: ${data[0].id}`);
      return data[0].id;
    }

    throw new Error('No match en endpoint principal');
  } catch (e) {
    console.log(`Error o sin resultados en endpoint principal: ${e.message}. Intentando con fallback...`);

    try {
      // Intentar con el endpoint de respaldo
      const fallback = await fetch(`${FALLBACK_ENDPOINT}/infraestructura/estaciones?nombre=${encodeURIComponent(nombreBusqueda)}`);
      const data = await fallback.json();
      console.log(`Respuesta del endpoint fallback:`, JSON.stringify(data));

      if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
        console.log(`Encontrada estación con ID: ${data[0].id} en fallback`);
        return data[0].id;
      }

      // Si todo falla, buscar una coincidencia aproximada con estaciones comunes
      const estacionesComunes = {
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
        'la plata': 'LPL'
      };

      // Buscar coincidencia exacta primero
      if (estacionesComunes[nombreBusqueda]) {
        console.log(`Coincidencia exacta encontrada en el mapa de estaciones: ${nombreBusqueda} -> ${estacionesComunes[nombreBusqueda]}`);
        return estacionesComunes[nombreBusqueda];
      }

      // Buscar coincidencia aproximada
      for (const [key, id] of Object.entries(estacionesComunes)) {
        if (nombreBusqueda.includes(key) || key.includes(nombreBusqueda)) {
          console.log(`Coincidencia aproximada encontrada: ${key} -> ${id}`);
          return id;
        }
      }

      console.log(`No se encontró ninguna coincidencia para: ${nombreEstacion}`);
      return null;
    } catch (fallbackError) {
      console.log(`Error en endpoint fallback: ${fallbackError.message}`);
      return null;
    }
  }
};

const getHorarioTren = async (origen, destino) => {
  try {
    const origenId = await getEstacionId(origen);
    const destinoId = destino ? await getEstacionId(destino) : null;

    if (!origenId) {
      console.log(`No se pudo encontrar ID para la estación de origen: ${origen}`);
      return null;
    }

    if (destino && !destinoId) {
      console.log(`No se pudo encontrar ID para la estación de destino: ${destino}`);
      return null;
    }

    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().slice(0, 5);

    console.log(`Consultando horarios para origenId=${origenId}, destinoId=${destinoId}, fecha=${fecha}, hora=${hora}`);

    let url;
    if (destinoId) {
      url = `${PRIMARY_ENDPOINT}/arribos/estacion/${origenId}?hasta=${destinoId}&fecha=${fecha}&hora=${hora}&cantidad=3`;
    } else {
      url = `${PRIMARY_ENDPOINT}/arribos/estacion/${origenId}?fecha=${fecha}&hora=${hora}&cantidad=3`;
    }

    console.log(`URL de consulta: ${url}`);
    
    // Establecer un timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      // Limpiar el timeout después de que la petición se complete
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`Error en la respuesta de la API: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`Respuesta de la API:`, JSON.stringify(data));

      if (!Array.isArray(data)) {
        console.log(`La respuesta no es un array como se esperaba:`, JSON.stringify(data));

        // Intentar extraer información relevante si la estructura es diferente
        if (data && data.trenes && Array.isArray(data.trenes) && data.trenes.length > 0) {
          console.log(`Encontrado array de trenes dentro de la respuesta`);
          return data.trenes[0];
        }
        
        // Manejar el caso donde la respuesta es un objeto único
        if (data && data.horario) {
          console.log(`Encontrado objeto único con horario`);
          return data;
        }

        return null;
      }

      if (data.length === 0) {
        console.log(`No se encontraron trenes para esta consulta`);
        return null;
      }

      // Verificar si los datos tienen la estructura esperada
      if (!data[0].horario) {
        console.log(`Los datos no tienen el formato esperado:`, JSON.stringify(data[0]));

        // Adaptar a posibles diferentes formatos
        if (data[0].hora) {
          console.log(`Adaptando formato: usando 'hora' en lugar de 'horario'`);
          data[0].horario = `${fecha}T${data[0].hora}:00`;
        } else {
          return null;
        }
      }

      return data[0];
    } catch (fetchError) {
      // Asegurarse de limpiar el timeout en caso de error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('La petición se abortó por timeout');
      }
      
      throw fetchError;
    }
  } catch (e) {
    console.error(`Error en getHorarioTren:`, e);
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

    // Extraer el valor del slot y mostrar información de depuración
    const origenSlot = slots.origen;
    console.log('GetNextTrainIntent - Slot completo origen:', JSON.stringify(origenSlot));

    // Intentar diferentes formas de obtener el valor del slot
    let origen = null;

    // Primero intentar con el valor directo del slot
    if (origenSlot?.value) {
      origen = origenSlot.value;
      console.log('Usando valor directo del slot:', origen);
    }
    // Luego intentar con resolutionPerAuthority si está disponible
    else if (origenSlot?.resolutions?.resolutionsPerAuthority &&
             origenSlot.resolutions.resolutionsPerAuthority.length > 0) {
      const resolution = origenSlot.resolutions.resolutionsPerAuthority[0];
      if (resolution.status.code === 'ER_SUCCESS_MATCH' && resolution.values.length > 0) {
        origen = resolution.values[0].value.name;
        console.log('Usando valor resuelto del slot:', origen);
      }
    }

    console.log('Valor final de origen:', origen);

    if (!origen) {
      return handlerInput.responseBuilder
        .speak('No entendí la estación de origen, ¿podés repetir? Por favor di el nombre de una estación como Retiro o Tigre.')
        .reprompt('¿Desde qué estación querés viajar? Por ejemplo, Retiro o Constitución.')
        .getResponse();
    }

    const tren = await getHorarioTren(origen);

    if (!tren) {
      // Mensaje más amigable cuando no se encuentran horarios
      const respuesta = `Lo siento, no pude encontrar información de horarios para trenes desde ${origen} en este momento. Puede que no haya servicios programados o que haya un problema con el sistema de consulta. ¿Querés intentar con otra estación?`;
      
      return handlerInput.responseBuilder
        .speak(respuesta)
        .reprompt('¿Desde qué otra estación querés saber el horario?')
        .getResponse();
    }

    const horaSalida = tren.horario.split('T')[1].slice(0, 5);
    const respuesta = `El próximo tren desde ${origen} sale a las ${horaSalida}.`;    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        // Cargar documento APL usando nuestra utilidad
        const aplDocument = loadAplDocument();
        
        if (aplDocument) {
          // Datos para el APL
          const aplData = {
            trains: [
              {
                horaSalida: horaSalida,
                destino: tren.destino || 'No disponible'
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

const GetTrainBetweenStationsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTrainBetweenStationsIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};

    // Extraer los valores de los slots y mostrar información de depuración
    const origenSlot = slots.origen;
    const destinoSlot = slots.destino;
    console.log('GetTrainBetweenStationsIntent - Slot completo origen:', JSON.stringify(origenSlot));
    console.log('GetTrainBetweenStationsIntent - Slot completo destino:', JSON.stringify(destinoSlot));

    // Intentar diferentes formas de obtener los valores de los slots
    let origen = null;
    let destino = null;

    // Procesar slot de origen
    if (origenSlot?.value) {
      origen = origenSlot.value;
      console.log('Usando valor directo del slot origen:', origen);
    }
    else if (origenSlot?.resolutions?.resolutionsPerAuthority &&
             origenSlot.resolutions.resolutionsPerAuthority.length > 0) {
      const resolution = origenSlot.resolutions.resolutionsPerAuthority[0];
      if (resolution.status.code === 'ER_SUCCESS_MATCH' && resolution.values.length > 0) {
        origen = resolution.values[0].value.name;
        console.log('Usando valor resuelto del slot origen:', origen);
      }
    }

    // Procesar slot de destino
    if (destinoSlot?.value) {
      destino = destinoSlot.value;
      console.log('Usando valor directo del slot destino:', destino);
    }
    else if (destinoSlot?.resolutions?.resolutionsPerAuthority &&
             destinoSlot.resolutions.resolutionsPerAuthority.length > 0) {
      const resolution = destinoSlot.resolutions.resolutionsPerAuthority[0];
      if (resolution.status.code === 'ER_SUCCESS_MATCH' && resolution.values.length > 0) {
        destino = resolution.values[0].value.name;
        console.log('Usando valor resuelto del slot destino:', destino);
      }
    }

    console.log('Valor final de origen:', origen);
    console.log('Valor final de destino:', destino);

    if (!origen || !destino) {
      return handlerInput.responseBuilder
        .speak('Necesito saber tanto la estación de origen como la de destino. Por favor di nombres de estaciones como Retiro, Tigre o Constitución.')
        .reprompt('Por ejemplo, podés preguntar: ¿Cuándo sale el tren de Retiro a Tigre?')
        .getResponse();
    }

    const tren = await getHorarioTren(origen, destino);

    if (!tren) {
      // Mensaje más amigable cuando no se encuentran horarios
      const respuesta = `Lo siento, no pude encontrar información de horarios para trenes desde ${origen} hacia ${destino} en este momento. Puede que no haya servicios programados en esa ruta o que haya un problema con el sistema de consulta. ¿Querés intentar con otras estaciones?`;
      
      return handlerInput.responseBuilder
        .speak(respuesta)
        .reprompt('¿Desde qué estación a cuál otra querés viajar?')
        .getResponse();
    }

    const horaSalida = tren.horario.split('T')[1].slice(0, 5);
    const respuesta = `El próximo tren desde ${origen} hacia ${destino} sale a las ${horaSalida}.`;    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        // Cargar documento APL usando nuestra utilidad
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

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Bienvenido a Horarios de Trenes. Podés preguntar por los horarios de una estación como "¿Cuándo sale el próximo tren en Retiro?" o entre dos estaciones como "¿Cuándo pasa el tren desde Retiro a Tigre?"';
    
    // Verificar si el dispositivo soporta APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      try {
        // Cargar documento APL usando nuestra utilidad
        const aplDocument = loadAplDocument();
        
        if (aplDocument) {
          // Datos para el APL de bienvenida
          const aplData = {
            trains: [
              {
                horaSalida: "Bienvenido",
                destino: "Consulta horarios de trenes"
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
    const speakOutput = 'No entendí lo que dijiste. Puedo darte información sobre trenes en estaciones como Retiro, Tigre, Constitución, Once, Temperley, Haedo, Morón, o Palermo. Probá preguntando, por ejemplo: ¿Cuándo pasa el tren desde Retiro a Tigre?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Desde qué estación querés saber el horario? Por ejemplo, Retiro o Constitución.')
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    let speakOutput = 'Ocurrió un error consultando los horarios. Intentalo más tarde.';
    
    // Errores específicos
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      speakOutput = 'No pude conectarme con el servicio de horarios. Por favor, verifica tu conexión a Internet e inténtalo nuevamente.';
    } else if (error.message.includes('JSON')) {
      speakOutput = 'Ocurrió un problema al procesar la respuesta del servicio. Esto podría ser temporal. Por favor intenta más tarde.';
    }
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('¿Querés intentar preguntar por otra estación?')
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNextTrainIntentHandler,
    GetTrainBetweenStationsIntentHandler,
    // Agregar handler para AMAZON.HelpIntent
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {
        const speakOutput = 'Esta skill te permite consultar horarios de trenes en Argentina. ' +
                           'Puedes preguntar por el próximo tren que sale de una estación, por ejemplo: "¿Cuándo sale el próximo tren en Retiro?" ' +
                           'O también puedes preguntar por trenes entre dos estaciones, por ejemplo: "¿Cuándo pasa el tren desde Retiro a Tigre?" ' +
                           'Algunas estaciones disponibles son: Retiro, Tigre, Constitución, Once, Temperley, Haedo, Morón, y Palermo. ' +
                           '¿Qué quieres consultar?';

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt('¿Qué horario de trenes te gustaría consultar?')
          .getResponse();
      }
    },
    // Agregar handler para AMAZON.FallbackIntent
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
      },
      handle(handlerInput) {
        const speakOutput = 'Lo siento, no entendí lo que pediste. Puedo darte información sobre trenes en estaciones como Retiro, Tigre, Constitución, Once, Temperley, Haedo, Morón, o Palermo. Prueba preguntando, por ejemplo: ¿Cuándo sale el próximo tren en Retiro?';

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt('¿Desde qué estación quieres saber el horario?')
          .getResponse();
      }
    },
    // Agregar handlers para AMAZON.StopIntent y AMAZON.CancelIntent
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
              || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent');
      },
      handle(handlerInput) {
        const speakOutput = 'Gracias por usar Horarios de Trenes. ¡Hasta luego!';

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    },
    // Agregar handler para SessionEndedRequest
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
      },
      handle(handlerInput) {
        // Limpiar recursos, registrar fin de sesión, etc.
        console.log(`Sesión finalizada: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
      }
    },
    FallbackHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
