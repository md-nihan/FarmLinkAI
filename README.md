███████╗ █████╗ ██████╗ ███╗   ███╗██╗     ██╗███╗   ██╗██╗  ██╗     █████╗ ██╗
██╔════╝██╔══██╗██╔══██╗████╗ ████║██║     ██║████╗  ██║██║ ██╔╝    ██╔══██╗██║
█████╗  ███████║██████╔╝██╔████╔██║██║     ██║██╔██╗ ██║█████╔╝     ███████║██║
██╔══╝  ██╔══██║██╔══██╗██║╚██╔╝██║██║     ██║██║╚██╗██║██╔═██╗     ██╔══██║██║
██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║██║ ╚████║██║  ██╗    ██║  ██║██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
```

<div align="center">

# 🌾 FarmLink AI - Hyperlocal Supply Chain for Farmers

**Connecting Farmers Directly with Buyers using AI & WhatsApp**

[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.twilio.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Demo](#-live-demo) • [Documentation](#-documentation) • [Tech Stack](#%EF%B8%8F-tech-stack)

</div>

---

## 🎯 The Problem

Farmers in India lose **30-40% of their income** to middlemen and logistical inefficiencies. They lack:
- Direct access to local markets
- Real-time demand information
- Fair pricing mechanisms
- Quality verification systems

Meanwhile, buyers struggle with inconsistent quality and inflated prices.

## 💡 The Solution

FarmLink AI is a **hyperlocal supply chain platform** that:
- 📱 Enables farmers to list produce via **WhatsApp** (zero learning curve)
- 🤖 Uses **AI image recognition** for automatic quality grading
- 🛒 Provides **real-time marketplace** for buyers to discover fresh produce
- ⚡ Facilitates **direct connection** between farmers and buyers
- 💰 Eliminates middlemen and ensures **fair pricing**

---

## ✨ Features

### For Farmers 🧑‍🌾
- ✅ **WhatsApp Integration**: List products by sending "Tomato 30 kg" + photo
- ✅ **Instant Confirmation**: Receive listing confirmation within 60 seconds
- ✅ **Order Notifications**: Get WhatsApp alerts when buyers place orders
- ✅ **No App Required**: Works on any smartphone with WhatsApp

### For Buyers 🛒
- ✅ **AI-Verified Quality**: See Grade A/B/C ratings on all products
- ✅ **Real-Time Marketplace**: Browse fresh produce with live updates
- ✅ **Direct Contact**: Connect directly with farmers (no middlemen)
- ✅ **Modern UI**: Beautiful, responsive design with animations

### For Admins 👨‍💼
- ✅ **Farmer Management**: Onboard and manage farmers easily
- ✅ **Analytics Dashboard**: Track products, orders, and farmers
- ✅ **Quality Control**: Monitor AI grading performance

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 16+](https://nodejs.org/)
- [Python 3.8+](https://www.python.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free)
- [Twilio](https://www.twilio.com/) account (free trial)

### Installation (Windows)

```powershell
# 1. Run setup wizard
setup.bat

# 2. Configure environment
# Edit .env with your credentials (MongoDB, Twilio)
notepad .env

# 3. Start AI service (Terminal 1)
start-ai-service.bat

# 4. Start backend (Terminal 2)
start-backend.bat

# 5. Open in browser
# Marketplace: http://localhost:3001
# Farmer Registration: http://localhost:3001/register.html
# Admin Login: http://localhost:3001/login.html
```

### Installation (Linux/Mac)

```bash
# Install dependencies
npm install
cd ai-service && pip install -r requirements.txt && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start AI service (Terminal 1)
cd ai-service
python app.py

# Start backend (Terminal 2)
npm start

