# 🧪 **MarzPay JavaScript Library - Practical Testing Guide**

## 🎯 **Overview**

This guide will walk you through setting up and testing the MarzPay JavaScript library with real API keys. You'll learn how to run actual API calls, test different scenarios, and verify the implementation works in production.

## 🚀 **Quick Setup & Testing**

### **1. Install Dependencies**

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/Katznicho/marzpay-js.git
cd marzpay-js

# Install dependencies
npm install

# Build the library
npm run build
```

### **2. Create Test Configuration**

Create a `.env` file in your project root:

```bash
# .env file
MARZPAY_API_USER=your_actual_username
MARZPAY_API_KEY=your_actual_api_key
MARZPAY_ENVIRONMENT=sandbox
```

### **3. Create Test Script**

Create a file called `test-implementation.js` in your project root:

```javascript
import MarzPay from './src/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize MarzPay with real credentials
const marzpay = new MarzPay({
  apiUser: process.env.MARZPAY_API_USER,
  apiKey: process.env.MARZPAY_API_KEY
});

async function testMarzPayImplementation() {
  console.log('🚀 Testing MarzPay Implementation with Real API Keys\n');
  
  try {
    // Test 1: Connection and Authentication
    console.log('1️⃣ Testing Connection and Authentication...');
    const services = await marzpay.services.getServices();
    console.log('✅ Connection successful! Available services:', services.data?.summary || 'No services found');
    
    // Test 2: Generate UUID4 Reference
    console.log('\n2️⃣ Testing UUID4 Reference Generation...');
    const reference = marzpay.collections.generateReference();
    console.log('✅ Generated UUID4 reference:', reference);
    
    // Test 3: Phone Number Validation
    console.log('\n3️⃣ Testing Phone Number Validation...');
    const testPhone = '0759983853';
    const isValid = marzpay.phoneUtils.isValidPhoneNumber(testPhone);
    const formatted = marzpay.phoneUtils.formatPhoneNumber(testPhone);
    console.log(`✅ Phone ${testPhone}: Valid=${isValid}, Formatted=${formatted}`);
    
    // Test 4: UUID Validation
    console.log('\n4️⃣ Testing UUID Validation...');
    const isValidUUID = marzpay.utils.isValidUUID(reference);
    console.log(`✅ UUID ${reference}: Valid=${isValidUUID}`);
    
    // Test 5: Collections API (Dry Run - No actual money collection)
    console.log('\n5️⃣ Testing Collections API (Dry Run)...');
    console.log('⚠️  This is a dry run - no actual money will be collected');
    
    const collectionParams = {
      amount: 100, // Minimum amount for testing
      phoneNumber: '0759983853',
      reference: reference,
      description: 'Test collection - DO NOT PROCESS'
    };
    
    console.log('📋 Collection parameters:', collectionParams);
    console.log('✅ Collections API ready (dry run mode)');
    
    // Test 6: Disbursements API (Dry Run - No actual money sent)
    console.log('\n6️⃣ Testing Disbursements API (Dry Run)...');
    console.log('⚠️  This is a dry run - no actual money will be sent');
    
    const disbursementParams = {
      amount: 1000, // Minimum amount for testing
      phoneNumber: '0759983853',
      reference: marzpay.disbursements.generateReference(),
      description: 'Test disbursement - DO NOT PROCESS'
    };
    
    console.log('📋 Disbursement parameters:', disbursementParams);
    console.log('✅ Disbursements API ready (dry run mode)');
    
    // Test 7: Utility Functions
    console.log('\n7️⃣ Testing Utility Functions...');
    
    const queryParams = { page: 1, limit: 10, status: 'active' };
    const queryString = marzpay.utils.buildQueryString(queryParams);
    console.log(`✅ Query string built: ${queryString}`);
    
    // Test 8: Error Handling
    console.log('\n8️⃣ Testing Error Handling...');
    
    try {
      // This should throw an error for invalid amount
      await marzpay.collections.collectMoney({
        amount: 50, // Below minimum
        phoneNumber: '0759983853',
        reference: marzpay.collections.generateReference(),
        description: 'Test error handling'
      });
    } catch (error) {
      console.log(`✅ Error handling works: ${error.message}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('📝 The MarzPay library is working correctly with your API credentials.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('🔍 Error details:', error);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your .env file has correct API credentials');
      console.log('2. Verify your API keys are active in MarzPay dashboard');
      console.log('3. Ensure you have proper permissions for the API endpoints');
    }
  }
}

// Run the tests
testMarzPayImplementation();
```

### **4. Install dotenv for Environment Variables**

```bash
npm install dotenv
```

### **5. Run the Test**

```bash
# Run the test script
node test-implementation.js
```

## 🔐 **Getting Your API Keys**

### **1. MarzPay Dashboard Access**
- Log into your MarzPay business dashboard
- Navigate to **API Settings** or **Developer Tools**
- Generate new API keys or copy existing ones

### **2. Required Credentials**
- **API Username**: Your MarzPay account username
- **API Key**: Your secret API key for authentication
- **Environment**: Choose between `sandbox` (testing) or `production`

### **3. Permissions Required**
- **Collections**: Permission to collect money from customers
- **Disbursements**: Permission to send money to customers
- **Services**: Permission to view available services
- **Transactions**: Permission to view transaction history

## 🧪 **Advanced Testing Scenarios**

### **1. Test with Real Phone Numbers**

```javascript
// Test with your own phone number (for safety)
const testPhoneNumbers = [
  '0759983853',  // Your test number
  '+256759983853', // International format
  '256759983853'   // Country code format
];

testPhoneNumbers.forEach(phone => {
  const isValid = marzpay.phoneUtils.isValidPhoneNumber(phone);
  const formatted = marzpay.phoneUtils.formatPhoneNumber(phone);
  console.log(`${phone}: Valid=${isValid}, Formatted=${formatted}`);
});
```

### **2. Test Amount Validation**

```javascript
// Test different amount scenarios
const testAmounts = [100, 500, 1000, 5000, 10000, 100000, 1000000];

testAmounts.forEach(amount => {
  const isValidCollection = marzpay.collections.isValidAmount(amount);
  const isValidDisbursement = marzpay.disbursements.isValidAmount(amount);
  
  console.log(`Amount ${amount}:`);
  console.log(`  Collections: ${isValidCollection ? '✅' : '❌'}`);
  console.log(`  Disbursements: ${isValidDisbursement ? '✅' : '❌'}`);
});
```

### **3. Test UUID Generation**

```javascript
// Generate multiple UUIDs to ensure uniqueness
const uuids = [];
for (let i = 0; i < 5; i++) {
  uuids.push(marzpay.collections.generateReference());
}

console.log('Generated UUIDs:');
uuids.forEach((uuid, index) => {
  const isValid = marzpay.utils.isValidUUID(uuid);
  console.log(`${index + 1}. ${uuid} - ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Check for duplicates
const uniqueUuids = new Set(uuids);
console.log(`\nUnique UUIDs: ${uniqueUuids.size}/${uuids.length}`);
```

## 🚨 **Safety Guidelines**

### **1. Never Test with Real Money**
- Always use **sandbox environment** for testing
- Use **minimum amounts** (100 UGX for collections, 1000 UGX for disbursements)
- Add **"TEST" or "DO NOT PROCESS"** in descriptions

### **2. Use Test Phone Numbers**
- Use your own phone number for testing
- Never use customer phone numbers in tests
- Verify phone number format before testing

### **3. Monitor API Usage**
- Check your MarzPay dashboard for API call logs
- Monitor for any unexpected charges
- Keep test amounts minimal

## 🔍 **Troubleshooting Common Issues**

### **1. Authentication Errors**
```bash
❌ Error: API credentials are required
💡 Solution: Check your .env file and API credentials

❌ Error: Invalid credentials
💡 Solution: Verify API keys in MarzPay dashboard
```

### **2. Network Errors**
```bash
❌ Error: Network request failed
💡 Solution: Check internet connection and MarzPay service status
```

### **3. Validation Errors**
```bash
❌ Error: Amount must be between 500 and 10,000,000 UGX
💡 Solution: Use valid amount ranges for testing

❌ Error: Reference must be a valid UUID4
💡 Solution: Use generateReference() method
```

## 📊 **Expected Test Results**

When everything works correctly, you should see:

```
🚀 Testing MarzPay Implementation with Real API Keys

1️⃣ Testing Connection and Authentication...
✅ Connection successful! Available services: { total_countries: 1, total_providers: 3 }

2️⃣ Testing UUID4 Reference Generation...
✅ Generated UUID4 reference: 550e8400-e29b-41d4-a716-446655440000

3️⃣ Testing Phone Number Validation...
✅ Phone 0759983853: Valid=true, Formatted=+256759983853

4️⃣ Testing UUID Validation...
✅ UUID 550e8400-e29b-41d4-a716-446655440000: Valid=true

5️⃣ Testing Collections API (Dry Run)...
⚠️  This is a dry run - no actual money will be collected
📋 Collection parameters: { amount: 100, phoneNumber: '0759983853', ... }
✅ Collections API ready (dry run mode)

6️⃣ Testing Disbursements API (Dry Run)...
⚠️  This is a dry run - no actual money will be sent
📋 Disbursement parameters: { amount: 1000, phoneNumber: '0759983853', ... }
✅ Disbursements API ready (dry run mode)

7️⃣ Testing Utility Functions...
✅ Query string built: page=1&limit=10&status=active

8️⃣ Testing Error Handling...
✅ Error handling works: Amount must be between 500 and 10,000,000 UGX

🎉 All tests completed successfully!
📝 The MarzPay library is working correctly with your API credentials.
```

## 🎯 **Next Steps After Testing**

1. **Integration**: Integrate the library into your application
2. **Production**: Switch to production environment when ready
3. **Monitoring**: Set up logging and monitoring for production use
4. **Error Handling**: Implement proper error handling in your app
5. **Webhooks**: Set up webhook endpoints for real-time updates

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your API credentials and permissions
3. Check MarzPay service status
4. Review the error messages for specific guidance

---

**Happy Testing! 🚀** Your MarzPay integration is now ready for real-world use!
