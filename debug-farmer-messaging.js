// Debug script to test farmer messaging system
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';

async function debugFarmerMessaging() {
  try {
    console.log('🔍 Debugging farmer messaging system...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Check if we have farmers in the database
    const farmers = await Farmer.find({}, 'name phone approvalStatus isActive');
    
    console.log(`\n📱 Found ${farmers.length} farmers in database:`);
    farmers.forEach((farmer, index) => {
      console.log(`   ${index + 1}. ${farmer.name} (${farmer.phone}) - Status: ${farmer.approvalStatus}, Active: ${farmer.isActive}`);
    });
    
    // Check for pending farmers
    const pendingFarmers = await Farmer.find({ approvalStatus: 'pending' });
    console.log(`\n⏳ Pending farmers: ${pendingFarmers.length}`);
    
    if (pendingFarmers.length > 0) {
      console.log('\n📋 First pending farmer details:');
      const farmer = pendingFarmers[0];
      console.log(`   Name: ${farmer.name}`);
      console.log(`   Phone: ${farmer.phone}`);
      console.log(`   Village: ${farmer.village}`);
      console.log(`   District: ${farmer.district}`);
      
      // Test the WhatsApp messaging function directly
      console.log('\n🧪 Testing WhatsApp messaging function...');
      
      // Import the WhatsApp routes
      const whatsappRoutes = require('./routes/whatsapp');
      
      // Initialize Twilio clients
      console.log('🔧 Initializing Twilio clients...');
      const initResult = whatsappRoutes.initializeTwilioClients();
      console.log(`   Initialization result: ${initResult ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Number of clients: ${whatsappRoutes.twilioClients ? whatsappRoutes.twilioClients.length : 0}`);
      
      if (whatsappRoutes.twilioClients && whatsappRoutes.twilioClients.length > 0) {
        console.log('\n✅ Twilio clients initialized successfully!');
        console.log('ℹ️  The messaging system should work correctly.');
        console.log('📝 To test approval messaging:');
        console.log('   1. Start the server: node server.js');
        console.log('   2. Approve the pending farmer in the admin panel');
        console.log('   3. Check server logs for messaging status');
      } else {
        console.log('\n❌ Twilio clients failed to initialize!');
        console.log('⚠️  Check your environment variables and Twilio credentials.');
      }
    } else {
      console.log('\n✅ No pending farmers found.');
      console.log('📝 To test the system:');
      console.log('   1. Register a new farmer through the registration page');
      console.log('   2. Approve the farmer in the admin panel');
      console.log('   3. Check if they receive the WhatsApp message');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    await mongoose.connection.close();
  }
}

// Run the function
debugFarmerMessaging();