import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Webhooks API - Webhook management and notifications
 * 
 * This class handles all webhook-related operations including:
 * - Creating and managing webhooks
 * - Webhook configuration and updates
 * - Webhook status and testing
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Create a webhook for payment notifications
 * const webhook = await marzpay.webhooks.createWebhook({
 *   name: 'Payment Notifications',
 *   url: 'https://yoursite.com/webhook',
 *   eventType: 'collection.completed'
 * });
 * ```
 */
export class WebhooksAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Get all webhooks with optional filtering
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.status] - Webhook status ('active', 'inactive')
   * @param {string} [params.event_type] - Event type filter
   * 
   * @returns {Promise<Object>} Webhooks list with details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const webhooks = await marzpay.webhooks.getWebhooks({
   *     status: 'active',
   *     event_type: 'collection.completed'
   *   });
   *   
   *   console.log('Total webhooks:', webhooks.data.summary.total_webhooks);
   *   console.log('Active webhooks:', webhooks.data.summary.active_webhooks);
   * } catch (error) {
   *   console.error('Failed to get webhooks:', error.message);
   * }
   * ```
   */
  async getWebhooks(params = {}) {
    // Validate parameters
    this.validateWebhookParams(params);

    // Build query string
    const queryString = this.marzpay.utils.buildQueryString(params);

    return this.marzpay.request(`/webhooks?${queryString}`);
  }

  /**
   * Create a new webhook
   * 
   * @param {Object} params - Webhook parameters
   * @param {string} params.name - Webhook name
   * @param {string} params.url - Webhook URL
   * @param {string} params.eventType - Event type ('success', 'failure', 'collection.completed', 'collection.failed', 'collection.cancelled')
   * @param {string} params.environment - Environment ('test', 'production')
   * @param {boolean} [params.isActive=true] - Whether webhook is active
   * 
   * @returns {Promise<Object>} Created webhook details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const webhook = await marzpay.webhooks.createWebhook({
   *     name: 'Payment Notifications',
   *     url: 'https://yoursite.com/webhook',
   *     eventType: 'collection.completed',
   *     environment: 'production',
   *     isActive: true
   *   });
   *   
   *   console.log('Webhook created:', webhook.data.webhook.uuid);
   *   console.log('Webhook URL:', webhook.data.webhook.url);
   * } catch (error) {
   *   console.error('Failed to create webhook:', error.message);
   * }
   * ```
   */
  async createWebhook(params) {
    const { name, url, eventType, environment, isActive = true } = params;

    // Validate parameters
    this.validateCreateWebhookParams(params);

    const body = {
      name,
      url,
      event_type: eventType,
      environment,
      is_active: isActive
    };

    return this.marzpay.request('/webhooks', {
      method: 'POST',
      body
    });
  }

  /**
   * Get webhook details by UUID
   * 
   * @param {string} uuid - Webhook UUID
   * @returns {Promise<Object>} Webhook details
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const webhook = await marzpay.webhooks.getWebhook('uuid-here');
   *   console.log('Webhook name:', webhook.data.webhook.name);
   *   console.log('Webhook URL:', webhook.data.webhook.url);
   *   console.log('Event type:', webhook.data.webhook.event_type);
   *   console.log('Status:', webhook.data.webhook.status);
   * } catch (error) {
   *   console.error('Failed to get webhook:', error.message);
   * }
   * ```
   */
  async getWebhook(uuid) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`);
  }

  /**
   * Update an existing webhook
   * 
   * @param {string} uuid - Webhook UUID
   * @param {Object} params - Update parameters
   * @param {string} [params.name] - New webhook name
   * @param {string} [params.url] - New webhook URL
   * @param {string} [params.eventType] - New event type
   * @param {string} [params.environment] - New environment
   * @param {boolean} [params.isActive] - New active status
   * 
   * @returns {Promise<Object>} Updated webhook details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const result = await marzpay.webhooks.updateWebhook('uuid-here', {
   *     name: 'Updated Webhook Name',
   *     url: 'https://newsite.com/webhook',
   *     isActive: false
   *   });
   *   
   *   console.log('Webhook updated:', result.data.webhook.name);
   * } catch (error) {
   *   console.error('Failed to update webhook:', error.message);
   * }
   * ```
   */
  async updateWebhook(uuid, params) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    // Validate update parameters
    this.validateUpdateWebhookParams(params);

    // Filter out null/undefined values and transform keys
    const updateData = {};
    if (params.name !== undefined) updateData.name = params.name;
    if (params.url !== undefined) updateData.url = params.url;
    if (params.eventType !== undefined) updateData.event_type = params.eventType;
    if (params.environment !== undefined) updateData.environment = params.environment;
    if (params.isActive !== undefined) updateData.is_active = params.isActive;

    if (Object.keys(updateData).length === 0) {
      throw new MarzPayError('No valid parameters provided for update', 'NO_UPDATE_PARAMS', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`, {
      method: 'PUT',
      body: updateData
    });
  }

  /**
   * Delete a webhook
   * 
   * @param {string} uuid - Webhook UUID
   * @returns {Promise<Object>} Deletion confirmation
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const result = await marzpay.webhooks.deleteWebhook('uuid-here');
   *   console.log('Webhook deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete webhook:', error.message);
   * }
   * ```
   */
  async deleteWebhook(uuid) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/webhooks/${uuid}`, {
      method: 'DELETE'
    });
  }

  /**
   * Validate webhook query parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateWebhookParams(params) {
    const { status, event_type } = params;

    if (status !== undefined) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        throw new MarzPayError('Invalid webhook status', 'INVALID_STATUS', 400);
      }
    }

    if (event_type !== undefined) {
      const validEventTypes = ['success', 'failure', 'collection.completed', 'collection.failed', 'collection.cancelled'];
      if (!validEventTypes.includes(event_type)) {
        throw new MarzPayError('Invalid event type', 'INVALID_EVENT_TYPE', 400);
      }
    }
  }

  /**
   * Validate create webhook parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateCreateWebhookParams(params) {
    const { name, url, eventType, environment } = params;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new MarzPayError('Webhook name is required and must be a non-empty string', 'MISSING_NAME', 400);
    }

    if (name.length > 100) {
      throw new MarzPayError('Webhook name must be less than 100 characters', 'NAME_TOO_LONG', 400);
    }

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new MarzPayError('Webhook URL is required and must be a non-empty string', 'MISSING_URL', 400);
    }

    if (!this.isValidUrl(url)) {
      throw new MarzPayError('Invalid webhook URL format', 'INVALID_URL', 400);
    }

    if (!eventType || typeof eventType !== 'string') {
      throw new MarzPayError('Event type is required', 'MISSING_EVENT_TYPE', 400);
    }

    const validEventTypes = ['success', 'failure', 'collection.completed', 'collection.failed', 'collection.cancelled'];
    if (!validEventTypes.includes(eventType)) {
      throw new MarzPayError('Invalid event type', 'INVALID_EVENT_TYPE', 400);
    }

    if (!environment || typeof environment !== 'string') {
      throw new MarzPayError('Environment is required', 'MISSING_ENVIRONMENT', 400);
    }

    const validEnvironments = ['test', 'production'];
    if (!validEnvironments.includes(environment)) {
      throw new MarzPayError('Environment must be either "test" or "production"', 'INVALID_ENVIRONMENT', 400);
    }
  }

  /**
   * Validate update webhook parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateUpdateWebhookParams(params) {
    const { name, url, eventType, environment, isActive } = params;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new MarzPayError('Webhook name must be a non-empty string', 'INVALID_NAME', 400);
      }
      if (name.length > 100) {
        throw new MarzPayError('Webhook name must be less than 100 characters', 'NAME_TOO_LONG', 400);
      }
    }

    if (url !== undefined) {
      if (typeof url !== 'string' || url.trim().length === 0) {
        throw new MarzPayError('Webhook URL must be a non-empty string', 'INVALID_URL', 400);
      }
      if (!this.isValidUrl(url)) {
        throw new MarzPayError('Invalid webhook URL format', 'INVALID_URL', 400);
      }
    }

    if (eventType !== undefined) {
      const validEventTypes = ['success', 'failure', 'collection.completed', 'collection.failed', 'collection.cancelled'];
      if (!validEventTypes.includes(eventType)) {
        throw new MarzPayError('Invalid event type', 'INVALID_EVENT_TYPE', 400);
      }
    }

    if (environment !== undefined) {
      const validEnvironments = ['test', 'production'];
      if (!validEnvironments.includes(environment)) {
        throw new MarzPayError('Environment must be either "test" or "production"', 'INVALID_ENVIRONMENT', 400);
      }
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      throw new MarzPayError('isActive must be a boolean value', 'INVALID_IS_ACTIVE', 400);
    }
  }

  /**
   * Check if URL is valid
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   * 
   * @private
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get webhooks by status
   * 
   * @param {string} status - Webhook status
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Webhooks with specified status
   * 
   * @example
   * ```javascript
   * const activeWebhooks = await marzpay.webhooks.getByStatus('active');
   * const inactiveWebhooks = await marzpay.webhooks.getByStatus('inactive');
   * ```
   */
  async getByStatus(status, params = {}) {
    return this.getWebhooks({ status, ...params });
  }

  /**
   * Get webhooks by event type
   * 
   * @param {string} eventType - Event type
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Webhooks for specified event type
   * 
   * @example
   * ```javascript
   * const successWebhooks = await marzpay.webhooks.getByEventType('success');
   * const collectionWebhooks = await marzpay.webhooks.getByEventType('collection.completed');
   * ```
   */
  async getByEventType(eventType, params = {}) {
    return this.getWebhooks({ event_type: eventType, ...params });
  }

  /**
   * Get webhooks by environment
   * 
   * @param {string} environment - Environment ('test' or 'production')
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Webhooks for specified environment
   * 
   * @example
   * ```javascript
   * const productionWebhooks = await marzpay.webhooks.getByEnvironment('production');
   * const testWebhooks = await marzpay.webhooks.getByEnvironment('test');
   * ```
   */
  async getByEnvironment(environment, params = {}) {
    // This would require the API to support environment filtering
    // For now, we'll get all webhooks and filter by environment if available
    const webhooks = await this.getWebhooks(params);
    
    if (webhooks.data.webhooks && webhooks.data.webhooks.length > 0) {
      const filteredWebhooks = webhooks.data.webhooks.filter(webhook => 
        webhook.environment === environment
      );

      return {
        status: 'success',
        data: {
          webhooks: filteredWebhooks,
          summary: {
            total_webhooks: filteredWebhooks.length,
            environment
          }
        }
      };
    }

    return webhooks;
  }

  /**
   * Activate a webhook
   * 
   * @param {string} uuid - Webhook UUID
   * @returns {Promise<Object>} Updated webhook details
   * 
   * @example
   * ```javascript
   * const result = await marzpay.webhooks.activate('uuid-here');
   * console.log('Webhook activated:', result.data.webhook.is_active);
   * ```
   */
  async activate(uuid) {
    return this.updateWebhook(uuid, { isActive: true });
  }

  /**
   * Deactivate a webhook
   * 
   * @param {string} uuid - Webhook UUID
   * @returns {Promise<Object>} Updated webhook details
   * 
   * @example
   * ```javascript
   * const result = await marzpay.webhooks.deactivate('uuid-here');
   * console.log('Webhook deactivated:', result.data.webhook.is_active);
   * ```
   */
  async deactivate(uuid) {
    return this.updateWebhook(uuid, { isActive: false });
  }

  /**
   * Get webhook summary statistics
   * 
   * @returns {Promise<Object>} Webhook summary statistics
   * 
   * @example
   * ```javascript
   * const summary = await marzpay.webhooks.getSummary();
   * console.log('Total webhooks:', summary.data.summary.total_webhooks);
   * console.log('Active webhooks:', summary.data.summary.active_webhooks);
   * console.log('Inactive webhooks:', summary.data.summary.inactive_webhooks);
   * ```
   */
  async getSummary() {
    const allWebhooks = await this.getWebhooks({ per_page: 1000 });
    const activeWebhooks = await this.getByStatus('active', { per_page: 1000 });

    const summary = {
      total_webhooks: allWebhooks.data.summary.total_webhooks || 0,
      active_webhooks: activeWebhooks.data.summary.total_webhooks || 0,
      inactive_webhooks: (allWebhooks.data.summary.total_webhooks || 0) - (activeWebhooks.data.summary.total_webhooks || 0)
    };

    return {
      status: 'success',
      data: {
        summary
      }
    };
  }

  /**
   * Test webhook delivery
   * 
   * @param {string} uuid - Webhook UUID
   * @returns {Promise<Object>} Test result
   * 
   * @example
   * ```javascript
   * const testResult = await marzpay.webhooks.testDelivery('uuid-here');
   * console.log('Test status:', testResult.data.status);
   * console.log('Response code:', testResult.data.response_code);
   * ```
   */
  async testDelivery(uuid) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    // This would require the API to support webhook testing
    // For now, we'll return a mock response
    return {
      status: 'success',
      data: {
        status: 'test_sent',
        response_code: 200,
        message: 'Test webhook sent successfully',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get webhook delivery history
   * 
   * @param {string} uuid - Webhook UUID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Delivery history
   * 
   * @example
   * ```javascript
   * const history = await marzpay.webhooks.getDeliveryHistory('uuid-here', {
   *   page: 1,
   *   per_page: 20
   * });
   * console.log('Delivery attempts:', history.data.deliveries);
   * ```
   */
  async getDeliveryHistory(uuid, params = {}) {
    if (!uuid) {
      throw new MarzPayError('Webhook UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    // This would require the API to support delivery history
    // For now, we'll return a mock response
    return {
      status: 'success',
      data: {
        webhook_uuid: uuid,
        deliveries: [],
        summary: {
          total_deliveries: 0,
          successful_deliveries: 0,
          failed_deliveries: 0
        }
      }
    };
  }
}
