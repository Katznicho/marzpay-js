# 🚀 MarzPay JavaScript Library

[![npm version](https://badge.fury.io/js/marzpay-js.svg)](https://badge.fury.io/js/marzpay-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Katznicho/marzpay-js/workflows/Build/badge.svg)](https://github.com/Katznicho/marzpay-js/actions)

> **Official JavaScript SDK for MarzPay - Mobile Money Payment Platform for Uganda**

The MarzPay JavaScript Library provides seamless integration between your applications and the MarzPay mobile money platform. This comprehensive SDK enables businesses in Uganda to accept mobile money payments, send money, manage accounts, and handle webhooks with ease.

## 🌟 Features

### 💰 **Payment Operations**
- **Collections API** - Collect money from customers via mobile money
- **Disbursements API** - Send money to customers
- **Transaction Management** - Track and manage all payment transactions
- **Account Management** - Check balances and account information

### 🔒 **Security & Validation**
- **Input Validation** - Comprehensive validation for amounts, phone numbers, and references
- **Phone Number Formatting** - Automatic conversion to international format (+256XXXXXXXXX)
- **UUID Generation** - Secure reference creation for all transactions
- **Error Handling** - Detailed error messages with error codes

### 🛠️ **Developer Experience**
- **TypeScript Support** - Full type definitions included
- **Multiple Build Formats** - UMD, CommonJS, ES Modules, and minified versions
- **Comprehensive Examples** - Ready-to-use code samples
- **Cross-Platform** - Works in browsers and Node.js environments

### 📱 **Mobile Money Support**
- **Multiple Providers** - Support for all major mobile money services in Uganda
- **Amount Validation** - Built-in limits (Collections: 500-10,000,000 UGX, Disbursements: 100-10,000,000 UGX)
- **Phone Number Formats** - Automatic handling of local, country code, and international formats

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Configuration](#-configuration)
- [Error Handling](#-error-handling)
- [Phone Number Formats](#-phone-number-formats)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Installation

### NPM (Recommended)
```bash
npm install marzpay-js
```

### Yarn
```bash
yarn add marzpay-js
```

### CDN (Browser)
```html
<!-- UMD Bundle -->
<script src="https://unpkg.com/marzpay-js@latest/dist/marzpay.umd.js"></script>

<!-- Minified Bundle -->
<script src="https://unpkg.com/marzpay-js@latest/dist/marzpay.min.js"></script>
```

### Manual Download
Download the latest release from [GitHub Releases](https://github.com/Katznicho/marzpay-js/releases) and include the appropriate file in your project.

## ⚡ Quick Start

### 1. Initialize MarzPay
```javascript
import MarzPay from 'marzpay-js';

const marzpay = new MarzPay({
  apiUser: 'your_api_username',
  apiKey: 'your_api_key'
});
```

### 2. Collect Money from Customer
```javascript
try {
  const result = await marzpay.collections.collectMoney({
    amount: 5000,
    phoneNumber: '0759983853',
    description: 'Payment for services'
  });
  
  console.log('Collection successful:', result);
} catch (error) {
  console.error('Collection failed:', error.message);
}
```

### 3. Send Money to Customer
```javascript
try {
  const result = await marzpay.disbursements.sendMoney({
    amount: 1000,
    phoneNumber: '0759983853',
    description: 'Refund payment'
  });
  
  console.log('Disbursement successful:', result);
} catch (error) {
  console.error('Disbursement failed:', error.message);
}
```

### 4. Check Account Balance
```javascript
try {
  const balance = await marzpay.accounts.getBalance();
  console.log('Current balance:', balance.data.balance, 'UGX');
} catch (error) {
  console.error('Failed to get balance:', error.message);
}
```

## 📚 API Reference

### Core MarzPay Class

#### Constructor
```javascript
new MarzPay(config)
```

**Parameters:**
- `config.apiUser` (string) - Your MarzPay API username
- `config.apiKey` (string) - Your MarzPay API key
- `config.baseUrl` (string, optional) - API base URL (default: `https://wallet.wearemarz.com/api/v1`)
- `config.timeout` (number, optional) - Request timeout in milliseconds (default: 30000)

#### Methods
- `setCredentials(apiUser, apiKey)` - Update API credentials
- `getAuthHeader()` - Get authentication header for requests

### Collections API

#### `collectMoney(params)`
Collect money from a customer via mobile money.

**Parameters:**
- `amount` (number) - Amount in UGX (500-10,000,000)
- `phoneNumber` (string) - Customer's phone number
- `description` (string, optional) - Payment description
- `callbackUrl` (string, optional) - Custom webhook URL
- `country` (string, optional) - Country code (default: 'UG')

**Returns:** Promise with collection result

#### `getCollectionStatus(reference)`
Get the status of a collection transaction.

#### `getCollectionHistory(params)`
Get collection transaction history with optional filtering.

### Disbursements API

#### `sendMoney(params)`
Send money to a customer via mobile money.

**Parameters:**
- `amount` (number) - Amount in UGX (100-10,000,000)
- `phoneNumber` (string) - Customer's phone number
- `description` (string, optional) - Payment description
- `callbackUrl` (string, optional) - Custom webhook URL
- `country` (string, optional) - Country code (default: 'UG')

**Returns:** Promise with disbursement result

#### `getDisbursementStatus(reference)`
Get the status of a disbursement transaction.

#### `getDisbursementHistory(params)`
Get disbursement transaction history with optional filtering.

### Accounts API

#### `getBalance()`
Get current account balance.

#### `getAccountInfo()`
Get account information and details.

#### `getAccountTransactions(params)`
Get account transaction history.

#### `updateAccountSettings(settings)`
Update account settings and preferences.

### Transactions API

#### `getTransaction(reference)`
Get transaction details by reference.

#### `getTransactions(params)`
Get all transactions with optional filtering.

#### `cancelTransaction(reference)`
Cancel a pending transaction.

#### `resendNotification(reference)`
Resend transaction notification to customer.

### Webhooks API

#### `registerWebhook(params)`
Register a new webhook endpoint.

#### `getWebhooks()`
Get all registered webhooks.

#### `deleteWebhook(webhookId)`
Delete a webhook endpoint.

#### `testWebhook(webhookId)`
Test a webhook endpoint.

### Utilities

#### `formatPhoneNumber(phone)`
Format phone number to international format (+256XXXXXXXXX).

#### `isValidPhoneNumber(phone)`
Validate phone number format.

#### `isValidAmount(amount, min, max)`
Validate amount within specified range.

#### `generateReference()`
Generate a unique UUID reference.

#### `formatAmount(amount)`
Format amount to UGX currency string.

#### `parseAmount(amountString)`
Parse amount from UGX currency string.

## 💡 Examples

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
      description: 'Product purchase'
    });
    
    console.log('Collection initiated:', collection.data.reference);
    
    // 2. Check collection status
    const status = await marzpay.collections.getCollectionStatus(
      collection.data.reference
    );
    
    console.log('Collection status:', status.data.status);
    
    // 3. Get account balance
    const balance = await marzpay.accounts.getBalance();
    console.log('New balance:', balance.data.balance, 'UGX');
    
  } catch (error) {
    console.error('Payment processing failed:', error.message);
  }
}
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

### Error Handling
```javascript
try {
  const result = await marzpay.collections.collectMoney({
    amount: 100,  // Below minimum
    phoneNumber: '0759983853'
  });
} catch (error) {
  if (error.code === 'INVALID_AMOUNT') {
    console.log('Amount must be at least 500 UGX');
  } else if (error.code === 'INVALID_PHONE') {
    console.log('Invalid phone number format');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## ⚙️ Configuration

### Environment Variables
```bash
# .env file
MARZPAY_API_USER=your_username
MARZPAY_API_KEY=your_api_key
MARZPAY_BASE_URL=https://wallet.wearemarz.com/api/v1
MARZPAY_TIMEOUT=30000
```

### Dynamic Configuration
```javascript
// Update credentials at runtime
marzpay.setCredentials('new_username', 'new_api_key');

// Update timeout
marzpay.config.timeout = 60000;
```

## 🚨 Error Handling

The library provides comprehensive error handling with custom `MarzPayError` class:

```javascript
class MarzPayError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'MarzPayError';
    this.code = code;
    this.status = status;
  }
}
```

### Common Error Codes
- `INVALID_AMOUNT` - Amount outside allowed range
- `INVALID_PHONE` - Invalid phone number format
- `MISSING_REFERENCE` - Transaction reference not provided
- `INVALID_CREDENTIALS` - API credentials invalid
- `NETWORK_ERROR` - Network or connection issues

### Error Handling Best Practices
```javascript
try {
  const result = await marzpay.collections.collectMoney(params);
} catch (error) {
  if (error instanceof MarzPayError) {
    // Handle MarzPay-specific errors
    switch (error.code) {
      case 'INVALID_AMOUNT':
        // Handle amount validation errors
        break;
      case 'INVALID_PHONE':
        // Handle phone validation errors
        break;
      default:
        // Handle other errors
        console.error('MarzPay error:', error.message);
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## 📱 Phone Number Formats

The library automatically handles various phone number formats:

| Input Format | Converts To | Description |
|--------------|-------------|-------------|
| `0759983853` | `+256759983853` | Local format (recommended) |
| `256759983853` | `+256759983853` | Country code format |
| `+256759983853` | `+256759983853` | International format (unchanged) |

### Phone Number Validation
```javascript
// Valid formats
marzpay.utils.isValidPhoneNumber('0759983853');     // true
marzpay.utils.isValidPhoneNumber('256759983853');   // true
marzpay.utils.isValidPhoneNumber('+256759983853');  // true

// Invalid formats
marzpay.utils.isValidPhoneNumber('123');            // false
marzpay.utils.isValidPhoneNumber('abc');            // false
marzpay.utils.isValidPhoneNumber('');               // false
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Build Library
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## 📦 Build Outputs

The library provides multiple build formats:

- **CommonJS** (`dist/marzpay.js`) - Node.js and bundler compatibility
- **ES Modules** (`dist/marzpay.esm.js`) - Modern bundlers and ES6+ environments
- **UMD** (`dist/marzpay.umd.js`) - Browser and AMD compatibility
- **Minified** (`dist/marzpay.min.js`) - Production-ready minified version
- **TypeScript Definitions** (`dist/marzpay.d.ts`) - TypeScript support

## 🌐 Browser Support

- **Modern Browsers** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Browsers** - iOS Safari 12+, Chrome Mobile 60+
- **Node.js** - Version 14.0.0 and above

## 🤝 Contributing

We welcome contributions to improve the MarzPay JavaScript Library!

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Katznicho/marzpay-js.git
   cd marzpay-js
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Make Changes**
   - Create a feature branch
   - Make your improvements
   - Add tests for new functionality
   - Ensure all tests pass

4. **Submit Pull Request**
   - Push your changes
   - Create a pull request
   - Describe your improvements

### Development Setup
```bash
# Clone repository
git clone https://github.com/Katznicho/marzpay-js.git
cd marzpay-js

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Build library
npm run build
```

### Code Standards
- Follow JavaScript/TypeScript best practices
- Use ES6+ features where appropriate
- Include JSDoc comments for public methods
- Ensure all tests pass
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 MarzPay Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support

### Documentation
- **API Reference** - [Full API Documentation](https://github.com/Katznicho/marzpay-js/wiki)
- **Examples** - [Code Examples](https://github.com/Katznicho/marzpay-js/tree/main/examples)
- **Changelog** - [Release Notes](https://github.com/Katznicho/marzpay-js/releases)

### Getting Help
- **GitHub Issues** - [Report Issues](https://github.com/Katznicho/marzpay-js/issues)
- **Discussions** - [Community Support](https://github.com/Katznicho/marzpay-js/discussions)
- **Wiki** - [Documentation & Guides](https://github.com/Katznicho/marzpay-js/wiki)

### MarzPay Support
- **API Documentation** - [MarzPay API Docs](https://docs.wearemarz.com)
- **Business Support** - [Contact MarzPay](https://wearemarz.com/contact)
- **Technical Support** - [API Support](https://support.wearemarz.com)

## 🙏 Acknowledgments

- **MarzPay Team** - For building the amazing mobile money platform
- **Open Source Community** - For the tools and libraries that made this possible
- **Contributors** - Everyone who has contributed to this project

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Katznicho/marzpay-js&type=Date)](https://star-history.com/#Katznicho/marzpay-js&Date)

---

<div align="center">

**Made with ❤️ by the MarzPay Team**

*Empowering businesses with seamless mobile payments*

[![MarzPay Logo](https://wearemarz.com/logo.png)](https://wearemarz.com)

</div>
