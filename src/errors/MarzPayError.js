/**
 * MarzPay Custom Error Class
 * 
 * Extends the standard Error class to provide additional context
 * for MarzPay-specific errors including error codes and HTTP status.
 * 
 * @extends Error
 * 
 * @example
 * ```javascript
 * try {
 *   await marzpay.collections.collectMoney(invalidParams);
 * } catch (error) {
 *   if (error instanceof MarzPayError) {
 *     console.log('Error Code:', error.code);
 *     console.log('HTTP Status:', error.status);
 *     console.log('Message:', error.message);
 *   }
 * }
 * ```
 */
export class MarzPayError extends Error {
  /**
   * Create a new MarzPayError
   * 
   * @param {string} message - Error message
   * @param {string} code - Error code for programmatic handling
   * @param {number} status - HTTP status code
   * @param {Object} [details] - Additional error details
   */
  constructor(message, code, status, details = {}) {
    super(message);
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MarzPayError.prototype);
    
    this.name = 'MarzPayError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MarzPayError);
    }
  }

  /**
   * Get error summary for logging
   * 
   * @returns {Object} Error summary object
   * 
   * @example
   * ```javascript
   * const error = new MarzPayError('Invalid amount', 'INVALID_AMOUNT', 400);
   * console.log(error.getSummary());
   * // Output: { name: 'MarzPayError', code: 'INVALID_AMOUNT', status: 400, message: 'Invalid amount' }
   * ```
   */
  getSummary() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      timestamp: this.timestamp
    };
  }

  /**
   * Check if error is a validation error
   * 
   * @returns {boolean} True if validation error
   * 
   * @example
   * ```javascript
   * if (error.isValidationError()) {
   *   // Handle validation errors
   * }
   * ```
   */
  isValidationError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error
   * 
   * @returns {boolean} True if server error
   * 
   * @example
   * ```javascript
   * if (error.isServerError()) {
   *   // Handle server errors
   * }
   * ```
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is a network error
   * 
   * @returns {boolean} True if network error
   * 
   * @example
   * ```javascript
   * if (error.isNetworkError()) {
   *   // Handle network errors
   * }
   * ```
   */
  isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }

  /**
   * Get user-friendly error message
   * 
   * @returns {string} User-friendly error message
   * 
   * @example
   * ```javascript
   * const userMessage = error.getUserMessage();
   * // Returns a message suitable for end users
   * ```
   */
  getUserMessage() {
    const userMessages = {
      'INVALID_AMOUNT': 'Please enter a valid amount between 500 and 10,000,000 UGX',
      'INVALID_PHONE': 'Please enter a valid phone number',
      'MISSING_UUID': 'Transaction reference is missing',
      'INVALID_UUID': 'Invalid transaction reference format',
      'INVALID_CREDENTIALS': 'Invalid API credentials. Please check your username and key',
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection',
      'ACCOUNT_FROZEN': 'Your account has been frozen. Please contact support',
      'INSUFFICIENT_BALANCE': 'Insufficient balance to complete this transaction',
      'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait before trying again'
    };

    return userMessages[this.code] || this.message;
  }

  /**
   * Convert error to JSON for serialization
   * 
   * @returns {Object} JSON representation of the error
   * 
   * @example
   * ```javascript
   * const errorJson = error.toJSON();
   * // Useful for logging or sending to error tracking services
   * ```
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Create error from API response
   * 
   * @param {Object} response - API response object
   * @param {number} status - HTTP status code
   * @returns {MarzPayError} New MarzPayError instance
   * 
   * @example
   * ```javascript
   * const error = MarzPayError.fromResponse(apiResponse, 400);
   * ```
   */
  static fromResponse(response, status) {
    const message = response.message || 'Request failed';
    const code = response.error_code || 'API_ERROR';
    
    return new MarzPayError(message, code, status, response);
  }

  /**
   * Create network error
   * 
   * @param {string} message - Error message
   * @returns {MarzPayError} New MarzPayError instance
   * 
   * @example
   * ```javascript
   * const error = MarzPayError.networkError('Failed to connect to server');
   * ```
   */
  static networkError(message) {
    return new MarzPayError(message, 'NETWORK_ERROR', 0);
  }

  /**
   * Create validation error
   * 
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @returns {MarzPayError} New MarzPayError instance
   * 
   * @example
   * ```javascript
   * const error = MarzPayError.validationError('Invalid phone number', 'INVALID_PHONE');
   * ```
   */
  static validationError(message, code) {
    return new MarzPayError(message, code, 400);
  }
}
