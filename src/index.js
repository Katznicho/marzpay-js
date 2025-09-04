import { v4 as uuidv4 } from 'uuid';

// Core MarzPay class
class MarzPay {
  constructor(config = {}) {
    this.config = {
      apiUser: config.apiUser || '',
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || 'https://wallet.wearemarz.com/api/v1',
      timeout: config.timeout || 30000,
      ...config
    };
    
    this.collections = new CollectionsAPI(this);
    this.disbursements = new DisbursementsAPI(this);
    this.accounts = new AccountsAPI(this);
    this.transactions = new TransactionsAPI(this);
    this.webhooks = new WebhooksAPI(this);
    this.services = new ServicesAPI(this);
    this.balance = new BalanceAPI(this);
    this.utils = new Utils();
  }

  // Set API credentials
  setCredentials(apiUser, apiKey) {
    this.config.apiUser = apiUser;
    this.config.apiKey = apiKey;
  }

  // Get authentication header
  getAuthHeader() {
    const credentials = `${this.config.apiUser}:${this.config.apiKey}`;
    return `Basic ${btoa(credentials)}`;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.getAuthHeader(),
      ...options.headers
    };

    const config = {
      method: options.method || 'GET',
      headers,
      timeout: this.config.timeout,
      ...options
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new MarzPayError(data.message || 'Request failed', data.error_code || 'REQUEST_FAILED', response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof MarzPayError) {
        throw error;
      }
      throw new MarzPayError(error.message, 'NETWORK_ERROR', 0);
    }
  }
}

// Collections API - Money collection from customers
class CollectionsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Collect money from customer
  async collectMoney(params) {
    const {
      amount,
      phoneNumber,
      description = null,
      callbackUrl = null,
      country = 'UG'
    } = params;

    // Validate inputs
    this.validateCollectionParams(params);

    // Format phone number
    const formattedPhone = this.marzpay.utils.formatPhoneNumber(phoneNumber);

    const body = {
      amount: parseInt(amount),
      phone_number: formattedPhone,
      reference: uuidv4(),
      description,
      callback_url: callbackUrl,
      country
    };

    return this.marzpay.request('/collect-money', {
      method: 'POST',
      body
    });
  }

  // Get collection by UUID
  async getCollection(uuid) {
    if (!uuid) {
      throw new MarzPayError('Collection UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/collect-money/${uuid}`);
  }

  // Get collection services
  async getCollectionServices() {
    return this.marzpay.request('/collect-money/services');
  }

  // Validate collection parameters
  validateCollectionParams(params) {
    const { amount, phoneNumber } = params;

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

    if (!this.marzpay.utils.isValidPhoneNumber(phoneNumber)) {
      throw new MarzPayError('Invalid phone number format', 'INVALID_PHONE', 400);
    }
  }
}

// Disbursements API - Send money to customers
class DisbursementsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Send money to customer
  async sendMoney(params) {
    const {
      amount,
      phoneNumber,
      description = null,
      callbackUrl = null,
      country = 'UG'
    } = params;

    // Validate inputs
    this.validateDisbursementParams(params);

    // Format phone number
    const formattedPhone = this.marzpay.utils.formatPhoneNumber(phoneNumber);

    const body = {
      amount: parseInt(amount),
      phone_number: formattedPhone,
      reference: uuidv4(),
      description,
      callback_url: callbackUrl,
      country
    };

    return this.marzpay.request('/send-money', {
      method: 'POST',
      body
    });
  }

  // Get disbursement by UUID
  async getDisbursement(uuid) {
    if (!uuid) {
      throw new MarzPayError('Disbursement UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/send-money/${uuid}`);
  }

  // Get disbursement services
  async getDisbursementServices() {
    return this.marzpay.request('/send-money/services');
  }

  // Validate disbursement parameters
  validateDisbursementParams(params) {
    const { amount, phoneNumber } = params;

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

    if (!this.marzpay.utils.isValidPhoneNumber(phoneNumber)) {
      throw new MarzPayError('Invalid phone number format', 'INVALID_PHONE', 400);
    }
  }
}

// Accounts API - Account management and balance
class AccountsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Get account information
  async getAccountInfo() {
    return this.marzpay.request('/account');
  }

  // Update account information
  async updateAccount(settings) {
    return this.marzpay.request('/account', {
      method: 'PUT',
      body: settings
    });
  }
}

// Balance API - Balance management
class BalanceAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Get account balance
  async getBalance() {
    return this.marzpay.request('/balance');
  }

  // Get balance history
  async getBalanceHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.marzpay.request(`/balance/history?${queryParams}`);
  }
}

