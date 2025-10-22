// Simulate WhatsApp webhook processing
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

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

// Simulate WhatsApp message processing
const simulateWhatsAppProcessing = async (fromNumber, messageBody, numMedia = 0) => {
  try {
    await connectDB();
    
    console.log(`📱 Simulating WhatsApp Message from ${fromNumber}: "${messageBody}"`);
    console.log(`🖼️ Media files: ${numMedia}`);

    // Check if farmer exists
    const farmer = await Farmer.findOne({ phone: fromNumber });
    
    if (!farmer) {
      console.log('❌ Farmer not found in database');
      return;
    }

    console.log(`✅ Farmer found: ${farmer.name}`);
    console.log(`📊 Approval Status: ${farmer.approvalStatus}`);
    console.log(`🔌 Active Status: ${farmer.isActive}`);

    if (!farmer.isActive) {
      console.log('❌ Farmer account is inactive. Cannot list products.');
      return;
    }

    // Parse message for product listing
    // Expected format: "Product Quantity" e.g., "Tomato 30 kg" or "Onion 50kg"
    const words = messageBody.split(' ');
    
    if (words.length < 2) {
      console.log('❌ Invalid format. Need at least product name and quantity');
      return;
    }

    // Extract product name (all words except last 1-2 which are quantity)
    let productName = '';
    let quantity = '';
    
    // Check if last word is just number or has unit
    const lastWord = words[words.length - 1];
    const secondLastWord = words.length > 2 ? words[words.length - 2] : '';
    
    if (/^\d+$/.test(lastWord) && /^(kg|kgs|ton|tons|quintal|quintals)$/i.test(secondLastWord)) {
      // Format: "Tomato 30 kg"
      quantity = `${secondLastWord} ${lastWord}`;
      productName = words.slice(0, -2).join(' ');
    } else if (/^\d+(kg|kgs|ton|tons|quintal|quintals)$/i.test(lastWord)) {
      // Format: "Tomato 30kg"
      quantity = lastWord;
      productName = words.slice(0, -1).join(' ');
    } else if (words.length >= 3 && /^\d+$/.test(secondLastWord) && /^(kg|kgs|ton|tons|quintal|quintals)$/i.test(lastWord)) {
      // Format: "Potato 20 kg" - number and unit as last two words
      quantity = `${secondLastWord} ${lastWord}`;
      productName = words.slice(0, -2).join(' ');
    } else {
      // Assume last word is quantity
      quantity = lastWord;
      productName = words.slice(0, -1).join(' ');
    }

    if (!productName || !quantity) {
      console.log('❌ Could not parse product details');
      return;
    }

    console.log(`✅ Product parsed: ${productName} (${quantity})`);

    // Create product object
    const newProduct = new Product({
      farmer_phone: fromNumber,
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name: productName,
      quantity: quantity,
      image_url: '', // No image in this simulation
      status: 'available',
      quality_grade: 'Grade B',
      quality_score: 75
    });

    console.log('💾 Product object created:');
    console.log(JSON.stringify(newProduct, null, 2));

    // Try to save the product
    await newProduct.save();
    console.log('✅ Product saved successfully');
    console.log('Product ID:', newProduct._id);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error in simulation:', error.message);
    mongoose.connection.close();
  }
};

// Test with active farmer
console.log('=== Testing with Active Farmer ===');
simulateWhatsAppProcessing('+919845325913', 'Potato 20 kg', 0);

console.log('\n=== Testing with Inactive Farmer ===');
simulateWhatsAppProcessing('+919999999996', 'Onion 10 kg', 0);