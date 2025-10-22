# Deployment Guide: FarmLink AI on Render

This guide will help you deploy the complete FarmLink AI application on Render with both the Node.js backend and Python AI service.

## Prerequisites

1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
3. A [Twilio](https://www.twilio.com) account
4. This repository code

## Step 1: Prepare Your Repository

1. Commit all your changes to Git:
```bash
git add .
git commit -m "Prepare for Render deployment"
```

2. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/farmlink-ai.git
git branch -M master
git push -u origin master
```

## Step 2: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the IP whitelist (or use 0.0.0.0/0 for testing)
5. Get your connection string:
   - Click "Connect" -> "Connect your application"
   - Copy the connection string and replace `<password>` with your actual password

## Step 3: Deploy the Python AI Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New+" -> "Web Service"
3. Connect your GitHub repository
4. Fill in the form:
   - **Name**: `farmlink-ai-ai-service`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 1 -b 0.0.0.0:$PORT render:app`
   - **Root Directory**: `ai-service`
5. Click "Advanced" and add environment variables:
   - `PYTHON_VERSION`: `3.8.11` (or higher)
6. Click "Create Web Service"

## Step 4: Deploy the Node.js Backend

1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Click "New+" -> "Web Service"
3. Connect the same GitHub repository
4. Fill in the form:
   - **Name**: `farmlink-ai-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: Leave empty (root of repository)
5. Click "Advanced" and add environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio WhatsApp number (e.g., `whatsapp:+14155238886`) |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `AI_SERVICE_URL` | URL of your deployed Python AI service (will get after deploying AI service) |
| `JWT_SECRET` | A random string for JWT token signing |
| `PORT` | `10000`

6. Click "Create Web Service"

## Step 5: Update AI Service URL

1. After the AI service is deployed, copy its URL from the Render dashboard
2. Go to your Node.js service settings on Render
3. Update the `AI_SERVICE_URL` environment variable with the AI service URL
4. Click "Save Changes" to redeploy

## Step 6: Configure Twilio Webhook

1. Go to your [Twilio Console](https://console.twilio.com)
2. Navigate to Programmable WhatsApp -> Senders
3. Click on your WhatsApp sandbox number
4. In the "Webhook URLs" section, set:
   - **WHEN A MESSAGE COMES IN**: `https://YOUR-BACKEND-URL.onrender.com/api/whatsapp` (POST)
5. Save the configuration

## Step 7: Create Initial Admin User

1. After deployment is complete, create your admin user:
```bash
curl -X POST https://YOUR-BACKEND-URL.onrender.com/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nihan9t9",
    "password": "1234",
    "name": "Admin User",
    "email": "admin@example.com"
  }'
```

## Environment Variables Reference

### Required for Node.js Backend:
- `MONGODB_URI`: MongoDB Atlas connection string
- `TWILIO_ACCOUNT_SID`: Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token
- `TWILIO_WHATSAPP_NUMBER`: WhatsApp number with `whatsapp:` prefix
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `AI_SERVICE_URL`: URL of the deployed Python AI service
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Port to run on (default: 3001 for local, Render sets automatically)

### Required for Python AI Service:
- `TWILIO_ACCOUNT_SID`: (Optional) For downloading Twilio media
- `TWILIO_AUTH_TOKEN`: (Optional) For downloading Twilio media
- `PORT`: (Set automatically by Render)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Verify your MongoDB URI
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user credentials are correct

2. **Twilio Webhook Not Working**:
   - Verify webhook URL is correct and publicly accessible
   - Check Twilio console for error messages
   - Ensure the endpoint returns HTTP 200

3. **AI Service Connection Failed**:
   - Verify `AI_SERVICE_URL` is correct
   - Check that the AI service is running
   - Ensure no firewall issues between services

4. **Environment Variables Not Set**:
   - Check all required environment variables are set in Render
   - Redeploy after making changes to environment variables

5. **Port Configuration Issues**:
   - The application now correctly uses `process.env.PORT` for Render compatibility
   - Node.js default port is 3001 for local development
   - Python AI service default port is 5000 for local development

### Checking Logs:

1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. Check for any error messages
4. Look for the green "✅" success messages

## Health Check Endpoints

- **Backend Health**: `https://YOUR-BACKEND-URL.onrender.com/api/health`
- **AI Service Health**: `https://YOUR-AI-SERVICE-URL.onrender.com/health`

## Updating Your Application

To update your deployed application:

1. Push changes to your GitHub repository
2. Go to your service in Render Dashboard
3. Click "Manual Deploy" -> "Deploy latest commit"
4. Or enable auto-deploy for automatic deployments on push

## Scaling Considerations

For production use:

1. Upgrade from free tier to paid plans on Render
2. Use a production MongoDB cluster instead of free tier
3. Add monitoring and alerting
4. Implement proper logging
5. Consider using a CDN for static assets

## Support

If you encounter issues:

1. Check the logs in Render Dashboard
2. Verify all environment variables are set correctly
3. Ensure your MongoDB Atlas cluster is accessible
4. Confirm Twilio webhook is properly configured