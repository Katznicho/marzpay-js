import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Balance API - Account balance management and history
 * 
 * This class handles all balance-related operations including:
 * - Getting current account balance
 * - Retrieving balance history
 * - Balance analytics and summaries
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Get current balance
 * const balance = await marzpay.balance.getBalance();
 * console.log('Current balance:', balance.data.account.balance.formatted);
 * ```
 */
export class BalanceAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Get current account balance
   * 
   * @returns {Promise<Object>} Current balance information
   * 
   * @throws {MarzPayError} When API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const balance = await marzpay.balance.getBalance();
   *   console.log('Balance:', balance.data.account.balance.formatted);
   *   console.log('Currency:', balance.data.account.balance.currency);
   *   console.log('Account status:', balance.data.account.status.account_status);
   * } catch (error) {
   *   console.error('Failed to get balance:', error.message);
   * }
   * ```
   */
  async getBalance() {
    return this.marzpay.request('/balance');
  }

  /**
   * Get detailed balance history
   * 
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.per_page=20] - Items per page (1-100)
   * @param {string} [params.operation] - Filter by operation ('credit' or 'debit')
   * @param {string} [params.start_date] - Start date (ISO format: YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (ISO format: YYYY-MM-DD)
   * 
   * @returns {Promise<Object>} Balance history with transactions
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const history = await marzpay.balance.getBalanceHistory({
   *     page: 1,
   *     per_page: 50,
   *     operation: 'credit',
   *     start_date: '2024-01-01',
   *     end_date: '2024-01-31'
   *   });
   *   
   *   console.log('Total transactions:', history.data.summary.total_transactions);
   *   console.log('Total credits:', history.data.summary.total_credits);
   *   console.log('Total debits:', history.data.summary.total_debits);
   * } catch (error) {
   *   console.error('Failed to get balance history:', error.message);
   * }
   * ```
   */
  async getBalanceHistory(params = {}) {
    // Validate parameters
    this.validateBalanceHistoryParams(params);

    // Build query string
    const queryString = this.marzpay.utils.buildQueryString(params);

    return this.marzpay.request(`/balance/history?${queryString}`);
  }

  /**
   * Validate balance history parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateBalanceHistoryParams(params) {
    const { page, per_page, operation, start_date, end_date } = params;

    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        throw new MarzPayError('Page must be a positive integer', 'INVALID_PAGE', 400);
      }
    }

    if (per_page !== undefined) {
      if (!Number.isInteger(per_page) || per_page < 1 || per_page > 100) {
        throw new MarzPayError('Per page must be between 1 and 100', 'INVALID_PER_PAGE', 400);
      }
    }

    if (operation !== undefined) {
      const validOperations = ['credit', 'debit'];
      if (!validOperations.includes(operation)) {
        throw new MarzPayError('Operation must be either "credit" or "debit"', 'INVALID_OPERATION', 400);
      }
    }

    if (start_date !== undefined) {
      if (!this.isValidDate(start_date)) {
        throw new MarzPayError('Start date must be in YYYY-MM-DD format', 'INVALID_START_DATE', 400);
      }
    }

    if (end_date !== undefined) {
      if (!this.isValidDate(end_date)) {
        throw new MarzPayError('End date must be in YYYY-MM-DD format', 'INVALID_END_DATE', 400);
      }
    }

    if (start_date && end_date) {
      if (new Date(start_date) > new Date(end_date)) {
        throw new MarzPayError('Start date cannot be after end date', 'INVALID_DATE_RANGE', 400);
      }
    }
  }

  /**
   * Check if date string is valid
   * 
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if date is valid
   * 
   * @private
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Get balance summary for a specific period
   * 
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Balance summary for the period
   * 
   * @example
   * ```javascript
   * const summary = await marzpay.balance.getPeriodSummary('2024-01-01', '2024-01-31');
   * console.log('Period net change:', summary.data.summary.net_change);
   * console.log('Transaction count:', summary.data.summary.transaction_count);
   * ```
   */
  async getPeriodSummary(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new MarzPayError('Both start and end dates are required', 'MISSING_DATES', 400);
    }

    const history = await this.getBalanceHistory({
      start_date: startDate,
      end_date: endDate,
      per_page: 1000 // Get all transactions for the period
    });

    return history;
  }

  /**
   * Get monthly balance summary
   * 
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Monthly balance summary
   * 
   * @example
   * ```javascript
   * const monthlySummary = await marzpay.balance.getMonthlySummary(2024, 1);
   * console.log('January 2024 summary:', monthlySummary.data.summary);
   * ```
   */
  async getMonthlySummary(year, month) {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new MarzPayError('Year must be between 2000 and 2100', 'INVALID_YEAR', 400);
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new MarzPayError('Month must be between 1 and 12', 'INVALID_MONTH', 400);
    }

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

    return this.getPeriodSummary(startDate, endDate);
  }

  /**
   * Get current balance amount in different formats
   * 
   * @returns {Promise<Object>} Balance in different formats
   * 
   * @example
   * ```javascript
   * const balanceFormats = await marzpay.balance.getBalanceFormats();
   * console.log('Raw amount:', balanceFormats.raw);
   * console.log('Formatted:', balanceFormats.formatted);
   * console.log('Currency:', balanceFormats.currency);
   * ```
   */
  async getBalanceFormats() {
    const balance = await this.getBalance();
    return {
      raw: balance.data.account.balance.raw,
      formatted: balance.data.account.balance.formatted,
      currency: balance.data.account.balance.currency
    };
  }

  /**
   * Check if account has sufficient balance
   * 
   * @param {number} amount - Amount to check
   * @returns {Promise<boolean>} True if sufficient balance
   * 
   * @example
   * ```javascript
   * const hasBalance = await marzpay.balance.hasSufficientBalance(50000);
   * if (hasBalance) {
   *   console.log('Sufficient balance for transaction');
   * } else {
   *   console.log('Insufficient balance');
   * }
   * ```
   */
  async hasSufficientBalance(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new MarzPayError('Amount must be a positive number', 'INVALID_AMOUNT', 400);
    }

    try {
      const balance = await this.getBalance();
      const currentBalance = parseFloat(balance.data.account.balance.raw);
      return currentBalance >= amount;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get balance trends (daily, weekly, monthly)
   * 
   * @param {string} period - Period type ('daily', 'weekly', 'monthly')
   * @param {number} count - Number of periods to retrieve
   * @returns {Promise<Object>} Balance trends data
   * 
   * @example
   * ```javascript
   * const trends = await marzpay.balance.getBalanceTrends('monthly', 6);
   * console.log('Last 6 months trends:', trends.data.trends);
   * ```
   */
  async getBalanceTrends(period = 'monthly', count = 6) {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      throw new MarzPayError('Period must be daily, weekly, or monthly', 'INVALID_PERIOD', 400);
    }

    if (!Number.isInteger(count) || count < 1 || count > 24) {
      throw new MarzPayError('Count must be between 1 and 24', 'INVALID_COUNT', 400);
    }

    // Calculate date range based on period and count
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - count);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - (count * 7));
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - count);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return this.getPeriodSummary(startDateStr, endDateStr);
  }

  /**
   * Get balance alerts and notifications
   * 
   * @returns {Promise<Object>} Balance alerts
   * 
   * @example
   * ```javascript
   * const alerts = await marzpay.balance.getBalanceAlerts();
   * console.log('Low balance alerts:', alerts.data.alerts);
   * ```
   */
  async getBalanceAlerts() {
    const balance = await this.getBalance();
    const currentBalance = parseFloat(balance.data.account.balance.raw);
    
    const alerts = [];
    
    // Low balance alert (below 10,000 UGX)
    if (currentBalance < 10000) {
      alerts.push({
        type: 'low_balance',
        message: 'Account balance is low',
        threshold: 10000,
        current: currentBalance,
        severity: 'warning'
      });
    }

    // Critical balance alert (below 1,000 UGX)
    if (currentBalance < 1000) {
      alerts.push({
        type: 'critical_balance',
        message: 'Account balance is critically low',
        threshold: 1000,
        current: currentBalance,
        severity: 'critical'
      });
    }

    return {
      status: 'success',
      data: {
        alerts,
        current_balance: currentBalance,
        currency: balance.data.account.balance.currency
      }
    };
  }
}
