import { MarzPay } from '../index.js';
import { MarzPayError } from '../errors/MarzPayError.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('MarzPay', () => {
  let marzpay;
  const validConfig = {
    apiUser: 'test-api-user',
    apiKey: 'test-api-key'
  };

  beforeEach(() => {
    fetch.mockClear();
    marzpay = new MarzPay(validConfig);
  });

  describe('constructor', () => {
    it('should create a MarzPay instance with valid config', () => {
      expect(marzpay).toBeInstanceOf(MarzPay);
      expect(marzpay.config.apiUser).toBe('test-api-user');
      expect(marzpay.config.apiKey).toBe('test-api-key');
    });

    it('should set default baseUrl and timeout', () => {
      expect(marzpay.config.baseUrl).toBe('https://wallet.wearemarz.com/api/v1');
      expect(marzpay.config.timeout).toBe(30000);
    });

    it('should throw error for missing apiUser', () => {
      const config = { apiKey: 'key' };
      
      expect(() => new MarzPay(config)).toThrow(MarzPayError);
      expect(() => new MarzPay(config)).toThrow('API credentials are required');
    });

    it('should throw error for missing apiKey', () => {
      const config = { apiUser: 'user' };
      
      expect(() => new MarzPay(config)).toThrow(MarzPayError);
      expect(() => new MarzPay(config)).toThrow('API credentials are required');
    });

    it('should allow custom baseUrl and timeout', () => {
      const customConfig = {
        ...validConfig,
        baseUrl: 'https://custom.api.com',
        timeout: 60000
      };
      
      const instance = new MarzPay(customConfig);
      expect(instance.config.baseUrl).toBe('https://custom.api.com');
      expect(instance.config.timeout).toBe(60000);
    });
  });

  describe('API instances', () => {
    it('should have collections API instance', () => {
      expect(marzpay.collections).toBeDefined();
      expect(marzpay.collections.marzpay).toBe(marzpay);
    });

    it('should have disbursements API instance', () => {
      expect(marzpay.disbursements).toBeDefined();
      expect(marzpay.disbursements.marzpay).toBe(marzpay);
    });

    it('should have services API instance', () => {
      expect(marzpay.services).toBeDefined();
      expect(marzpay.services.marzpay).toBe(marzpay);
    });

    it('should have webhooks API instance', () => {
      expect(marzpay.webhooks).toBeDefined();
      expect(marzpay.webhooks.marzpay).toBe(marzpay);
    });

    it('should have utils instance', () => {
      expect(marzpay.utils).toBeDefined();
    });

    it('should have phoneUtils instance', () => {
      expect(marzpay.phoneUtils).toBeDefined();
    });
  });

  describe('request method', () => {
    const mockResponse = {
      success: true,
      data: { message: 'Success' }
    };

    beforeEach(() => {
      fetch.mockResolvedValue(createMockResponse(mockResponse));
    });

    it('should make successful API request', async () => {
      const result = await marzpay.request('/test-endpoint');

      expect(fetch).toHaveBeenCalledWith(
        'https://wallet.wearemarz.com/api/v1/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.any(String)
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request with body', async () => {
      const body = { test: 'data' };
      
      await marzpay.request('/test-endpoint', {
        method: 'POST',
        body
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://wallet.wearemarz.com/api/v1/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body)
        })
      );
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'API Error',
          code: 'API_ERROR'
        }
      };

      fetch.mockResolvedValue(createMockResponse(errorResponse, 400));

      await expect(marzpay.request('/test-endpoint'))
        .rejects.toThrow(MarzPayError);
      await expect(marzpay.request('/test-endpoint'))
        .rejects.toThrow('Request failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      fetch.mockRejectedValue(networkError);

      await expect(marzpay.request('/test-endpoint'))
        .rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      const textResponse = 'Plain text response';
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => textResponse
      });

      await expect(marzpay.request('/test-endpoint'))
        .rejects.toThrow(MarzPayError);
      await expect(marzpay.request('/test-endpoint'))
        .rejects.toThrow('Invalid JSON');
    });
  });

  describe('utility methods', () => {
    describe('formatPhoneNumber', () => {
      it('should format Ugandan phone numbers correctly', () => {
        expect(marzpay.phoneUtils.formatPhoneNumber('0759983853')).toBe('+256759983853');
        expect(marzpay.phoneUtils.formatPhoneNumber('+256759983853')).toBe('+256759983853');
        expect(marzpay.phoneUtils.formatPhoneNumber('256759983853')).toBe('+256759983853');
      });

      it('should handle invalid phone numbers', () => {
        expect(marzpay.phoneUtils.formatPhoneNumber('invalid')).toBe(null);
        expect(marzpay.phoneUtils.formatPhoneNumber('')).toBe(null);
        expect(marzpay.phoneUtils.formatPhoneNumber(null)).toBe(null);
      });
    });

    describe('isValidPhoneNumber', () => {
      it('should validate Ugandan phone numbers', () => {
        expect(marzpay.phoneUtils.isValidPhoneNumber('0759983853')).toBe(true);
        expect(marzpay.phoneUtils.isValidPhoneNumber('+256759983853')).toBe(true);
        expect(marzpay.phoneUtils.isValidPhoneNumber('256759983853')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(marzpay.phoneUtils.isValidPhoneNumber('123')).toBe(false);
        expect(marzpay.phoneUtils.isValidPhoneNumber('invalid')).toBe(false);
        expect(marzpay.phoneUtils.isValidPhoneNumber('')).toBe(false);
      });
    });

    describe('isValidUUID', () => {
      it('should validate UUID4 format', () => {
        expect(marzpay.utils.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        expect(marzpay.utils.isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
      });

      it('should reject invalid UUIDs', () => {
        expect(marzpay.utils.isValidUUID('invalid-uuid')).toBe(false);
        expect(marzpay.utils.isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
        expect(marzpay.utils.isValidUUID('')).toBe(false);
      });
    });

    describe('buildQueryString', () => {
      it('should build query string from object', () => {
        const params = { page: 1, limit: 10, status: 'active' };
        const result = marzpay.utils.buildQueryString(params);
        
        expect(result).toBe('page=1&limit=10&status=active');
      });

      it('should handle empty parameters', () => {
        expect(marzpay.utils.buildQueryString({})).toBe('');
        expect(marzpay.utils.buildQueryString(null)).toBe('');
        expect(marzpay.utils.buildQueryString(undefined)).toBe('');
      });

      it('should handle special characters', () => {
        const params = { 
          search: 'test query', 
          filter: 'status:active' 
        };
        const result = marzpay.utils.buildQueryString(params);
        
        expect(result).toBe('search=test%20query&filter=status%3Aactive');
      });
    });
  });

  describe('error handling', () => {
    it('should handle configuration errors', () => {
      expect(() => new MarzPay({}))
        .toThrow(MarzPayError);
    });

    it('should handle request errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(marzpay.request('/test'))
        .rejects.toThrow('Network error');
    });
  });

  describe('authentication', () => {
    it('should generate auth header correctly', () => {
      const authHeader = marzpay.getAuthHeader();
      expect(authHeader).toContain('Basic');
      expect(authHeader).toContain('dGVzdC1hcGktdXNlcjp0ZXN0LWFwaS1rZXk=');
    });

    it('should allow updating credentials', () => {
      marzpay.setCredentials('new-user', 'new-key');
      expect(marzpay.config.apiUser).toBe('new-user');
      expect(marzpay.config.apiKey).toBe('new-key');
    });
  });
});
