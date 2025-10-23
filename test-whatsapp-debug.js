// Test script to debug WhatsApp messaging issues
const https = require('https');

function testWhatsAppConfiguration() {
  console.log('🔍 Testing WhatsApp Configuration...\n');
  
  // Test 1: Check Twilio system status
  console.log('1️⃣ Testing Twilio System Status...');
  const twilioOptions = {
    hostname: 'farmlinkai-7.onrender.com',
    port: 443,
    path: '/api/test-twilio',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const twilioReq = https.request(twilioOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`   Status: ${response.success ? '✅' : '❌'}`);
        console.log(`   Message: ${response.message}`);
        console.log(`   Account Count: ${response.accountCount}`);
        
        if (response.accountCount === 0) {
          console.log('   ⚠️ No Twilio accounts configured!');
        }
        
        // Test 2: Check if we can send a test message
        if (response.accountCount > 0) {
          testWhatsAppMessage();
        } else {
          console.log('\n❌ Cannot test messaging - No Twilio accounts configured');
          console.log('\n🔧 Troubleshooting Steps:');
          console.log('   1. Check Render environment variables:');
          console.log('      - TWILIO_ACCOUNT_SID');
          console.log('      - TWILIO_AUTH_TOKEN');
          console.log('      - TWILIO_WHATSAPP_NUMBER');
          console.log('   2. Verify Twilio account is active');
          console.log('   3. Check WhatsApp sandbox configuration');
        }
      } catch (error) {
        console.error('   ❌ Error parsing response:', error);
      }
    });
  });
  
  twilioReq.on('error', (error) => {
    console.error('   ❌ Request error:', error);
  });
  
  twilioReq.end();
}

function testWhatsAppMessage() {
  console.log('\n2️⃣ Testing WhatsApp Message Sending...');
  
  const testData = JSON.stringify({
    to: "whatsapp:+919845325913", // Your number for testing
    message: "🧪 Test message from FarmLink AI - If you receive this, WhatsApp is working!"
  });
  
  const messageOptions = {
    hostname: 'farmlinkai-7.onrender.com',
    port: 443,
    path: '/api/test-twilio',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const messageReq = https.request(messageOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`   Status: ${response.success ? '✅' : '❌'}`);
        console.log(`   Message: ${response.message}`);
        
        if (response.success) {
          console.log('   🎉 Test message sent successfully!');
          console.log('   📱 Check your WhatsApp for the test message');
        } else {
          console.log('   ❌ Failed to send test message');
          console.log('   Error:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('   ❌ Error parsing response:', error);
      }
    });
  });
  
  messageReq.on('error', (error) => {
    console.error('   ❌ Request error:', error);
  });
  
  messageReq.write(testData);
  messageReq.end();
}

// Run the tests
testWhatsAppConfiguration();
