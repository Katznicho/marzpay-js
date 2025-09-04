// Global test setup
import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.createMockMarzPay = () => ({
  config: {
    apiKey: 'test-api-key',
    businessId: 'test-business-id',
    environment: 'sandbox'
  },
  request: jest.fn(),
  utils: {
    formatPhoneNumber: jest.fn((phone) => phone),
    isValidPhoneNumber: jest.fn(() => true),
    isValidUUID: jest.fn((uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)),
    buildQueryString: jest.fn((params) => new URLSearchParams(params).toString())
  }
});

global.createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: async () => data,
  text: async () => JSON.stringify(data)
});

global.createMockError = (message, code = 'ERROR', status = 400) => ({
  message,
  code,
  status,
  name: 'MarzPayError'
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

// Clean up after each test
afterEach(() => {
  jest.resetAllMocks();
});
