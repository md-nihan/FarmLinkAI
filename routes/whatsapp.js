const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MessagingResponse = twilio.twiml.MessagingResponse;

// Function to download and save image from Twilio
async function downloadAndSaveImage(imageUrl) {
  try {
    console.log('📥 Downloading image from Twilio...');
    
    // Download image with Twilio authentication
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      },
      responseType: 'arraybuffer'
    });
    
    // Generate unique filename
    const fileExtension = imageUrl.includes('.jpg') || imageUrl.includes('jpeg') ? '.jpg' : 
                         imageUrl.includes('.png') ? '.png' : '.jpg';
    const filename = `product-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const filepath = path.join(__dirname, '../public/uploads', filename);
    
    // Save image to public/uploads directory
    fs.writeFileSync(filepath, response.data);
    
    // Return the public URL path
    const publicUrl = `/uploads/${filename}`;
    console.log(`✅ Image saved successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
    return null;
  }
}

// WhatsApp webhook endpoint
router.post('/', async (req, res) => {
  try {
    const twiml = new MessagingResponse();
    const incomingMsg = req.body.Body ? req.body.Body.trim() : '';
    const fromNumber = req.body.From ? req.body.From.replace('whatsapp:', '') : '';
    const numMedia = parseInt(req.body.NumMedia) || 0;
    
    console.log(`📱 WhatsApp Message from ${fromNumber}: "${incomingMsg}"`);
    console.log(`🖼️ Media files: ${numMedia}`);

    // Check if farmer exists
    const farmer = await Farmer.findOne({ phone: fromNumber });
    
    if (!farmer) {
      twiml.message('❌ Sorry, you are not registered as a farmer. Please contact admin for registration.');
      return res.type('text/xml').send(twiml.toString());
    }

    if (!farmer.isActive) {
      twiml.message('❌ Your account is currently inactive. Please contact admin.');
      return res.type('text/xml').send(twiml.toString());
    }

    // Parse message for product listing
    // Expected format: "Product Quantity" e.g., "Tomato 30 kg" or "Onion 50kg"
    const words = incomingMsg.split(' ');
    
    if (words.length < 2) {
      twiml.message('❌ Invalid format. Please send: [Product Name] [Quantity]\n\nExample: Tomato 30 kg');
      return res.type('text/xml').send(twiml.toString());
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
    } else {
      // Assume last word is quantity
      quantity = lastWord;
      productName = words.slice(0, -1).join(' ');
    }

    if (!productName || !quantity) {
      twiml.message('❌ Could not parse product details. Format: [Product Name] [Quantity]\n\nExample: Tomato 30 kg');
      return res.type('text/xml').send(twiml.toString());
    }

    // Get image URL if provided and download it
    let imageUrl = '';
    if (numMedia > 0) {
      // Get Twilio media URL
      const twilioMediaUrl = req.body.MediaUrl0;
      console.log(`🖼️ Original Twilio URL: ${twilioMediaUrl}`);
      
      // Download and save image locally
      const localImagePath = await downloadAndSaveImage(twilioMediaUrl);
      
      if (localImagePath) {
        imageUrl = localImagePath; // Use local path instead of Twilio URL
        console.log(`✅ Image will be accessible at: http://localhost:3001${localImagePath}`);
      } else {
        console.log('⚠️ Failed to download image, will use default grade');
      }
    }

    // Create product object with a safe default grade first (respond fast to WhatsApp)
    const newProduct = new Product({
      farmer_phone: fromNumber,
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name: productName,
      quantity: quantity,
      image_url: imageUrl,
      status: 'available',
      quality_grade: 'Grade B',
      quality_score: 75
    });

    // Save to database quickly before any AI work
    await newProduct.save();
    console.log('✅ Product saved to database (pre-AI)');

    // Send immediate confirmation to farmer (avoid Twilio timeout)
    const confirmationMsg = `✅ Product Listed Successfully!\n\n` +
      `📦 Product: ${productName}\n` +
      `⚖️ Quantity: ${quantity}\n` +
      `⭐ Quality: ${newProduct.quality_grade}\n` +
      `📍 Location: ${farmer.location || 'Not specified'}\n\n` +
      `Your produce is now live on the marketplace! 🌾`;

    twiml.message(confirmationMsg);
    res.type('text/xml').send(twiml.toString());

    // Fire-and-forget: call AI service to refine quality grade if image is provided
    if (imageUrl) {
      setImmediate(async () => {
        try {
          console.log('🤖 Calling AI service for quality grading (async)...');
          const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';

          // Convert local path to full URL for AI service
          // Prefer explicit BACKEND_PUBLIC_URL; otherwise derive from request headers
          const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          const backendBase = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}`;
          const imageFullUrl = imageUrl.startsWith('http') ? imageUrl : `${backendBase}${imageUrl}`;

          const aiResponse = await axios.post(`${aiServiceUrl}/grade`, {
            image_url: imageFullUrl,
            product_name: productName
          }, {
            timeout: 10000 // 10 second timeout
          });

          if (aiResponse.data && aiResponse.data.grade) {
            await Product.findByIdAndUpdate(newProduct._id, {
              quality_grade: aiResponse.data.grade,
              quality_score: aiResponse.data.score || 0
            });
            console.log(`✅ AI Grade saved: ${aiResponse.data.grade} (Score: ${aiResponse.data.score})`);
          }
        } catch (aiError) {
          console.error('⚠️ AI service error (async):', aiError.message);
        }
      });
    }

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    const twiml = new MessagingResponse();
    twiml.message('❌ An error occurred. Please try again later or contact support.');
    res.type('text/xml').send(twiml.toString());
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'WhatsApp webhook is working!' });
});

module.exports = router;
