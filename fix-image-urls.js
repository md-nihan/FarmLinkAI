// Script to fix image URLs in the database to use localhost instead of ngrok URLs
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to fix image URLs
const fixImageUrls = async () => {
  try {
    // Find all products with image URLs containing ngrok
    const products = await Product.find({ 
      image_url: { $regex: 'ngrok-free.dev' } 
    });
    
    console.log(`Found ${products.length} products with ngrok URLs`);
    
    for (const product of products) {
      console.log(`Fixing product: ${product.product_name}`);
      console.log(`  Old URL: ${product.image_url}`);
      
      // Replace ngrok URL with localhost URL
      const newImageUrl = product.image_url.replace(
        'https://tactual-agrologic-bradley.ngrok-free.dev', 
        'http://localhost:3001'
      );
      
      console.log(`  New URL: ${newImageUrl}`);
      
      // Update the product
      await Product.findByIdAndUpdate(product._id, { image_url: newImageUrl });
      console.log(`  ✅ Updated product ${product._id}`);
    }
    
    console.log('✅ All image URLs fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error.message);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await fixImageUrls();
  process.exit();
};

run();