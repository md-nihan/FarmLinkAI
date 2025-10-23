const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { normalizePhone, ensureWhatsAppAddress } = require('../utils/phone');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MessagingResponse = twilio.twiml.MessagingResponse;

// Array to store multiple Twilio clients for failover
let twilioClients = [];
let currentClientIndex = 0;

// Export twilioClients so other modules can access it
module.exports.twilioClients = twilioClients;

// Function to initialize multiple Twilio clients
function initializeTwilioClients() {
  // Clear the existing array
  twilioClients.length = 0;
  currentClientIndex = 0;
  
  // Check for multiple account configurations
  const accountConfigs = [];
  
  console.log('🔧 Initializing Twilio clients...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET'}`);
  console.log(`   TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`   TWILIO_WHATSAPP_NUMBER: ${process.env.TWILIO_WHATSAPP_NUMBER || 'NOT SET'}`);
  
  // Check for multiple accounts (TWILIO_ACCOUNT_SID_1, TWILIO_ACCOUNT_SID_2, etc.)
  for (let i = 1; i <= 5; i++) {
    const accountSid = process.env[`TWILIO_ACCOUNT_SID_${i}`];
    const authToken = process.env[`TWILIO_AUTH_TOKEN_${i}`];
    let whatsappNumber = process.env[`TWILIO_WHATSAPP_NUMBER_${i}`] || process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (accountSid && authToken) {
      // Ensure correct WhatsApp from address (whatsapp:+E164)
      if (whatsappNumber) {
        const e164From = normalizePhone(whatsappNumber);
        whatsappNumber = e164From.startsWith('whatsapp:') ? e164From : `whatsapp:${e164From}`;
      }
      accountConfigs.push({
        accountSid,
        authToken,
        whatsappNumber
      });
      console.log(`✅ Twilio Account ${i} configured`);
    }
  }
  
  // If no multiple accounts found, use the primary account
  if (accountConfigs.length === 0 && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    let whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (whatsappNumber) {
      const e164From = normalizePhone(whatsappNumber);
      whatsappNumber = e164From.startsWith('whatsapp:') ? e164From : `whatsapp:${e164From}`;
    }
    accountConfigs.push({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappNumber: whatsappNumber
    });
    console.log('✅ Primary Twilio Account configured');
  }
  
  // Initialize clients for each account
  accountConfigs.forEach((config, index) => {
    try {
      const client = twilio(config.accountSid, config.authToken);
      twilioClients.push({
        client,
        config,
        index
      });
      console.log(`✅ Twilio Client ${index + 1} initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize Twilio Client ${index + 1}:`, error.message);
    }
  });
  
  if (twilioClients.length === 0) {
    console.error('❌ No Twilio accounts configured!');
    console.error('   Please set the following environment variables:');
    console.error('   - TWILIO_ACCOUNT_SID');
    console.error('   - TWILIO_AUTH_TOKEN');
    console.error('   - TWILIO_WHATSAPP_NUMBER');
    console.error('   Check TWILIO_SETUP_FIX.md for detailed instructions');
    return false;
  }
  
  console.log(`✅ Initialized ${twilioClients.length} Twilio account(s) for failover`);
  return true;
}

