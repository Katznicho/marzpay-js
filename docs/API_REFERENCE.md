# MarzPay JavaScript Library - API Reference

## Table of Contents

- [Core Classes](#core-classes)
- [Collections API](#collections-api)
- [Disbursements API](#disbursements-api)
- [Accounts API](#accounts-api)
- [Balance API](#balance-api)
- [Transactions API](#transactions-api)
- [Services API](#services-api)
- [Webhooks API](#webhooks-api)
- [Utilities](#utilities)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Core Classes

### MarzPay

The main class that initializes the MarzPay SDK and provides access to all API modules.

```javascript
import MarzPay from 'marzpay-js';

const marzpay = new MarzPay({
  apiUser: 'your_username',
  apiKey: 'your_api_key',
  baseUrl: 'https://wallet.wearemarz.com/api/v1',
  timeout: 30000
});
```

#### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiUser` | string | - | Your MarzPay API username |
| `apiKey` | string | - | Your MarzPay API key |
| `baseUrl` | string | `'https://wallet.wearemarz.com/api/v1'` | API base URL |
| `timeout` | number | `30000` | Request timeout in milliseconds |

#### Methods

##### `setCredentials(apiUser, apiKey)`

Update API credentials at runtime.

```javascript
marzpay.setCredentials('new_username', 'new_api_key');
```

##### `getAuthHeader()`

Get the current authentication header.

```javascript
const authHeader = marzpay.getAuthHeader();
// Returns: "Basic base64_encoded_credentials"
```

## Collections API

The Collections API handles money collection from customers via mobile money.

### Methods

#### `collectMoney(params)`

Initiate a money collection from a customer.

```javascript
const result = await marzpay.collections.collectMoney({
  amount: 5000,
  phoneNumber: '0759983853',
  description: 'Payment for services',
  callbackUrl: 'https://yoursite.com/webhook',
  country: 'UG'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount in UGX (500-10,000,000) |
| `phoneNumber` | string | Yes | Customer's phone number |
| `description` | string \| null | No | Payment description |
| `callbackUrl` | string \| null | No | Custom webhook URL |
| `country` | string | No | Country code (default: 'UG') |

**Returns:** Promise with collection result

**Example Response:**
```json
{
  "status": "success",
  "message": "Collection initiated successfully",
  "data": {
    "transaction": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "reference": "ref-123456",
      "status": "processing",
      "provider_reference": "mtn-ref-789"
    },
    "collection": {
      "amount": {
        "formatted": "5,000 UGX",
        "raw": "5000",
        "currency": "UGX"
      },
      "provider": "MTN",
      "phone_number": "+256759983853",
      "mode": "mobile_money"
    }
  }
}
```

#### `getCollection(uuid)`

Get collection details by UUID.

```javascript
const collection = await marzpay.collections.getCollection('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Collection transaction UUID |

**Returns:** Promise with collection details

#### `getCollectionServices()`

Get available collection services for the business.

```javascript
const services = await marzpay.collections.getCollectionServices();
```

**Returns:** Promise with available services

#### `getStatus(uuid)`

Get collection status (alias for `getCollection`).

```javascript
const status = await marzpay.collections.getStatus('uuid-here');
```

#### `isValidAmount(amount)`

Check if collection amount is within limits.

```javascript
const isValid = marzpay.collections.isValidAmount(5000); // true
const isInvalid = marzpay.collections.isValidAmount(100); // false
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount to validate |

**Returns:** boolean

#### `getLimits()`

Get collection amount limits.

```javascript
const limits = marzpay.collections.getLimits();
// Returns: { min: 500, max: 10000000, currency: 'UGX' }
```

**Returns:** Object with limits

## Disbursements API

The Disbursements API handles sending money to customers via mobile money.

### Methods

#### `sendMoney(params)`

Send money to a customer.

```javascript
const result = await marzpay.disbursements.sendMoney({
  amount: 1000,
  phoneNumber: '0759983853',
  description: 'Refund payment',
  callbackUrl: 'https://yoursite.com/webhook',
  country: 'UG'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount in UGX (1,000-500,000) |
| `phoneNumber` | string | Yes | Customer's phone number |
| `description` | string \| null | No | Payment description |
| `callbackUrl` | string \| null | No | Custom webhook URL |
| `country` | string | No | Country code (default: 'UG') |

**Returns:** Promise with disbursement result

**Example Response:**
```json
{
  "status": "success",
  "message": "Withdrawal initiated successfully",
  "data": {
    "transaction": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "reference": "ref-123456",
      "status": "processing",
      "provider_reference": "mtn-ref-789"
    },
    "withdrawal": {
      "amount": {
        "formatted": "1,000 UGX",
        "raw": "1000",
        "currency": "UGX"
      },
      "charge": {
        "formatted": "50 UGX",
        "raw": "50",
        "currency": "UGX",
        "percentage": "5%"
      },
      "total_deduction": {
        "formatted": "1,050 UGX",
        "raw": "1050",
        "currency": "UGX"
      },
      "provider": "MTN",
      "phone_number": "+256759983853",
      "mode": "mobile_money"
    }
  }
}
```

#### `getDisbursement(uuid)`

Get disbursement details by UUID.

```javascript
const disbursement = await marzpay.disbursements.getDisbursement('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Disbursement transaction UUID |

**Returns:** Promise with disbursement details

#### `getDisbursementServices()`

Get available disbursement services for the business.

```javascript
const services = await marzpay.disbursements.getDisbursementServices();
```

**Returns:** Promise with available services

## Accounts API

The Accounts API handles business account information and updates.

### Methods

#### `getAccountInfo()`

Get business account information.

```javascript
const account = await marzpay.accounts.getAccountInfo();
```

**Returns:** Promise with account information

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "account": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "business_name": "My Business",
      "email": "business@example.com",
      "contact_phone": "+256759983853",
      "business_address": "123 Main St",
      "business_city": "Kampala",
      "business_country": "Uganda",
      "balance": {
        "formatted": "100,000 UGX",
        "raw": "100000",
        "currency": "UGX"
      },
      "status": {
        "account_status": "active",
        "is_frozen": "false",
        "freeze_reason": null,
        "is_verified": "true"
      }
    }
  }
}
```

#### `updateAccount(settings)`

Update business account information.

```javascript
const result = await marzpay.accounts.updateAccount({
  business_name: 'Updated Business Name',
  contact_phone: '+256759983853',
  business_address: '456 New St',
  business_city: 'Kampala',
  business_country: 'Uganda'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `business_name` | string \| null | No | Business name |
| `contact_phone` | string \| null | No | Contact phone number |
| `business_address` | string \| null | No | Business address |
| `business_city` | string \| null | No | Business city |
| `business_country` | string \| null | No | Business country |

**Returns:** Promise with updated account information

## Balance API

The Balance API handles account balance information and history.

### Methods

#### `getBalance()`

Get current account balance.

```javascript
const balance = await marzpay.balance.getBalance();
```

**Returns:** Promise with balance information

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "account": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "business_name": "My Business",
      "balance": {
        "formatted": "100,000 UGX",
        "raw": "100000",
        "currency": "UGX"
      },
      "status": {
        "mode": "live",
        "account_status": "active",
        "is_frozen": "false",
        "freeze_reason": null
      },
      "limits": {
        "withdrawal": {
          "minimum": "1,000",
          "maximum": "500,000"
        },
        "deposit": {
          "minimum": "500",
          "maximum": "10,000,000"
        }
      }
    },
    "summary": {
      "monthly": {
        "credits": "500,000",
        "debits": "400,000",
        "net_change": "100,000",
        "transaction_count": "25"
      }
    }
  }
}
```

#### `getBalanceHistory(params)`

Get detailed balance history.

```javascript
const history = await marzpay.balance.getBalanceHistory({
  page: 1,
  per_page: 20,
  operation: 'credit',
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `per_page` | number | No | Items per page (1-100, default: 20) |
| `operation` | string | No | Filter by operation ('credit' or 'debit') |
| `start_date` | string | No | Start date (ISO format) |
| `end_date` | string | No | End date (ISO format) |

**Returns:** Promise with balance history

## Transactions API

The Transactions API handles transaction queries and details.

### Methods

#### `getTransactions(params)`

Get all transactions with optional filtering.

```javascript
const transactions = await marzpay.transactions.getTransactions({
  page: 1,
  per_page: 20,
  type: 'collection',
  status: 'successful',
  provider: 'mtn',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  reference: 'ref-123'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `per_page` | number | No | Items per page (1-100, default: 20) |
| `type` | string | No | Transaction type ('collection', 'withdrawal', 'charge', 'refund') |
| `status` | string | No | Transaction status ('pending', 'processing', 'successful', 'failed', 'cancelled') |
| `provider` | string | No | Mobile money provider ('mtn', 'airtel') |
| `start_date` | string | No | Start date (ISO format) |
| `end_date` | string | No | End date (ISO format) |
| `reference` | string | No | Transaction reference |

**Returns:** Promise with transactions list

#### `getTransaction(uuid)`

Get transaction details by UUID.

```javascript
const transaction = await marzpay.transactions.getTransaction('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Transaction UUID |

**Returns:** Promise with transaction details

## Services API

The Services API handles available services and subscriptions.

### Methods

#### `getServices(params)`

Get all available services with optional filtering.

```javascript
const services = await marzpay.services.getServices({
  type: 'collection',
  provider: 'mtn',
  status: 'active'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Service type ('collection', 'withdrawal') |
| `provider` | string | No | Mobile money provider ('mtn', 'airtel') |
| `status` | string | No | Service status ('active', 'inactive') |

**Returns:** Promise with services list

#### `getService(uuid)`

Get service details by UUID.

```javascript
const service = await marzpay.services.getService('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Service UUID |

**Returns:** Promise with service details

## Webhooks API

The Webhooks API handles webhook management for payment notifications.

### Methods

#### `getWebhooks(params)`

Get all webhooks with optional filtering.

```javascript
const webhooks = await marzpay.webhooks.getWebhooks({
  status: 'active',
  event_type: 'collection.completed'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Webhook status ('active', 'inactive') |
| `event_type` | string | No | Event type filter |

**Returns:** Promise with webhooks list

#### `createWebhook(params)`

Create a new webhook.

```javascript
const webhook = await marzpay.webhooks.createWebhook({
  name: 'Payment Notification',
  url: 'https://yoursite.com/webhook',
  eventType: 'collection.completed',
  environment: 'production',
  isActive: true
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Webhook name |
| `url` | string | Yes | Webhook URL |
| `eventType` | string | Yes | Event type ('success', 'failure', 'collection.completed', 'collection.failed', 'collection.cancelled') |
| `environment` | string | Yes | Environment ('test', 'production') |
| `isActive` | boolean | No | Whether webhook is active (default: true) |

**Returns:** Promise with created webhook

#### `getWebhook(uuid)`

Get webhook details by UUID.

```javascript
const webhook = await marzpay.webhooks.getWebhook('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Webhook UUID |

**Returns:** Promise with webhook details

#### `updateWebhook(uuid, params)`

Update an existing webhook.

```javascript
const result = await marzpay.webhooks.updateWebhook('uuid-here', {
  name: 'Updated Name',
  url: 'https://newsite.com/webhook',
  isActive: false
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Webhook UUID |
| `params` | object | Yes | Update parameters (same as createWebhook) |

**Returns:** Promise with updated webhook

#### `deleteWebhook(uuid)`

Delete a webhook.

```javascript
const result = await marzpay.webhooks.deleteWebhook('uuid-here');
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Webhook UUID |

**Returns:** Promise with deletion confirmation

## Utilities

The Utilities class provides helper methods for common operations.

### Methods

#### `formatPhoneNumber(phone)`

Format phone number to international format.

```javascript
const formatted = marzpay.utils.formatPhoneNumber('0759983853');
// Returns: '+256759983853'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Phone number in any format |

**Returns:** string | null

#### `isValidPhoneNumber(phone)`

Validate phone number format.

```javascript
const isValid = marzpay.utils.isValidPhoneNumber('0759983853'); // true
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Phone number to validate |

**Returns:** boolean

#### `isValidAmount(amount, min, max)`

Validate amount within specified range.

```javascript
const isValid = marzpay.utils.isValidAmount(5000, 1000, 10000); // true
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount to validate |
| `min` | number | No | Minimum value (default: 100) |
| `max` | number | No | Maximum value (default: 10,000,000) |

**Returns:** boolean

#### `generateReference()`

Generate a unique UUID reference.

```javascript
const reference = marzpay.utils.generateReference();
// Returns: '550e8400-e29b-41d4-a716-446655440000'
```

**Returns:** string

#### `formatAmount(amount)`

Format amount to UGX currency string.

```javascript
const formatted = marzpay.utils.formatAmount(5000);
// Returns: 'UGX 5,000.00'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount to format |

**Returns:** string

#### `parseAmount(amountString)`

Parse amount from UGX currency string.

```javascript
const amount = marzpay.utils.parseAmount('UGX 5,000.00');
// Returns: 5000
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amountString` | string | Yes | Amount string to parse |

**Returns:** number

#### `buildQueryString(params)`

Build query string from parameters object.

```javascript
const queryString = marzpay.utils.buildQueryString({
  page: 1,
  per_page: 20,
  status: 'active'
});
// Returns: 'page=1&per_page=20&status=active'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Parameters object |

**Returns:** string

#### `isValidUUID(uuid)`

Validate UUID format.

```javascript
const isValid = marzpay.utils.isValidUUID('550e8400-e29b-41d4-a716-446655440000');
// Returns: true
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | UUID to validate |

**Returns:** boolean

#### `sanitizeString(input)`

Sanitize input string to prevent XSS.

```javascript
const sanitized = marzpay.utils.sanitizeString('<script>alert("xss")</script>');
// Returns: 'scriptalert("xss")/script'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | any | Yes | Input to sanitize |

**Returns:** any

## Error Handling

The library provides comprehensive error handling with custom `MarzPayError` class.

### MarzPayError Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Error name ('MarzPayError') |
| `message` | string | Error message |
| `code` | string | Error code for programmatic handling |
| `status` | number | HTTP status code |
| `details` | object | Additional error details |
| `timestamp` | string | Error timestamp (ISO format) |

### Error Methods

#### `getSummary()`

Get error summary for logging.

```javascript
const summary = error.getSummary();
// Returns: { name, code, status, message, timestamp }
```

#### `isValidationError()`

Check if error is a validation error (4xx status).

```javascript
if (error.isValidationError()) {
  // Handle validation errors
}
```

#### `isServerError()`

Check if error is a server error (5xx status).

```javascript
if (error.isServerError()) {
  // Handle server errors
}
```

#### `isNetworkError()`

Check if error is a network error.

```javascript
if (error.isNetworkError()) {
  // Handle network errors
}
```

#### `getUserMessage()`

Get user-friendly error message.

```javascript
const userMessage = error.getUserMessage();
// Returns message suitable for end users
```

#### `toJSON()`

Convert error to JSON for serialization.

```javascript
const errorJson = error.toJSON();
// Useful for logging or error tracking
```

### Static Error Creation Methods

#### `MarzPayError.fromResponse(response, status)`

Create error from API response.

```javascript
const error = MarzPayError.fromResponse(apiResponse, 400);
```

#### `MarzPayError.networkError(message)`

Create network error.

```javascript
const error = MarzPayError.networkError('Failed to connect to server');
```

#### `MarzPayError.validationError(message, code)`

Create validation error.

```javascript
const error = MarzPayError.validationError('Invalid phone number', 'INVALID_PHONE');
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_AMOUNT` | Amount outside allowed range | 400 |
| `INVALID_PHONE` | Invalid phone number format | 400 |
| `MISSING_UUID` | Transaction reference missing | 400 |
| `INVALID_UUID` | Invalid UUID format | 400 |
| `INVALID_CREDENTIALS` | API credentials invalid | 401 |
| `ACCOUNT_FROZEN` | Account is frozen | 403 |
| `NETWORK_ERROR` | Network connection failed | 0 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

### Error Handling Best Practices

```javascript
try {
  const result = await marzpay.collections.collectMoney(params);
} catch (error) {
  if (error instanceof MarzPayError) {
    // Handle MarzPay-specific errors
    switch (error.code) {
      case 'INVALID_AMOUNT':
        console.log('Amount must be between 500 and 10,000,000 UGX');
        break;
      case 'INVALID_PHONE':
        console.log('Please enter a valid phone number');
        break;
      case 'ACCOUNT_FROZEN':
        console.log('Account is frozen. Contact support.');
        break;
      default:
        console.error('MarzPay error:', error.getUserMessage());
    }
    
    // Log error for debugging
    console.error('Error details:', error.getSummary());
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## Examples

### Complete Payment Flow

```javascript
import MarzPay from 'marzpay-js';

const marzpay = new MarzPay({
  apiUser: 'your_username',
  apiKey: 'your_api_key'
});

async function processPayment() {
  try {
    // 1. Collect money from customer
    const collection = await marzpay.collections.collectMoney({
      amount: 10000,
      phoneNumber: '0759983853',
      description: 'Product purchase',
      callbackUrl: 'https://yoursite.com/webhook'
    });
    
    console.log('Collection initiated:', collection.data.transaction.reference);
    
    // 2. Check collection status
    const status = await marzpay.collections.getStatus(
      collection.data.transaction.uuid
    );
    
    console.log('Collection status:', status.data.transaction.status);
    
    // 3. Get account balance
    const balance = await marzpay.balance.getBalance();
    console.log('Current balance:', balance.data.account.balance.formatted);
    
  } catch (error) {
    if (error instanceof MarzPayError) {
      console.error('Payment failed:', error.getUserMessage());
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

### Webhook Management

```javascript
// Create webhook for payment notifications
const webhook = await marzpay.webhooks.createWebhook({
  name: 'Payment Notifications',
  url: 'https://yoursite.com/webhook',
  eventType: 'collection.completed',
  environment: 'production'
});

// Get all webhooks
const webhooks = await marzpay.webhooks.getWebhooks({
  status: 'active'
});

// Update webhook
await marzpay.webhooks.updateWebhook(webhook.data.webhook.uuid, {
  isActive: false
});

// Delete webhook
await marzpay.webhooks.deleteWebhook(webhook.data.webhook.uuid);
```

### Transaction History

```javascript
// Get recent transactions
const transactions = await marzpay.transactions.getTransactions({
  page: 1,
  per_page: 10,
  type: 'collection',
  status: 'successful',
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// Get specific transaction details
const transaction = await marzpay.transactions.getTransaction(
  'transaction-uuid-here'
);
```

### Service Management

```javascript
// Get available services
const services = await marzpay.services.getServices({
  type: 'collection',
  provider: 'mtn',
  status: 'active'
});

// Get specific service details
const service = await marzpay.services.getService('service-uuid-here');
```

### Phone Number Validation

```javascript
// Test different phone number formats
const phoneNumbers = [
  '0759983853',      // Local format
  '256759983853',    // Country code
  '+256759983853'    // International format
];

phoneNumbers.forEach(phone => {
  const isValid = marzpay.utils.isValidPhoneNumber(phone);
  const formatted = marzpay.utils.formatPhoneNumber(phone);
  
  console.log(`${phone} -> ${formatted} (Valid: ${isValid})`);
});
```

### Error Handling with Retry Logic

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof MarzPayError) {
        if (error.isNetworkError() && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
      throw error;
    }
  }
}

// Usage
const result = await retryOperation(() => 
  marzpay.collections.collectMoney(params)
);
```
