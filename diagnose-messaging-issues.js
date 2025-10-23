// Comprehensive diagnostic script for messaging issues
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

async function diagnoseMessagingIssues() {
  try {
    console.log('🔍 COMPREHENSIVE MESSAGING SYSTEM DIAGNOSTIC\n');
    
    // 1. Check environment variables
    console.log('1️⃣ Checking Environment Variables...');
    const requiredVars = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_WHATSAPP_NUMBER',
      'MONGODB_URI'
    ];
    
    let allEnvVarsPresent = true;
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName}: SET`);
      } else {
        console.log(`   ❌ ${varName}: MISSING`);
        allEnvVarsPresent = false;
      }
    });
    
    if (!allEnvVarsPresent) {
      console.log('   ⚠️  Some required environment variables are missing!');
      return;
    }
    
    // 2. Check MongoDB connection
    console.log('\n2️⃣ Checking MongoDB Connection...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('   ✅ MongoDB Connected Successfully');
    } catch (error) {
      console.log('   ❌ MongoDB Connection Failed:', error.message);
      return;
    }
    
    // 3. Check database content
    console.log('\n3️⃣ Checking Database Content...');
    const farmerCount = await Farmer.countDocuments();
    const productCount = await Product.countDocuments();
    const pendingFarmers = await Farmer.countDocuments({ approvalStatus: 'pending' });
    const approvedFarmers = await Farmer.countDocuments({ approvalStatus: 'approved' });
    const activeFarmers = await Farmer.countDocuments({ isActive: true });
    
    console.log(`   Farmers in database: ${farmerCount}`);
    console.log(`   Products in database: ${productCount}`);
    console.log(`   Pending farmers: ${pendingFarmers}`);
    console.log(`   Approved farmers: ${approvedFarmers}`);
    console.log(`   Active farmers: ${activeFarmers}`);
    
    // 4. Check Twilio system
    console.log('\n4️⃣ Checking Twilio System...');
    try {
      const whatsappRoutes = require('./routes/whatsapp');
      
      // Initialize Twilio clients
      console.log('   Initializing Twilio clients...');
      const initResult = whatsappRoutes.initializeTwilioClients();
      console.log(`   Initialization result: ${initResult ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Number of clients: ${whatsappRoutes.twilioClients ? whatsappRoutes.twilioClients.length : 0}`);
      
      if (!initResult || !whatsappRoutes.twilioClients || whatsappRoutes.twilioClients.length === 0) {
        console.log('   ❌ Twilio clients failed to initialize!');
        await mongoose.connection.close();
        return;
      }
      
      console.log('   ✅ Twilio clients initialized successfully!');
      
      // Test sending a message
      console.log('\n   Testing Message Sending...');
      try {
        const sendWhatsAppMessageWithFailover = whatsappRoutes.sendWhatsAppMessageWithFailover;
        
        const testMessage = `🔧 Diagnostic Test Message\nSystem diagnostic completed successfully.\nTimestamp: ${new Date().toISOString()}`;
        
        const message = await sendWhatsAppMessageWithFailover({
          body: testMessage,
          to: 'whatsapp:+919845325913' // Your number
        });
        
        console.log('   ✅ Test message sent successfully!');
        console.log(`   Message SID: ${message.sid}`);
        
      } catch (error) {
        console.log('   ❌ Failed to send test message:', error.message);
        console.log('   Error code:', error.code);
      }
      
    } catch (error) {
      console.log('   ❌ Error checking Twilio system:', error.message);
    }
    
    // 5. Check for common issues
    console.log('\n5️⃣ Checking for Common Issues...');
    
    // Check if there are any farmers
    if (farmerCount === 0) {
      console.log('   ⚠️  No farmers found in database');
      console.log('   ℹ️  Farmers must register through the registration page');
    }
    
    // Check for pending farmers
    if (pendingFarmers > 0) {
      console.log(`   ℹ️  ${pendingFarmers} farmer(s) pending approval`);
      console.log('   ℹ️  These farmers need to be approved in the admin panel');
    }
    
    // Check for active farmers
    if (activeFarmers === 0) {
      console.log('   ⚠️  No active farmers found');
      console.log('   ℹ️  Farmers must be approved and active to receive messages');
    }
    
    // 6. Provide troubleshooting steps
    console.log('\n6️⃣ Troubleshooting Steps:');
    console.log('   If messages are not being received:');
    console.log('     1. Verify farmers have sent "join organization-organized" to +14155238886');
    console.log('     2. Check if farmers are in the WhatsApp sandbox');
    console.log('     3. Review server logs for any error messages');
    console.log('     4. Ensure Twilio webhook is properly configured');
    console.log('     5. Verify environment variables are correct');
    
    console.log('\n   If approval messages are not being sent:');
    console.log('     1. Check the farmer approval process in the admin panel');
    console.log('     2. Verify the Twilio client initialization');
    console.log('     3. Check server logs for messaging errors');
    
    console.log('\n   If order notifications are not being sent:');
    console.log('     1. Verify the product ordering process');
    console.log('     2. Check that the farmer is active');
    console.log('     3. Review server logs for messaging errors');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Diagnostic completed!');
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the function
diagnoseMessagingIssues();