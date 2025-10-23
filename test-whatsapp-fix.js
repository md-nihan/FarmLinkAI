// Test script to verify WhatsApp messaging fix
const https = require('https');

function testWhatsAppFix() {
  console.log('🧪 Testing WhatsApp Messaging Fix...\n');
  
  // Test 1: Check Twilio configuration
  console.log('1️⃣ Checking Twilio Configuration...');
  checkTwilioConfig();
}

function checkTwilioConfig() {
  const options = {
    hostname: 'farmlinkai-7.onrender.com',
    port: 443,
    path: '/api/test-twilio',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`   Status: ${response.success ? '✅' : '❌'}`);
        console.log(`   Account Count: ${response.accountCount}`);
        
        if (response.accountCount > 0) {
          console.log('   🎉 Twilio is properly configured!');
          testMessageSending();
        } else {
          console.log('   ❌ Twilio not configured');
          console.log('\n🔧 Next Steps:');
          console.log('   1. Go to Render Dashboard');
          console.log('   2. Add environment variables:');
          console.log('      - TWILIO_ACCOUNT_SID');
          console.log('      - TWILIO_AUTH_TOKEN');
          console.log('      - TWILIO_WHATSAPP_NUMBER');
          console.log('   3. Redeploy the service');
          console.log('   4. Run this test again');
        }
      } catch (error) {
        console.error('   ❌ Error parsing response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('   ❌ Request error:', error);
  });
  
  req.end();
}

function testMessageSending() {
  console.log('\n2️⃣ Testing Message Sending...');
  
  const testData = JSON.stringify({
    to: "whatsapp:+919845325913", // Replace with your test number
    message: "🧪 WhatsApp Fix Test - If you receive this, the fix is working!"
  });
  
  const options = {
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

  const req = https.request(options, (res) => {
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
          console.log('\n✅ WhatsApp messaging is now working!');
          console.log('\n🧪 Next Tests:');
          console.log('   1. Register a new farmer');
          console.log('   2. Approve the farmer in admin panel');
          console.log('   3. Check if farmer receives welcome message');
          console.log('   4. Place an order for a product');
          console.log('   5. Check if farmer receives order notification');
        } else {
          console.log('   ❌ Failed to send test message');
          console.log('   Error:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('   ❌ Error parsing response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('   ❌ Request error:', error);
  });
  
  req.write(testData);
  req.end();
}

// Run the test
testWhatsAppFix();
