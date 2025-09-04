// MarzPay JavaScript Library Type Definitions

export interface MarzPayConfig {
  apiUser?: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface CollectionParams {
  amount: number;
  phoneNumber: string;
  description?: string | null;
  callbackUrl?: string | null;
  country?: string;
}

export interface DisbursementParams {
  amount: number;
  phoneNumber: string;
  description?: string | null;
  callbackUrl?: string | null;
  country?: string;
}

export interface WebhookParams {
  name: string;
  url: string;
  eventType: 'success' | 'failure' | 'collection.completed' | 'collection.failed' | 'collection.cancelled';
  environment: 'test' | 'production';
  isActive?: boolean;
}

export interface WebhookUpdateParams {
  name?: string | null;
  url?: string | null;
  eventType?: 'success' | 'failure' | 'collection.completed' | 'collection.failed' | 'collection.cancelled' | null;
  environment?: 'test' | 'production' | null;
  isActive?: boolean | null;
}

export interface TransactionParams {
  page?: number;
  per_page?: number;
  type?: 'collection' | 'withdrawal' | 'charge' | 'refund';
  status?: 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled';
  provider?: 'mtn' | 'airtel';
  start_date?: string;
  end_date?: string;
  reference?: string;
}

export interface ServiceParams {
  type?: 'collection' | 'withdrawal';
  provider?: 'mtn' | 'airtel';
  status?: 'active' | 'inactive';
}

export interface BalanceHistoryParams {
  page?: number;
  per_page?: number;
  operation?: 'credit' | 'debit';
  start_date?: string;
  end_date?: string;
}

export interface AccountUpdateParams {
  business_name?: string | null;
  contact_phone?: string | null;
  business_address?: string | null;
  business_city?: string | null;
  business_country?: string | null;
}

export interface MarzPayResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error_code?: string;
}

export interface CollectionResponse {
  transaction: {
    uuid: string;
    reference: string;
    status: string;
    provider_reference: string;
  };
  collection: {
    amount: {
      formatted: string;
      raw: string;
      currency: string;
    };
    provider: string;
    phone_number: string;
    mode: string;
    description?: string;
  };
  timeline: {
    initiated_at: string;
    estimated_settlement?: string;
    created_at?: string;
    updated_at?: string;
  };
  metadata: {
    response_timestamp: string;
    sandbox_mode?: string;
  };
}

export interface DisbursementResponse {
  transaction: {
    uuid: string;
    reference: string;
    status: string;
    provider_reference: string;
  };
  withdrawal: {
    amount: {
      formatted: string;
      raw: string;
      currency: string;
    };
    charge: {
      formatted: string;
      raw: string;
      currency: string;
      percentage: string;
    };
    total_deduction: {
      formatted: string;
      raw: string;
      currency: string;
    };
    provider: string;
    phone_number: string;
    mode: string;
    description?: string;
  };
  account: {
    uuid: string;
    balance_before: {
      formatted: string;
      raw: string;
      currency: string;
    };
    balance_after: {
      formatted: string;
      raw: string;
      currency: string;
    };
  };
  daily_limits: string;
  timeline: {
    initiated_at: string;
    estimated_settlement?: string;
  };
  metadata: {
    response_timestamp: string;
    sandbox_mode?: string;
  };
}

