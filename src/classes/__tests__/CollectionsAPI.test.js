import { CollectionsAPI } from '../CollectionsAPI.js';
import { MarzPayError } from '../../errors/MarzPayError.js';

describe('CollectionsAPI', () => {
  let collectionsAPI;
  let mockMarzPay;

  beforeEach(() => {
    mockMarzPay = createMockMarzPay();
    collectionsAPI = new CollectionsAPI(mockMarzPay);
  });

  describe('constructor', () => {
    it('should create a CollectionsAPI instance', () => {
      expect(collectionsAPI).toBeInstanceOf(CollectionsAPI);
      expect(collectionsAPI.marzpay).toBe(mockMarzPay);
    });
  });

  describe('collectMoney', () => {
    const validParams = {
      amount: 5000,
      phoneNumber: '0759983853',
      reference: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Payment for services',
      callbackUrl: 'https://example.com/webhook',
      country: 'UG'
    };

    it('should successfully collect money with valid parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          transaction: {
            reference: validParams.reference,
            status: 'pending'
          }
        }
      };

      mockMarzPay.request.mockResolvedValue(mockResponse);

      const result = await collectionsAPI.collectMoney(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith('/collect-money', {
        method: 'POST',
        body: {
          amount: 5000,
          phone_number: '0759983853',
          reference: validParams.reference,
          description: 'Payment for services',
          callback_url: 'https://example.com/webhook',
          country: 'UG'
        }
      });
    });

    it('should use default values for optional parameters', async () => {
      const params = {
        amount: 5000,
        phoneNumber: '0759983853',
        reference: '550e8400-e29b-41d4-a716-446655440000'
      };

      const mockResponse = { success: true };
      mockMarzPay.request.mockResolvedValue(mockResponse);

      await collectionsAPI.collectMoney(params);

      expect(mockMarzPay.request).toHaveBeenCalledWith('/collect-money', {
        method: 'POST',
        body: {
          amount: 5000,
          phone_number: '0759983853',
          reference: params.reference,
          description: null,
          callback_url: null,
          country: 'UG'
        }
      });
    });

    it('should format phone number using utils', async () => {
      mockMarzPay.utils.formatPhoneNumber.mockReturnValue('+256759983853');
      
      const mockResponse = { success: true };
      mockMarzPay.request.mockResolvedValue(mockResponse);

      await collectionsAPI.collectMoney(validParams);

      expect(mockMarzPay.utils.formatPhoneNumber).toHaveBeenCalledWith('0759983853');
      expect(mockMarzPay.request).toHaveBeenCalledWith('/collect-money', {
        method: 'POST',
        body: expect.objectContaining({
          phone_number: '+256759983853'
        })
      });
    });

    it('should convert amount to integer', async () => {
      const params = { ...validParams, amount: '5000' };
      const mockResponse = { success: true };
      mockMarzPay.request.mockResolvedValue(mockResponse);

      await collectionsAPI.collectMoney(params);

      expect(mockMarzPay.request).toHaveBeenCalledWith('/collect-money', {
        method: 'POST',
        body: expect.objectContaining({
          amount: 5000
        })
      });
    });
  });

  describe('validation', () => {
    const baseParams = {
      amount: 5000,
      phoneNumber: '0759983853',
      reference: '550e8400-e29b-41d4-a716-446655440000'
    };

    it('should throw error for missing amount', () => {
      const params = { ...baseParams };
      delete params.amount;

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Amount must be between 500 and 10,000,000 UGX');
    });

    it('should throw error for amount below minimum', () => {
      const params = { ...baseParams, amount: 100 };

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Amount must be between 500 and 10,000,000 UGX');
    });

    it('should throw error for amount above maximum', () => {
      const params = { ...baseParams, amount: 20000000 };

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Amount must be between 500 and 10,000,000 UGX');
    });

    it('should throw error for missing phone number', () => {
      const params = { ...baseParams };
      delete params.phoneNumber;

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Phone number is required');
    });

    it('should throw error for invalid phone number', () => {
      mockMarzPay.utils.isValidPhoneNumber.mockReturnValue(false);
      const params = { ...baseParams, phoneNumber: 'invalid' };

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Invalid phone number format');
    });

    it('should throw error for missing reference', () => {
      const params = { ...baseParams };
      delete params.reference;

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Reference is required');
    });

    it('should throw error for invalid UUID reference', () => {
      mockMarzPay.utils.isValidUUID.mockReturnValue(false);
      const params = { ...baseParams, reference: 'invalid-ref' };

      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow(MarzPayError);
      expect(() => collectionsAPI.validateCollectionParams(params))
        .toThrow('Reference must be a valid UUID4');
    });

    it('should pass validation with valid parameters', () => {
      expect(() => collectionsAPI.validateCollectionParams(baseParams))
        .not.toThrow();
    });
  });

  describe('getCollection', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';

    it('should successfully get collection details', async () => {
      const mockResponse = {
        success: true,
        data: {
          transaction: {
            uuid: validUUID,
            status: 'successful'
          }
        }
      };

      mockMarzPay.request.mockResolvedValue(mockResponse);

      const result = await collectionsAPI.getCollection(validUUID);

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith(`/collect-money/${validUUID}`);
    });

    it('should throw error for missing UUID', async () => {
      await expect(collectionsAPI.getCollection())
        .rejects.toThrow(MarzPayError);
      await expect(collectionsAPI.getCollection())
        .rejects.toThrow('Collection UUID is required');
    });

    it('should throw error for invalid UUID format', async () => {
      mockMarzPay.utils.isValidUUID.mockReturnValue(false);

      await expect(collectionsAPI.getCollection('invalid-uuid'))
        .rejects.toThrow(MarzPayError);
      await expect(collectionsAPI.getCollection('invalid-uuid'))
        .rejects.toThrow('Invalid UUID format');
    });
  });

  describe('getCollectionServices', () => {
    it('should successfully get collection services', async () => {
      const mockResponse = {
        success: true,
        data: {
          summary: {
            total_countries: 1
          }
        }
      };

      mockMarzPay.request.mockResolvedValue(mockResponse);

      const result = await collectionsAPI.getCollectionServices();

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith('/collect-money/services');
    });
  });

  describe('getStatus', () => {
    it('should call getCollection method', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const mockResponse = { success: true };
      
      mockMarzPay.request.mockResolvedValue(mockResponse);

      await collectionsAPI.getStatus(uuid);

      expect(mockMarzPay.request).toHaveBeenCalledWith(`/collect-money/${uuid}`);
    });
  });

  describe('utility methods', () => {
    describe('isValidAmount', () => {
      it('should return true for valid amounts', () => {
        expect(collectionsAPI.isValidAmount(500)).toBe(true);
        expect(collectionsAPI.isValidAmount(5000)).toBe(true);
        expect(collectionsAPI.isValidAmount(10000000)).toBe(true);
      });

      it('should return false for invalid amounts', () => {
        expect(collectionsAPI.isValidAmount(100)).toBe(false);
        expect(collectionsAPI.isValidAmount(20000000)).toBe(false);
        expect(collectionsAPI.isValidAmount(0)).toBe(false);
        expect(collectionsAPI.isValidAmount(-1000)).toBe(false);
      });
    });

    describe('getLimits', () => {
      it('should return correct limits', () => {
        const limits = collectionsAPI.getLimits();
        
        expect(limits).toEqual({
          min: 500,
          max: 10000000,
          currency: 'UGX'
        });
      });
    });

    describe('generateReference', () => {
      it('should generate a valid UUID4', () => {
        const reference = collectionsAPI.generateReference();
        
        expect(mockMarzPay.utils.isValidUUID(reference)).toBe(true);
      });

      it('should generate unique references', () => {
        const ref1 = collectionsAPI.generateReference();
        const ref2 = collectionsAPI.generateReference();
        
        expect(ref1).not.toBe(ref2);
      });
    });

    describe('isValidReference', () => {
      it('should return true for valid UUID4', () => {
        mockMarzPay.utils.isValidUUID.mockReturnValue(true);
        
        expect(collectionsAPI.isValidReference('550e8400-e29b-41d4-a716-446655440000'))
          .toBe(true);
      });

      it('should return false for invalid reference', () => {
        mockMarzPay.utils.isValidUUID.mockReturnValue(false);
        
        expect(collectionsAPI.isValidReference('invalid-ref'))
          .toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle API request errors', async () => {
      const error = new Error('Network error');
      mockMarzPay.request.mockRejectedValue(error);

      await expect(collectionsAPI.collectMoney({
        amount: 5000,
        phoneNumber: '0759983853',
        reference: '550e8400-e29b-41d4-a716-446655440000'
      })).rejects.toThrow('Network error');
    });

    it('should handle validation errors before making API calls', async () => {
      const params = {
        amount: 100, // Invalid amount
        phoneNumber: '0759983853',
        reference: '550e8400-e29b-41d4-a716-446655440000'
      };

      await expect(collectionsAPI.collectMoney(params))
        .rejects.toThrow(MarzPayError);
      await expect(collectionsAPI.collectMoney(params))
        .rejects.toThrow('Amount must be between 500 and 10,000,000 UGX');

      // Should not make API call
      expect(mockMarzPay.request).not.toHaveBeenCalled();
    });
  });
});
