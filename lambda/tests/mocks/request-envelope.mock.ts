import { RequestEnvelope } from 'ask-sdk-model';

export const createMockRequestEnvelope = (slots: Record<string, any> = {}): RequestEnvelope => {
  return {
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
        slots
      }
    }
  } as RequestEnvelope;
};
