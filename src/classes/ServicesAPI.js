import { MarzPayError } from '../errors/MarzPayError.js';

/**
 * Services API - Service management and availability
 * 
 * This class handles all service-related operations including:
 * - Getting available services
 * - Retrieving service details
 * - Service status and capabilities
 * 
 * @example
 * ```javascript
 * const marzpay = new MarzPay(config);
 * 
 * // Get available services
 * const services = await marzpay.services.getServices({
 *   type: 'collection',
 *   provider: 'mtn'
 * });
 * ```
 */
export class ServicesAPI {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  /**
   * Get all available services with optional filtering
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.type] - Service type ('collection', 'withdrawal')
   * @param {string} [params.provider] - Mobile money provider ('mtn', 'airtel')
   * @param {string} [params.status] - Service status ('active', 'inactive')
   * 
   * @returns {Promise<Object>} Services list with details
   * 
   * @throws {MarzPayError} When validation fails or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const services = await marzpay.services.getServices({
   *     type: 'collection',
   *     provider: 'mtn',
   *     status: 'active'
   *   });
   *   
   *   console.log('Total services:', services.data.summary.total_services);
   *   console.log('Available providers:', services.data.summary.total_providers);
   *   console.log('Available countries:', services.data.summary.total_countries);
   * } catch (error) {
   *   console.error('Failed to get services:', error.message);
   * }
   * ```
   */
  async getServices(params = {}) {
    // Validate parameters
    this.validateServiceParams(params);

    // Build query string
    const queryString = this.marzpay.utils.buildQueryString(params);

    return this.marzpay.request(`/services?${queryString}`);
  }

  /**
   * Get service details by UUID
   * 
   * @param {string} uuid - Service UUID
   * @returns {Promise<Object>} Service details
   * 
   * @throws {MarzPayError} When UUID is missing or API request fails
   * 
   * @example
   * ```javascript
   * try {
   *   const service = await marzpay.services.getService('uuid-here');
   *   console.log('Service name:', service.data.service.name);
   *   console.log('Service type:', service.data.service.type);
   *   console.log('Provider:', service.data.service.provider);
   *   console.log('Status:', service.data.service.status);
   * } catch (error) {
   *   console.error('Failed to get service:', error.message);
   * }
   * ```
   */
  async getService(uuid) {
    if (!uuid) {
      throw new MarzPayError('Service UUID is required', 'MISSING_UUID', 400);
    }

    if (!this.marzpay.utils.isValidUUID(uuid)) {
      throw new MarzPayError('Invalid UUID format', 'INVALID_UUID', 400);
    }

    return this.marzpay.request(`/services/${uuid}`);
  }

