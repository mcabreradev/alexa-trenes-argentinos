// This file contains setup code that will be executed before Jest runs the tests

// Silence console logs during tests to reduce noise
// You can remove these if you want to see the logs during testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