// Function to send WhatsApp message with failover
async function sendWhatsAppMessageWithFailover(messageOptions) {
  // Ensure Twilio clients are available; lazily initialize if needed
  if (twilioClients.length === 0) {
    console.log('🔧 No Twilio clients initialized yet. Attempting lazy initialization...');
    const ok = initializeTwilioClients();
    if (!ok || twilioClients.length === 0) {
      const error = new Error('No Twilio accounts configured. Please set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
      error.code = 'NO_TWILIO_CONFIG';
      throw error;
    }
  }
  
  const errors = [];
  
  // Try each client in order until one succeeds
  for (let i = 0; i < twilioClients.length; i++) {
    const clientIndex = (currentClientIndex + i) % twilioClients.length;
    const { client, config } = twilioClients[clientIndex];
    
    try {
      console.log(`📤 Attempting to send message with Twilio Account ${clientIndex + 1}...`);
      
      const message = await client.messages.create({
        body: messageOptions.body,
        from: config.whatsappNumber,
        to: messageOptions.to
      });
      
      console.log(`✅ Message sent successfully with Twilio Account ${clientIndex + 1}! Message SID: ${message.sid}`);
      
      // Update current client index for next message (round-robin)
      currentClientIndex = (clientIndex + 1) % twilioClients.length;
      
      return message;
    } catch (error) {
      console.error(`❌ Failed to send message with Twilio Account ${clientIndex + 1}:`, error.message);
      console.error('Error code:', error.code);
      
      // Check if this is a credit limit error that warrants switching accounts
      if (isCreditLimitError(error)) {
        console.log(`⚠️ Credit limit reached for Account ${clientIndex + 1}, will try next account if available`);
        errors.push({
          account: clientIndex + 1,
          error: error.message,
          code: error.code
        });
        // Continue to try next account
      } else {
        // For other errors, re-throw immediately
        throw error;
      }
    }
  }
  
  // If we get here, all accounts failed
  const error = new Error(`Failed to send message with all ${twilioClients.length} Twilio accounts. Errors: ${JSON.stringify(errors)}`);
  error.code = 'ALL_ACCOUNTS_FAILED';
  throw error;
}

// Function to determine if an error is due to credit limits
function isCreditLimitError(error) {
  if (!error) return false;
  
  // Common Twilio error codes for rate/credit limits
  const creditLimitCodes = [
    21614,  // Recipient not valid (can be due to limits)
    63018,  // Rate limit exceeded
    21211,  // Invalid 'To' Phone Number (can be due to limits)
    21408   // Permission to send an SMS has not been enabled for the region
  ];
  
  // Check for specific error messages
  const errorMessage = (error.message || '').toLowerCase();
  const creditLimitMessages = [
    'credit limit',
    'rate limit',
    'too many requests',
    'quota exceeded',
    'daily limit',
    'monthly limit'
  ];
  
  return creditLimitCodes.includes(error.code) || 
         creditLimitMessages.some(msg => errorMessage.includes(msg)) ||
         error.status === 429; // HTTP Too Many Requests
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
    const farmer = await Farmer.findOne({ phone: normalizePhone(fromNumber) });
    
    if (!farmer) {
      twiml.message('❌ Sorry, you are not registered as a farmer. Please contact admin for registration.');
      return res.type('text/xml').send(twiml.toString());
    }

    if (!farmer.isActive) {
      twiml.message('❌ Your account is currently inactive. Please contact admin.');
      return res.type('text/xml').send(twiml.toString());
    }

    // If farmer is approved but welcome not sent yet (or not recorded), send it now (post-join)
    if (farmer.approvalStatus === 'approved' && (!farmer.welcomeSent || !farmer.welcomeSentAt)) {
      try {
        const sandboxJoinCode = process.env.TWILIO_SANDBOX_JOIN_CODE || 'organization-organized';
        const sandboxNumber = process.env.TWILIO_SANDBOX_NUMBER || '+14155238886';
        const welcomeMsg = `🎉 *Welcome ${farmer.name}!*\n\n` +
          `You're now connected with FarmLink AI.\n\n` +
          `You can list produce by sending: [Vegetable] [Quantity] (e.g., Tomato 50 kg)\n\n` +
          `If messages ever fail, ensure you are joined to sandbox by sending \"join ${sandboxJoinCode}\" to ${sandboxNumber}.`;

        await sendWhatsAppMessageWithFailover({
          body: welcomeMsg,
          to: `whatsapp:${normalizePhone(fromNumber)}`
        });
        farmer.welcomeSent = true;
        farmer.welcomeSentAt = new Date();
        await farmer.save();
        console.log(`✅ Late welcome message delivered to ${fromNumber}`);
      } catch (e) {
        console.error('⚠️ Failed to send late welcome:', e.message);
      }
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
        // Use the same logic as server.js for consistency
        let backendBase;
        // Use environment variable if set and not in local development
        if (process.env.BACKEND_PUBLIC_URL && process.env.NODE_ENV !== 'development') {
          backendBase = process.env.BACKEND_PUBLIC_URL;
        } else if (process.env.NODE_ENV === 'production') {
          const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          backendBase = `${proto}://${host}`;
        } else {
          // For local development, use localhost
          backendBase = `http://localhost:${process.env.PORT || 3001}`;
        }
        
        // Ensure we always use the correct production URL for deployed images
        if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_PUBLIC_URL) {
          // Fallback to the known deployed URL if environment variable is not set
          backendBase = 'https://farmlinkai-7.onrender.com';
        }
        
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
    
    // Try to send WhatsApp confirmation with failover
    let whatsappSent = false;
    
    try {
      await sendWhatsAppMessageWithFailover({
        body: confirmationMsg,
        to: `whatsapp:${fromNumber}`
      });
      console.log(`✅ WhatsApp confirmation sent successfully to ${fromNumber}`);
      whatsappSent = true;
    } catch (msgError) {
      console.error(`❌ Failed to send WhatsApp confirmation to ${fromNumber}:`, msgError.message);
      console.error('Error code:', msgError.code);
      // Continue anyway - don't fail the whole process
    }
    
    // After confirmation, ensure welcome message delivered if never recorded
    if (farmer.approvalStatus === 'approved' && !farmer.welcomeSent) {
      try {
        const sandboxJoinCode = process.env.TWILIO_SANDBOX_JOIN_CODE || 'organization-organized';
        const sandboxNumber = process.env.TWILIO_SANDBOX_NUMBER || '+14155238886';
        const quickWelcome = `🎉 Congratulations ${farmer.name}! Your FarmLink AI account is active.\nSend: [Vegetable] [Quantity] (e.g., Tomato 50 kg). If messages fail, send \"join ${sandboxJoinCode}\" to ${sandboxNumber}.`;
        await sendWhatsAppMessageWithFailover({ body: quickWelcome, to: `whatsapp:${normalizePhone(fromNumber)}` });
        farmer.welcomeSent = true;
        farmer.welcomeSentAt = new Date();
        await farmer.save();
        console.log(`✅ Post-listing welcome delivered to ${fromNumber}`);
      } catch (e) {
        console.error('⚠️ Failed to send post-listing welcome:', e.message);
      }
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
        try {
          await sendWhatsAppMessageWithFailover({
            body: `⚠️ We encountered an issue saving your product listing. Please try again or contact support.`,
            to: `whatsapp:${fromNumber}`
          });
          console.log(`✅ Error notification sent to farmer: ${fromNumber}`);
        } catch (notifyError) {
          console.error(`❌ Failed to send error notification to ${fromNumber}:`, notifyError.message);
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
          let backendBase = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}`;
          
          // Ensure we always use the correct production URL for deployed images
          if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_PUBLIC_URL) {
            // Fallback to the known deployed URL if environment variable is not set
            backendBase = 'https://farmlinkai-7.onrender.com';
          }
          
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
module.exports.initializeTwilioClients = initializeTwilioClients;
module.exports.sendWhatsAppMessageWithFailover = sendWhatsAppMessageWithFailover;
module.exports.isCreditLimitError = isCreditLimitError;
// Export twilioClients so other modules can access it
module.exports.twilioClients = twilioClients;
