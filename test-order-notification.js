// Test script to verify order notification messaging
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';

async function testOrderNotification() {
  try {
    console.log('🧪 Testing Order Notification Messaging...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Find an active farmer to test with
    const farmer = await Farmer.findOne({ isActive: true });
    
    if (!farmer) {
      console.log('⚠️  No active farmers found. Creating a test farmer...');
      
      // Create a test farmer
      const testFarmer = new Farmer({
        name: 'Order Test Farmer',
        phone: '+919999999998',
        village: 'Test Village',
        district: 'Test District',
        approvalStatus: 'approved',
        isActive: true
      });
      
      await testFarmer.save();
      console.log('✅ Test farmer created:', testFarmer.name);
      
      // Create a test product
      const product = new Product({
        farmer_phone: testFarmer.phone,
        farmer_name: testFarmer.name,
        farmer_location: `${testFarmer.village}, ${testFarmer.district}`,
        product_name: 'Test Tomato',
        quantity: '20 kg',
        status: 'available',
        quality_grade: 'Grade B',
        quality_score: 75
      });
      
      await product.save();
      console.log('✅ Test product created:', product.product_name);
      
      console.log('\n📝 To test order notification:');
      console.log('   1. Start the server: node server.js');
      console.log('   2. Place an order for this product via API');
      console.log('   3. Check server logs for messaging status');
      console.log('   4. Verify the farmer receives a WhatsApp message');
      
    } else {
      console.log(`✅ Found active farmer: ${farmer.name} (${farmer.phone})`);
      
      // Create a test product for this farmer
      const product = new Product({
        farmer_phone: farmer.phone,
        farmer_name: farmer.name,
        farmer_location: farmer.location || `${farmer.village}, ${farmer.district}`,
        product_name: 'Test Product',
        quantity: '10 kg',
        status: 'available',
        quality_grade: 'Grade B',
        quality_score: 75
      });
      
      await product.save();
      console.log('✅ Test product created:', product.product_name);
      console.log('   Product ID:', product._id);
      
      console.log('\n📝 To test order notification:');
      console.log('   1. Start the server: node server.js');
      console.log('   2. Place an order for product ID:', product._id.toString());
      console.log('   3. Check server logs for messaging status');
      console.log('   4. Verify farmer receives WhatsApp message');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Order notification test setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

// Run the function
testOrderNotification();