const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const whatsappRoutes = require('./routes/whatsapp');
const productRoutes = require('./routes/products');
const farmerRoutes = require('./routes/farmers');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection?.readyState;
  res.json({ 
    status: 'ok', 
    message: 'FarmLink AI Server is running',
    timestamp: new Date().toISOString(),
    db: {
      connected: dbState === 1,
      readyState: dbState
    },
    config: {
      ai_service_url: process.env.AI_SERVICE_URL ? 'set' : 'unset',
      backend_public_url: process.env.BACKEND_PUBLIC_URL ? 'set' : 'unset'
    }
  });
});

// MongoDB Connection with retry (do not crash app immediately)
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';
  const maxAttempts = 10;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB Connected Successfully');
      return;
    } catch (error) {
      const backoff = Math.min(30000, 2000 * attempt); // up to 30s
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${maxAttempts}):`, error.message);
      if (attempt >= maxAttempts) {
        console.error('⚠️ Max MongoDB connection attempts reached. Server will continue running; API will return errors until DB is reachable.');
        return;
      }
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
};

// Start Server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  // Start server first; DB connects in background/retries
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`
    🚀 FarmLink AI Server Started!
    
    📱 Server running at: http://0.0.0.0:${PORT}
    🌾 Marketplace: http://0.0.0.0:${PORT}
    👨‍💼 Admin Panel: http://0.0.0.0:${PORT}/admin.html
    
    💬 WhatsApp Webhook: http://0.0.0.0:${PORT}/api/whatsapp
    📊 API Health: http://0.0.0.0:${PORT}/api/health
    `);

    // Kick off DB connect attempts
    connectDB();
  });
};

startServer();

// Handle unhandled promise rejections (log but don't crash)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions (log but keep process alive)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