// Transactions API - Transaction management
class TransactionsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Get all transactions
  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.marzpay.request(`/transactions?${queryParams}`);
  }

  // Get transaction by UUID
  async getTransaction(uuid) {
    if (!uuid) {
      throw new MarzPayError('Transaction UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/transactions/${uuid}`);
  }
}

// Services API - Service management
class ServicesAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Get all services
  async getServices(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.marzpay.request(`/services?${queryParams}`);
  }

  // Get service by UUID
  async getService(uuid) {
    if (!uuid) {
      throw new MarzPayError('Service UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/services/${uuid}`);
  }
}

// Webhooks API - Webhook management
class WebhooksAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  // Get all webhooks
  async getWebhooks(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.marzpay.request(`/webhooks?${queryParams}`);
  }

  // Create webhook
  async createWebhook(params) {
    const { name, url, eventType, environment, isActive = true } = params;

    if (!name || !url || !eventType || !environment) {
      throw new MarzPayError('Name, URL, event type, and environment are required', 'MISSING_REQUIRED_FIELDS', 400);
    }

    return this.marzpay.request('/webhooks', {
      method: 'POST',
      body: { name, url, event_type: eventType, environment, is_active: isActive }
    });
  }

  // Get webhook by UUID
  async getWebhook(uuid) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`);
  }

  // Update webhook
  async updateWebhook(uuid, params) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`, {
      method: 'PUT',
      body: params
    });
  }

  // Delete webhook
  async deleteWebhook(uuid) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`, {
      method: 'DELETE'
    });
  }
}

// Utilities class
class Utils {
  // Format phone number to +256XXXXXXXXX format
  formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Local format: 0759983853 -> +256759983853
      cleaned = '256' + cleaned.substring(1);
    } else if (cleaned.startsWith('256')) {
      // Already in correct format
      cleaned = cleaned;
    } else if (cleaned.length === 9) {
      // 9 digits: 759983853 -> +256759983853
      cleaned = '256' + cleaned;
    }

    // Add + prefix
    return `+${cleaned}`;
  }

  // Validate phone number format
  isValidPhoneNumber(phone) {
    if (!phone) return false;

    const formatted = this.formatPhoneNumber(phone);
    if (!formatted) return false;

    // Check if it matches +256XXXXXXXXX format
    const phoneRegex = /^\+256[0-9]{9}$/;
    return phoneRegex.test(formatted);
  }

  // Validate amount
  isValidAmount(amount, min = 100, max = 10000000) {
    const numAmount = parseInt(amount);
    return !isNaN(numAmount) && numAmount >= min && numAmount <= max;
  }

  // Generate reference
  generateReference() {
    return uuidv4();
  }

  // Format amount to UGX
  formatAmount(amount) {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  }

  // Parse amount from UGX string
  parseAmount(amountString) {
    return parseInt(amountString.replace(/[^\d]/g, ''));
  }

  // Build query string from parameters
  buildQueryString(params) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString();
  }

  // Validate UUID format
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Sanitize input string
  sanitizeString(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }
}

// Custom error class
class MarzPayError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'MarzPayError';
    this.code = code;
    this.status = status;
  }
}

// Export the library
export default MarzPay;
export { MarzPay, MarzPayError };
