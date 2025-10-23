const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Fix image URLs in the database
async function fixImageUrls() {
  try {
    console.log('🔧 Starting image URL fix...');
    
    // Find all products with localhost URLs
    const products = await Product.find({
      image_url: { $regex: /^http:\/\/localhost/ }
    });
    
    console.log(`📦 Found ${products.length} products with localhost URLs`);
    
    if (products.length === 0) {
      console.log('✅ No products need fixing');
      return;
    }
    
    // Update each product
    for (const product of products) {
      const oldUrl = product.image_url;
      const newUrl = oldUrl.replace('http://localhost:3001', 'https://farmlinkai-7.onrender.com');
      
      await Product.findByIdAndUpdate(product._id, {
        image_url: newUrl
      });
      
      console.log(`✅ Updated product ${product._id}:`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${newUrl}`);
    }
    
    console.log(`🎉 Successfully updated ${products.length} products!`);
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the fix
connectDB().then(() => {
  fixImageUrls();
});
