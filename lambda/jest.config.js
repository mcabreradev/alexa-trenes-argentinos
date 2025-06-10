module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    'ask-sdk-core': '<rootDir>/tests/mocks/ask-sdk-core.mock.js'
  }
};
