// Test Twilio client
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

console.log('🔧 Testing Twilio client initialization...');

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
  
  // Test sending a message to yourself (optional)
  console.log('ℹ️  Twilio client is ready to send messages');
  
} catch (error) {
  console.error('❌ Failed to initialize Twilio client:', error.message);
  console.error('Error stack:', error.stack);
}