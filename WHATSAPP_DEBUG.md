# 📱 FarmLink AI - WhatsApp Debug Guide

## 🎯 Purpose

This guide helps debug WhatsApp integration issues with Twilio API for FarmLink AI.

---

## 🔧 Twilio Configuration Check

### 1. Environment Variables
Check your `.env` file has correct values:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=your_phone_number_here
```

### 2. Webhook URL
Ensure webhook is set in Twilio Console:
- **URL**: `https://your-ngrok-url/api/whatsapp`
- **Method**: POST
- **Location**: Twilio Console → Messaging → WhatsApp Sandbox

---

## 🧪 Debugging Steps

### Step 1: Check Twilio Credentials

```bash
# Test Twilio API access
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/your_account_sid_here.json" \
  -u your_account_sid_here:your_auth_token_here
```

Expected response:
```json
{
  "account_sid": "your_account_sid_here",
  "friendly_name": "Your Account Name",
  "status": "active"
}
```

### Step 2: Verify WhatsApp Sandbox

1. Go to: https://console.twilio.com/
2. Navigate to: **Messaging → Try It Out → WhatsApp Sandbox**
3. Check:
   - Sandbox status: **Active**
   - Join code: **join something-mysterious**
   - WhatsApp number: **+14155238886**

### Step 3: Test Webhook Endpoint

```bash
# Test your webhook is accessible
curl -X POST "https://your-ngrok-url/api/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "Body": "Test message",
    "From": "whatsapp:+1234567890"
  }'
```

Expected response:
```
HTTP 200 OK
```

---

## 📊 Common Issues & Solutions

### Issue 1: "Account not found" Error

**Error**:
```json
{
  "code": 20001,
  "message": "Account not found",
  "more_info": "https://www.twilio.com/docs/errors/20001"
}
```

**Solution**:
1. Verify `TWILIO_ACCOUNT_SID` in `.env`
2. Check account SID in Twilio Console
3. Ensure credentials are correct

### Issue 2: "Authenticate failed" Error

**Error**:
```json
{
  "code": 20003,
  "message": "Authenticate failed",
  "more_info": "https://www.twilio.com/docs/errors/20003"
}
```

**Solution**:
1. Verify `TWILIO_AUTH_TOKEN` in `.env`
2. Check auth token in Twilio Console
3. Ensure no extra spaces in credentials

### Issue 3: Webhook Not Receiving Messages

**Symptoms**:
- Messages sent but no response
- No logs in terminal
- No product listings created

**Solutions**:
1. Check ngrok is running: `ngrok http 3001`
2. Verify webhook URL in Twilio Console
3. Ensure URL is HTTPS (not HTTP)
4. Check server is running: `npm start`

### Issue 4: "From" Number Format

**Error**: Messages not processed correctly

**Solution**: Ensure phone numbers include country code:
- ✅ Correct: `whatsapp:+919876543210`
- ❌ Wrong: `whatsapp:9876543210`

---

## 📞 Testing WhatsApp Flow

### 1. Manual Message Test

Send test message from your WhatsApp:
```
Test Vegetable 10kg
```

### 2. Expected Server Logs

```
📱 WhatsApp Message Received:
   From: whatsapp:+1234567890
   Body: Test Vegetable 10kg
   Media: None

✅ Product created successfully!
   Name: Test Vegetable
   Quantity: 10kg
   Farmer: +1234567890
```

### 3. Expected WhatsApp Response

```
✅ Product Listed Successfully!

📦 Product: Test Vegetable
⚖️ Quantity: 10kg
⭐ Quality: Grade B (Default - no image)
📍 Location: Unknown

Your produce is now live on the marketplace! 🌾
```

---

## 🛠️ Advanced Debugging

### 1. Check Twilio Message Logs

1. Go to: https://console.twilio.com/
2. Navigate to: **Messaging → Monitor → Logs**
3. Look for recent messages
4. Check status and error codes

### 2. Test with Twilio API Explorer

1. Go to: https://www.twilio.com/console/sms/whatsapp/learn
2. Use the API explorer to send test messages
3. Verify credentials work

### 3. ngrok Debugging

Check ngrok inspector:
1. Open: http://localhost:4040
2. View incoming requests
3. Check request format matches expectations

---

## 📈 WhatsApp Message Format

### Incoming Message Structure

```json
{
  "SmsSid": "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "SmsStatus": "received",
  "Body": "Tomato 50kg",
  "From": "whatsapp:+1234567890",
  "To": "whatsapp:+14155238886",
  "NumMedia": "0"
}
```

### With Image Attachment

```json
{
  "SmsSid": "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "SmsStatus": "received",
  "Body": "Tomato 50kg",
  "From": "whatsapp:+1234567890",
  "To": "whatsapp:+14155238886",
  "NumMedia": "1",
  "MediaUrl0": "https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media/MEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

---

## 🚨 Emergency Troubleshooting

### If Nothing Works:

1. **Restart everything**:
   ```bash
   # Terminal 1 - AI Service
   cd ai-service
   python app.py
   
   # Terminal 2 - Backend
   npm start
   ```

2. **Restart ngrok**:
   ```bash
   ngrok http 3001
   ```

3. **Update webhook URL** in Twilio Console with new ngrok URL

4. **Check firewall** - Ensure ports 3001 and 5000 are not blocked

---

## 📞 Twilio Support Resources

- **Main Docs**: https://www.twilio.com/docs/whatsapp
- **Sandbox Setup**: https://www.twilio.com/docs/whatsapp/sandbox
- **Error Codes**: https://www.twilio.com/docs/errors
- **API Explorer**: https://www.twilio.com/console/sms/whatsapp/learn

---

## 🔄 Last Updated

**Date**: 2025-10-22
**Status**: ✅ Debug guide current