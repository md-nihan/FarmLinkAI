const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Place an order
router.post('/order/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { buyer_name, buyer_phone } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    // Update product status
    product.status = 'ordered';
    product.buyer_name = buyer_name || 'Anonymous Buyer';
    product.buyer_phone = buyer_phone || '';
    product.orderedAt = new Date();
    
    await product.save();

    // Send WhatsApp notification to farmer
    try {
      const farmerWhatsApp = product.farmer_phone.startsWith('whatsapp:') ? product.farmer_phone : `whatsapp:${product.farmer_phone}`;
      const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
      
      console.log(`📨 Sending order notification...`);
      console.log(`   From: ${twilioWhatsApp}`);
      console.log(`   To: ${farmerWhatsApp}`);
      
      const notificationMsg = `🎉 *Order Alert!*\n\n` +
        `A buyer wants to purchase your produce:\n\n` +
        `📦 Product: ${product.product_name}\n` +
        `⚖️ Quantity: ${product.quantity}\n` +
        `👤 Buyer: ${buyer_name || 'Anonymous'}\n` +
        `📞 Contact: ${buyer_phone || 'Will call you'}\n\n` +
        `Please prepare the order for dispatch! 🚜`;

      const message = await twilioClient.messages.create({
        body: notificationMsg,
        from: twilioWhatsApp,
        to: farmerWhatsApp
      });

      console.log(`✅ Order notification sent successfully! Message SID: ${message.sid}`);
    } catch (twilioError) {
      console.error('⚠️ Failed to send WhatsApp notification:', twilioError.message);
      console.error('⚠️ Error code:', twilioError.code);
      console.error('⚠️ More info:', twilioError.moreInfo);
      // Don't fail the order if notification fails
    }

    res.json({
      success: true,
      message: 'Order placed successfully!',
      product: product
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
});

// Get products by farmer
router.get('/farmer/:phone', async (req, res) => {
  try {
    const products = await Product.find({ farmer_phone: req.params.phone })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Manual product creation endpoint (for testing without WhatsApp)
router.post('/create', async (req, res) => {
  try {
    const { farmer_phone, product_name, quantity, image_url } = req.body;

    // Validate required fields
    if (!farmer_phone || !product_name || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Farmer phone, product name, and quantity are required'
      });
    }

    // Find farmer
    const Farmer = require('../models/Farmer');
    const farmer = await Farmer.findOne({ phone: farmer_phone });
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found. Please add farmer first in admin panel.'
      });
    }

    // Create product
    const newProduct = new Product({
      farmer_phone,
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name,
      quantity,
      image_url: image_url || '',
      status: 'available',
      quality_grade: 'Grade B',
      quality_score: 75
    });

    await newProduct.save();

    // Send confirmation notification (simulated WhatsApp)
    console.log(`\n📱 SIMULATED WhatsApp to ${farmer_phone}:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Product Listed Successfully!`);
    console.log(``);
    console.log(`📦 Product: ${product_name}`);
    console.log(`⚖️ Quantity: ${quantity}`);
    console.log(`⭐ Quality: ${newProduct.quality_grade}`);
    console.log(`📍 Location: ${farmer.location || 'Not specified'}`);
    console.log(``);
    console.log(`Your produce is now live on the marketplace! 🌾`);
    console.log(`View at: http://localhost:3001`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully! (WhatsApp confirmation sent - check console)',
      product: newProduct,
      whatsapp_message: `✅ Product Listed! ${product_name} (${quantity}) - ${newProduct.quality_grade}. View at marketplace!`
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

module.exports = router;
