// Test script for farmer messaging fix
const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';

async function testFarmerMessaging() {
    try {
        console.log('🔧 Testing farmer messaging fix...\n');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
        
        // Create a test farmer with pending status
        console.log('\n1️⃣ Creating test farmer...');
        const testPhone = '+919876543210';
        const existingFarmer = await Farmer.findOne({ phone: testPhone });
        if (existingFarmer) {
            await Farmer.deleteOne({ phone: testPhone });
            console.log('   Removed existing test farmer');
        }
        
        const farmer = new Farmer({
            name: 'Test Farmer for Messaging',
            phone: testPhone,
            village: 'Test Village',
            district: 'Test District',
            crops: 'Tomato, Onion',
            approvalStatus: 'pending',
            isActive: false
        });
        
        await farmer.save();
        console.log('   ✅ Test farmer created with ID:', farmer._id);
        
        // Test admin login
        console.log('\n2️⃣ Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'nihan9t9',
            password: '1234'
        });
        
        const token = loginResponse.data.token;
        console.log('   ✅ Admin login successful!');
        
        // Approve the farmer
        console.log('\n3️⃣ Approving farmer...');
        const approveResponse = await axios.post(
            `http://localhost:3001/api/farmers/approve/${farmer._id}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('   Approval response:', approveResponse.data.message);
        
        if (approveResponse.data.error) {
            console.log('   ⚠️  WhatsApp error:', approveResponse.data.error);
        } else {
            console.log('   ✅ Farmer approval completed successfully!');
        }
        
        // Clean up test farmer
        await Farmer.deleteOne({ _id: farmer._id });
        console.log('\n4️⃣ Cleaned up test farmer');
        
        await mongoose.connection.close();
        console.log('\n✅ Farmer messaging test completed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Check if the test farmer received a WhatsApp message');
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
testFarmerMessaging();