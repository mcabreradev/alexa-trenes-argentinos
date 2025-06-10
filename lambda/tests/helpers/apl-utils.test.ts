import * as fs from 'fs';
import * as path from 'path';
import { loadAplDocument } from '../../src/apl-utils';

// Mock the fs and path modules
jest.mock('fs');
jest.mock('path');

describe('apl-utils', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Instead of mocking __dirname, we'll make path.resolve return predictable paths
    (path.resolve as jest.Mock).mockImplementation((dir, ...args) => {
      // Ignore the real __dirname and use our mock path
      return ['/mock/dist/path', ...args].join('/');
    });
    
    // Default mock implementations
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.readFileSync as jest.Mock).mockReturnValue('{}');
  });

  describe('loadAplDocument', () => {
    it('should try to load from skill/apl-documents first', () => {
      // Make the first path check pass
      (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify({
        type: 'APL',
        version: '2023.2',
        theme: 'dark',
        mainTemplate: {
          parameters: ['trains'],
          items: []
        }
      }));

      const result = loadAplDocument();
      
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/dist/path/../../../skill/apl-documents/train-schedule-apl.json');
      expect(result).toEqual({
        type: 'APL',
        version: '2023.2',
        theme: 'dark',
        mainTemplate: {
          parameters: ['trains'],
          items: []
        }
      });
    });

    it('should try to load from lambda/apl-documents if skill path fails', () => {
      // Make the first path check fail, second pass
      (fs.existsSync as jest.Mock).mockImplementationOnce(() => false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify({
        type: 'APL',
        version: '2023.2',
        theme: 'dark',
        mainTemplate: {
          parameters: ['trains'],
          items: []
        }
      }));

      const result = loadAplDocument();
      
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/dist/path/../../../skill/apl-documents/train-schedule-apl.json');
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/dist/path/../../apl-documents/train-schedule-apl.json');
      expect(result).toEqual({
        type: 'APL',
        version: '2023.2',
        theme: 'dark',
        mainTemplate: {
          parameters: ['trains'],
          items: []
        }
      });
    });

    it('should use fallback template if no APL document is found', () => {
      // Make all path checks fail
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = loadAplDocument();
      
      expect(result).toBeTruthy();
      expect(result?.type).toBe('APL');
      expect(result?.mainTemplate.parameters).toContain('trains');
    });

    it('should handle errors and return null', () => {
      // Simulate an error
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = loadAplDocument();
      
      expect(result).toBeNull();
    });
  });
});
