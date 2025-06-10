import { TrenesApiService } from '../../src/services/trenes-api-service';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');

describe('TrenesApiService', () => {
  let service: TrenesApiService;
  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrenesApiService();
    
    // Setup default mock response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({})
    };
    mockedFetch.mockResolvedValue(mockResponse as any);
  });

  describe('getEstaciones', () => {
    it('should fetch stations with the correct URL', async () => {
      const mockEstaciones = [
        { id: 'RTR', nombre: 'Retiro', ramal: 'R1' },
        { id: 'CST', nombre: 'Constitución', ramal: 'R2' }
      ];
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockEstaciones)
      };
      
      mockedFetch.mockResolvedValue(mockResponse as any);
      
      const result = await service.getEstaciones({});
      
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/infraestructura/estaciones'),
        expect.any(Object)
      );
      expect(result).toEqual(mockEstaciones);
    });

    it('should include query parameters when provided', async () => {
      await service.getEstaciones({ nombre: 'Retiro' });
      
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/infraestructura/estaciones?nombre=Retiro'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      mockedFetch.mockResolvedValue(mockResponse as any);
      
      await expect(service.getEstaciones({})).rejects.toThrow('Error en API');
    });

    it('should handle network errors gracefully', async () => {
      mockedFetch.mockRejectedValue(new Error('Network Error'));
      
      // Set the same URL for base and fallback to prevent retry
      (service as any).baseUrl = 'https://test.com';
      (service as any).fallbackUrl = 'https://test.com';
      
      await expect(service.getEstaciones({})).rejects.toThrow('Network Error');
    });
  });

  // Add tests for other API methods following a similar pattern
  // (getArribos, getRamales, etc.)
});
