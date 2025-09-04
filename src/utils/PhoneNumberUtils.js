/**
 * Phone Number Utilities
 * 
 * Handles phone number formatting, validation, and conversion
 * for Ugandan mobile numbers with support for multiple formats.
 * 
 * @example
 * ```javascript
 * const utils = new PhoneNumberUtils();
 * 
 * // Format phone number
 * const formatted = utils.formatPhoneNumber('0759983853');
 * // Returns: '+256759983853'
 * 
 * // Validate phone number
 * const isValid = utils.isValidPhoneNumber('0759983853');
 * // Returns: true
 * ```
 */
export class PhoneNumberUtils {
  constructor() {
    // Ugandan mobile number patterns
    this.patterns = {
      local: /^0[0-9]{9}$/,           // 0759983853
      countryCode: /^256[0-9]{9}$/,   // 256759983853
      international: /^\+256[0-9]{9}$/, // +256759983853
      nineDigits: /^[0-9]{9}$/        // 759983853
    };
    
    // Supported mobile money providers
    this.providers = {
      mtn: ['075', '076', '077', '078'],
      airtel: ['075', '070', '074'],
      africell: ['079'],
      ugandaTel: ['071']
    };
  }

  /**
   * Format phone number to international format (+256XXXXXXXXX)
   * 
   * @param {string} phone - Phone number in any supported format
   * @returns {string|null} Formatted phone number or null if invalid
   * 
   * @example
   * ```javascript
   * utils.formatPhoneNumber('0759983853');     // Returns: '+256759983853'
   * utils.formatPhoneNumber('256759983853');   // Returns: '+256759983853'
   * utils.formatPhoneNumber('+256759983853');  // Returns: '+256759983853'
   * utils.formatPhoneNumber('759983853');      // Returns: '+256759983853'
   * ```
   */
  formatPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle different formats
    if (cleaned.startsWith('+')) {
      // Already in international format
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Local format: 0759983853 -> +256759983853
      cleaned = '256' + cleaned.substring(1);
    } else if (cleaned.startsWith('256')) {
      // Already has country code
      cleaned = cleaned;
    } else if (cleaned.length === 9) {
      // 9 digits: 759983853 -> +256759983853
      cleaned = '256' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      // 10 digits starting with 0: 0759983853 -> +256759983853
      cleaned = '256' + cleaned.substring(1);
    } else {
      // Invalid format
      return null;
    }

    // Validate the cleaned number
    if (!/^256[0-9]{9}$/.test(cleaned)) {
      return null;
    }

