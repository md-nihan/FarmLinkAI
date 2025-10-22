# 🚀 FarmLink AI - Complete Setup Guide

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- ✅ **MongoDB Atlas Account** (Free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- ✅ **Twilio Account** (Free trial) - [Sign up here](https://www.twilio.com/)

---

## 📋 Step-by-Step Setup

### Step 1: MongoDB Atlas Setup

1. **Create a MongoDB Atlas cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Click "Build a Database"
   - Choose the **FREE** M0 tier
   - Select a region closest to you
   - Click "Create Cluster"

2. **Create a database user:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `farmlink-admin`
   - Password: Generate a secure password (save it!)
   - User Privileges: "Atlas admin"
   - Click "Add User"

3. **Whitelist your IP address:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get your connection string:**
   - Go to "Databases" tab
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://...`)
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `farmlink`

### Step 2: Twilio WhatsApp Setup

1. **Create a Twilio account:**
   - Go to [Twilio](https://www.twilio.com/try-twilio)
   - Sign up for a free account
   - Complete phone verification

2. **Access WhatsApp Sandbox:**
   - In Twilio Console, go to: Messaging → Try it out → Send a WhatsApp message
   - You'll see a WhatsApp number (e.g., `+1 415 523 8886`)
   - Follow instructions to join the sandbox from your phone
   - Send the code (e.g., "join <code>") to the Twilio WhatsApp number

3. **Get your credentials:**
   - Account SID: Found on Twilio Dashboard
   - Auth Token: Found on Twilio Dashboard (click to reveal)
   - WhatsApp Number: The sandbox number (format: `whatsapp:+14155238886`)

### Step 3: Project Installation

1. **Open PowerShell and navigate to project:**
   ```powershell
   cd "c:\Users\nihan\OneDrive\Desktop\hackathon\farmerproject"
   ```

2. **Install Node.js dependencies:**
   ```powershell
   npm install
   ```

3. **Install Python dependencies:**
   ```powershell
   cd ai-service
   pip install -r requirements.txt
   cd ..
   ```

### Step 4: Environment Configuration

1. **Create `.env` file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   - Open `.env` in a text editor
   - Fill in your values:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://farmlink-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/farmlink?retryWrites=true&w=majority

   # Twilio WhatsApp Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   TWILIO_PHONE_NUMBER=+14155238886

   # AI Service Configuration
   AI_SERVICE_URL=http://localhost:5000

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

### Step 5: Running the Application

**You need 2 terminal windows:**

**Terminal 1 - Start AI Service:**
```powershell
cd ai-service
python app.py
```

Wait for: `✅ Model loaded successfully!`

**Terminal 2 - Start Backend Server:**
```powershell
npm start
```

Wait for: `🚀 FarmLink AI Server Started!`

### Step 6: Access the Platform

Open your browser and visit:

- **Marketplace:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html
- **API Health:** http://localhost:3000/api/health

---

## 🧪 Testing the Complete Workflow

### Test 1: Add a Farmer (Admin Panel)

1. Open http://localhost:3000/admin.html
2. Fill in the form:
   - **Name:** Parvati Devi
   - **Phone:** YOUR_WHATSAPP_NUMBER (with country code, e.g., +911234567890)
   - **Location:** Bengaluru Rural
3. Click "Add Farmer"
4. You should see success message

### Test 2: List a Product (WhatsApp)

1. On your phone, open WhatsApp
2. Send a message to the Twilio sandbox number
3. **Important:** Make sure you've joined the sandbox first!
4. Send: `Tomato 30 kg`
5. Optionally attach a photo of tomatoes
6. You should receive a confirmation with AI quality grade

### Test 3: View Product (Marketplace)

1. Open http://localhost:3000
2. You should see your product card with:
   - Product name and quantity
   - AI quality grade
   - Farmer details
3. The page auto-refreshes every 30 seconds

### Test 4: Place an Order (Buyer)

1. On the marketplace, click "Order Now" on a product
2. Fill in buyer details:
   - Name: Ravi Kumar
   - Phone: +919876543210
3. Click "Confirm Order"
4. The farmer should receive a WhatsApp notification instantly!

---

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
- Verify your connection string in `.env`
- Ensure password is correct (no special characters that need URL encoding)
- Check if IP is whitelisted in MongoDB Atlas Network Access

### Issue: WhatsApp Messages Not Received

**Solution:**
- Verify you've joined the Twilio sandbox
- Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in `.env`
- Ensure phone number format: `whatsapp:+14155238886`

### Issue: AI Service Not Starting

**Solution:**
```powershell
# Install TensorFlow separately if needed
pip install tensorflow==2.13.0

# For Windows, you might need:
pip install tensorflow-cpu==2.13.0
```

### Issue: Images Not Displaying

**Solution:**
- Twilio media URLs may expire
- For production, implement image upload to cloud storage (AWS S3, Cloudinary)

### Issue: Port Already in Use

**Solution:**
```powershell
# Change PORT in .env to a different number
PORT=3001

# Or kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 🌐 Making WhatsApp Webhook Public (For Testing)

The Twilio webhook needs a public URL. Use **ngrok** for testing:

1. **Download ngrok:** https://ngrok.com/download

2. **Run ngrok:**
   ```powershell
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure Twilio Webhook:**
   - Go to Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
   - Paste your ngrok URL + `/api/whatsapp`
   - Example: `https://abc123.ngrok.io/api/whatsapp`
   - Save

---

## 📊 API Endpoints Reference

### Farmer Management
- `GET /api/farmers` - Get all farmers
- `POST /api/farmers` - Add new farmer
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer

### Product Management
- `GET /api/products` - Get all available products
- `GET /api/products/:id` - Get single product
- `POST /api/products/order/:productId` - Place order

### WhatsApp Integration
- `POST /api/whatsapp` - Webhook endpoint (Twilio calls this)

### AI Service
- `POST http://localhost:5000/grade` - Grade produce quality
- `GET http://localhost:5000/health` - Health check

---

## 🎯 Success Metrics to Track

Once everything is running:

- ✅ Admin can add farmers successfully
- ✅ Farmers receive WhatsApp confirmations within 60 seconds
- ✅ Products display with AI quality grades on marketplace
- ✅ Buyers can place orders
- ✅ Farmers receive instant order notifications

---

## 🚀 Next Steps (Post-MVP)

After validating the MVP, consider:

1. **Payment Integration** - Razorpay, Stripe
2. **Route Optimization** - Google Maps API
3. **Demand Forecasting** - Historical sales data analysis
4. **Mobile App** - React Native or Flutter
5. **Cloud Deployment** - AWS, Heroku, or DigitalOcean

---

## 📞 Need Help?

If you encounter issues:

1. Check server logs in both terminals
2. Verify all credentials in `.env`
3. Test API endpoints individually
4. Check MongoDB Atlas and Twilio dashboards

Happy farming! 🌾🧑‍🌾
