# 🔧 WhatsApp Troubleshooting Guide

## Current Issue: Not Receiving WhatsApp Messages

Let me help you fix this step by step!

---

## ✅ Step-by-Step Checklist

### 1. Authenticate ngrok (MOST COMMON ISSUE)

**Run this command in PowerShell:**
```powershell
ngrok config add-authtoken YOUR_ACTUAL_TOKEN_HERE
```

Replace `YOUR_ACTUAL_TOKEN_HERE` with your token from:
https://dashboard.ngrok.com/get-started/your-authtoken

**Example:**
```powershell
ngrok config add-authtoken 2abcdef1234567890_yourActualTokenHere
```

---

### 2. Start ngrok

```powershell
ngrok http 3001
```

**You should see:**
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

---

### 3. Verify Backend is Running

Check if you see this in your terminal:
```
✅ MongoDB Connected Successfully
🚀 FarmLink AI Server Started!
📱 Server running at: http://localhost:3001
```

If NOT, run:
```powershell
cd "c:\Users\nihan\OneDrive\Desktop\hackathon\farmerproject"
npm start
```

---

### 4. Configure Twilio Webhook CORRECTLY

This is CRITICAL - one wrong character and it won't work!

1. Go to: https://console.twilio.com/
2. Click: **Messaging → Try it Out → Send a WhatsApp message**
3. Scroll down to "Sandbox Configuration"
4. Find: **"WHEN A MESSAGE COMES IN"**
5. Enter: `https://YOUR-NGROK-URL/api/whatsapp`
   
   **IMPORTANT:** 
   - Use HTTPS (not HTTP)
   - Include /api/whatsapp at the end
   - No trailing slash
   - Example: `https://abc123.ngrok.io/api/whatsapp`

6. Set **HTTP Method**: **POST** (not GET)
7. Click **SAVE**

---

### 5. Join WhatsApp Sandbox

1. Open WhatsApp on your phone
2. Add contact: **+1 254 570 5933**
3. Find your join code in Twilio Console (e.g., "join happy-tiger")
4. Send the join code to +1 254 570 5933
5. You should receive: "You are now connected to the Sandbox"

---

### 6. Add Farmer First

Before sending WhatsApp messages, you MUST add the farmer:

1. Go to: http://localhost:3001/admin.html
2. Add farmer with your EXACT WhatsApp number
   - **Phone**: Must match your WhatsApp (e.g., +911234567890)
   - **Name**: Any name
   - **Location**: Any location
3. Click "Add Farmer"

**CRITICAL:** The phone number in admin panel must match your WhatsApp number!

---

### 7. Test WhatsApp

From your WhatsApp, send to **+1 254 570 5933**:
```
Tomato 30 kg
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Farmer not found" error

**Fix:** Add farmer in admin panel with EXACT WhatsApp number (including country code)

### Issue 2: No response from bot

**Possible causes:**
- ❌ ngrok not running
- ❌ Wrong webhook URL in Twilio
- ❌ Backend server not running
- ❌ Didn't join sandbox

**Check:**
```powershell
# Check if ngrok is running
# You should see a window with "Forwarding" info

# Check if backend is running
# Visit: http://localhost:3001/api/health
# Should show: {"status":"ok"}
```

### Issue 3: ngrok authentication error

**Fix:**
```powershell
# Get fresh token from: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_NEW_TOKEN
ngrok http 3001
```

### Issue 4: Webhook URL not working

**Test webhook manually:**
1. Copy your ngrok URL (e.g., https://abc123.ngrok.io)
2. Visit: `https://abc123.ngrok.io/api/health`
3. Should show: `{"status":"ok"}`
4. If it works, your webhook URL is correct!

---

## 🔍 Debugging Steps

### Step 1: Check ngrok

```powershell
# Start ngrok
ngrok http 3001
```

Look for:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

### Step 2: Test webhook URL

In browser, visit:
```
https://YOUR-NGROK-URL/api/health
```

Should show:
```json
{"status":"ok","message":"FarmLink AI Server is running"}
```

### Step 3: Check Twilio webhook

1. Go to Twilio Console
2. Check "WHEN A MESSAGE COMES IN" field
3. Should be: `https://YOUR-NGROK-URL/api/whatsapp`
4. Method: POST

### Step 4: Verify farmer exists

1. Go to: http://localhost:3001/admin.html
2. Check farmers list
3. Your WhatsApp number should be there

### Step 5: Send test message

From WhatsApp:
```
Tomato 30 kg
```

### Step 6: Check backend logs

Look at your terminal running `npm start`

You should see:
```
📱 WhatsApp Message from +1234567890: "Tomato 30 kg"
🖼️ Media files: 0
✅ Product saved to database
```

---

## 🎯 Quick Test (Without WhatsApp)

Want to test the system without ngrok?

1. **Add Farmer**: http://localhost:3001/admin.html
2. **List Product**: http://localhost:3001/test-listing.html
3. **View Marketplace**: http://localhost:3001

This tests the EXACT same workflow!

---

## 📞 Still Not Working?

Let me know:
1. What's showing in your ngrok terminal?
2. What's in the Twilio webhook field?
3. Did you join the WhatsApp sandbox?
4. What's your WhatsApp number (country code + number)?
5. Any error messages in the backend terminal?

I'll help you fix it! 🔧
