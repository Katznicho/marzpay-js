import { v4 as uuidv4 } from 'uuid';
import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Disbursements API - Money sending to customers via mobile money
 * 
 * This class handles all disbursement-related operations including:
 * - Sending money to customers
 * - Retrieving disbursement details
 * - Getting available disbursement services
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Send money to customer
 * const result = await marzpay.disbursements.sendMoney({
 *   amount: 5000,
 *   phoneNumber: '0759983853',
 *   reference: '550e8400-e29b-41d4-a716-446655440000',
 *   description: 'Refund payment'
 * });
 * ```
 */
export class DisbursementsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Send money to a customer via mobile money
   * 
   * @param {Object} params - Disbursement parameters
   * @param {number} params.amount - Amount in UGX (1,000-500,000)
   * @param {string} params.phoneNumber - Customer's phone number
   * @param {string} params.reference - Unique UUID4 reference for the transaction
   * @param {string|null} [params.description] - Payment description
   * @param {string|null} [params.callbackUrl] - Custom webhook URL
   * @param {string} [params.country='UG'] - Country code
   * 
   * @returns {Promise<Object>} Disbursement result with transaction details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const result = await marzpay.disbursements.sendMoney({
   *     amount: 10000,
   *     phoneNumber: '0759983853',
   *     reference: '550e8400-e29b-41d4-a716-446655440000',
   *     description: 'Refund payment',
   *     callbackUrl: 'https://yoursite.com/webhook'
   *   });
   *   
   *   console.log('Money sent:', result.data.transaction.reference);
   * } catch (error) {
   *   console.error('Disbursement failed:', error.message);
   * }
   * ```
   */
  async sendMoney(params) {
    const {
      amount,
      phoneNumber,
      reference,
      description = null,
      callbackUrl = null,
      country = 'UG'
    } = params;

    // Validate inputs
    this.validateDisbursementParams(params);

    // Format phone number
    const formattedPhone = this.marzpay.phoneUtils.formatPhoneNumber(phoneNumber);

    const body = {
      amount: parseInt(amount),
      phone_number: formattedPhone,
      reference: reference,
      description,
      callback_url: callbackUrl,
      country
    };

    return this.marzpay.request('/send-money', {
      method: 'POST',
      body
    });
  }

  /**
   * Get disbursement details by UUID
   * 
   * @param {string} uuid - Disbursement transaction UUID
   * @returns {Promise<Object>} Disbursement details
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * const disbursement = await marzpay.disbursements.getDisbursement('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Disbursement status:', disbursement.data.transaction.status);
   * ```
   */
  async getDisbursement(uuid) {
    if (!uuid) {
      throw new MarzPayError('Disbursement UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/send-money/${uuid}`);
  }

  /**
   * Get available disbursement services for the business
   * 
   * @returns {Promise<Object>} Available disbursement services
   * 
   * @example
   * ```javascript
   * const services = await marzpay.disbursements.getDisbursementServices();
   * console.log('Available providers:', services.data.summary.total_providers);
   * ```
   */
  async getDisbursementServices() {
    return this.marzpay.request('/send-money/services');
  }

  /**
   * Validate disbursement parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateDisbursementParams(params) {
    const { amount, phoneNumber, reference } = params;

    if (!amount || amount < 1000 || amount > 500000) {
      throw new MarzPayError(
        'Amount must be between 1,000 and 500,000 UGX',
        'INVALID_AMOUNT',
        400
      );
    }

    if (!phoneNumber) {
      throw new MarzPayError('Phone number is required', 'MISSING_PHONE', 400);
    }

    if (!this.marzpay.phoneUtils.isValidPhoneNumber(phoneNumber)) {
      throw new MarzPayError('Invalid phone number format', 'INVALID_PHONE', 400);
    }

    if (!reference) {
      throw new MarzPayError('Reference is required', 'MISSING_REFERENCE', 400);
    }

    if (!this.marzpay.utils.isValidUUID(reference)) {
      throw new MarzPayError('Reference must be a valid UUID4', 'INVALID_REFERENCE', 400);
    }
  }

  /**
   * Get disbursement status summary
   * 
   * @param {string} uuid - Disbursement UUID
   * @returns {Promise<Object>} Disbursement status
   * 
   * @example
   * ```javascript
   * const status = await marzpay.disbursements.getStatus('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Status:', status.data.transaction.status);
   * ```
   */
  async getStatus(uuid) {
    return this.getDisbursement(uuid);
  }

  /**
   * Check if disbursement amount is within limits
   * 
   * @param {number} amount - Amount to check
   * @returns {boolean} True if amount is valid
   * 
   * @example
   * ```javascript
   * const isValid = marzpay.disbursements.isValidAmount(5000); // true
   * const isInvalid = marzpay.disbursements.isValidAmount(500); // false
   * ```
   */
  isValidAmount(amount) {
    return amount >= 1000 && amount <= 500000;
  }

  /**
   * Get disbursement limits
   * 
   * @returns {Object} Disbursement amount limits
   * 
   * @example
   * ```javascript
   * const limits = marzpay.disbursements.getLimits();
   * console.log('Min:', limits.min, 'Max:', limits.max);
   * ```
   */
  getLimits() {
    return {
      min: 1000,
      max: 500000,
      currency: 'UGX'
    };
  }

  /**
   * Calculate disbursement fees
   * 
   * @param {number} amount - Amount to calculate fees for
   * @returns {Object} Fee calculation
   * 
   * @example
   * ```javascript
   * const fees = marzpay.disbursements.calculateFees(10000);
   * console.log('Fee:', fees.fee, 'Total:', fees.total);
   * ```
   */
  calculateFees(amount) {
    if (!this.isValidAmount(amount)) {
      throw new MarzPayError('Invalid amount for fee calculation', 'INVALID_AMOUNT', 400);
    }

    // Example fee structure (adjust based on actual MarzPay fees)
    const feePercentage = 0.05; // 5%
    const fee = Math.round(amount * feePercentage);
    const total = amount + fee;

    return {
      amount,
      fee,
      feePercentage: feePercentage * 100,
      total,
      currency: 'UGX'
    };
  }

  /**
   * Get disbursement history
   * 
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Disbursement history
   * 
   * @example
   * ```javascript
   * const history = await marzpay.disbursements.getHistory({
   *   page: 1,
   *   per_page: 20,
   *   status: 'successful'
   * });
   * ```
   */
  async getHistory(params = {}) {
    const queryString = this.marzpay.utils.buildQueryString({
      type: 'withdrawal',
      ...params
    });

    return this.marzpay.request(`/transactions?${queryString}`);
  }

  /**
   * Generate a UUID4 reference for disbursements
   * 
   * @returns {string} Generated UUID4 reference
   * 
   * @example
   * ```javascript
   * const reference = marzpay.disbursements.generateReference();
   * // Returns: '550e8400-e29b-41d4-a716-446655440000'
   * 
   * const result = await marzpay.disbursements.sendMoney({
   *   amount: 10000,
   *   phoneNumber: '0759983853',
   *   reference: reference,
   *   description: 'Refund payment'
   * });
   * ```
   */
  generateReference() {
    return uuidv4();
  }

  /**
   * Validate reference is a valid UUID4
   * 
   * @param {string} reference - Reference to validate
   * @returns {boolean} True if reference is a valid UUID4
   * 
   * @example
   * ```javascript
   * const isValid = marzpay.disbursements.isValidReference('550e8400-e29b-41d4-a716-446655440000'); // true
   * const isInvalid = marzpay.disbursements.isValidReference('invalid-ref'); // false
   * ```
   */
  isValidReference(reference) {
    return this.marzpay.utils.isValidUUID(reference);
  }
}
