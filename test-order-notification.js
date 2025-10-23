// Test script for order notification fix
const axios = require('axios');
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
        console.log('🔧 Testing order notification fix...\n');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
        
        // Create a test farmer
        console.log('\n1️⃣ Creating test farmer...');
        const testPhone = '+919876543210';
        const existingFarmer = await Farmer.findOne({ phone: testPhone });
        if (existingFarmer) {
            await Farmer.deleteOne({ phone: testPhone });
            console.log('   Removed existing test farmer');
        }
        
        const farmer = new Farmer({
            name: 'Test Farmer for Order Notification',
            phone: testPhone,
            village: 'Test Village',
            district: 'Test District',
            crops: 'Tomato, Onion',
            approvalStatus: 'approved',
            isActive: true
        });
        
        await farmer.save();
        console.log('   ✅ Test farmer created with ID:', farmer._id);
        
        // Create a test product
        console.log('\n2️⃣ Creating test product...');
        const product = new Product({
            farmer_phone: testPhone,
            farmer_name: farmer.name,
            farmer_location: `${farmer.village}, ${farmer.district}`,
            product_name: 'Test Tomato',
            quantity: '20 kg',
            image_url: '',
            status: 'available',
            quality_grade: 'Grade B',
            quality_score: 75
        });
        
        await product.save();
        console.log('   ✅ Test product created with ID:', product._id);
        
        // Place an order
        console.log('\n3️⃣ Placing order...');
        const orderResponse = await axios.post(`http://localhost:3001/api/products/order/${product._id}`, {
            buyer_name: 'Test Buyer',
            buyer_phone: '+919999999999'
        });
        
        console.log('   Order response:', orderResponse.data.message);
        
        // Clean up
        await Product.deleteOne({ _id: product._id });
        await Farmer.deleteOne({ _id: farmer._id });
        console.log('\n4️⃣ Cleaned up test data');
        
        await mongoose.connection.close();
        console.log('\n✅ Order notification test completed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Check if the test farmer received a WhatsApp message about the order');
        console.log('   2. If not, check the server logs for error messages');
        console.log('   3. Verify Twilio configuration in .env file');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
        await mongoose.connection.close();
    }
}

// Run the test
testOrderNotification();