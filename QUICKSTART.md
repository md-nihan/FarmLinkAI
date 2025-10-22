# 🌾 FarmLink AI - Quick Start Guide

## Get Started in 5 Minutes!

### 1️⃣ Install Dependencies

```powershell
# Install Node.js packages
npm install

# Install Python packages
cd ai-service
pip install -r requirements.txt
cd ..
```

### 2️⃣ Configure Environment

```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env with your credentials
notepad .env
```

**Required Credentials:**
- MongoDB Atlas connection string
- Twilio Account SID & Auth Token
- Twilio WhatsApp number

### 3️⃣ Start Services

**Terminal 1 - AI Service:**
```powershell
cd ai-service
python app.py
```

**Terminal 2 - Backend Server:**
```powershell
npm start
```

### 4️⃣ Access Platform

- 🛒 **Marketplace:** http://localhost:3000
- 👨‍💼 **Admin Panel:** http://localhost:3000/admin.html
- 🏥 **Health Check:** http://localhost:3000/api/health

---

## 🎯 Quick Test Workflow

1. **Add Farmer** (Admin Panel)
   - Open http://localhost:3000/admin.html
   - Add farmer with your WhatsApp number

2. **List Product** (WhatsApp)
   - Send to Twilio number: "Tomato 30 kg"
   - Attach a photo (optional)

3. **View Product** (Marketplace)
   - Open http://localhost:3000
   - See your AI-graded product

4. **Place Order** (Buyer)
   - Click "Order Now"
   - Fill details
   - Farmer gets WhatsApp notification!

---

## 📚 Full Documentation

For detailed setup instructions, troubleshooting, and API reference:
👉 See **SETUP_GUIDE.md**

---

## 🎨 Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** Vanilla JS, Modern CSS (Glass Morphism)
- **AI:** Python, Flask, TensorFlow (MobileNetV2)
- **Integration:** Twilio WhatsApp API

---

## 🏆 MVP Features

✅ WhatsApp-based product listing
✅ AI quality grading (Grade A/B/C)
✅ Real-time marketplace
✅ Order placement system
✅ Instant WhatsApp notifications
✅ Admin farmer management

---

## 🚀 Next Steps

After MVP validation:
- Payment gateway integration
- Route optimization for delivery
- Demand forecasting AI
- Mobile application
- Production deployment

---

**Made with ❤️ for farmers** 🧑‍🌾
