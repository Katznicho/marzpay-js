import MarzPay from './src/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize MarzPay with real credentials
const marzpay = new MarzPay({
  apiUser: process.env.MARZPAY_API_USER,
  apiKey: process.env.MARZPAY_API_KEY
});

async function testRealCollection() {
  console.log('Testing Real Money Collection - You Should Receive a Mobile Money Prompt\n');
  
  try {
    // Generate a unique reference for this test
    const reference = marzpay.collections.generateReference();
    console.log('Generated Reference:', reference);
    
    // Test parameters - MINIMUM AMOUNT for safety
    const collectionParams = {
      amount: 500, // Minimum amount (500 UGX = ~$0.13 USD)
      phoneNumber: '0759983853', // Replace with your actual phone number
      reference: reference,
      description: 'TEST COLLECTION - API Testing - Amount: 500 UGX'
    };
    
    console.log('Collection Parameters:');
    console.log('   Amount:', collectionParams.amount, 'UGX');
    console.log('   Phone:', collectionParams.phoneNumber);
    console.log('   Reference:', collectionParams.reference);
    console.log('   Description:', collectionParams.description);
    
    console.log('\nIMPORTANT: This will attempt to collect REAL money from your phone!');
    console.log('Amount: 500 UGX (minimum allowed)');
    console.log('You should receive a mobile money prompt on your phone');
    console.log('You can REJECT the prompt if you don\'t want to proceed');
    
    // Ask for confirmation
    console.log('\nAttempting to collect money...');
    console.log('Check your phone for the mobile money prompt...');
    
    // Make the actual API call
    const result = await marzpay.collections.collectMoney(collectionParams);
    
    console.log('\nCollection initiated successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.data?.transaction) {
      console.log('\nTransaction Details:');
      console.log('   Status:', result.data.transaction.status);
      console.log('   Reference:', result.data.transaction.reference);
      console.log('   Amount:', result.data.transaction.amount, 'UGX');
      
      // Check if we can get the transaction status
      if (result.data.transaction.uuid) {
        console.log('\nChecking transaction status...');
        try {
          const status = await marzpay.collections.getCollection(result.data.transaction.uuid);
          console.log('Current Status:', status.data?.transaction?.status);
        } catch (statusError) {
          console.log('Could not check status:', statusError.message);
        }
      }
    }
    
    console.log('\nTest completed! Check your phone for the mobile money prompt.');
    console.log('You can accept or reject the prompt - this is just a test!');
    
  } catch (error) {
    console.error('\nCollection test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('credentials')) {
      console.log('\nTroubleshooting:');
      console.log('1. Check your .env file has correct API credentials');
      console.log('2. Verify your API keys are active in MarzPay dashboard');
      console.log('3. Ensure you have proper permissions for collections');
    } else if (error.message.includes('amount')) {
      console.log('\nAmount validation error - check the amount limits');
    } else if (error.message.includes('phone')) {
      console.log('\nPhone number error - check the phone number format');
    }
  }
}

// Run the real collection test
testRealCollection();
