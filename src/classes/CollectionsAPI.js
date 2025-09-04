import { v4 as uuidv4 } from 'uuid';
import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Collections API - Money collection from customers via mobile money
 * 
 * This class handles all collection-related operations including:
 * - Initiating money collections
 * - Retrieving collection details
 * - Getting available collection services
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Collect money from customer
 * const result = await marzpay.collections.collectMoney({
 *   amount: 5000,
 *   phoneNumber: '0759983853',
 *   reference: '550e8400-e29b-41d4-a716-446655440000',
 *   description: 'Payment for services'
 * });
 * ```
 */
export class CollectionsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Collect money from a customer via mobile money
   * 
   * @param {Object} params - Collection parameters
   * @param {number} params.amount - Amount in UGX (500-10,000,000)
   * @param {string} params.phoneNumber - Customer's phone number
   * @param {string} params.reference - Unique UUID4 reference for the transaction
   * @param {string|null} [params.description] - Payment description
   * @param {string|null} [params.callbackUrl] - Custom webhook URL
   * @param {string} [params.country='UG'] - Country code
   * 
   * @returns {Promise<Object>} Collection result with transaction details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const result = await marzpay.collections.collectMoney({
   *     amount: 10000,
   *     phoneNumber: '0759983853',
   *     reference: '550e8400-e29b-41d4-a716-446655440000',
   *     description: 'Product purchase',
   *     callbackUrl: 'https://yoursite.com/webhook'
   *   });
   *   
   *   console.log('Collection initiated:', result.data.transaction.reference);
   * } catch (error) {
   *   console.error('Collection failed:', error.message);
   * }
   * ```
   */
  async collectMoney(params) {
    const {
      amount,
      phoneNumber,
      reference,
      description = null,
      callbackUrl = null,
      country = 'UG'
    } = params;

    // Validate inputs
    this.validateCollectionParams(params);

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

    return this.marzpay.request('/collect-money', {
      method: 'POST',
      body
    });
  }

  /**
   * Get collection details by UUID
   * 
   * @param {string} uuid - Collection transaction UUID
   * @returns {Promise<Object>} Collection details
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * const collection = await marzpay.collections.getCollection('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Collection status:', collection.data.transaction.status);
   * ```
   */
  async getCollection(uuid) {
    if (!uuid) {
      throw new MarzPayError('Collection UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/collect-money/${uuid}`);
  }

  /**
   * Get available collection services for the business
   * 
   * @returns {Promise<Object>} Available collection services
   * 
   * @example
   * ```javascript
   * const services = await marzpay.collections.getCollectionServices();
   * console.log('Available countries:', services.data.summary.total_countries);
   * ```
   */
  async getCollectionServices() {
    return this.marzpay.request('/collect-money/services');
  }

  /**
   * Validate collection parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateCollectionParams(params) {
    const { amount, phoneNumber, reference } = params;

    if (!amount || amount < 500 || amount > 10000000) {
      throw new MarzPayError(
        'Amount must be between 500 and 10,000,000 UGX',
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
   * Get collection status summary
   * 
   * @param {string} uuid - Collection UUID
   * @returns {Promise<Object>} Collection status
   * 
   * @example
   * ```javascript
   * const status = await marzpay.collections.getStatus('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Status:', status.data.transaction.status);
   * ```
   */
  async getStatus(uuid) {
    return this.getCollection(uuid);
  }

  /**
   * Check if collection amount is within limits
   * 
   * @param {number} amount - Amount to check
   * @returns {boolean} True if amount is valid
   * 
   * @example
   * ```javascript
   * const isValid = marzpay.collections.isValidAmount(5000); // true
   * const isInvalid = marzpay.collections.isValidAmount(100); // false
   * ```
   */
  isValidAmount(amount) {
    return amount >= 500 && amount <= 10000000;
  }

  /**
   * Get collection limits
   * 
   * @returns {Object} Collection amount limits
   * 
   * @example
   * ```javascript
   * const limits = marzpay.collections.getLimits();
   * console.log('Min:', limits.min, 'Max:', limits.max);
   * ```
   */
  getLimits() {
    return {
      min: 500,
      max: 10000000,
      currency: 'UGX'
    };
  }

  /**
   * Generate a UUID4 reference for collections
   * 
   * @returns {string} Generated UUID4 reference
   * 
   * @example
   * ```javascript
   * const reference = marzpay.collections.generateReference();
   * // Returns: '550e8400-e29b-41d4-a716-446655440000'
   * 
   * const result = await marzpay.collections.collectMoney({
   *   amount: 10000,
   *   phoneNumber: '0759983853',
   *   reference: reference,
   *   description: 'Product purchase'
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
   * const isValid = marzpay.collections.isValidReference('550e8400-e29b-41d4-a716-446655440000'); // true
   * const isInvalid = marzpay.collections.isValidReference('invalid-ref'); // false
   * ```
   */
  isValidReference(reference) {
    return this.marzpay.utils.isValidUUID(reference);
  }
}
