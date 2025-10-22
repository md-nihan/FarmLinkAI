const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://nihan:Killer888beats@nihan.3jzvm5.mongodb.net/climate-sustainability?retryWrites=true&w=majority&appName=nihan';

async function createTestFarmer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');

        // Create a test farmer with pending status
        const farmer = new Farmer({
            name: 'New Registration Test Farmer',
            phone: '+919999999996', // Different phone number
            village: 'Test Village',
            district: 'Test District',
            crops: 'Onion',
            approvalStatus: 'pending',
            isActive: false
        });

        await farmer.save();
        console.log('✅ Test farmer created with pending status!');
        console.log('Farmer ID:', farmer._id);
        console.log('Name:', farmer.name);
        console.log('Status:', farmer.approvalStatus);

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating test farmer:', error.message);
        process.exit(1);
    }
}

createTestFarmer();