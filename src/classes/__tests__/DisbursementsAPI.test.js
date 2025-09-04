import { DisbursementsAPI } from '../DisbursementsAPI.js';
import { MarzPayError } from '../../errors/MarzPayError.js';

describe('DisbursementsAPI', () => {
  let disbursementsAPI;
  let mockMarzPay;

  beforeEach(() => {
    mockMarzPay = createMockMarzPay();
    disbursementsAPI = new DisbursementsAPI(mockMarzPay);
  });

  describe('constructor', () => {
    it('should create a DisbursementsAPI instance', () => {
      expect(disbursementsAPI).toBeInstanceOf(DisbursementsAPI);
      expect(disbursementsAPI.marzpay).toBe(mockMarzPay);
    });
  });

  describe('sendMoney', () => {
    const validParams = {
      amount: 5000,
      phoneNumber: '0759983853',
      reference: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Refund payment',
      callbackUrl: 'https://example.com/webhook',
      country: 'UG'
    };

    it('should successfully send money with valid parameters', async () => {
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

      const result = await disbursementsAPI.sendMoney(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith('/send-money', {
        method: 'POST',
        body: {
          amount: 5000,
          phone_number: '0759983853',
          reference: validParams.reference,
          description: 'Refund payment',
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

      await disbursementsAPI.sendMoney(params);

      expect(mockMarzPay.request).toHaveBeenCalledWith('/send-money', {
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

      await disbursementsAPI.sendMoney(validParams);

      expect(mockMarzPay.utils.formatPhoneNumber).toHaveBeenCalledWith('0759983853');
      expect(mockMarzPay.request).toHaveBeenCalledWith('/send-money', {
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

      await disbursementsAPI.sendMoney(params);

      expect(mockMarzPay.request).toHaveBeenCalledWith('/send-money', {
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

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Amount must be between 1,000 and 500,000 UGX');
    });

    it('should throw error for amount below minimum', () => {
      const params = { ...baseParams, amount: 500 };

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Amount must be between 1,000 and 500,000 UGX');
    });

    it('should throw error for amount above maximum', () => {
      const params = { ...baseParams, amount: 1000000 };

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Amount must be between 1,000 and 500,000 UGX');
    });

    it('should throw error for missing phone number', () => {
      const params = { ...baseParams };
      delete params.phoneNumber;

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Phone number is required');
    });

    it('should throw error for invalid phone number', () => {
      mockMarzPay.utils.isValidPhoneNumber.mockReturnValue(false);
      const params = { ...baseParams, phoneNumber: 'invalid' };

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Invalid phone number format');
    });

    it('should throw error for missing reference', () => {
      const params = { ...baseParams };
      delete params.reference;

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Reference is required');
    });

    it('should throw error for invalid UUID reference', () => {
      mockMarzPay.utils.isValidUUID.mockReturnValue(false);
      const params = { ...baseParams, reference: 'invalid-ref' };

      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow(MarzPayError);
      expect(() => disbursementsAPI.validateDisbursementParams(params))
        .toThrow('Reference must be a valid UUID4');
    });

    it('should pass validation with valid parameters', () => {
      expect(() => disbursementsAPI.validateDisbursementParams(baseParams))
        .not.toThrow();
    });
  });

  describe('getDisbursement', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';

    it('should successfully get disbursement details', async () => {
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

      const result = await disbursementsAPI.getDisbursement(validUUID);

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith(`/send-money/${validUUID}`);
    });

    it('should throw error for missing UUID', async () => {
      await expect(disbursementsAPI.getDisbursement())
        .rejects.toThrow(MarzPayError);
      await expect(disbursementsAPI.getDisbursement())
        .rejects.toThrow('Disbursement UUID is required');
    });

    it('should throw error for invalid UUID format', async () => {
      mockMarzPay.utils.isValidUUID.mockReturnValue(false);

      await expect(disbursementsAPI.getDisbursement('invalid-uuid'))
        .rejects.toThrow(MarzPayError);
      await expect(disbursementsAPI.getDisbursement('invalid-uuid'))
        .rejects.toThrow('Invalid UUID format');
    });
  });

  describe('getDisbursementServices', () => {
    it('should successfully get disbursement services', async () => {
      const mockResponse = {
        success: true,
        data: {
          summary: {
            total_providers: 3
          }
        }
      };

      mockMarzPay.request.mockResolvedValue(mockResponse);

      const result = await disbursementsAPI.getDisbursementServices();

      expect(result).toEqual(mockResponse);
      expect(mockMarzPay.request).toHaveBeenCalledWith('/send-money/services');
    });
  });

  describe('getStatus', () => {
    it('should call getDisbursement method', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const mockResponse = { success: true };
      
      mockMarzPay.request.mockResolvedValue(mockResponse);

      await disbursementsAPI.getStatus(uuid);

      expect(mockMarzPay.request).toHaveBeenCalledWith(`/send-money/${uuid}`);
    });
  });

  describe('utility methods', () => {
    describe('isValidAmount', () => {
      it('should return true for valid amounts', () => {
        expect(disbursementsAPI.isValidAmount(1000)).toBe(true);
        expect(disbursementsAPI.isValidAmount(5000)).toBe(true);
        expect(disbursementsAPI.isValidAmount(500000)).toBe(true);
      });

      it('should return false for invalid amounts', () => {
        expect(disbursementsAPI.isValidAmount(500)).toBe(false);
        expect(disbursementsAPI.isValidAmount(1000000)).toBe(false);
        expect(disbursementsAPI.isValidAmount(0)).toBe(false);
        expect(disbursementsAPI.isValidAmount(-1000)).toBe(false);
      });
    });

    describe('getLimits', () => {
      it('should return correct limits', () => {
        const limits = disbursementsAPI.getLimits();
        
        expect(limits).toEqual({
          min: 1000,
          max: 500000,
          currency: 'UGX'
        });
      });
    });

    describe('calculateFees', () => {
      it('should calculate fees correctly', () => {
        const fees = disbursementsAPI.calculateFees(10000);
        
        expect(fees).toEqual({
          amount: 10000,
          fee: 500,
          feePercentage: 5,
          total: 10500,
          currency: 'UGX'
        });
      });

      it('should throw error for invalid amount', () => {
        expect(() => disbursementsAPI.calculateFees(500))
          .toThrow(MarzPayError);
        expect(() => disbursementsAPI.calculateFees(500))
          .toThrow('Invalid amount for fee calculation');
      });
    });

    describe('getHistory', () => {
      it('should get disbursement history with default parameters', async () => {
        const mockResponse = { success: true, data: [] };
        mockMarzPay.request.mockResolvedValue(mockResponse);
        mockMarzPay.utils.buildQueryString.mockReturnValue('type=withdrawal');

        await disbursementsAPI.getHistory();

        expect(mockMarzPay.utils.buildQueryString).toHaveBeenCalledWith({
          type: 'withdrawal'
        });
        expect(mockMarzPay.request).toHaveBeenCalledWith('/transactions?type=withdrawal');
      });

      it('should get disbursement history with custom parameters', async () => {
        const params = { page: 2, per_page: 50, status: 'successful' };
        const mockResponse = { success: true, data: [] };
        mockMarzPay.request.mockResolvedValue(mockResponse);
        mockMarzPay.utils.buildQueryString.mockReturnValue('type=withdrawal&page=2&per_page=50&status=successful');

        await disbursementsAPI.getHistory(params);

        expect(mockMarzPay.utils.buildQueryString).toHaveBeenCalledWith({
          type: 'withdrawal',
          ...params
        });
      });
    });

    describe('generateReference', () => {
      it('should generate a valid UUID4', () => {
        const reference = disbursementsAPI.generateReference();
        
        expect(mockMarzPay.utils.isValidUUID(reference)).toBe(true);
      });

      it('should generate unique references', () => {
        const ref1 = disbursementsAPI.generateReference();
        const ref2 = disbursementsAPI.generateReference();
        
        expect(ref1).not.toBe(ref2);
      });
    });

    describe('isValidReference', () => {
      it('should return true for valid UUID4', () => {
        mockMarzPay.utils.isValidUUID.mockReturnValue(true);
        
        expect(disbursementsAPI.isValidReference('550e8400-e29b-41d4-a716-446655440000'))
          .toBe(true);
      });

      it('should return false for invalid reference', () => {
        mockMarzPay.utils.isValidUUID.mockReturnValue(false);
        
        expect(disbursementsAPI.isValidReference('invalid-ref'))
          .toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle API request errors', async () => {
      const error = new Error('Network error');
      mockMarzPay.request.mockRejectedValue(error);

      await expect(disbursementsAPI.sendMoney({
        amount: 5000,
        phoneNumber: '0759983853',
        reference: '550e8400-e29b-41d4-a716-446655440000'
      })).rejects.toThrow('Network error');
    });

    it('should handle validation errors before making API calls', async () => {
      const params = {
        amount: 500, // Invalid amount
        phoneNumber: '0759983853',
        reference: '550e8400-e29b-41d4-a716-446655440000'
      };

      await expect(disbursementsAPI.sendMoney(params))
        .rejects.toThrow(MarzPayError);
      await expect(disbursementsAPI.sendMoney(params))
        .rejects.toThrow('Amount must be between 1,000 and 500,000 UGX');

      // Should not make API call
      expect(mockMarzPay.request).not.toHaveBeenCalled();
    });
  });
});
