# 🧑‍🌾 FarmLink AI - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FARMER (Parvati)                      │
│                           WhatsApp                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Send: "Tomato 30 kg" + Photo
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Twilio WhatsApp API                       │
│                   (Webhook: /api/whatsapp)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Backend Server                     │
│                     (Express.js - Port 3000)                 │
│                                                               │
│  Routes:                                                      │
│  • /api/whatsapp    - WhatsApp webhook handler               │
│  • /api/products    - Product CRUD operations                │
│  • /api/farmers     - Farmer management                      │
│  • /api/health      - Health check                           │
└─────┬──────────────────────────────────┬────────────────────┘
      │                                  │
      │ Call AI Service                  │ Save to Database
      │                                  │
      ▼                                  ▼
┌────────────────────────┐    ┌────────────────────────┐
│  AI Quality Grading    │    │   MongoDB Atlas        │
│  Python Flask (5000)   │    │   (Cloud Database)     │
│                        │    │                        │
│  • MobileNetV2 Model   │    │  Collections:          │
│  • Image Analysis      │    │  • farmers             │
│  • Grade: A/B/C        │    │  • products            │
└────────────────────────┘    └────────────────────────┘
                                        │
                                        │ Read Products
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Web Application                        │
│              (Vanilla JS + Modern CSS)                       │
│                                                               │
│  Pages:                                                       │
│  • index.html   - Buyer marketplace                          │
│  • admin.html   - Farmer management                          │
│                                                               │
│  Features:                                                    │
│  • Glass morphism UI                                         │
│  • Animated gradients                                        │
│  • Real-time updates                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Place Order
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        BUYER (Ravi)                          │
│                    Hotel/Restaurant Owner                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Product Listing Flow
```
Farmer (WhatsApp) 
  → Twilio API 
  → Backend (/api/whatsapp)
  → AI Service (quality grading)
  → MongoDB (save product)
  → WhatsApp (confirmation to farmer)
```

### 2. Order Placement Flow
```
Buyer (Web)
  → Frontend (order modal)
  → Backend (/api/products/order/:id)
  → MongoDB (update status)
  → Twilio API
  → Farmer (WhatsApp notification)
```

### 3. Farmer Onboarding Flow
```
Admin (Web)
  → Frontend (admin panel)
  → Backend (/api/farmers)
  → MongoDB (save farmer)
  → Frontend (confirmation)
```

## Database Schema

### Farmers Collection
```javascript
{
  _id: ObjectId,
  name: String,              // "Parvati Devi"
  phone: String,             // "+911234567890"
  location: String,          // "Bengaluru Rural"
  isActive: Boolean,         // true/false
  createdAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  farmer_phone: String,      // "+911234567890"
  farmer_name: String,       // "Parvati Devi"
  farmer_location: String,   // "Bengaluru Rural"
  product_name: String,      // "Tomato"
  quantity: String,          // "30 kg"
  status: String,            // "available" | "ordered" | "delivered"
  image_url: String,         // Twilio media URL
  quality_grade: String,     // "Grade A" | "Grade B" | "Grade C"
  quality_score: Number,     // 0-100
  buyer_phone: String,       // Set when ordered
  buyer_name: String,        // Set when ordered
  createdAt: Date,
  orderedAt: Date
}
```

## API Endpoints

### Farmer Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmers` | Get all farmers |
| POST | `/api/farmers` | Add new farmer |
| PUT | `/api/farmers/:id` | Update farmer |
| DELETE | `/api/farmers/:id` | Delete farmer |

### Product Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all available products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products/order/:id` | Place order |

### WhatsApp Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp` | Webhook for incoming WhatsApp messages |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `http://localhost:5000/grade` | Grade produce quality |
| GET | `http://localhost:5000/health` | Health check |

## Technology Stack Details

### Backend (Node.js)
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **twilio**: WhatsApp integration
- **axios**: HTTP client for AI service
- **dotenv**: Environment configuration
- **cors**: Cross-origin resource sharing
- **body-parser**: Request parsing

### Frontend (Vanilla JavaScript)
- **No frameworks**: Pure JS for simplicity
- **Modern CSS3**: Glass morphism, gradients, animations
- **Responsive design**: Mobile-first approach
- **Real-time updates**: Auto-refresh every 30 seconds

### AI Service (Python/Flask)
- **flask**: Lightweight web framework
- **tensorflow**: Deep learning framework
- **Pillow**: Image processing
- **MobileNetV2**: Pre-trained CNN model
- **numpy**: Numerical computations

### Database (MongoDB Atlas)
- **Cloud-hosted**: No local setup required
- **Free tier**: M0 cluster (512 MB storage)
- **Automatic backups**: Point-in-time recovery
- **Global clusters**: Low latency access

### Integration (Twilio)
- **WhatsApp Business API**: Sandbox for development
- **Programmable messaging**: Send/receive messages
- **Media support**: Image upload/download
- **Webhooks**: Real-time message delivery

## Security Considerations

### Current Implementation (MVP)
- ✅ Environment variables for credentials
- ✅ CORS enabled for development
- ✅ MongoDB connection with authentication
- ✅ Input validation on forms

### Production Requirements
- 🔒 HTTPS/TLS encryption
- 🔒 API rate limiting
- 🔒 JWT authentication for admin
- 🔒 Input sanitization
- 🔒 CSRF protection
- 🔒 Image upload to secure storage (S3)
- 🔒 Webhook signature verification
- 🔒 Environment-based configuration

## Scalability Path

### Phase 1: MVP (Current)
- Single server deployment
- Twilio sandbox
- Free MongoDB Atlas tier
- Manual coordination

### Phase 2: Production
- Load balancer + multiple servers
- Twilio production account
- MongoDB replica set
- Automated logistics

### Phase 3: Scale
- Microservices architecture
- Message queue (RabbitMQ/Redis)
- CDN for static assets
- Multi-region deployment
- Kubernetes orchestration

## Performance Optimization

### Current Optimizations
- ✅ Database indexes on frequently queried fields
- ✅ Efficient query patterns
- ✅ Image lazy loading
- ✅ CSS animations (GPU accelerated)
- ✅ Minimal dependencies

### Future Optimizations
- 📈 Redis caching layer
- 📈 Image compression/CDN
- 📈 Database query optimization
- 📈 Frontend code splitting
- 📈 Service worker for offline support

## Monitoring & Analytics

### Recommended Tools
- **Backend**: PM2 for process management
- **Database**: MongoDB Atlas monitoring
- **Logging**: Winston or Morgan
- **Analytics**: Google Analytics
- **Error tracking**: Sentry
- **Uptime**: UptimeRobot

## Deployment Options

### Quick Deploy (Free Tiers)
- **Backend**: Heroku, Render, Railway
- **Database**: MongoDB Atlas (already cloud)
- **AI Service**: Render, Railway
- **Frontend**: Vercel, Netlify, GitHub Pages

### Production Deploy
- **Cloud**: AWS, Google Cloud, Azure
- **Containers**: Docker + Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI
- **Monitoring**: Datadog, New Relic

---

**Architecture designed for rapid iteration and easy scaling** 🚀