  /**
   * Validate service query parameters
   * 
   * @param {Object} params - Parameters to validate
   * @throws {MarzPayError} When validation fails
   * 
   * @private
   */
  validateServiceParams(params) {
    const { type, provider, status } = params;

    if (type !== undefined) {
      const validTypes = ['collection', 'withdrawal'];
      if (!validTypes.includes(type)) {
        throw new MarzPayError('Invalid service type', 'INVALID_TYPE', 400);
      }
    }

    if (provider !== undefined) {
      const validProviders = ['mtn', 'airtel'];
      if (!validProviders.includes(provider)) {
        throw new MarzPayError('Invalid provider', 'INVALID_PROVIDER', 400);
      }
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        throw new MarzPayError('Invalid service status', 'INVALID_STATUS', 400);
      }
    }
  }

  /**
   * Get services by type
   * 
   * @param {string} type - Service type
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Services of specified type
   * 
   * @example
   * ```javascript
   * const collectionServices = await marzpay.services.getByType('collection');
   * const withdrawalServices = await marzpay.services.getByType('withdrawal');
   * ```
   */
  async getByType(type, params = {}) {
    return this.getServices({ type, ...params });
  }

  /**
   * Get services by provider
   * 
   * @param {string} provider - Mobile money provider
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Services from specified provider
   * 
   * @example
   * ```javascript
   * const mtnServices = await marzpay.services.getByProvider('mtn');
   * const airtelServices = await marzpay.services.getByProvider('airtel');
   * ```
   */
  async getByProvider(provider, params = {}) {
    return this.getServices({ provider, ...params });
  }

  /**
   * Get active services only
   * 
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Active services
   * 
   * @example
   * ```javascript
   * const activeServices = await marzpay.services.getActive();
   * console.log('Active services count:', activeServices.data.summary.total_services);
   * ```
   */
  async getActive(params = {}) {
    return this.getServices({ status: 'active', ...params });
  }

  /**
   * Get collection services
   * 
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Collection services
   * 
   * @example
   * ```javascript
   * const collectionServices = await marzpay.services.getCollectionServices();
   * console.log('Collection services:', collectionServices.data.services);
   * ```
   */
  async getCollectionServices(params = {}) {
    return this.getByType('collection', params);
  }

  /**
   * Get withdrawal services
   * 
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Withdrawal services
   * 
   * @example
   * ```javascript
   * const withdrawalServices = await marzpay.services.getWithdrawalServices();
   * console.log('Withdrawal services:', withdrawalServices.data.services);
   * ```
   */
  async getWithdrawalServices(params = {}) {
    return this.getByType('withdrawal', params);
  }

  /**
   * Get service summary statistics
   * 
   * @returns {Promise<Object>} Service summary statistics
   * 
   * @example
   * ```javascript
   * const summary = await marzpay.services.getSummary();
   * console.log('Total services:', summary.data.summary.total_services);
   * console.log('Active services:', summary.data.summary.active_services);
   * console.log('Inactive services:', summary.data.summary.inactive_services);
   * ```
   */
  async getSummary() {
    const allServices = await this.getServices({ per_page: 1000 });
    const activeServices = await this.getActive({ per_page: 1000 });

    const summary = {
      total_services: allServices.data.summary.total_services || 0,
      active_services: activeServices.data.summary.total_services || 0,
      inactive_services: (allServices.data.summary.total_services || 0) - (activeServices.data.summary.total_services || 0),
      total_providers: allServices.data.summary.total_providers || 0,
      total_countries: allServices.data.summary.total_countries || 0
    };

    return {
      status: 'success',
      data: {
        summary
      }
    };
  }

  /**
   * Check if service is available
   * 
   * @param {string} type - Service type
   * @param {string} provider - Mobile money provider
   * @returns {Promise<boolean>} True if service is available
   * 
   * @example
   * ```javascript
   * const isAvailable = await marzpay.services.isServiceAvailable('collection', 'mtn');
   * if (isAvailable) {
   *   console.log('MTN collection service is available');
   * } else {
   *   console.log('MTN collection service is not available');
   * }
   * ```
   */
  async isServiceAvailable(type, provider) {
    try {
      const services = await this.getServices({ type, provider, status: 'active' });
      return services.data.summary.total_services > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service capabilities
   * 
   * @param {string} uuid - Service UUID
   * @returns {Promise<Object>} Service capabilities
   * 
   * @example
   * ```javascript
   * const capabilities = await marzpay.services.getServiceCapabilities('uuid-here');
   * console.log('Supported countries:', capabilities.data.service.countries);
   * console.log('Supported currencies:', capabilities.data.service.currencies);
   * console.log('Limits:', capabilities.data.service.limits);
   * ```
   */
  async getServiceCapabilities(uuid) {
    const service = await this.getService(uuid);
    
    return {
      status: 'success',
      data: {
        service: {
          countries: service.data.service.countries || [],
          currencies: service.data.service.currencies || [],
          limits: service.data.service.limits || {},
          features: service.data.service.features || []
        }
      }
    };
  }

  /**
   * Get service status
   * 
   * @param {string} uuid - Service UUID
   * @returns {Promise<Object>} Service status
   * 
   * @example
   * ```javascript
   * const status = await marzpay.services.getServiceStatus('uuid-here');
   * console.log('Service status:', status.data.service.status);
   * console.log('Last updated:', status.data.service.updated_at);
   * ```
   */
  async getServiceStatus(uuid) {
    const service = await this.getService(uuid);
    
    return {
      status: 'success',
      data: {
        service: {
          status: service.data.service.status,
          updated_at: service.data.service.updated_at,
          is_active: service.data.service.status === 'active'
        }
      }
    };
  }

  /**
   * Get services by country
   * 
   * @param {string} country - Country code (e.g., 'UG')
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Services available in specified country
   * 
   * @example
   * ```javascript
   * const ugandaServices = await marzpay.services.getByCountry('UG');
   * console.log('Services in Uganda:', ugandaServices.data.services);
   * ```
   */
  async getByCountry(country, params = {}) {
    if (!country || typeof country !== 'string') {
      throw new MarzPayError('Country code is required', 'MISSING_COUNTRY', 400);
    }

    if (country.length !== 2) {
      throw new MarzPayError('Country code must be 2 characters', 'INVALID_COUNTRY_CODE', 400);
    }

    // This would require the API to support country filtering
    // For now, we'll get all services and filter by country if available
    const services = await this.getServices(params);
    
    if (services.data.services && services.data.services.length > 0) {
      const filteredServices = services.data.services.filter(service => 
        service.countries && service.countries.includes(country.toUpperCase())
      );

      return {
        status: 'success',
        data: {
          services: filteredServices,
          summary: {
            total_services: filteredServices.length,
            country: country.toUpperCase()
          }
        }
      };
    }

    return services;
  }

  /**
   * Compare services
   * 
   * @param {Array<string>} serviceUuids - Array of service UUIDs to compare
   * @returns {Promise<Object>} Service comparison
   * 
   * @example
   * ```javascript
   * const comparison = await marzpay.services.compareServices([
   *   'uuid-1',
   *   'uuid-2',
   *   'uuid-3'
   * ]);
   * console.log('Service comparison:', comparison.data.comparison);
   * ```
   */
  async compareServices(serviceUuids) {
    if (!Array.isArray(serviceUuids) || serviceUuids.length < 2) {
      throw new MarzPayError('At least 2 service UUIDs are required for comparison', 'INSUFFICIENT_SERVICES', 400);
    }

    if (serviceUuids.length > 5) {
      throw new MarzPayError('Maximum 5 services can be compared at once', 'TOO_MANY_SERVICES', 400);
    }

    // Validate all UUIDs
    for (const uuid of serviceUuids) {
      if (!this.marzpay.utils.isValidUUID(uuid)) {
        throw new MarzPayError(`Invalid UUID format: ${uuid}`, 'INVALID_UUID', 400);
      }
    }

    // Get all services
    const services = await Promise.all(
      serviceUuids.map(uuid => this.getService(uuid))
    );

    // Create comparison object
    const comparison = {
      services: services.map(service => ({
        uuid: service.data.service.uuid,
        name: service.data.service.name,
        type: service.data.service.type,
        provider: service.data.service.provider,
        status: service.data.service.status,
        countries: service.data.service.countries || [],
        currencies: service.data.service.currencies || [],
        limits: service.data.service.limits || {},
        features: service.data.service.features || []
      })),
      summary: {
        total_services: services.length,
        active_services: services.filter(s => s.data.service.status === 'active').length,
        types: [...new Set(services.map(s => s.data.service.type))],
        providers: [...new Set(services.map(s => s.data.service.provider))]
      }
    };

    return {
      status: 'success',
      data: {
        comparison
      }
    };
  }
}
