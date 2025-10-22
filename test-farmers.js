const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test function
const testFarmersAndProducts = async () => {
  try {
    await connectDB();
    
    // List all farmers
    console.log('=== Farmers in Database ===');
    const farmers = await Farmer.find({});
    console.log(`Found ${farmers.length} farmers:`);
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.phone}) - Status: ${farmer.approvalStatus}, Active: ${farmer.isActive}`);
    });
    
    // List all products
    console.log('\n=== Products in Database ===');
    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.product_name} (${product.quantity}) - Grade: ${product.quality_grade}, Farmer: ${product.farmer_phone}`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    mongoose.connection.close();
  }
};

testFarmersAndProducts();