import { EstacionesHelper } from '../../src/helpers/estaciones-helper';
import { Estacion } from '../../src/types/api-types';

describe('EstacionesHelper', () => {
  describe('normalizarNombre', () => {
    it('should convert to lowercase', () => {
      expect(EstacionesHelper.normalizarNombre('RETIRO')).toBe('retiro');
    });

    it('should remove accents', () => {
      expect(EstacionesHelper.normalizarNombre('Constitución')).toBe('constitucion');
    });

    it('should handle empty strings', () => {
      expect(EstacionesHelper.normalizarNombre('')).toBe('');
      expect(EstacionesHelper.normalizarNombre(undefined as unknown as string)).toBe('');
    });
  });

  describe('getNombreNormalizado', () => {
    it('should return alternative name when available', () => {
      expect(EstacionesHelper.getNombreNormalizado('plaza once')).toBe('once');
      expect(EstacionesHelper.getNombreNormalizado('Once de Septiembre')).toBe('once');
      expect(EstacionesHelper.getNombreNormalizado('Estación Retiro')).toBe('retiro');
    });

    it('should return normalized name when no alternative exists', () => {
      expect(EstacionesHelper.getNombreNormalizado('Ciudadela')).toBe('ciudadela');
    });
  });

  describe('getIdEstacionComun', () => {
    it('should return ID for common stations', () => {
      expect(EstacionesHelper.getIdEstacionComun('Retiro')).toBe('RTR');
      expect(EstacionesHelper.getIdEstacionComun('Constitución')).toBe('CST');
      expect(EstacionesHelper.getIdEstacionComun('Once')).toBe('ONC');
    });

    it('should handle alternative names', () => {
      expect(EstacionesHelper.getIdEstacionComun('Estación Retiro')).toBe('RTR');
      expect(EstacionesHelper.getIdEstacionComun('Plaza Once')).toBe('ONC');
    });

    it('should return null for unknown stations', () => {
      expect(EstacionesHelper.getIdEstacionComun('Estación Desconocida')).toBeNull();
    });
  });

  describe('buscarCoincidenciaAproximada', () => {
    it('should find exact matches', () => {
      expect(EstacionesHelper.buscarCoincidenciaAproximada('Retiro')).toBe('RTR');
    });

    it('should find partial matches', () => {
      // These will match based on the implementation that checks if one string includes the other
      expect(EstacionesHelper.buscarCoincidenciaAproximada('Esta Retiro')).toBe('RTR');
      expect(EstacionesHelper.buscarCoincidenciaAproximada('Ret')).toBe('RTR');
    });

    it('should return null for no matches', () => {
      expect(EstacionesHelper.buscarCoincidenciaAproximada('Estación Inexistente')).toBeNull();
    });
  });

  describe('encontrarMejorCoincidencia', () => {
    const estaciones: Estacion[] = [
      { id: 'RTR', nombre: 'Retiro', ramal: 'R1' },
      { id: 'PAL', nombre: 'Palermo', ramal: 'R1' },
      { id: 'CST', nombre: 'Constitución', ramal: 'R2' }
    ];

    it('should find exact matches', () => {
      const result = EstacionesHelper.encontrarMejorCoincidencia('palermo', estaciones);
      expect(result).toEqual({ id: 'PAL', nombre: 'Palermo', ramal: 'R1' });
    });

    it('should find matches with accents using partial matching', () => {
      const result = EstacionesHelper.encontrarMejorCoincidencia('const', estaciones);
      expect(result).toEqual({ id: 'CST', nombre: 'Constitución', ramal: 'R2' });
    });

    it('should find partial matches', () => {
      const result = EstacionesHelper.encontrarMejorCoincidencia('Reti', estaciones);
      expect(result).toEqual({ id: 'RTR', nombre: 'Retiro', ramal: 'R1' });
    });

    it('should return null for no matches', () => {
      const result = EstacionesHelper.encontrarMejorCoincidencia('Estación Desconocida', estaciones);
      expect(result).toBeNull();
    });

    it('should handle empty array', () => {
      const result = EstacionesHelper.encontrarMejorCoincidencia('Retiro', []);
      expect(result).toBeNull();
    });
  });
});
