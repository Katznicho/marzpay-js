import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Accounts API - Business account management and information
 * 
 * This class handles all account-related operations including:
 * - Getting business account information
 * - Updating account settings
 * - Managing business profile
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Get account information
 * const account = await marzpay.accounts.getAccountInfo();
 * console.log('Business name:', account.data.account.business_name);
 * ```
 */
export class AccountsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Get business account information
   * 
   * @returns {Promise<Object>} Business account details
   * 
   * @throws {MarzPayError} When API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const account = await marzpay.accounts.getAccountInfo();
   *   console.log('Business:', account.data.account.business_name);
   *   console.log('Balance:', account.data.account.balance.formatted);
   *   console.log('Status:', account.data.account.status.account_status);
   * } catch (error) {
   *   console.error('Failed to get account info:', error.message);
   * }
   * ```
   */
  async getAccountInfo() {
    return this.marzpay.request('/account');
  }

  /**
   * Update business account information
   * 
   * @param {Object} settings - Account settings to update
   * @param {string|null} [settings.business_name] - Business name
   * @param {string|null} [settings.contact_phone] - Contact phone number
   * @param {string|null} [settings.business_address] - Business address
   * @param {string|null} [settings.business_city] - Business city
   * @param {string|null} [settings.business_country] - Business country
   * 
   * @returns {Promise<Object>} Updated account information
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const result = await marzpay.accounts.updateAccount({
   *     business_name: 'Updated Business Name',
   *     contact_phone: '+256759983853',
   *     business_address: '456 New Street',
   *     business_city: 'Kampala',
   *     business_country: 'Uganda'
   *   });
   *   
   *   console.log('Account updated:', result.data.account.business_name);
   * } catch (error) {
   *   console.error('Failed to update account:', error.message);
   * }
   * ```
   */
  async updateAccount(settings) {
    // Validate settings
    this.validateAccountSettings(settings);

    // Filter out null/undefined values
    const updateData = Object.fromEntries(
      Object.entries(settings).filter(([_, value]) => value != null)
    );

    if (Object.keys(updateData).length === 0) {
      throw new MarzPayError('No valid settings provided for update', 'NO_SETTINGS', 400);
    }

    return this.marzpay.request('/account', {
      method: 'PUT',
      body: updateData
    });
  }

  /**
   * Validate account settings
   * 
   * @param {Object} settings - Settings to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateAccountSettings(settings) {
    const { business_name, contact_phone, business_address, business_city, business_country } = settings;

    if (business_name !== null && business_name !== undefined) {
      if (typeof business_name !== 'string' || business_name.trim().length === 0) {
        throw new MarzPayError('Business name must be a non-empty string', 'INVALID_BUSINESS_NAME', 400);
      }
      if (business_name.length > 100) {
        throw new MarzPayError('Business name must be less than 100 characters', 'BUSINESS_NAME_TOO_LONG', 400);
      }
    }

    if (contact_phone !== null && contact_phone !== undefined) {
      if (!this.marzpay.utils.isValidPhoneNumber(contact_phone)) {
        throw new MarzPayError('Invalid contact phone number format', 'INVALID_CONTACT_PHONE', 400);
      }
    }

    if (business_address !== null && business_address !== undefined) {
      if (typeof business_address !== 'string' || business_address.trim().length === 0) {
        throw new MarzPayError('Business address must be a non-empty string', 'INVALID_ADDRESS', 400);
      }
      if (business_address.length > 200) {
        throw new MarzPayError('Business address must be less than 200 characters', 'ADDRESS_TOO_LONG', 400);
      }
    }

    if (business_city !== null && business_city !== undefined) {
      if (typeof business_city !== 'string' || business_city.trim().length === 0) {
        throw new MarzPayError('Business city must be a non-empty string', 'INVALID_CITY', 400);
      }
      if (business_city.length > 50) {
        throw new MarzPayError('Business city must be less than 50 characters', 'CITY_TOO_LONG', 400);
      }
    }

    if (business_country !== null && business_country !== undefined) {
      if (typeof business_country !== 'string' || business_country.trim().length === 0) {
        throw new MarzPayError('Business country must be a non-empty string', 'INVALID_COUNTRY', 400);
      }
      if (business_country.length > 50) {
        throw new MarzPayError('Business country must be less than 50 characters', 'COUNTRY_TOO_LONG', 400);
      }
    }
  }

  /**
   * Get account status summary
   * 
   * @returns {Promise<Object>} Account status information
   * 
   * @example
   * ```javascript
   * const status = await marzpay.accounts.getAccountStatus();
   * console.log('Account frozen:', status.data.account.status.is_frozen);
   * console.log('Verification status:', status.data.account.status.is_verified);
   * ```
   */
  async getAccountStatus() {
    const account = await this.getAccountInfo();
    return {
      status: 'success',
      data: {
        account: {
          status: account.data.account.status
        }
      }
    };
  }

  /**
   * Check if account is active
   * 
   * @returns {Promise<boolean>} True if account is active
   * 
   * @example
   * ```javascript
   * const isActive = await marzpay.accounts.isAccountActive();
   * if (isActive) {
   *   console.log('Account is active and ready for transactions');
   * } else {
   *   console.log('Account is not active');
   * }
   * ```
   */
  async isAccountActive() {
    try {
      const status = await this.getAccountStatus();
      return status.data.account.status.account_status === 'active' && 
             status.data.account.status.is_frozen === 'false';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if account is verified
   * 
   * @returns {Promise<boolean>} True if account is verified
   * 
   * @example
   * ```javascript
   * const isVerified = await marzpay.accounts.isAccountVerified();
   * if (isVerified) {
   *   console.log('Account is verified');
   * } else {
   *   console.log('Account needs verification');
   * }
   * ```
   */
  async isAccountVerified() {
    try {
      const status = await this.getAccountStatus();
      return status.data.account.status.is_verified === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get account limits and capabilities
   * 
   * @returns {Promise<Object>} Account limits and capabilities
   * 
   * @example
   * ```javascript
   * const limits = await marzpay.accounts.getAccountLimits();
   * console.log('Collection limits:', limits.data.account.limits.deposit);
   * console.log('Withdrawal limits:', limits.data.account.limits.withdrawal);
   * ```
   */
  async getAccountLimits() {
    const account = await this.getAccountInfo();
    return {
      status: 'success',
      data: {
        account: {
          limits: account.data.account.limits
        }
      }
    };
  }

  /**
   * Get business profile information
   * 
   * @returns {Promise<Object>} Business profile details
   * 
   * @example
   * ```javascript
   * const profile = await marzpay.accounts.getBusinessProfile();
   * console.log('Business name:', profile.data.account.business_name);
   * console.log('Contact phone:', profile.data.account.contact_phone);
   * console.log('Address:', profile.data.account.business_address);
   * ```
   */
  async getBusinessProfile() {
    const account = await this.getAccountInfo();
    return {
      status: 'success',
      data: {
        account: {
          business_name: account.data.account.business_name,
          contact_phone: account.data.account.contact_phone,
          business_address: account.data.account.business_address,
          business_city: account.data.account.business_city,
          business_country: account.data.account.business_country
        }
      }
    };
  }
}
