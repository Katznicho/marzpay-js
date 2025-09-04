import { v4 as uuidv4 } from 'uuid';

/**
 * General Utilities - Helper methods for common operations
 * 
 * This class provides utility methods for:
 * - Amount formatting and parsing
 * - UUID generation and validation
 * - String sanitization and validation
 * - Query string building
 * - Data validation helpers
 * 
 * @example
 * ```javascript
 * const utils = new GeneralUtils();
 * 
 * // Format amount
 * const formatted = utils.formatAmount(5000);
 * // Returns: 'UGX 5,000.00'
 * 
 * // Generate UUID
 * const uuid = utils.generateReference();
 * // Returns: '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export class GeneralUtils {
  constructor() {
    // Default currency configuration
    this.currency = {
      code: 'UGX',
      symbol: 'UGX',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    };
  }

  /**
   * Format amount to currency string
   * 
   * @param {number} amount - Amount to format
   * @param {Object} options - Formatting options
   * @param {string} [options.currency='UGX'] - Currency code
   * @param {number} [options.decimalPlaces=2] - Number of decimal places
   * @param {string} [options.thousandsSeparator=','] - Thousands separator
   * @param {string} [options.decimalSeparator='.'] - Decimal separator
   * 
   * @returns {string} Formatted currency string
   * 
   * @example
   * ```javascript
   * utils.formatAmount(5000);                    // Returns: 'UGX 5,000.00'
   * utils.formatAmount(1234567.89);             // Returns: 'UGX 1,234,567.89'
   * utils.formatAmount(100, { currency: 'USD' }); // Returns: 'USD 100.00'
   * ```
   */
  formatAmount(amount, options = {}) {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a valid number');
    }

    const config = { ...this.currency, ...options };
    
    // Format number with separators
    const formattedNumber = amount.toLocaleString('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces
    });

    return `${config.symbol} ${formattedNumber}`;
  }

  /**
   * Parse amount from currency string
   * 
   * @param {string} amountString - Amount string to parse
   * @param {Object} options - Parsing options
   * @param {string} [options.currency='UGX'] - Expected currency code
   * @param {string} [options.thousandsSeparator=','] - Thousands separator
   * @param {string} [options.decimalSeparator='.'] - Decimal separator
   * 
   * @returns {number} Parsed amount
   * 
   * @example
   * ```javascript
   * utils.parseAmount('UGX 5,000.00');          // Returns: 5000
   * utils.parseAmount('1,234,567.89');          // Returns: 1234567.89
   * utils.parseAmount('$100.50', { currency: 'USD' }); // Returns: 100.50
   * ```
   */
  parseAmount(amountString, options = {}) {
    if (!amountString || typeof amountString !== 'string') {
      throw new Error('Amount string is required and must be a string');
    }

    const config = { ...this.currency, ...options };
    
    // Remove currency symbol and extra spaces
    let cleaned = amountString.replace(new RegExp(`\\s*${config.symbol}\\s*`, 'gi'), '');
    
    // Remove thousands separators
    cleaned = cleaned.replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '');
    
    // Convert decimal separator to standard format
    if (config.decimalSeparator !== '.') {
      cleaned = cleaned.replace(new RegExp(`\\${config.decimalSeparator}`, 'g'), '.');
    }

    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      throw new Error('Invalid amount format');
    }

    return parsed;
  }

  /**
   * Generate a unique UUID reference
   * 
   * @returns {string} Generated UUID
   * 
   * @example
   * ```javascript
   * const reference = utils.generateReference();
   * // Returns: '550e8400-e29b-41d4-a716-446655440000'
   * ```
   */
  generateReference() {
    return uuidv4();
  }

  /**
   * Validate UUID format
   * 
   * @param {string} uuid - UUID to validate
   * @returns {boolean} True if UUID is valid
   * 
   * @example
   * ```javascript
   * utils.isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // Returns: true
   * utils.isValidUUID('invalid-uuid');                          // Returns: false
   * ```
   */
  isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Build query string from parameters object
   * 
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   * 
   * @example
   * ```javascript
   * const queryString = utils.buildQueryString({
   *   page: 1,
   *   per_page: 20,
   *   status: 'active'
   * });
   * // Returns: 'page=1&per_page=20&status=active'
   * ```
   */
  buildQueryString(params) {
    if (!params || typeof params !== 'object') {
      return '';
    }

    const queryParams = [];

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          // Handle array parameters
          value.forEach(item => {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
          });
        } else {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
    }

    return queryParams.join('&');
  }

  /**
   * Sanitize input string to prevent XSS
   * 
   * @param {any} input - Input to sanitize
   * @returns {any} Sanitized input
   * 
   * @example
   * ```javascript
   * utils.sanitizeString('<script>alert("xss")</script>'); // Returns: 'scriptalert("xss")/script'
   * utils.sanitizeString('Hello World');                   // Returns: 'Hello World'
   * ```
   */
  sanitizeString(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove HTML tags and potentially dangerous characters
    return input
      .replace(/<[^>]*>/g, '')           // Remove HTML tags
      .replace(/[<>]/g, '')              // Remove remaining < and >
      .replace(/javascript:/gi, '')      // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '')       // Remove event handlers
      .trim();
  }

  /**
   * Validate amount within specified range
   * 
   * @param {number} amount - Amount to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} True if amount is valid
   * 
   * @example
   * ```javascript
   * utils.isValidAmount(5000, 1000, 10000);    // Returns: true
   * utils.isValidAmount(500, 1000, 10000);     // Returns: false
   * utils.isValidAmount(15000, 1000, 10000);   // Returns: false
   * ```
   */
  isValidAmount(amount, min = 100, max = 10000000) {
    if (!Number.isFinite(amount)) {
      return false;
    }

    return amount >= min && amount <= max;
  }

  /**
   * Format date to ISO string
   * 
   * @param {Date|string|number} date - Date to format
   * @returns {string} ISO date string (YYYY-MM-DD)
   * 
   * @example
   * ```javascript
   * utils.formatDate(new Date());           // Returns: '2024-01-15'
   * utils.formatDate('2024-01-15T10:30:00'); // Returns: '2024-01-15'
   * utils.formatDate(1705312200000);       // Returns: '2024-01-15'
   * ```
   */
  formatDate(date) {
    if (!date) {
      throw new Error('Date is required');
    }

    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    return dateObj.toISOString().split('T')[0];
  }

  /**
   * Check if date string is valid
   * 
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if date is valid
   * 
   * @example
   * ```javascript
   * utils.isValidDate('2024-01-15');    // Returns: true
   * utils.isValidDate('2024-13-45');    // Returns: false
   * utils.isValidDate('invalid-date');  // Returns: false
   * ```
   */
  isValidDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Get date range for specified period
   * 
   * @param {string} period - Period type ('today', 'yesterday', 'week', 'month', 'year')
   * @returns {Object} Object with start and end dates
   * 
   * @example
   * ```javascript
   * const range = utils.getDateRange('week');
   * console.log('Start:', range.start); // Returns: '2024-01-08'
   * console.log('End:', range.end);     // Returns: '2024-01-14'
   * ```
   */
  getDateRange(period) {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period.toLowerCase()) {
      case 'today':
        // Start and end are already today
        break;
      
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      
      case 'week':
        // Get start of current week (Monday)
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start.setDate(now.getDate() - daysFromMonday);
        end.setDate(start.getDate() + 6);
        break;
      
      case 'month':
        // Get start of current month
        start.setDate(1);
        // Get end of current month
        end.setMonth(end.getMonth() + 1, 0);
        break;
      
      case 'year':
        // Get start of current year
        start.setMonth(0, 1);
        // Get end of current year
        end.setMonth(11, 31);
        break;
      
      default:
        throw new Error('Invalid period. Use: today, yesterday, week, month, or year');
    }

    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    };
  }

  /**
   * Generate random string
   * 
   * @param {number} length - Length of string to generate
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   * 
   * @example
   * ```javascript
   * utils.generateRandomString(8);                    // Returns: 'aB3k9mN'
   * utils.generateRandomString(16, '0123456789');    // Returns: '1234567890123456'
   * ```
   */
  generateRandomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    if (!Number.isInteger(length) || length < 1) {
      throw new Error('Length must be a positive integer');
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Deep clone object
   * 
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   * 
   * @example
   * ```javascript
   * const original = { a: 1, b: { c: 2 } };
   * const cloned = utils.deepClone(original);
   * cloned.b.c = 3;
   * console.log(original.b.c); // Still 2
   * console.log(cloned.b.c);   // Now 3
   * ```
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Merge objects deeply
   * 
   * @param {...Object} objects - Objects to merge
   * @returns {Object} Merged object
   * 
   * @example
   * ```javascript
   * const obj1 = { a: 1, b: { c: 2 } };
   * const obj2 = { b: { d: 3 }, e: 4 };
   * const merged = utils.deepMerge(obj1, obj2);
   * // Returns: { a: 1, b: { c: 2, d: 3 }, e: 4 }
   * ```
   */
  deepMerge(...objects) {
    const result = {};

    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            result[key] = this.deepMerge(result[key] || {}, obj[key]);
          } else {
            result[key] = obj[key];
          }
        });
      }
    });

    return result;
  }

  /**
   * Debounce function execution
   * 
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   * 
   * @example
   * ```javascript
   * const debouncedSearch = utils.debounce(searchFunction, 300);
   * // Call debouncedSearch multiple times, only last call executes after 300ms
   * ```
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function execution
   * 
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   * 
   * @example
   * ```javascript
   * const throttledScroll = utils.throttle(scrollHandler, 100);
   * // scrollHandler executes at most once every 100ms
   * ```
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Sleep for specified milliseconds
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after sleep
   * 
   * @example
   * ```javascript
   * await utils.sleep(1000); // Sleep for 1 second
   * ```
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   * 
   * @param {Function} func - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   * 
   * @example
   * ```javascript
   * const result = await utils.retryWithBackoff(
   *   () => apiCall(),
   *   3,    // max retries
   *   1000  // base delay 1 second
   * );
   * ```
   */
  async retryWithBackoff(func, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await func();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Validate email format
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   * 
   * @example
   * ```javascript
   * utils.isValidEmail('user@example.com');     // Returns: true
   * utils.isValidEmail('invalid-email');        // Returns: false
   * ```
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   * 
   * @example
   * ```javascript
   * utils.isValidUrl('https://example.com');    // Returns: true
   * utils.isValidUrl('invalid-url');            // Returns: false
   * ```
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Capitalize first letter of string
   * 
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   * 
   * @example
   * ```javascript
   * utils.capitalize('hello world');    // Returns: 'Hello world'
   * utils.capitalize('HELLO');          // Returns: 'Hello'
   * ```
   */
  capitalize(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to camelCase
   * 
   * @param {string} str - String to convert
   * @returns {string} CamelCase string
   * 
   * @example
   * ```javascript
   * utils.toCamelCase('hello world');      // Returns: 'helloWorld'
   * utils.toCamelCase('user_name');       // Returns: 'userName'
   * ```
   */
  toCamelCase(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }

    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, match => match.toLowerCase());
  }

  /**
   * Convert string to snake_case
   * 
   * @param {string} str - String to convert
   * @returns {string} Snake_case string
   * 
   * @example
   * ```javascript
   * utils.toSnakeCase('helloWorld');      // Returns: 'hello_world'
   * utils.toSnakeCase('UserName');       // Returns: 'user_name'
   * ```
   */
  toSnakeCase(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }

    return str
      .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      .replace(/^_/, '');
  }

  /**
   * Truncate string to specified length
   * 
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add if truncated
   * @returns {string} Truncated string
   * 
   * @example
   * ```javascript
   * utils.truncate('Hello world', 8);           // Returns: 'Hello wo...'
   * utils.truncate('Short', 10);                // Returns: 'Short'
   * utils.truncate('Long text', 5, '***');      // Returns: 'Long ***'
   * ```
   */
  truncate(str, length, suffix = '...') {
    if (!str || typeof str !== 'string') {
      return str;
    }

    if (str.length <= length) {
      return str;
    }

    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Generate hash from string
   * 
   * @param {string} str - String to hash
   * @returns {string} Hash string
   * 
   * @example
   * ```javascript
   * const hash = utils.generateHash('hello world');
   * // Returns: '5eb63bbbe01eeed093cb22bb8f5acdc3'
   * ```
   */
  generateHash(str) {
    if (!str || typeof str !== 'string') {
      throw new Error('String is required for hashing');
    }

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }
}
