// Mock for ask-sdk-core
const mockHandlerInput = {
  requestEnvelope: {
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'TestIntent',
        slots: {}
      }
    },
    context: {
      System: {
        user: {
          userId: 'test-user-id'
        }
      }
    }
  },
  attributesManager: {
    getRequestAttributes: jest.fn().mockReturnValue({}),
    getSessionAttributes: jest.fn().mockReturnValue({}),
    setSessionAttributes: jest.fn(),
    getPersistentAttributes: jest.fn().mockResolvedValue({}),
    setPersistentAttributes: jest.fn(),
    savePersistentAttributes: jest.fn().mockResolvedValue(undefined)
  },
  responseBuilder: {
    speak: jest.fn(function() { return this; }),
    reprompt: jest.fn(function() { return this; }),
    withSimpleCard: jest.fn(function() { return this; }),
    withStandardCard: jest.fn(function() { return this; }),
    addDirective: jest.fn(function() { return this; }),
    withShouldEndSession: jest.fn(function() { return this; }),
    getResponse: jest.fn().mockReturnValue({
      outputSpeech: {
        type: 'SSML',
        ssml: '<speak>Test response</speak>'
      }
    })
  },
  serviceClientFactory: {
    getDeviceAddressService: jest.fn(),
    getUpsService: jest.fn(),
    getMonetizationService: jest.fn(),
    getReminderManagementService: jest.fn(),
    getListManagementService: jest.fn()
  }
};

const mockRequestEnvelope = {
  version: '1.0',
  session: {
    new: true,
    sessionId: 'test-session-id',
    application: {
      applicationId: 'test-app-id'
    },
    user: {
      userId: 'test-user-id'
    }
  },
  context: {
    System: {
      application: {
        applicationId: 'test-app-id'
      },
      user: {
        userId: 'test-user-id'
      },
      device: {
        deviceId: 'test-device-id',
        supportedInterfaces: {}
      }
    }
  },
  request: {
    type: 'IntentRequest',
    requestId: 'test-request-id',
    timestamp: new Date().toISOString(),
    locale: 'es-ES',
    intent: {
      name: 'TestIntent',
      confirmationStatus: 'NONE',
      slots: {}
    }
  }
};

const mockSkillBuilder = {
  addRequestHandlers: jest.fn(function() { return this; }),
  addRequestInterceptors: jest.fn(function() { return this; }),
  addResponseInterceptors: jest.fn(function() { return this; }),
  addErrorHandlers: jest.fn(function() { return this; }),
  withPersistenceAdapter: jest.fn(function() { return this; }),
  withApiClient: jest.fn(function() { return this; }),
  withCustomUserAgent: jest.fn(function() { return this; }),
  lambda: jest.fn().mockReturnValue(() => Promise.resolve({}))
};

const Alexa = {
  SkillBuilders: {
    custom: jest.fn().mockReturnValue(mockSkillBuilder),
    standard: jest.fn().mockReturnValue(mockSkillBuilder)
  },
  RequestHandler: jest.fn(),
  ErrorHandler: jest.fn(),
  DefaultApiClient: jest.fn(),
  getRequestType: jest.fn().mockReturnValue('IntentRequest'),
  getIntentName: jest.fn().mockReturnValue('TestIntent'),
  getSlotValue: jest.fn().mockReturnValue('test-value'),
  getSupportedInterfaces: jest.fn().mockReturnValue({}),
  isNewSession: jest.fn().mockReturnValue(true),
  createStandardHandler: jest.fn()
};

// Export the mocks
module.exports = {
  Alexa,
  mockHandlerInput,
  mockRequestEnvelope,
  mockSkillBuilder
};
