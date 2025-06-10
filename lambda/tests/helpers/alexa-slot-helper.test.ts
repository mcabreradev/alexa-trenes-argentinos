import { AlexaSlotHelper } from '../../src/helpers/alexa-slot-helper';
import { RequestEnvelope } from 'ask-sdk-model';

describe('AlexaSlotHelper', () => {
  describe('getSlotValue', () => {
    it('should return null when slot is not present', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {}
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getSlotValue(requestEnvelope, 'nonExistentSlot')).toBeNull();
    });

    it('should use resolved value when available', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              testSlot: {
                value: 'raw value',
                resolutions: {
                  resolutionsPerAuthority: [
                    {
                      status: { code: 'ER_SUCCESS_MATCH' },
                      values: [{ value: { name: 'resolved value', id: '1234' } }]
                    }
                  ]
                }
              }
            }
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getSlotValue(requestEnvelope, 'testSlot')).toBe('resolved value');
    });

    it('should fall back to direct value when resolution is not available', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              testSlot: {
                value: 'raw value'
              }
            }
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getSlotValue(requestEnvelope, 'testSlot')).toBe('raw value');
    });
  });

  describe('getSlotValues', () => {
    it('should get multiple slot values', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              slotA: { value: 'valueA' },
              slotB: { value: 'valueB' },
              slotC: { 
                value: 'rawC',
                resolutions: {
                  resolutionsPerAuthority: [
                    {
                      status: { code: 'ER_SUCCESS_MATCH' },
                      values: [{ value: { name: 'resolvedC', id: '1234' } }]
                    }
                  ]
                }
              }
            }
          }
        }
      } as unknown as RequestEnvelope;

      const result = AlexaSlotHelper.getSlotValues(requestEnvelope, ['slotA', 'slotB', 'slotC', 'nonExistent']);
      expect(result).toEqual({
        slotA: 'valueA',
        slotB: 'valueB',
        slotC: 'resolvedC',
        nonExistent: null
      });
    });
  });

  describe('getDateSlotValue', () => {
    beforeEach(() => {
      // Mock Date to have a consistent reference point for tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-06-09T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should parse an ISO date string', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              dateSlot: { value: '2025-06-10' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      const result = AlexaSlotHelper.getDateSlotValue(requestEnvelope, 'dateSlot');
      expect(result).toEqual(new Date('2025-06-10'));
    });

    it('should handle "mañana" correctly', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              dateSlot: { value: 'mañana' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      const result = AlexaSlotHelper.getDateSlotValue(requestEnvelope, 'dateSlot');
      const tomorrow = new Date('2025-06-10T12:00:00Z');
      
      expect(result?.getFullYear()).toBe(tomorrow.getFullYear());
      expect(result?.getMonth()).toBe(tomorrow.getMonth());
      expect(result?.getDate()).toBe(tomorrow.getDate());
    });

    it('should handle "hoy" correctly', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              dateSlot: { value: 'hoy' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      const result = AlexaSlotHelper.getDateSlotValue(requestEnvelope, 'dateSlot');
      const today = new Date('2025-06-09T12:00:00Z');
      
      expect(result?.getFullYear()).toBe(today.getFullYear());
      expect(result?.getMonth()).toBe(today.getMonth());
      expect(result?.getDate()).toBe(today.getDate());
    });
  });

  describe('getTimeSlotValue', () => {
    it('should format time values correctly', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              timeSlot: { value: '9:30' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getTimeSlotValue(requestEnvelope, 'timeSlot')).toBe('09:30');
    });

    it('should handle already formatted time values', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              timeSlot: { value: '14:45' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getTimeSlotValue(requestEnvelope, 'timeSlot')).toBe('14:45');
    });

    it('should return null for invalid time formats', () => {
      const requestEnvelope = {
        request: {
          intent: {
            slots: {
              timeSlot: { value: 'no es una hora' }
            }
          }
        }
      } as unknown as RequestEnvelope;

      expect(AlexaSlotHelper.getTimeSlotValue(requestEnvelope, 'timeSlot')).toBeNull();
    });
  });
});
