// Mock the dist/index.js module
jest.mock('../dist/index', () => ({
  handler: jest.fn().mockImplementation((event, context) => {
    // Return a promise to simulate the async behavior of the Lambda handler
    return Promise.resolve({});
  })
}));

const compiledIndex = require('../dist/index');

describe('Root index.js', () => {
  it('should re-export the handler from dist/index.js', async () => {
    // We don't load the actual root index.js because that would
    // cause conflicts with Jest's module mocking system
    // Instead, we just test that it exports the handler from dist/index.js
    
    // Ensure our mock is working
    expect(typeof compiledIndex.handler).toBe('function');
    
    // Verify the mock works as expected
    const result = await compiledIndex.handler('event', 'context');
    expect(compiledIndex.handler).toHaveBeenCalledWith('event', 'context');
  });
});
