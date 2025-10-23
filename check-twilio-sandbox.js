// Script to check Twilio WhatsApp sandbox configuration
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

async function checkTwilioSandbox() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials are missing!');
      return;
    }
    
    const client = twilio(accountSid, authToken);
    
    console.log('🔍 Checking Twilio WhatsApp Sandbox Configuration...\n');
    
    // Try to get the current account information
    const account = await client.api.accounts(accountSid).fetch();
    console.log('🏢 Account Information:');
    console.log(`   Account SID: ${account.sid}`);
    console.log(`   Friendly Name: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}`);
    
    // For WhatsApp sandbox information, we need to check if we're using the sandbox number
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    console.log(`\n📱 Configured WhatsApp Number: ${whatsappNumber}`);
    
    // List outgoing caller IDs to see what numbers are verified
    console.log('\n📋 Verified Phone Numbers:');
    const outgoingCallerIds = await client.outgoingCallerIds.list({limit: 20});
    if (outgoingCallerIds.length > 0) {
      outgoingCallerIds.forEach((callerId, index) => {
        console.log(`   ${index + 1}. ${callerId.phoneNumber} (${callerId.friendlyName})`);
      });
    } else {
      console.log('   No verified outgoing caller IDs found');
    }
    
    // Check messaging services
    console.log('\n📡 Messaging Services:');
    try {
      const services = await client.messaging.services.list({limit: 20});
      if (services.length > 0) {
        services.forEach((service, index) => {
          console.log(`   ${index + 1}. ${service.friendlyName} (${service.sid})`);
        });
      } else {
        console.log('   No messaging services found');
      }
    } catch (error) {
      console.log('   Unable to fetch messaging services:', error.message);
    }
    
    console.log('\nℹ️  Note: For WhatsApp sandbox testing:');
    console.log('   - Only pre-approved phone numbers can receive messages in sandbox mode');
    console.log('   - Your number (+919845325913) is likely approved');
    console.log('   - Other farmers need to be manually added to the sandbox');
    console.log('   - Go to Twilio Console > WhatsApp > Sandbox to manage approved numbers');
    
  } catch (error) {
    console.error('❌ Error checking Twilio configuration:', error.message);
    console.error('   Error code:', error.code);
  }
}

checkTwilioSandbox();