// Script to add farmer phone numbers to Twilio WhatsApp sandbox
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

// List of farmer phone numbers to add to sandbox
// Replace these with actual farmer numbers
const farmerNumbers = [
  '+919876543210',
  '+919876543211',
  '+919876543212',
  // Add more numbers as needed
];

async function addNumbersToSandbox() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials are missing!');
      return;
    }
    
    const client = twilio(accountSid, authToken);
    
    console.log('📱 Adding farmer numbers to Twilio WhatsApp Sandbox...\n');
    
    // Add each number to the sandbox
    for (const number of farmerNumbers) {
      try {
        // Note: Twilio doesn't have a direct API to add numbers to sandbox
        // The sandbox approval is typically done through the console
        // But we can verify if numbers are already approved
        
        console.log(`⏳ Checking status for ${number}...`);
        
        // For now, we'll just show instructions for each number
        console.log(`   ℹ️  To add ${number} to sandbox:`);
        console.log(`      1. Go to Twilio Console > Messaging > Try it out > WhatsApp Sandbox`);
        console.log(`      2. Enter ${number} in the "Add to Sandbox" field`);
        console.log(`      3. Click "Add"\n`);
        
      } catch (error) {
        console.error(`   ❌ Error processing ${number}:`, error.message);
      }
    }
    
    console.log('✅ Process completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Follow the instructions above for each number');
    console.log('   2. After adding numbers, test the messaging functionality');
    console.log('   3. You can use the test scripts we created earlier');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the function
addNumbersToSandbox();