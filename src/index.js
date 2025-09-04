import { CollectionsAPI } from './classes/CollectionsAPI.js';
import { DisbursementsAPI } from './classes/DisbursementsAPI.js';
import { AccountsAPI } from './classes/AccountsAPI.js';
import { BalanceAPI } from './classes/BalanceAPI.js';
import { TransactionsAPI } from './classes/TransactionsAPI.js';
import { ServicesAPI } from './classes/ServicesAPI.js';
import { WebhooksAPI } from './classes/WebhooksAPI.js';
import { PhoneNumberUtils } from './utils/PhoneNumberUtils.js';
import { GeneralUtils } from './utils/GeneralUtils.js';
import { MarzPayError } from './errors/MarzPayError.js';

/**
 * MarzPay JavaScript SDK
 * 
 * Official JavaScript SDK for MarzPay - Mobile Money Payment Platform for Uganda
 * 
 * @example
 * ```javascript
 * import MarzPay from 'marzpay-js';
 * 
 * const marzpay = new MarzPay({
 *   apiUser: 'your_username',
 *   apiKey: 'your_api_key'
 * });
 * 
 * // Collect money from customer
 * const result = await marzpay.collections.collectMoney({
 *   amount: 5000,
 *   phoneNumber: '0759983853',
 *   description: 'Payment for services'
 * });
 * ```
 */
export class MarzPay {
  /**
   * Create a new MarzPay instance
   * 
   * @param {Object} config - Configuration object
   * @param {string} config.apiUser - Your MarzPay API username
   * @param {string} config.apiKey - Your MarzPay API key
   * @param {string} [config.baseUrl='https://wallet.wearemarz.com/api/v1'] - API base URL
   * @param {number} [config.timeout=30000] - Request timeout in milliseconds
   */
  constructor(config) {
    if (!config.apiUser || !config.apiKey) {
      throw new MarzPayError('API credentials are required', 'MISSING_CREDENTIALS', 400);
    }

    this.config = {
      baseUrl: 'https://wallet.wearemarz.com/api/v1',
      timeout: 30000,
      ...config
    };

    // Initialize API modules
    this.collections = new CollectionsAPI(this);
    this.disbursements = new DisbursementsAPI(this);
    this.accounts = new AccountsAPI(this);
    this.balance = new BalanceAPI(this);
    this.transactions = new TransactionsAPI(this);
    this.services = new ServicesAPI(this);
    this.webhooks = new WebhooksAPI(this);

    // Initialize utility modules
    this.phoneUtils = new PhoneNumberUtils();
    this.utils = new GeneralUtils();

    // Bind methods to maintain context
    this.request = this.request.bind(this);
    this.setCredentials = this.setCredentials.bind(this);
    this.getAuthHeader = this.getAuthHeader.bind(this);
  }

  /**
   * Make HTTP request to MarzPay API
   * 
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Request options
   * @param {string} [options.method='GET'] - HTTP method
   * @param {Object} [options.body] - Request body
   * @param {Object} [options.headers] - Additional headers
   * 
   * @returns {Promise<Object>} API response
   * 
   * @throws {MarzPayError} When request fails
   * 
   * @private
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {}
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
        ...headers
      },
      timeout: this.config.timeout
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        throw MarzPayError.fromResponse(responseData, response.status);
      }

      return responseData;
    } catch (error) {
      if (error instanceof MarzPayError) {
        throw error;
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw MarzPayError.networkError('Network request failed');
      }

      throw new MarzPayError(
        error.message || 'Request failed',
        'REQUEST_FAILED',
        error.status || 0
      );
    }
  }

  /**
   * Update API credentials at runtime
   * 
   * @param {string} apiUser - New API username
   * @param {string} apiKey - New API key
   */
  setCredentials(apiUser, apiKey) {
    if (!apiUser || !apiKey) {
      throw new MarzPayError('Both API username and key are required', 'MISSING_CREDENTIALS', 400);
    }

    this.config.apiUser = apiUser;
    this.config.apiKey = apiKey;
  }

  /**
   * Get the current authentication header
   * 
   * @returns {string} Base64 encoded authorization header
   */
  getAuthHeader() {
    const credentials = `${this.config.apiUser}:${this.config.apiKey}`;
    return `Basic ${btoa(credentials)}`;
  }

  /**
   * Get SDK version and information
   * 
   * @returns {Object} SDK information
   */
  getInfo() {
    return {
      name: 'MarzPay JavaScript SDK',
      version: '1.0.0',
      description: 'Official JavaScript SDK for MarzPay - Mobile Money Payment Platform for Uganda',
      baseUrl: this.config.baseUrl,
      features: [
        'Collections API',
        'Disbursements API',
        'Accounts API',
        'Balance API',
        'Transactions API',
        'Services API',
        'Webhooks API',
        'Phone Number Utilities',
        'General Utilities',
        'Error Handling'
      ]
    };
  }

  /**
   * Test API connection
   * 
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.request('/account');
      return {
        status: 'success',
        message: 'API connection successful',
        data: {
          account_status: response.data?.account?.status?.account_status || 'unknown',
          business_name: response.data?.account?.business_name || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'API connection failed',
        error: error.message,
        code: error.code
      };
    }
  }
}

// Export the main class
export default MarzPay;

// Export all classes for individual use
export {
  CollectionsAPI,
  DisbursementsAPI,
  AccountsAPI,
  BalanceAPI,
  TransactionsAPI,
  ServicesAPI,
  WebhooksAPI,
  PhoneNumberUtils,
  GeneralUtils,
  MarzPayError
};
