# Referencia Rápida - Alexa Skill Trenes Argentinos

## Comandos Comunes

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instalar dependencias |
| `pnpm build` | Compilar el proyecto TypeScript |
| `pnpm watch` | Compilar en modo watch (recompila automáticamente) |
| `pnpm test` | Ejecutar pruebas unitarias |
| `pnpm test:coverage` | Generar informe de cobertura de pruebas |
| `pnpm deploy` | Crear paquete optimizado para despliegue |
| `pnpm start` | Ejecutar la aplicación localmente |

## Estructura de Archivos

| Ruta | Descripción |
|------|-------------|
| `/lambda/src/index.ts` | Punto de entrada principal y handlers de Alexa |
| `/lambda/src/helpers/` | Utilidades auxiliares |
| `/lambda/src/services/` | Servicios de negocio |
| `/lambda/src/types/` | Definiciones de tipos TypeScript |
| `/lambda/tests/` | Pruebas unitarias |
| `/lambda/apl-documents/` | Plantillas de visualización APL |
| `/skill/models/es-ES.json` | Modelo de interacción de la skill en español |

## Ejemplos de Código

### Crear un nuevo intent handler

```typescript
const MyNewIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MyNewIntent';
  },
  async handle(handlerInput: HandlerInput) {
    // Implementación...
    return handlerInput.responseBuilder
      .speak('Respuesta al usuario')
      .getResponse();
  }
};

// Añadir a SkillBuilder
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    // ...otros handlers
    MyNewIntentHandler
  )
  .lambda();
```

### Extraer valores de slots

```typescript
// Slot simple
const estacion = AlexaSlotHelper.getSlotValue(handlerInput.requestEnvelope, 'estacion');

// Slot de fecha
const fecha = AlexaSlotHelper.getDateSlotValue(handlerInput.requestEnvelope, 'fecha');

// Slot de hora
const hora = AlexaSlotHelper.getTimeSlotValue(handlerInput.requestEnvelope, 'hora');

// Múltiples slots
const { origen, destino } = AlexaSlotHelper.getSlotValues(
  handlerInput.requestEnvelope,
  ['origen', 'destino']
);
```

### Buscar estaciones

```typescript
// En HorariosService
const estacion = await horariosService.buscarEstacion('Retiro');
// Devuelve: { id: 'RTR', nombre: 'Retiro', encontradoEn: 'api' }

// En EstacionesHelper
const idEstacion = EstacionesHelper.getIdEstacionComun('Retiro');
// Devuelve: 'RTR'

const nombreNormalizado = EstacionesHelper.getNombreNormalizado('Estación Retiro');
// Devuelve: 'retiro'
```

### Consultar horarios

```typescript
// Próximo tren
const proximoTren = await horariosService.obtenerProximoTren('Retiro');

// Horarios entre estaciones
const horarios = await horariosService.obtenerHorarios({
  estacion: 'Retiro',
  destino: 'Tigre',
  fecha: '2025-06-09',
  hora: '14:00'
});

// Primer tren de mañana
const primerTren = await horariosService.obtenerPrimerTrenManana('Retiro');
```

### Añadir soporte APL

```typescript
// Verificar si el dispositivo soporta APL
if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
  // Crear directiva APL
  const aplDirective = {
    type: 'Alexa.Presentation.APL.RenderDocument',
    token: 'token123',
    document: require('../apl-documents/my-template.json'),
    datasources: {
      myData: {
        title: 'Título',
        content: 'Contenido',
        // otros datos...
      }
    }
  };

  // Añadir a la respuesta
  handlerInput.responseBuilder.addDirective(aplDirective);
}
```

### Manejo de errores

```typescript
try {
  // Código que puede fallar
} catch (error) {
  console.error('Descripción del error:', error);

  // Respuesta amigable al usuario
  return handlerInput.responseBuilder
    .speak('Lo siento, ha ocurrido un problema. Por favor, inténtalo de nuevo más tarde.')
    .getResponse();
}
```

### Pruebas unitarias

```typescript
// Probar un helper
test('should normalize station name', () => {
  expect(EstacionesHelper.normalizarNombre('Estación Retíro')).toBe('estacion retiro');
});

// Mockear un servicio
jest.mock('../../src/services/trenes-api-service');
const mockApiService = new TrenesApiService() as jest.Mocked<TrenesApiService>;
mockApiService.getEstaciones.mockResolvedValue([
  { id: 'RTR', nombre: 'Retiro', ramal: 'R1' }
]);
```

## Ejemplos de Utterances

| Intent | Ejemplo de Utterance |
|--------|----------------------|
| GetNextTrainIntent | "Cuándo sale el próximo tren en Retiro" |
| GetTrainBetweenStationsIntent | "Horarios entre Constitución y Temperley" |
| GetFirstTrainTomorrowIntent | "Primer tren mañana desde Retiro" |
| AMAZON.HelpIntent | "Ayuda" |
| AMAZON.StopIntent | "Parar" |
| AMAZON.CancelIntent | "Cancelar" |

## Enlaces Útiles

- [Documentación de Alexa Skills Kit](https://developer.amazon.com/es-ES/docs/alexa/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [Alexa Skills Kit SDK para Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- [APL (Alexa Presentation Language)](https://developer.amazon.com/es-ES/docs/alexa/alexa-presentation-language/understand-apl.html)
- [Jest para Pruebas](https://jestjs.io/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Solución de Problemas Comunes

| Problema | Solución |
|----------|----------|
| La skill no entiende un nombre de estación | Añadir variante al mapa NOMBRES_ALTERNATIVOS en EstacionesHelper |
| Error "Cannot find module" | Verificar importaciones y ejecutar `pnpm install` |
| La API devuelve un error | Comprobar parámetros y verificar que la API esté disponible |
| Error en compilación TypeScript | Revisar errores en consola y corregir tipos |
| Test falla | Verificar que los mocks estén configurados correctamente |
| Paquete de despliegue muy grande | Usar `pnpm deploy` con script optimizado |