export interface TransactionResponse {
  transaction: {
    uuid: string;
    reference: string;
    provider_reference: string;
    amount: {
      formatted: string;
      raw: string;
      currency: string;
    };
    type: string;
    status: string;
    description: string;
    origin: string;
    method: string;
    transaction_for: string;
    is_reversed?: string;
    is_reversal?: string;
  };
  details: {
    provider: string;
    phone_number: string;
    names: string;
    email: string;
    ip_address: string;
    user_agent: string;
  };
  service?: {
    subscription: {
      uuid: string;
      status: string;
    };
    service: {
      uuid: string;
      name: string;
      provider: string;
      description: string;
    };
  } | null;
  payment_link?: {
    uuid: string;
    title: string;
    reference: string;
  } | null;
  charge_transaction?: {
    uuid: string;
    amount: {
      formatted: string;
      raw: string;
    };
    status: string;
  } | null;
  timeline: {
    created_at: string;
    updated_at: string;
  };
  reversal?: {
    reversed_at: string;
    reversal_reason: string;
    reversed_by_user: string;
    reversal_status: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface AccountInfo {
  account: {
    uuid: string;
    business_name: string;
    email: string;
    contact_phone: string;
    business_address: string;
    business_city: string;
    business_country: string;
    balance: {
      formatted: string;
      raw: string;
      currency: string;
    };
    status: {
      account_status: string;
      is_frozen: string;
      freeze_reason: string;
      is_verified: string;
    };
    limits: {
      withdrawal: {
        minimum: {
          formatted: string;
          raw: string;
        };
        maximum: {
          formatted: string;
          raw: string;
        };
      };
      deposit: {
        minimum: {
          formatted: string;
          raw: string;
        };
        maximum: {
          formatted: string;
          raw: string;
        };
      };
    };
    charges: {
      percentage_charge: string;
      fixed_charge: {
        formatted: string;
        raw: string;
      };
    };
    timeline: {
      created_at: string;
      updated_at: string;
      last_login_at: string | null;
    };
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface BalanceResponse {
  account: {
    uuid: string;
    business_name: string;
    balance: {
      formatted: string;
      raw: string;
      currency: string;
    };
    status: {
      mode: string;
      account_status: string;
      is_frozen: string;
      freeze_reason: string;
    };
    limits: {
      withdrawal: {
        minimum: string;
        maximum: string;
      };
      deposit: {
        minimum: string;
        maximum: string;
      };
    };
  };
  summary: {
    monthly: {
      credits: string;
      debits: string;
      net_change: string;
      transaction_count: string;
    };
    weekly: {
      credits: string;
      debits: string;
      net_change: string;
      transaction_count: string;
    };
    daily: {
      credits: string;
      debits: string;
      net_change: string;
      transaction_count: string;
      period: string;
    };
  };
  metadata: {
    last_updated: string;
    response_timestamp: string;
  };
}

export interface BalanceHistoryResponse {
  account: {
    uuid: string;
    current_balance: {
      formatted: string;
      raw: string;
      currency: string;
    };
  };
  history: string;
  pagination: {
    current_page: string;
    last_page: string;
    per_page: string;
    total: string;
    from: string;
    to: string;
  };
  filters: {
    operation: string;
    start_date: string;
    end_date: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface ServiceResponse {
  service: {
    uuid: string;
    name: string;
    provider: string;
    type: string;
    description: string;
    currency: string;
    mode: string;
    is_active: string;
    created_at: string;
    updated_at: string;
  };
  subscription?: {
    uuid: string;
    status: string;
    subscribed_at: string;
    expires_at: string | null;
    notes: string;
    settings: string;
  } | null;
  availability: {
    is_subscribed: boolean;
    can_subscribe: string;
    subscription_required: boolean;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface ServicesListResponse {
  account: {
    uuid: string;
  };
  services: string;
  summary: {
    total_services: string;
    subscribed_services: string;
    available_services: string;
  };
  filters: {
    type: string;
    provider: string | null;
    status: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface WebhookResponse {
  webhook: {
    uuid: string;
    name: string;
    url: string;
    event_type: string;
    environment: string;
    is_active: string;
    retry_count: string;
    last_triggered_at?: string | null;
    last_response_code?: string;
    last_response_body?: string;
    timeline: {
      created_at: string;
      updated_at: string;
    };
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface WebhooksListResponse {
  account: {
    uuid: string;
  };
  webhooks: string;
  summary: {
    total_webhooks: string;
    active_webhooks: string;
    inactive_webhooks: string;
  };
  filters: {
    status: string;
    event_type: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface CollectionServicesResponse {
  account: {
    uuid: string;
  };
  countries: string;
  summary: {
    total_countries: string;
    total_services: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface DisbursementServicesResponse {
  account: {
    uuid: string;
  };
  countries: string;
  summary: {
    total_countries: string;
    total_services: string;
  };
  metadata: {
    response_timestamp: string;
  };
}

export interface TransactionsListResponse {
  account: {
    uuid: string;
    current_balance: {
      formatted: string;
      raw: string;
      currency: string;
    };
  };
  transactions: string;
  pagination: {
    current_page: string;
    last_page: string;
    per_page: string;
    total: string;
    from: string;
    to: string;
  };
  filters: {
    type: string;
    status: string;
    provider: string | null;
    start_date: string;
    end_date: string;
    reference: string | null;
  };
  metadata: {
    response_timestamp: string;
  };
}

export class MarzPayError extends Error {
  constructor(message: string, code: string, status: number);
  code: string;
  status: number;
}

export class MarzPay {
  constructor(config?: MarzPayConfig);
  
  config: MarzPayConfig;
  collections: CollectionsAPI;
  disbursements: DisbursementsAPI;
  accounts: AccountsAPI;
  transactions: TransactionsAPI;
  webhooks: WebhooksAPI;
  services: ServicesAPI;
  balance: BalanceAPI;
  utils: Utils;
  
  setCredentials(apiUser: string, apiKey: string): void;
  getAuthHeader(): string;
  request(endpoint: string, options?: RequestOptions): Promise<any>;
}

export class CollectionsAPI {
  constructor(marzpay: MarzPay);
  
  collectMoney(params: CollectionParams): Promise<MarzPayResponse<CollectionResponse>>;
  getCollection(uuid: string): Promise<MarzPayResponse<CollectionResponse>>;
  getCollectionServices(): Promise<MarzPayResponse<CollectionServicesResponse>>;
  validateCollectionParams(params: CollectionParams): void;
}

export class DisbursementsAPI {
  constructor(marzpay: MarzPay);
  
  sendMoney(params: DisbursementParams): Promise<MarzPayResponse<DisbursementResponse>>;
  getDisbursement(uuid: string): Promise<MarzPayResponse<DisbursementResponse>>;
  getDisbursementServices(): Promise<MarzPayResponse<DisbursementServicesResponse>>;
  validateDisbursementParams(params: DisbursementParams): void;
}

export class AccountsAPI {
  constructor(marzpay: MarzPay);
  
  getAccountInfo(): Promise<MarzPayResponse<AccountInfo>>;
  updateAccount(settings: AccountUpdateParams): Promise<MarzPayResponse<AccountInfo>>;
}

export class BalanceAPI {
  constructor(marzpay: MarzPay);
  
  getBalance(): Promise<MarzPayResponse<BalanceResponse>>;
  getBalanceHistory(params?: BalanceHistoryParams): Promise<MarzPayResponse<BalanceHistoryResponse>>;
}

export class TransactionsAPI {
  constructor(marzpay: MarzPay);
  
  getTransactions(params?: TransactionParams): Promise<MarzPayResponse<TransactionsListResponse>>;
  getTransaction(uuid: string): Promise<MarzPayResponse<TransactionResponse>>;
}

export class ServicesAPI {
  constructor(marzpay: MarzPay);
  
  getServices(params?: ServiceParams): Promise<MarzPayResponse<ServicesListResponse>>;
  getService(uuid: string): Promise<MarzPayResponse<ServiceResponse>>;
}

export class WebhooksAPI {
  constructor(marzpay: MarzPay);
  
  getWebhooks(params?: { status?: string; event_type?: string }): Promise<MarzPayResponse<WebhooksListResponse>>;
  createWebhook(params: WebhookParams): Promise<MarzPayResponse<WebhookResponse>>;
  getWebhook(uuid: string): Promise<MarzPayResponse<WebhookResponse>>;
  updateWebhook(uuid: string, params: WebhookUpdateParams): Promise<MarzPayResponse<WebhookResponse>>;
  deleteWebhook(uuid: string): Promise<MarzPayResponse<{ webhook: { uuid: string; name: string } }>>;
}

export class Utils {
  formatPhoneNumber(phone: string): string | null;
  isValidPhoneNumber(phone: string): boolean;
  isValidAmount(amount: number, min?: number, max?: number): boolean;
  generateReference(): string;
  formatAmount(amount: number): string;
  parseAmount(amountString: string): number;
  buildQueryString(params: Record<string, any>): string;
  isValidUUID(uuid: string): boolean;
  sanitizeString(input: any): any;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Global types for browser usage
declare global {
  interface Window {
    MarzPay: typeof MarzPay;
    MarzPayError: typeof MarzPayError;
  }
}
