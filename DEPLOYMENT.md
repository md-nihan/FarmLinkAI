# 🚀 FarmLink AI - Deployment Guide

## Overview

This guide covers deploying FarmLink AI to production environments. We'll cover free and paid options.

---

## 🆓 Free Deployment (Recommended for MVP)

### Option 1: Render.com (Easiest)

#### Backend Deployment

1. **Create account** at [render.com](https://render.com)

2. **New Web Service**
   - Connect your GitHub repository
   - Name: `farmlink-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

3. **Environment Variables**
   ```
   MONGODB_URI=your_mongodb_atlas_url
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   AI_SERVICE_URL=https://your-ai-service.onrender.com
   NODE_ENV=production
   ```

4. **Deploy** - Render will auto-deploy on git push

#### AI Service Deployment

1. **New Web Service**
   - Name: `farmlink-ai-service`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Root Directory: `ai-service`

2. **Update Backend** - Set AI_SERVICE_URL to AI service URL

#### Frontend

Frontend is served by the backend (static files in `/public`)

---

### Option 2: Railway.app

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   railway init
   railway up
   railway variables set MONGODB_URI=...
   ```

3. **Deploy AI Service**
   ```bash
   cd ai-service
   railway init
   railway up
   ```

---

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Apps**
   ```bash
   heroku create farmlink-backend
   heroku create farmlink-ai-service
   ```

3. **Configure Environment**
   ```bash
   heroku config:set MONGODB_URI=... -a farmlink-backend
   heroku config:set TWILIO_ACCOUNT_SID=... -a farmlink-backend
   # ... other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 💰 Production Deployment (Paid)

### AWS (Amazon Web Services)

#### Backend on EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect and Setup**
   ```bash
   ssh ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone your-repo-url
   cd farmerproject
   npm install
   ```

3. **Configure Environment**
   ```bash
   nano .env
   # Add your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start server.js --name farmlink-backend
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/farmlink
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/farmlink /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### AI Service on EC2 (Separate Instance)

1. **Launch EC2 Instance**
   - Same as above
   - Recommended: t2.medium (AI needs more CPU)

2. **Install Python**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip
   ```

3. **Deploy AI Service**
   ```bash
   cd farmerproject/ai-service
   pip3 install -r requirements.txt
   pm2 start app.py --name farmlink-ai --interpreter python3
   ```

---

### Google Cloud Platform (GCP)

#### Using Cloud Run (Serverless)

1. **Install gcloud CLI**
   ```bash
   curl https://sdk.cloud.google.com | bash
   gcloud init
   ```

2. **Create Dockerfile** (Backend)
   ```dockerfile
   FROM node:16
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Build and Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/farmlink-backend
   gcloud run deploy farmlink-backend --image gcr.io/your-project/farmlink-backend --platform managed
   ```

4. **Set Environment Variables**
   - Go to Cloud Run console
   - Edit service
   - Add environment variables

---

### DigitalOcean (Droplet)

1. **Create Droplet**
   - Ubuntu 22.04
   - Basic plan ($6/month)
   - Choose datacenter

2. **SSH and Setup**
   ```bash
   ssh root@your-droplet-ip
   
   # Same setup as AWS EC2
   # Install Node.js, PM2, Nginx
   ```

3. **Deploy Application**
   - Same steps as AWS EC2

---

## 📱 WhatsApp Production Setup

### Upgrade from Sandbox to Production

1. **Twilio Account Upgrade**
   - Verify your identity (business documents)
   - Purchase a phone number
   - Request WhatsApp Business API access

2. **Facebook Business Manager**
   - Create business account
   - Link to Twilio
   - Complete verification

3. **Update Environment**
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+your_production_number
   ```

4. **Configure Webhook**
   - In Twilio Console: Messaging → Settings → WhatsApp
   - Webhook URL: `https://your-domain.com/api/whatsapp`
   - Method: POST

---

## 🗄️ Database (MongoDB Atlas)

### Production Configuration

1. **Upgrade Cluster**
   - Free tier (M0) → M2 or higher
   - More storage and connections

2. **Security**
   - Remove 0.0.0.0/0 IP whitelist
   - Add specific server IPs only
   - Enable audit logs

3. **Backups**
   - Enable automatic backups
   - Set retention period (7-30 days)
   - Test restore process

4. **Performance**
   - Create indexes on frequently queried fields
   - Enable performance monitoring
   - Set up alerts

---

## 🔐 Security Checklist

### Application Security

- [ ] Enable HTTPS (SSL certificate)
- [ ] Remove debug logs in production
- [ ] Set `NODE_ENV=production`
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Verify Twilio webhook signatures
- [ ] Use environment variables (never hardcode secrets)

### Database Security

- [ ] Strong database password
- [ ] IP whitelist (specific IPs only)
- [ ] Enable MongoDB encryption at rest
- [ ] Regular backups
- [ ] Monitor unusual activity

### API Security

- [ ] Implement API authentication (JWT)
- [ ] Rate limiting (prevent abuse)
- [ ] CORS configuration (specific origins)
- [ ] Input validation
- [ ] Error handling (don't expose stack traces)

---

## 📊 Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring** (Free)
   ```bash
   pm2 monitor
   ```

2. **Uptime Robot** (Free)
   - Monitor endpoint availability
   - Alert on downtime

3. **LogRocket / Sentry** (Error Tracking)
   ```bash
   npm install @sentry/node
   ```

### Database Monitoring

- MongoDB Atlas built-in monitoring
- Set alerts for:
  - High CPU usage
  - Low storage
  - Connection spikes

### Analytics

- Google Analytics (frontend)
- Custom event tracking (product listings, orders)

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Render
      env:
        RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
      run: |
        curl $RENDER_DEPLOY_HOOK
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**
   - AWS ELB / Nginx
   - Distribute traffic across multiple servers

2. **Multiple Instances**
   - Run 2-3 backend instances
   - PM2 cluster mode: `pm2 start server.js -i max`

3. **Database Scaling**
   - MongoDB Atlas auto-scaling
   - Read replicas for heavy reads

### Caching

1. **Redis** (for session, frequently accessed data)
   ```bash
   npm install redis
   ```

2. **CDN** (for static assets)
   - Cloudflare (free)
   - AWS CloudFront

---

## 💸 Cost Estimation

### Free Tier (MVP)
- **Backend**: Render.com free tier
- **AI Service**: Render.com free tier
- **Database**: MongoDB Atlas M0 (free)
- **WhatsApp**: Twilio sandbox (free)
- **Total**: $0/month

### Production (Small Scale)
- **Backend**: Render.com Starter ($7/month)
- **AI Service**: Render.com Starter ($7/month)
- **Database**: MongoDB Atlas M2 ($9/month)
- **WhatsApp**: Twilio ($0.005/message, ~$50/month for 10k messages)
- **Domain**: Namecheap ($12/year)
- **Total**: ~$75/month

### Production (Medium Scale)
- **Backend**: AWS EC2 t3.medium ($30/month)
- **AI Service**: AWS EC2 t3.medium ($30/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **WhatsApp**: Twilio (~$200/month for 40k messages)
- **Load Balancer**: AWS ALB ($20/month)
- **Total**: ~$340/month

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificate installed
- [ ] Error monitoring setup
- [ ] Uptime monitoring configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Rollback plan documented

---

## 🆘 Troubleshooting Production Issues

### High Memory Usage
```bash
# Check memory
free -h

# Check Node.js memory
pm2 monit

# Increase memory limit
pm2 start server.js --max-memory-restart 300M
```

### Database Connection Issues
```bash
# Check connection
mongosh "your_mongodb_uri"

# Verify IP whitelist
# Check MongoDB Atlas Network Access
```

### Slow Response Times
```bash
# Enable profiling
# Add to server.js
const morgan = require('morgan');
app.use(morgan('combined'));

# Check slow queries in MongoDB Atlas
```

---

## 📞 Support

For production issues:
- 📧 Twilio Support: support.twilio.com
- 📧 MongoDB Support: support.mongodb.com
- 📧 Render Support: render.com/docs

---

**Good luck with your deployment! 🚀**
