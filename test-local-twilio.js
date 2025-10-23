// Local test script for Twilio configuration
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

console.log('🔧 Testing Twilio client initialization locally...\n');

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  console.log('🔧 Twilio Configuration Check:');
  console.log(`   Account SID: ${accountSid ? 'SET' : 'MISSING'}`);
  console.log(`   Auth Token: ${authToken ? 'SET' : 'MISSING'}`);
  console.log(`   WhatsApp Number: ${twilioWhatsAppNumber || 'MISSING'}`);
  
  if (!accountSid || !authToken) {
    console.error('❌ Twilio credentials are missing!');
    process.exit(1);
  }
  
  const twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized successfully');
  
  // Test multi-account configuration
  console.log('\n🔧 Checking multi-account configuration...');
  
  // Check for multiple accounts (TWILIO_ACCOUNT_SID_1, TWILIO_ACCOUNT_SID_2, etc.)
  let accountCount = 0;
  for (let i = 1; i <= 5; i++) {
    const accountSid = process.env[`TWILIO_ACCOUNT_SID_${i}`];
    const authToken = process.env[`TWILIO_AUTH_TOKEN_${i}`];
    const apiKey = process.env[`TWILIO_API_KEY_${i}`];
    
    if (accountSid && authToken) {
      accountCount++;
      console.log(`✅ Twilio Account ${i} configured`);
      console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
      console.log(`   Auth Token: ${authToken.substring(0, 10)}...`);
      console.log(`   API Key: ${apiKey ? 'SET' : 'NOT SET'}`);
    }
  }
  
  if (accountCount > 0) {
    console.log(`✅ Found ${accountCount} additional Twilio account(s) for failover`);
  } else {
    console.log('ℹ️  No additional Twilio accounts configured (single account mode)');
  }
  
  // Test sending a message to yourself (optional)
  console.log('\nℹ️  Twilio client is ready to send messages');
  console.log('\n🔧 To test actual message sending, run the server and use the /api/test-twilio endpoint');
  
} catch (error) {
  console.error('❌ Failed to initialize Twilio client:', error.message);
  console.error('Error stack:', error.stack);
}