    return `+${cleaned}`;
  }

  /**
   * Validate phone number format
   * 
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone number is valid
   * 
   * @example
   * ```javascript
   * utils.isValidPhoneNumber('0759983853');     // Returns: true
   * utils.isValidPhoneNumber('256759983853');   // Returns: true
   * utils.isValidPhoneNumber('+256759983853');  // Returns: true
   * utils.isValidPhoneNumber('123');            // Returns: false
   * ```
   */
  isValidPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const formatted = this.formatPhoneNumber(phone);
    if (!formatted) {
      return false;
    }

    // Check if it matches +256XXXXXXXXX format
    return this.patterns.international.test(formatted);
  }

  /**
   * Get phone number provider (MTN, Airtel, etc.)
   * 
   * @param {string} phone - Phone number
   * @returns {string|null} Provider name or null if unknown
   * 
   * @example
   * ```javascript
   * utils.getProvider('0759983853'); // Returns: 'mtn'
   * utils.getProvider('0701234567'); // Returns: 'airtel'
   * ```
   */
  getProvider(phone) {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }

    const formatted = this.formatPhoneNumber(phone);
    const prefix = formatted.substring(4, 7); // Extract 075, 070, etc.

    for (const [provider, prefixes] of Object.entries(this.providers)) {
      if (prefixes.includes(prefix)) {
        return provider;
      }
    }

    return null;
  }

  /**
   * Check if phone number is from a specific provider
   * 
   * @param {string} phone - Phone number
   * @param {string} provider - Provider name (mtn, airtel, etc.)
   * @returns {boolean} True if phone number is from the specified provider
   * 
   * @example
   * ```javascript
   * utils.isFromProvider('0759983853', 'mtn');    // Returns: true
   * utils.isFromProvider('0759983853', 'airtel'); // Returns: false
   * ```
   */
  isFromProvider(phone, provider) {
    const phoneProvider = this.getProvider(phone);
    return phoneProvider === provider.toLowerCase();
  }

  /**
   * Get phone number without country code
   * 
   * @param {string} phone - Phone number
   * @returns {string|null} Phone number without country code or null if invalid
   * 
   * @example
   * ```javascript
   * utils.getLocalNumber('+256759983853'); // Returns: '0759983853'
   * utils.getLocalNumber('0759983853');    // Returns: '0759983853'
   * ```
   */
  getLocalNumber(phone) {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }

    const formatted = this.formatPhoneNumber(phone);
    return '0' + formatted.substring(4); // +256759983853 -> 0759983853
  }

  /**
   * Get phone number with country code (no +)
   * 
   * @param {string} phone - Phone number
   * @returns {string|null} Phone number with country code or null if invalid
   * 
   * @example
   * ```javascript
   * utils.getCountryCodeNumber('+256759983853'); // Returns: '256759983853'
   * utils.getCountryCodeNumber('0759983853');    // Returns: '256759983853'
   * ```
   */
  getCountryCodeNumber(phone) {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }

    const formatted = this.formatPhoneNumber(phone);
    return formatted.substring(1); // +256759983853 -> 256759983853
  }

  /**
   * Mask phone number for privacy (shows only first and last 2 digits)
   * 
   * @param {string} phone - Phone number
   * @param {string} [maskChar='*'] - Character to use for masking
   * @returns {string|null} Masked phone number or null if invalid
   * 
   * @example
   * ```javascript
   * utils.maskPhoneNumber('0759983853');     // Returns: '07******53'
   * utils.maskPhoneNumber('+256759983853');  // Returns: '+25******53'
   * ```
   */
  maskPhoneNumber(phone, maskChar = '*') {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }

    const formatted = this.formatPhoneNumber(phone);
    const length = formatted.length;
    
    if (length <= 4) {
      return formatted;
    }

    const firstPart = formatted.substring(0, 2);
    const lastPart = formatted.substring(length - 2);
    const maskedPart = maskChar.repeat(length - 4);

    return `${firstPart}${maskedPart}${lastPart}`;
  }

  /**
   * Get all supported phone number formats for a given number
   * 
   * @param {string} phone - Phone number
   * @returns {Object|null} Object with different formats or null if invalid
   * 
   * @example
   * ```javascript
   * utils.getAllFormats('0759983853');
   * // Returns: {
   * //   local: '0759983853',
   * //   countryCode: '256759983853',
   * //   international: '+256759983853'
   * // }
   * ```
   */
  getAllFormats(phone) {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }

    const formatted = this.formatPhoneNumber(phone);
    
    return {
      local: this.getLocalNumber(phone),
      countryCode: this.getCountryCodeNumber(phone),
      international: formatted
    };
  }

  /**
   * Validate phone number against specific provider
   * 
   * @param {string} phone - Phone number
   * @param {string} provider - Provider name
   * @returns {boolean} True if phone number is valid for the provider
   * 
   * @example
   * ```javascript
   * utils.isValidForProvider('0759983853', 'mtn');    // Returns: true
   * utils.isValidForProvider('0701234567', 'mtn');    // Returns: false
   * ```
   */
  isValidForProvider(phone, provider) {
    if (!this.isValidPhoneNumber(phone)) {
      return false;
    }

    const phoneProvider = this.getProvider(phone);
    return phoneProvider === provider.toLowerCase();
  }

  /**
   * Get supported providers list
   * 
   * @returns {Array} Array of supported provider names
   * 
   * @example
   * ```javascript
   * const providers = utils.getSupportedProviders();
   * // Returns: ['mtn', 'airtel', 'africell', 'ugandaTel']
   * ```
   */
  getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Get provider prefixes
   * 
   * @param {string} provider - Provider name
   * @returns {Array|null} Array of prefixes for the provider or null if not found
   * 
   * @example
   * ```javascript
   * const prefixes = utils.getProviderPrefixes('mtn');
   * // Returns: ['075', '076', '077', '078']
   * ```
   */
  getProviderPrefixes(provider) {
    return this.providers[provider.toLowerCase()] || null;
  }
}
