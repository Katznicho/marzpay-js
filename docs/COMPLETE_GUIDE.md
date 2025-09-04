# MarzPay JavaScript Library - Complete Guide

## 🌟 **Overview**

The MarzPay JavaScript Library is a comprehensive, professional-grade SDK for integrating with the MarzPay mobile money payment platform in Uganda. This library provides a clean, modular architecture with separate classes for each API domain, comprehensive error handling, and extensive utility functions.

## 📚 **Table of Contents**

1. [Installation & Setup](#installation--setup)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Core Classes](#core-classes)
5. [API Reference](#api-reference)
6. [Error Handling](#error-handling)
7. [Utilities](#utilities)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

## 🚀 **Installation & Setup**

### **NPM Installation**

```bash
npm install marzpay-js
```

### **ES6 Import**

```javascript
import MarzPay from 'marzpay-js';
```

### **CommonJS Import**

```javascript
const MarzPay = require('marzpay-js');
```

### **Browser Import**

```html
<script src="https://unpkg.com/marzpay-js@latest/dist/marzpay.min.js"></script>
```

## ⚡ **Quick Start**

### **Basic Setup**

```javascript
import MarzPay from 'marzpay-js';

// Initialize the SDK
const marzpay = new MarzPay({
  apiUser: 'your_username',
  apiKey: 'your_api_key'
});

// Test connection
const connectionTest = await marzpay.testConnection();
console.log('Connection status:', connectionTest.status);
```

### **First Payment Collection**

```javascript
try {
  // Collect money from customer
  const result = await marzpay.collections.collectMoney({
    amount: 5000,
    phoneNumber: '0759983853',
    description: 'Payment for services'
  });
  
  console.log('Collection initiated:', result.data.transaction.reference);
} catch (error) {
  console.error('Collection failed:', error.message);
}
```

## 🏗️ **Architecture Overview**

The MarzPay library follows a modular, class-based architecture:

```
MarzPay (Main Class)
├── collections (CollectionsAPI)
├── disbursements (DisbursementsAPI)
├── accounts (AccountsAPI)
├── balance (BalanceAPI)
├── transactions (TransactionsAPI)
├── services (ServicesAPI)
├── webhooks (WebhooksAPI)
├── phoneUtils (PhoneNumberUtils)
└── utils (GeneralUtils)
```

### **Key Design Principles**

- **Separation of Concerns**: Each API domain has its own class
- **Dependency Injection**: All classes receive the main MarzPay instance
- **Consistent Interface**: All API methods follow the same pattern
- **Comprehensive Validation**: Input validation at multiple levels
- **Professional Error Handling**: Custom error classes with detailed information

## 🎯 **Core Classes**

### **1. MarzPay (Main Class)**

The main entry point that initializes all API modules and provides core functionality.

```javascript
const marzpay = new MarzPay({
  apiUser: 'username',
  apiKey: 'api_key',
  baseUrl: 'https://wallet.wearemarz.com/api/v1', // Optional
  timeout: 30000 // Optional, default: 30000ms
});
```

**Key Methods:**
- `testConnection()` - Test API connectivity
- `getInfo()` - Get SDK information
- `setCredentials()` - Update credentials at runtime

### **2. CollectionsAPI**

Handles money collection from customers via mobile money.

```javascript
// Collect money
const result = await marzpay.collections.collectMoney({
  amount: 5000,
  phoneNumber: '0759983853',
  description: 'Payment for services',
  callbackUrl: 'https://yoursite.com/webhook'
});

// Get collection details
const collection = await marzpay.collections.getCollection('uuid-here');

// Get available services
const services = await marzpay.collections.getCollectionServices();
```

**Features:**
- Amount validation (500 - 10,000,000 UGX)
- Phone number formatting and validation
- Automatic UUID generation
- Service availability checking

### **3. DisbursementsAPI**

Handles sending money to customers via mobile money.

```javascript
// Send money
const result = await marzpay.disbursements.sendMoney({
  amount: 1000,
  phoneNumber: '0759983853',
  description: 'Refund payment'
});

// Get disbursement details
const disbursement = await marzpay.disbursements.getDisbursement('uuid-here');

// Calculate fees
const fees = marzpay.disbursements.calculateFees(10000);
```

**Features:**
- Amount validation (1,000 - 500,000 UGX)
- Fee calculation
- Transaction history
- Service availability

### **4. AccountsAPI**

Manages business account information and settings.

```javascript
// Get account info
const account = await marzpay.accounts.getAccountInfo();

// Update account
const result = await marzpay.accounts.updateAccount({
  business_name: 'Updated Business Name',
  contact_phone: '+256759983853'
});

// Check account status
const isActive = await marzpay.accounts.isAccountActive();
const isVerified = await marzpay.accounts.isAccountVerified();
```

**Features:**
- Account information retrieval
- Profile updates
- Status checking
- Limits and capabilities

### **5. BalanceAPI**

Handles account balance and financial analytics.

```javascript
// Get current balance
const balance = await marzpay.balance.getBalance();

// Get balance history
const history = await marzpay.balance.getBalanceHistory({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  operation: 'credit'
});

// Get balance alerts
const alerts = await marzpay.balance.getBalanceAlerts();
```

**Features:**
- Current balance
- Historical data
- Period summaries
- Balance alerts
- Trend analysis

### **6. TransactionsAPI**

Manages transaction queries and analytics.

```javascript
// Get all transactions
const transactions = await marzpay.transactions.getTransactions({
  type: 'collection',
  status: 'successful',
  provider: 'mtn',
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// Get transaction details
const transaction = await marzpay.transactions.getTransaction('uuid-here');

// Get analytics
const analytics = await marzpay.transactions.getAnalytics('monthly', 6);
```

**Features:**
- Comprehensive filtering
- Transaction details
- Analytics and reporting
- Search and pagination
- Summary statistics

### **7. ServicesAPI**

Manages available services and capabilities.

```javascript
// Get all services
const services = await marzpay.services.getServices({
  type: 'collection',
  provider: 'mtn',
  status: 'active'
});

// Get service details
const service = await marzpay.services.getService('uuid-here');

// Check availability
const isAvailable = await marzpay.services.isServiceAvailable('collection', 'mtn');
```

**Features:**
- Service discovery
- Capability checking
- Provider filtering
- Service comparison
- Status monitoring

### **8. WebhooksAPI**

Manages webhook configurations for notifications.

```javascript
// Create webhook
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
await marzpay.webhooks.updateWebhook('uuid-here', {
  isActive: false
});
```

**Features:**
- Webhook creation and management
- Event type configuration
- Environment support
- Status monitoring
- Delivery testing

## 🛠️ **Utilities**

### **PhoneNumberUtils**

Advanced phone number handling for Uganda.

```javascript
// Format phone numbers
const formatted = marzpay.phoneUtils.formatPhoneNumber('0759983853');
// Returns: '+256759983853'

// Validate phone numbers
const isValid = marzpay.phoneUtils.isValidPhoneNumber('0759983853');

// Get provider information
const provider = marzpay.phoneUtils.getProvider('0759983853');
// Returns: 'mtn'

// Check provider compatibility
const isMtn = marzpay.phoneUtils.isFromProvider('0759983853', 'mtn');
```

**Features:**
- Multiple format support
- Provider detection
- Format conversion
- Validation
- Masking for privacy

### **GeneralUtils**

Comprehensive utility functions.

```javascript
// Amount formatting
const formatted = marzpay.utils.formatAmount(5000);
// Returns: 'UGX 5,000.00'

// UUID generation
const uuid = marzpay.utils.generateReference();

// Query string building
const queryString = marzpay.utils.buildQueryString({
  page: 1,
  per_page: 20,
  status: 'active'
});

// Date utilities
const range = marzpay.utils.getDateRange('week');
const isValid = marzpay.utils.isValidDate('2024-01-15');
```

**Features:**
- Currency formatting
- Data validation
- String manipulation
- Date handling
- Object utilities
- Performance helpers

## ⚠️ **Error Handling**

### **MarzPayError Class**

Professional error handling with detailed information.

```javascript
try {
  await marzpay.collections.collectMoney(invalidParams);
} catch (error) {
  if (error instanceof MarzPayError) {
    console.log('Error Code:', error.code);
    console.log('HTTP Status:', error.status);
    console.log('User Message:', error.getUserMessage());
    
    if (error.isValidationError()) {
      // Handle validation errors
    } else if (error.isServerError()) {
      // Handle server errors
    } else if (error.isNetworkError()) {
      // Handle network errors
    }
  }
}
```

**Error Properties:**
- `code` - Error code for programmatic handling
- `status` - HTTP status code
- `message` - Detailed error message
- `timestamp` - Error occurrence time
- `details` - Additional error context

**Error Methods:**
- `getSummary()` - Get error summary for logging
- `getUserMessage()` - Get user-friendly message
- `isValidationError()` - Check if validation error
- `isServerError()` - Check if server error
- `isNetworkError()` - Check if network error

### **Common Error Codes**

| Code | Description | HTTP Status | Solution |
|------|-------------|-------------|----------|
| `MISSING_CREDENTIALS` | API credentials missing | 400 | Provide valid credentials |
| `INVALID_AMOUNT` | Amount outside limits | 400 | Use valid amount range |
| `INVALID_PHONE` | Invalid phone format | 400 | Use valid phone number |
| `MISSING_UUID` | Transaction UUID missing | 400 | Provide valid UUID |
| `INVALID_CREDENTIALS` | Invalid API credentials | 401 | Check username and key |
| `ACCOUNT_FROZEN` | Account is frozen | 403 | Contact support |
| `NETWORK_ERROR` | Network connection failed | 0 | Check internet connection |

## 📖 **Best Practices**

### **1. Error Handling**

```javascript
// Always wrap API calls in try-catch
try {
  const result = await marzpay.collections.collectMoney(params);
  // Handle success
} catch (error) {
  if (error instanceof MarzPayError) {
    // Handle MarzPay-specific errors
    switch (error.code) {
      case 'INVALID_AMOUNT':
        // Show amount validation message
        break;
      case 'ACCOUNT_FROZEN':
        // Show account frozen message
        break;
      default:
        // Show generic error message
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### **2. Input Validation**

```javascript
// Validate inputs before API calls
const validateCollectionParams = (params) => {
  if (!params.amount || params.amount < 500) {
    throw new Error('Amount must be at least 500 UGX');
  }
  
  if (!marzpay.phoneUtils.isValidPhoneNumber(params.phoneNumber)) {
    throw new Error('Invalid phone number format');
  }
};

// Use validation
try {
  validateCollectionParams(params);
  const result = await marzpay.collections.collectMoney(params);
} catch (error) {
  // Handle validation errors
}
```

### **3. Retry Logic**

```javascript
// Implement retry logic for network errors
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof MarzPayError && error.isNetworkError() && attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
};

// Usage
const result = await retryOperation(() => 
  marzpay.collections.collectMoney(params)
);
```

### **4. Logging and Monitoring**

```javascript
// Implement comprehensive logging
const logApiCall = (method, endpoint, params, result, error) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    params,
    result: result ? 'success' : 'error',
    error: error ? {
      code: error.code,
      message: error.message,
      status: error.status
    } : null
  };
  
  console.log('API Call Log:', logEntry);
  // Send to logging service
};

// Usage
try {
  const result = await marzpay.collections.collectMoney(params);
  logApiCall('POST', '/collect-money', params, result, null);
} catch (error) {
  logApiCall('POST', '/collect-money', params, null, error);
  throw error;
}
```

## 📝 **Examples**

### **Complete Payment Flow**

```javascript
async function processCompletePayment() {
  try {
    // 1. Check account status
    const isActive = await marzpay.accounts.isAccountActive();
    if (!isActive) {
      throw new Error('Account is not active');
    }

    // 2. Check balance
    const balance = await marzpay.balance.getBalance();
    const currentBalance = parseFloat(balance.data.account.balance.raw);
    
    if (currentBalance < 10000) {
      throw new Error('Insufficient balance');
    }

    // 3. Collect payment
    const collection = await marzpay.collections.collectMoney({
      amount: 10000,
      phoneNumber: '0759983853',
      description: 'Product purchase',
      callbackUrl: 'https://yoursite.com/webhook'
    });

    console.log('Collection initiated:', collection.data.transaction.reference);

    // 4. Monitor transaction
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const status = await marzpay.collections.getStatus(
        collection.data.transaction.uuid
      );
      
      if (status.data.transaction.status === 'successful') {
        console.log('Payment successful!');
        break;
      } else if (status.data.transaction.status === 'failed') {
        throw new Error('Payment failed');
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }

    // 5. Get updated balance
    const newBalance = await marzpay.balance.getBalance();
    console.log('New balance:', newBalance.data.account.balance.formatted);

  } catch (error) {
    console.error('Payment processing failed:', error.message);
    throw error;
  }
}
```

### **Webhook Management System**

```javascript
class WebhookManager {
  constructor(marzpay) {
    this.marzpay = marzpay;
    this.webhooks = new Map();
  }

  async initializeWebhooks() {
    try {
      // Get existing webhooks
      const existingWebhooks = await this.marzpay.webhooks.getWebhooks({
        status: 'active'
      });

      // Create default webhooks if none exist
      if (existingWebhooks.data.summary.total_webhooks === 0) {
        await this.createDefaultWebhooks();
      }

      // Store webhook references
      existingWebhooks.data.webhooks.forEach(webhook => {
        this.webhooks.set(webhook.event_type, webhook);
      });

    } catch (error) {
      console.error('Failed to initialize webhooks:', error);
    }
  }

  async createDefaultWebhooks() {
    const defaultWebhooks = [
      {
        name: 'Collection Success',
        url: 'https://yoursite.com/webhooks/collection-success',
        eventType: 'collection.completed',
        environment: 'production'
      },
      {
        name: 'Collection Failure',
        url: 'https://yoursite.com/webhooks/collection-failed',
        eventType: 'collection.failed',
        environment: 'production'
      },
      {
        name: 'Disbursement Success',
        url: 'https://yoursite.com/webhooks/disbursement-success',
        eventType: 'withdrawal.completed',
        environment: 'production'
      }
    ];

    for (const webhookConfig of defaultWebhooks) {
      try {
        const webhook = await this.marzpay.webhooks.createWebhook(webhookConfig);
        this.webhooks.set(webhookConfig.eventType, webhook.data.webhook);
        console.log(`Created webhook: ${webhookConfig.name}`);
      } catch (error) {
        console.error(`Failed to create webhook ${webhookConfig.name}:`, error);
      }
    }
  }

  async updateWebhookUrl(eventType, newUrl) {
    const webhook = this.webhooks.get(eventType);
    if (!webhook) {
      throw new Error(`No webhook found for event type: ${eventType}`);
    }

    const result = await this.marzpay.webhooks.updateWebhook(webhook.uuid, {
      url: newUrl
    });

    this.webhooks.set(eventType, result.data.webhook);
    return result;
  }

  async testWebhook(eventType) {
    const webhook = this.webhooks.get(eventType);
    if (!webhook) {
      throw new Error(`No webhook found for event type: ${eventType}`);
    }

    return await this.marzpay.webhooks.testDelivery(webhook.uuid);
  }
}

// Usage
const webhookManager = new WebhookManager(marzpay);
await webhookManager.initializeWebhooks();
```

### **Transaction Analytics Dashboard**

```javascript
class TransactionAnalytics {
  constructor(marzpay) {
    this.marzpay = marzpay;
  }

  async getDashboardData(period = 'month') {
    try {
      const [transactions, balance, summary] = await Promise.all([
        this.marzpay.transactions.getAnalytics(period, 6),
        this.marzpay.balance.getBalance(),
        this.marzpay.transactions.getSummary()
      ]);

      return {
        period,
        balance: balance.data.account.balance,
        transactions: transactions.data,
        summary: summary.data.summary,
        trends: this.calculateTrends(transactions.data.transactions)
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  calculateTrends(transactions) {
    // Group transactions by date
    const grouped = transactions.reduce((acc, transaction) => {
      const date = transaction.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { collections: 0, withdrawals: 0, total: 0 };
      }
      
      if (transaction.type === 'collection') {
        acc[date].collections += parseFloat(transaction.amount.raw);
      } else if (transaction.type === 'withdrawal') {
        acc[date].withdrawals += parseFloat(transaction.amount.raw);
      }
      
      acc[date].total = acc[date].collections - acc[date].withdrawals;
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getProviderComparison() {
    try {
      const [mtnTransactions, airtelTransactions] = await Promise.all([
        this.marzpay.transactions.getByProvider('mtn', { per_page: 1000 }),
        this.marzpay.transactions.getByProvider('airtel', { per_page: 1000 })
      ]);

      return {
        mtn: this.calculateProviderStats(mtnTransactions.data.transactions),
        airtel: this.calculateProviderStats(airtelTransactions.data.transactions)
      };
    } catch (error) {
      console.error('Failed to get provider comparison:', error);
      throw error;
    }
  }

  calculateProviderStats(transactions) {
    const stats = {
      total_transactions: transactions.length,
      successful_transactions: 0,
      failed_transactions: 0,
      total_amount: 0,
      success_rate: 0
    };

    transactions.forEach(transaction => {
      if (transaction.status === 'successful') {
        stats.successful_transactions++;
        stats.total_amount += parseFloat(transaction.amount.raw);
      } else if (transaction.status === 'failed') {
        stats.failed_transactions++;
      }
    });

    stats.success_rate = (stats.successful_transactions / stats.total_transactions) * 100;
    return stats;
  }
}

// Usage
const analytics = new TransactionAnalytics(marzpay);
const dashboardData = await analytics.getDashboardData('month');
const providerComparison = await analytics.getProviderComparison();
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Network Connection Errors**

```javascript
// Check if it's a network error
if (error.isNetworkError()) {
  console.log('Network connection failed. Please check:');
  console.log('- Internet connection');
  console.log('- Firewall settings');
  console.log('- API endpoint accessibility');
}
```

#### **2. Authentication Errors**

```javascript
// Check credentials
if (error.code === 'INVALID_CREDENTIALS') {
  console.log('Authentication failed. Please verify:');
  console.log('- API username is correct');
  console.log('- API key is correct');
  console.log('- Account is active');
}
```

#### **3. Validation Errors**

```javascript
// Handle validation errors
if (error.isValidationError()) {
  console.log('Validation failed:');
  console.log('- Check all required fields');
  console.log('- Verify data formats');
  console.log('- Ensure values are within limits');
}
```

### **Debug Mode**

```javascript
// Enable debug mode for detailed logging
const marzpay = new MarzPay({
  apiUser: 'username',
  apiKey: 'api_key',
  debug: true // Enable debug logging
});

// Debug information will be logged to console
```

## 🤝 **Contributing**

### **Development Setup**

```bash
# Clone the repository
git clone https://github.com/Katznicho/marzpay-js.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### **Code Standards**

- Follow ESLint configuration
- Use JSDoc for all public methods
- Write comprehensive tests
- Follow the existing code structure
- Ensure all tests pass

### **Pull Request Process**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- **Documentation**: [GitHub Wiki](https://github.com/Katznicho/marzpay-js/wiki)
- **Issues**: [GitHub Issues](https://github.com/Katznicho/marzpay-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Katznicho/marzpay-js/discussions)
- **Email**: support@marzpay.com

## 🙏 **Acknowledgments**

- MarzPay Team for the excellent API
- Contributors and maintainers
- The JavaScript community for best practices
- Uganda's mobile money ecosystem

---

**Made with ❤️ by the MarzPay Team**

Empowering businesses with seamless mobile payments in Uganda and beyond.
