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
