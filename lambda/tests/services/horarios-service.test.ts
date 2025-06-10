import { HorariosService } from '../../src/services/horarios-service';
import { TrenesApiService } from '../../src/services/trenes-api-service';
import { Estacion, Arribo } from '../../src/types/api-types';

// Mock the TrenesApiService to avoid actual API calls during tests
jest.mock('../../src/services/trenes-api-service');

describe('HorariosService', () => {
  let service: HorariosService;
  let mockApiService: jest.Mocked<TrenesApiService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mocked instance of TrenesApiService
    mockApiService = new TrenesApiService() as jest.Mocked<TrenesApiService>;
    
    // Create the service using the mocked API service
    service = new HorariosService();
    
    // Inject the mock API service into the HorariosService
    (service as any).apiService = mockApiService;
  });

  describe('buscarEstacion', () => {
    it('should find a station via API', async () => {
      const mockEstaciones: Estacion[] = [
        { id: 'RTR', nombre: 'Retiro', ramal: 'R1' }
      ];
      
      mockApiService.getEstaciones = jest.fn().mockResolvedValue(mockEstaciones);
      
      const result = await service.buscarEstacion('Retiro');
      
      expect(mockApiService.getEstaciones).toHaveBeenCalledWith({ nombre: 'retiro' });
      expect(result).toEqual({
        id: 'RTR',
        nombre: 'Retiro',
        encontradoEn: 'api'
      });
    });

    it('should fall back to common stations map when API returns no results', async () => {
      // API returns empty array
      mockApiService.getEstaciones = jest.fn().mockResolvedValue([]);
      
      const result = await service.buscarEstacion('Retiro');
      
      expect(mockApiService.getEstaciones).toHaveBeenCalledWith({ nombre: 'retiro' });
      expect(result).toEqual({
        id: 'RTR',
        nombre: 'Retiro',
        encontradoEn: 'mapa'
      });
    });

    it('should return null when station cannot be found', async () => {
      // API returns empty array
      mockApiService.getEstaciones = jest.fn().mockResolvedValue([]);
      
      const result = await service.buscarEstacion('Estación Inexistente');
      
      expect(mockApiService.getEstaciones).toHaveBeenCalledWith({ nombre: 'estacion inexistente' });
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.getEstaciones = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const result = await service.buscarEstacion('Retiro');
      
      expect(mockApiService.getEstaciones).toHaveBeenCalledWith({ nombre: 'retiro' });
      expect(result).toBeNull();
    });
  });

  // Additional tests for other methods like obtenerHorarios, obtenerProximoTren, etc.
  // would follow a similar pattern, mocking the necessary API responses
});
