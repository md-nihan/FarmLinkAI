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

// Initialize Twilio client placeholder
let twilioClient = null;

// Function to initialize Twilio client after environment is ready
function initializeTwilioClient() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    console.log('🔧 Twilio Configuration Check:');
    console.log(`   Account SID: ${accountSid ? 'SET' : 'MISSING'}`);
    console.log(`   Auth Token: ${authToken ? 'SET' : 'MISSING'}`);
    
    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials are missing!');
      twilioClient = null;
      return false;
    } else {
      twilioClient = twilio(accountSid, authToken);
      console.log('✅ Twilio client initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
    console.error('Error stack:', error.stack);
    twilioClient = null;
    return false;
  }
}

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
      responseType: 'arraybuffer',
      timeout: 30000 // 30 second timeout
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
    console.error('Error stack:', error.stack);
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
        // Construct full URL for the image
        const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const backendBase = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}` || 'https://farmlinkai-7.onrender.com';
        
        // Ensure we don't have double slashes
        if (localImagePath.startsWith('/')) {
          imageUrl = `${backendBase}${localImagePath}`;
        } else {
          imageUrl = `${backendBase}/${localImagePath}`;
        }
        
        console.log(`✅ Image will be accessible at: ${imageUrl}`);
        console.log(`🔧 Backend Base URL: ${backendBase}`);
        console.log(`🔧 Local Image Path: ${localImagePath}`);
      } else {
        console.log('⚠️ Failed to download image, will use default grade');
      }
    } else {
      console.log('ℹ️ No media files attached to this message');
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
      quality_grade: 'pending',
      quality_score: 0
    });

    // Send immediate confirmation to farmer (avoid Twilio timeout)
    const qualityText = numMedia > 0 ? 'pending AI analysis' : 'no image provided';
    const confirmationMsg = `✅ Product Listed Successfully!\n\n` +
      `📦 Product: ${productName}\n` +
      `⚖️ Quantity: ${quantity}\n` +
      `⭐ Quality: ${qualityText}\n` +
      `📍 Location: ${farmer.location || 'Not specified'}\n\n` +
      `Your produce is now live on the marketplace! 🌾\n\n` +
      `View at: ${process.env.BACKEND_PUBLIC_URL || 'https://farmlinkai-7.onrender.com'}`;

    console.log(`📲 Sending WhatsApp confirmation to ${fromNumber}:`);
    console.log(confirmationMsg);
    
    // Initialize Twilio client if not already done
    if (!twilioClient) {
      console.log('🔧 Initializing Twilio client...');
      const initSuccess = initializeTwilioClient();
      if (!initSuccess) {
        console.error('❌ Failed to initialize Twilio client. Cannot send WhatsApp confirmation.');
      }
    }
    
    // Check if Twilio client is available
    if (!twilioClient) {
      console.error('❌ Twilio client not initialized. Cannot send WhatsApp confirmation.');
      // Try to initialize it one more time
      console.log('🔧 Attempting to initialize Twilio client again...');
      initializeTwilioClient();
    }
    
    // Try to send WhatsApp confirmation
    let whatsappSent = false;
    
    // Make sure Twilio client is initialized
    if (!twilioClient) {
      console.log('🔧 Initializing Twilio client...');
      initializeTwilioClient();
    }
    
    if (twilioClient) {
      const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      console.log(`🔧 Twilio WhatsApp Number: ${twilioWhatsAppNumber || 'NOT SET'}`);
      
      if (twilioWhatsAppNumber) {
        try {
          // Send the actual WhatsApp message
          await twilioClient.messages.create({
            body: confirmationMsg,
            from: twilioWhatsAppNumber,
            to: `whatsapp:${fromNumber}`
          });
          console.log(`✅ WhatsApp confirmation sent successfully to ${fromNumber}`);
          whatsappSent = true;
        } catch (msgError) {
          console.error(`❌ Failed to send WhatsApp confirmation to ${fromNumber}:`, msgError.message);
          console.error('Error code:', msgError.code);
          console.error('More info:', msgError.moreInfo);
          // Continue anyway - don't fail the whole process
        }
      } else {
        console.error('❌ Twilio WhatsApp number is not configured!');
      }
    } else {
      console.error('❌ Twilio client could not be initialized.');
    }
    
    // Always send TwiML response
    if (whatsappSent) {
      twiml.message(confirmationMsg);
    } else {
      // Send a basic TwiML response without WhatsApp confirmation
      twiml.message('✅ Product listed successfully!\n\nYour produce is now live on the marketplace.\n\nView at: ' + (process.env.BACKEND_PUBLIC_URL || 'https://farmlinkai-7.onrender.com'));
    }

    res.type('text/xml').send(twiml.toString());

    // Save to database in background
    setImmediate(async () => {
      try {
        console.log('💾 Saving product to database:', JSON.stringify({
          farmer_phone: newProduct.farmer_phone,
          product_name: newProduct.product_name,
          quantity: newProduct.quantity,
          image_url: newProduct.image_url
        }, null, 2));
        await newProduct.save();
        console.log('✅ Product saved to database (post-response)');
        console.log('Product ID:', newProduct._id);
        
        // Also update the frontend in real-time if WebSocket is available
        // This would require implementing WebSocket connections
      } catch (e) {
        console.error('❌ Failed to save product:', e.message);
        console.error('Error stack:', e.stack);
        
        // Try to send an error notification to the farmer
        if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
          try {
            await twilioClient.messages.create({
              body: `⚠️ We encountered an issue saving your product listing. Please try again or contact support.`,
              from: process.env.TWILIO_WHATSAPP_NUMBER,
              to: `whatsapp:${fromNumber}`
            });
            console.log(`✅ Error notification sent to farmer: ${fromNumber}`);
          } catch (notifyError) {
            console.error(`❌ Failed to send error notification to ${fromNumber}:`, notifyError.message);
          }
        }
      }

      // Fire-and-forget: call AI service to refine quality grade if image is provided
      if (imageUrl) {
        try {
          console.log('🤖 Calling AI service for quality grading (async)...');
          const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://farmlinkai-7.onrender.com';
          
          console.log(`🔧 AI Service URL: ${aiServiceUrl}`);

          // Convert local path to full URL for AI service
          // Prefer explicit BACKEND_PUBLIC_URL; otherwise derive from request headers
          const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          const backendBase = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}` || 'https://farmlinkai-7.onrender.com';
          
          // Ensure we don't have double slashes
          let imageFullUrl = imageUrl;
          if (!imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('/')) {
              imageFullUrl = `${backendBase}${imageUrl}`;
            } else {
              imageFullUrl = `${backendBase}/${imageUrl}`;
            }
          }
          
          console.log(`🔧 Image URL for AI service: ${imageFullUrl}`);

          const aiResponse = await axios.post(`${aiServiceUrl}/grade`, {
            image_url: imageFullUrl,
            product_name: productName
          }, {
            timeout: 30000 // 30 second timeout
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
          console.error('Error stack:', aiError.stack);
          
          // Update product with error status
          try {
            await Product.findByIdAndUpdate(newProduct._id, {
              quality_grade: 'Grade B',
              quality_score: 75,
              ai_error: true
            });
            console.log('✅ Fallback grade applied due to AI service error');
          } catch (updateError) {
            console.error('❌ Failed to update product with fallback grade:', updateError.message);
          }
        }
      }
    });

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
module.exports.initializeTwilioClient = initializeTwilioClient;
