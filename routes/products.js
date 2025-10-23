const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const twilio = require('twilio');
const { ensureWhatsAppAddress, normalizePhone } = require('../utils/phone');

// We'll import the sendWhatsAppMessageWithFailover function from whatsapp routes
const whatsappRoutes = require('./whatsapp');
const sendWhatsAppMessageWithFailover = whatsappRoutes.sendWhatsAppMessageWithFailover;

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(50);

    // Normalize image URLs to current server origin (works for local and prod)
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${proto}://${host}`;

    const fixedProducts = products.map(product => {
      if (product.image_url) {
        try {
          const u = new URL(product.image_url);
          if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
            product.image_url = `${origin}${u.pathname}`;
          } else {
            // If the URL contains our uploads path, always normalize to current origin
            const idx = product.image_url.indexOf('/uploads/');
            if (idx >= 0) {
              const pathname = product.image_url.substring(idx);
              product.image_url = `${origin}${pathname}`;
            }
          }
        } catch (_) {
          // If it's a relative path like /uploads/..., prefix with origin
          if (product.image_url.startsWith('/')) {
            product.image_url = `${origin}${product.image_url}`;
          }
        }
        // If the path points to /uploads but file is missing, clear it so frontend shows placeholder
        const uploadsIdx = product.image_url.indexOf('/uploads/');
        if (uploadsIdx >= 0) {
          const path = require('path');
          const fs = require('fs');
          const fname = product.image_url.substring(uploadsIdx + '/uploads/'.length);
          const localPath = path.join(__dirname, '..', 'public', 'uploads', fname);
          if (!fs.existsSync(localPath)) {
            product.image_url = '';
          }
        }
      }
      return product;
    });

    res.json({
      success: true,
      count: fixedProducts.length,
      products: fixedProducts
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

    // Normalize image URL to current server origin (works for local and prod)
    if (product.image_url) {
      const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const origin = `${proto}://${host}`;
      try {
        const u = new URL(product.image_url);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          product.image_url = `${origin}${u.pathname}`;
        } else {
          const idx = product.image_url.indexOf('/uploads/');
          if (idx >= 0) {
            const pathname = product.image_url.substring(idx);
            product.image_url = `${origin}${pathname}`;
          }
        }
      } catch (_) {
        if (product.image_url.startsWith('/')) {
          product.image_url = `${origin}${product.image_url}`;
        }
      }
      // If the path points to /uploads but file is missing, clear it so frontend shows placeholder
      const uploadsIdx = product.image_url.indexOf('/uploads/');
      if (uploadsIdx >= 0) {
        const path = require('path');
        const fs = require('fs');
        const fname = product.image_url.substring(uploadsIdx + '/uploads/'.length);
        const localPath = path.join(__dirname, '..', 'public', 'uploads', fname);
        if (!fs.existsSync(localPath)) {
          product.image_url = '';
        }
      }
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

    // Send WhatsApp notification to farmer with failover
    try {
      // Ensure phone number is correctly formatted for WhatsApp (strict)
      const farmerWhatsApp = ensureWhatsAppAddress(normalizePhone(product.farmer_phone));
      
      console.log(`📨 Sending order notification...`);
      console.log(`   To: ${farmerWhatsApp}`);
      
      // Initialize Twilio clients if not already initialized
      if (!whatsappRoutes.twilioClients || whatsappRoutes.twilioClients.length === 0) {
        console.log('🔧 Initializing Twilio clients for order notification...');
        whatsappRoutes.initializeTwilioClients();
      }
      
      const notificationMsg = `🎉 *Order Alert!*\n\n` +
        `A buyer wants to purchase your produce:\n\n` +
        `📦 Product: ${product.product_name}\n` +
        `⚖️ Quantity: ${product.quantity}\n` +
        `👤 Buyer: ${buyer_name || 'Anonymous'}\n` +
        `📞 Contact: ${buyer_phone || 'Will call you'}\n\n` +
        `Please prepare the order for dispatch! 🚜`;

      // Resolve the preferred sender based on farmer's last inbound WhatsApp
      let preferredFrom = '';
      try {
        const farmerDoc = await Farmer.findOne({ phone: normalizePhone(product.farmer_phone) });
        preferredFrom = farmerDoc?.lastWhatsappFrom || '';
        var preferredAccountSid = farmerDoc?.lastTwilioAccountSid || '';
        if (preferredFrom) console.log(`🔎 Using preferred from-number for farmer: ${preferredFrom}`);
        if (preferredAccountSid) console.log(`🏷️  Using preferred AccountSid for farmer: ${preferredAccountSid}`);
      } catch (e) {
        console.warn('⚠️ Could not fetch farmer for preferred from-number:', e.message);
      }

      // Send with failover, retry once on config/credit errors
      const sendFn = whatsappRoutes.sendWhatsAppMessageWithFailover;
      try {
        await sendFn({ body: notificationMsg, to: farmerWhatsApp, preferredFrom, preferredAccountSid });
      } catch (err1) {
        console.warn('⚠️ First send attempt failed, re-initializing Twilio and retrying once...', err1.code, err1.message);
        whatsappRoutes.initializeTwilioClients();
        await sendFn({ body: notificationMsg, to: farmerWhatsApp, preferredFrom, preferredAccountSid });
      }

      console.log(`✅ Order notification sent successfully!`);
    } catch (twilioError) {
      console.error('⚠️ Failed to send WhatsApp notification:', twilioError.message);
      console.error('⚠️ Error code:', twilioError.code);
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

    // Normalize image URLs to current server origin (works for local and prod)
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${proto}://${host}`;

    const fixedProducts = products.map(product => {
      if (product.image_url) {
        try {
          const u = new URL(product.image_url);
          if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
            product.image_url = `${origin}${u.pathname}`;
          } else {
            const idx = product.image_url.indexOf('/uploads/');
            if (idx >= 0) {
              const pathname = product.image_url.substring(idx);
              product.image_url = `${origin}${pathname}`;
            }
          }
        } catch (_) {
          if (product.image_url.startsWith('/')) {
            product.image_url = `${origin}${product.image_url}`;
          }
        }
        // If the path points to /uploads but file is missing, clear it so frontend shows placeholder
        const uploadsIdx = product.image_url.indexOf('/uploads/');
        if (uploadsIdx >= 0) {
          const path = require('path');
          const fs = require('fs');
          const fname = product.image_url.substring(uploadsIdx + '/uploads/'.length);
          const localPath = path.join(__dirname, '..', 'public', 'uploads', fname);
          if (!fs.existsSync(localPath)) {
            product.image_url = '';
          }
        }
      }
      return product;
    });

    res.json({
      success: true,
      count: fixedProducts.length,
      products: fixedProducts
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

    console.log('💾 Saving manual product to database:', JSON.stringify(newProduct, null, 2));
    await newProduct.save();
    console.log('✅ Manual product saved to database. Product ID:', newProduct._id);

    // Send confirmation notification via WhatsApp with failover
    try {
      const farmerWhatsApp = ensureWhatsAppAddress(farmer_phone);
      
      const confirmationMsg = `✅ Product Listed Successfully!\n\n` +
        `📦 Product: ${product_name}\n` +
        `⚖️ Quantity: ${quantity}\n` +
        `⭐ Quality: ${newProduct.quality_grade}\n` +
        `📍 Location: ${farmer.location || 'Not specified'}\n\n` +
        `Your produce is now live on the marketplace! 🌾\n\n` +
        `View at: ${process.env.BACKEND_PUBLIC_URL || 'https://farmlinkai-7.onrender.com'}`;

      await sendWhatsAppMessageWithFailover({
        body: confirmationMsg,
        to: farmerWhatsApp
      });
      
      console.log(`✅ WhatsApp confirmation sent to farmer: ${farmer_phone}`);
    } catch (notificationError) {
      console.error(`❌ Failed to send WhatsApp confirmation to ${farmer_phone}:`, notificationError.message);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully! WhatsApp confirmation sent to farmer.',
      product: newProduct
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