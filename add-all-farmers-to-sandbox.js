// Script to add all registered farmers to Twilio WhatsApp sandbox
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';

async function addAllFarmersToSandbox() {
  try {
    console.log('🚜 Fetching all farmers from database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully\n');
    
    // Fetch all farmers
    const farmers = await Farmer.find({}, 'name phone');
    
    console.log(`📱 Found ${farmers.length} farmers in the database:\n`);
    
    // Display farmer information
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} - ${farmer.phone}`);
    });
    
    console.log('\n📝 Instructions to add farmers to WhatsApp Sandbox:');
    console.log('   1. Go to Twilio Console > Messaging > Try it out > WhatsApp Sandbox');
    console.log('   2. For each farmer above, add their phone number to the sandbox');
    console.log('   3. The numbers should be in international format (e.g., +919876543210)\n');
    
    console.log('⚠️  Important Notes:');
    console.log('   - Twilio Sandbox only allows up to 1000 contacts');
    console.log('   - For production, apply for WhatsApp Business API');
    console.log('   - All farmers must send the join message to the WhatsApp number');
    console.log('   - The join message is: "join organization-organized"\n');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Process completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

// Run the function
addAllFarmersToSandbox();