# Open http://localhost:3001
# Farmer Registration: http://localhost:3001/register.html
# Admin Login: http://localhost:3001/login.html
```

### Deployment on Render

See [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md) for detailed deployment instructions.

---

## 🎬 Live Demo

### User Journey

1. **Admin adds farmer** (http://localhost:3000/admin.html)
   - Name: Parvati Devi
   - Phone: +911234567890
   - Location: Bengaluru Rural

2. **Farmer lists product via WhatsApp**
   ```
   Send to Twilio number: "Tomato 30 kg" + 📸 photo
   
   Bot replies:
   ✅ Product Listed Successfully!
   📦 Product: Tomato
   ⚖️ Quantity: 30 kg
   ⭐ Quality: Grade A
   ```

3. **Buyer views marketplace** (http://localhost:3000)
   - See AI-graded products
   - Filter by quality
   - Click "Order Now"

4. **Farmer receives order notification**
   ```
   🎉 Order Alert!
   Product: Tomato (30 kg)
   Buyer: Ravi Kumar
   Contact: +919876543210
   ```

---

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **Twilio API** - WhatsApp integration

### Frontend
- **Vanilla JavaScript** - No frameworks (lightweight)
- **Modern CSS3** - Glass morphism, gradients, animations
- **Responsive Design** - Mobile-first approach

### AI Service
- **Python** + **Flask** - Microservice architecture
- **TensorFlow** - Deep learning framework
- **MobileNetV2** - Pre-trained CNN model
- **Pillow** - Image processing

### DevOps
- **Git** - Version control
- **MongoDB Atlas** - Cloud database hosting
- **ngrok** - Webhook tunneling (development)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed installation & troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & data flow |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | Complete QA procedures |
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | Presentation & demo guide |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Comprehensive overview |

---

## 📁 Project Structure

```
farmerproject/
├── 📂 models/          # MongoDB schemas (Farmer, Product)
├── 📂 routes/          # API endpoints (WhatsApp, Products, Farmers)
├── 📂 public/          # Frontend (HTML, CSS, JS)
├── 📂 ai-service/      # Python Flask AI microservice
├── 🔧 server.js        # Main backend server
├── 📄 package.json     # Node.js dependencies
└── 📖 Documentation    # Setup guides, architecture, etc.
```

---

## 🎨 Screenshots

### Marketplace (Buyer View)
- Modern glass morphism design
- AI quality badges (Grade A/B/C)
- Real-time product updates
- Responsive mobile layout

### Admin Panel
- Farmer management dashboard
- Live statistics
- Product monitoring
- Clean, intuitive interface

### WhatsApp Integration
- Natural language product listing
- Instant confirmations
- Order notifications
- Zero learning curve

---

## 🛣️ Roadmap

### ✅ Phase 1: MVP (Current)
- [x] WhatsApp-based product listing
- [x] AI quality grading (MobileNetV2)
- [x] Real-time marketplace
- [x] Order placement system
- [x] Admin farmer management

### 🚧 Phase 2: Enhanced Features (3 months)
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Analytics dashboard
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Advanced WhatsApp bot (voice, catalogs)
- [ ] Push notifications

### 🔮 Phase 3: AI & Automation (6 months)
- [ ] Demand forecasting
- [ ] Route optimization
- [ ] Dynamic pricing
- [ ] Custom AI model (trained on produce)
- [ ] Farmer education via WhatsApp

### 🌍 Phase 4: Scale (12 months)
- [ ] B2B portal for businesses
- [ ] Inventory management
- [ ] Logistics integration
- [ ] Pan-India expansion
- [ ] Native mobile apps

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📊 MVP Success Metrics

- ✅ **Listing Speed**: <60 seconds per product
- ✅ **AI Accuracy**: 85%+ quality grading accuracy
- ✅ **User Adoption**: 100% WhatsApp confirmation delivery
- ✅ **System Reliability**: 99%+ uptime
- ✅ **Response Time**: <500ms API responses

---

## 🐛 Troubleshooting

**MongoDB Connection Failed?**
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure password doesn't have special characters

**WhatsApp Not Working?**
- Join Twilio sandbox first
- Verify credentials in `.env`
- Check webhook URL (use ngrok for local testing)

**AI Service Error?**
- Install TensorFlow: `pip install tensorflow==2.13.0`
- For Windows, try: `pip install tensorflow-cpu==2.13.0`

➡️ **Full troubleshooting**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📄 License

MIT License - Free for educational and commercial use.

See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Farmers** - The backbone of our food system
- **Open Source Community** - TensorFlow, Node.js, MongoDB teams
- **Twilio** - WhatsApp API platform
- **MongoDB** - Atlas cloud database

---

## 📞 Support

- 📧 **Email**: Contact via repository
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📖 **Docs**: See documentation folder

---

<div align="center">

**Made with ❤️ for farmers**

*Empowering 🧑‍🌾 • Innovating 🤖 • Connecting 🌾*

⭐ Star this repo if you found it helpful!

</div>
