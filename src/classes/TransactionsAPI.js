import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Transactions API - Transaction management and queries
 * 
 * This class handles all transaction-related operations including:
 * - Getting transaction lists with filtering
 * - Retrieving transaction details
 * - Transaction analytics and reporting
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Get recent transactions
 * const transactions = await marzpay.transactions.getTransactions({
 *   page: 1,
 *   per_page: 20,
 *   type: 'collection'
 * });
 * ```
 */
export class TransactionsAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Get all transactions with optional filtering
   * 
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.per_page=20] - Items per page (1-100)
   * @param {string} [params.type] - Transaction type ('collection', 'withdrawal', 'charge', 'refund')
   * @param {string} [params.status] - Transaction status ('pending', 'processing', 'successful', 'failed', 'cancelled')
   * @param {string} [params.provider] - Mobile money provider ('mtn', 'airtel')
   * @param {string} [params.start_date] - Start date (ISO format: YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (ISO format: YYYY-MM-DD)
   * @param {string} [params.reference] - Transaction reference
   * 
   * @returns {Promise<Object>} Transactions list with pagination
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const transactions = await marzpay.transactions.getTransactions({
   *     page: 1,
   *     per_page: 50,
   *     type: 'collection',
   *     status: 'successful',
   *     provider: 'mtn',
   *     start_date: '2024-01-01',
   *     end_date: '2024-01-31'
   *   });
   *   
   *   console.log('Total transactions:', transactions.data.summary.total_transactions);
   *   console.log('Current page:', transactions.data.pagination.current_page);
   *   console.log('Total pages:', transactions.data.pagination.total_pages);
   * } catch (error) {
   *   console.error('Failed to get transactions:', error.message);
   * }
   * ```
   */
  async getTransactions(params = {}) {
    // Validate parameters
    this.validateTransactionParams(params);

    // Build query string
    const queryString = this.marzpay.utils.buildQueryString(params);

    return this.marzpay.request(`/transactions?${queryString}`);
  }

  /**
   * Get transaction details by UUID
   * 
   * @param {string} uuid - Transaction UUID
   * @returns {Promise<Object>} Transaction details
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const transaction = await marzpay.transactions.getTransaction('uuid-here');
   *   console.log('Transaction status:', transaction.data.transaction.status);
   *   console.log('Amount:', transaction.data.transaction.amount.formatted);
   *   console.log('Provider:', transaction.data.transaction.provider);
   * } catch (error) {
   *   console.error('Failed to get transaction:', error.message);
   * }
   * ```
   */
  async getTransaction(uuid) {
    if (!uuid) {
      throw new MarzPayError('Transaction UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/transactions/${uuid}`);
  }

  /**
   * Validate transaction query parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateTransactionParams(params) {
    const { page, per_page, type, status, provider, start_date, end_date } = params;

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

    if (type !== undefined) {
      const validTypes = ['collection', 'withdrawal', 'charge', 'refund'];
      if (!validTypes.includes(type)) {
        throw new MarzPayError('Invalid transaction type', 'INVALID_TYPE', 400);
      }
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'successful', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new MarzPayError('Invalid transaction status', 'INVALID_STATUS', 400);
      }
    }

    if (provider !== undefined) {
      const validProviders = ['mtn', 'airtel'];
      if (!validProviders.includes(provider)) {
        throw new MarzPayError('Invalid provider', 'INVALID_PROVIDER', 400);
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
   * Get transactions by type
   * 
   * @param {string} type - Transaction type
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Transactions of specified type
   * 
   * @example
   * ```javascript
   * const collections = await marzpay.transactions.getByType('collection', {
   *   status: 'successful',
   *   per_page: 100
   * });
   * ```
   */
  async getByType(type, params = {}) {
    return this.getTransactions({ type, ...params });
  }

  /**
   * Get transactions by status
   * 
   * @param {string} status - Transaction status
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Transactions with specified status
   * 
   * @example
   * ```javascript
   * const pending = await marzpay.transactions.getByStatus('pending');
   * const successful = await marzpay.transactions.getByStatus('successful');
   * ```
   */
  async getByStatus(status, params = {}) {
    return this.getTransactions({ status, ...params });
  }

  /**
   * Get transactions by provider
   * 
   * @param {string} provider - Mobile money provider
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Transactions from specified provider
   * 
   * @example
   * ```javascript
   * const mtnTransactions = await marzpay.transactions.getByProvider('mtn');
   * const airtelTransactions = await marzpay.transactions.getByProvider('airtel');
   * ```
   */
  async getByProvider(provider, params = {}) {
    return this.getTransactions({ provider, ...params });
  }

  /**
   * Get transactions for a specific date range
   * 
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Transactions in date range
   * 
   * @example
   * ```javascript
   * const weeklyTransactions = await marzpay.transactions.getByDateRange(
   *   '2024-01-01',
   *   '2024-01-07'
   * );
   * ```
   */
  async getByDateRange(startDate, endDate, params = {}) {
    if (!startDate || !endDate) {
      throw new MarzPayError('Both start and end dates are required', 'MISSING_DATES', 400);
    }

    return this.getTransactions({
      start_date: startDate,
      end_date: endDate,
      ...params
    });
  }

  /**
   * Get recent transactions (last N days)
   * 
   * @param {number} days - Number of days to look back
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Recent transactions
   * 
   * @example
   * ```javascript
   * const recent = await marzpay.transactions.getRecent(7); // Last 7 days
   * const today = await marzpay.transactions.getRecent(1); // Today only
   * ```
   */
  async getRecent(days = 7, params = {}) {
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new MarzPayError('Days must be between 1 and 365', 'INVALID_DAYS', 400);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return this.getByDateRange(startDateStr, endDateStr, params);
  }

  /**
   * Get transaction summary statistics
   * 
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Transaction summary statistics
   * 
   * @example
   * ```javascript
   * const stats = await marzpay.transactions.getSummary({
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31'
   * });
   * 
   * console.log('Total amount:', stats.data.summary.total_amount);
   * console.log('Transaction count:', stats.data.summary.total_transactions);
   * console.log('Success rate:', stats.data.summary.success_rate);
   * ```
   */
  async getSummary(params = {}) {
    const transactions = await this.getTransactions({
      ...params,
      per_page: 1000 // Get all transactions for accurate summary
    });

    const summary = this.calculateSummary(transactions.data.transactions);
    
    return {
      status: 'success',
      data: {
        summary,
        filters: params
      }
    };
  }

  /**
   * Calculate transaction summary from transaction list
   * 
   * @param {Array} transactions - Array of transactions
   * @returns {Object} Calculated summary
   * 
   * @private
   */
  calculateSummary(transactions) {
    let totalAmount = 0;
    let totalTransactions = transactions.length;
    let successfulTransactions = 0;
    let failedTransactions = 0;
    let pendingTransactions = 0;
    let totalCollections = 0;
    let totalWithdrawals = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount.raw) || 0;
      
      if (transaction.status === 'successful') {
        successfulTransactions++;
        totalAmount += amount;
      } else if (transaction.status === 'failed') {
        failedTransactions++;
      } else if (transaction.status === 'pending') {
        pendingTransactions++;
      }

      if (transaction.type === 'collection') {
        totalCollections++;
      } else if (transaction.type === 'withdrawal') {
        totalWithdrawals++;
      }
    });

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    return {
      total_amount: totalAmount,
      total_transactions: totalTransactions,
      successful_transactions: successfulTransactions,
      failed_transactions: failedTransactions,
      pending_transactions: pendingTransactions,
      total_collections: totalCollections,
      total_withdrawals: totalWithdrawals,
      success_rate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Search transactions by reference
   * 
   * @param {string} reference - Transaction reference to search for
   * @returns {Promise<Object>} Matching transactions
   * 
   * @example
   * ```javascript
   * const results = await marzpay.transactions.searchByReference('ref-123');
   * console.log('Found transactions:', results.data.transactions.length);
   * ```
   */
  async searchByReference(reference) {
    if (!reference || typeof reference !== 'string') {
      throw new MarzPayError('Reference is required and must be a string', 'INVALID_REFERENCE', 400);
    }

    return this.getTransactions({ reference });
  }

  /**
   * Get transaction analytics
   * 
   * @param {string} period - Period type ('daily', 'weekly', 'monthly')
   * @param {number} count - Number of periods to analyze
   * @returns {Promise<Object>} Transaction analytics
   * 
   * @example
   * ```javascript
   * const analytics = await marzpay.transactions.getAnalytics('monthly', 6);
   * console.log('Monthly trends:', analytics.data.trends);
   * ```
   */
  async getAnalytics(period = 'monthly', count = 6) {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      throw new MarzPayError('Period must be daily, weekly, or monthly', 'INVALID_PERIOD', 400);
    }

    if (!Number.isInteger(count) || count < 1 || count > 24) {
      throw new MarzPayError('Count must be between 1 and 24', 'INVALID_COUNT', 400);
    }

    // Calculate date range
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

    const transactions = await this.getByDateRange(startDateStr, endDateStr, { per_page: 1000 });
    
    return {
      status: 'success',
      data: {
        period,
        count,
        date_range: { start: startDateStr, end: endDateStr },
        summary: this.calculateSummary(transactions.data.transactions),
        transactions: transactions.data.transactions
      }
    };
  }
}
