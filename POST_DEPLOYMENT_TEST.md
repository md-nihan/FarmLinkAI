# Post-Deployment Verification Test

## Overview
This document provides step-by-step instructions to verify that the farmer messaging fixes are working correctly after deployment to Render.

## Prerequisites
1. Application deployed to Render
2. Twilio credentials configured in Render environment variables
3. MongoDB connection working
4. Your WhatsApp number for testing

## Test Steps

### 1. Farmer Registration Test
1. Open your deployed application in a browser
2. Navigate to the farmer registration page (`/register.html`)
3. Register as a new farmer using your WhatsApp number
4. Verify that:
   - Registration is successful
   - You see a success message
   - No errors in the browser console

### 2. Admin Approval Test
1. Log in to the admin panel (`/admin.html`) using credentials:
   - Username: `nihan9t9`
   - Password: `1234`
2. Navigate to the "Pending Farmers" section
3. Approve the farmer you just registered
4. Verify that:
   - The farmer status changes to "Approved"
   - The farmer becomes active
   - No errors are shown in the admin panel

### 3. WhatsApp Message Verification
1. Check your WhatsApp for a message from the Twilio number (+14155238886)
2. Verify that you received:
   - A welcome message after approval
   - Proper formatting with emojis and instructions
   - Information about joining the WhatsApp sandbox

### 4. Product Listing Test
1. Reply to the WhatsApp message with the join command as instructed
2. Send a product listing message:
   - Format: `[Product Name] [Quantity]`
   - Example: `Tomato 20 kg`
3. Optionally attach a photo
4. Verify that:
   - You receive a confirmation message
   - The product appears on the marketplace within a few minutes

### 5. Order Placement Test
1. Open the marketplace in another browser/incognito window
2. Find the product you just listed
3. Click "Order Now"
4. Fill in your details and place the order
5. Verify that:
   - You see an order confirmation
   - The farmer receives an order notification via WhatsApp

### 6. Server Logs Check
1. In Render dashboard, check the application logs
2. Verify that there are no error messages related to:
   - Twilio message sending
   - Phone number formatting
   - WhatsApp notifications

## Troubleshooting

### If Farmers Don't Receive Messages
1. Check Render environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `NODE_ENV` should be `production`

2. Check server logs for Twilio errors

3. Verify that the Twilio sandbox is properly configured with your webhook URL

### If Products Don't Appear on Marketplace
1. Check MongoDB connection
2. Verify image upload directory permissions
3. Check server logs for product creation errors

### If Admin Panel Doesn't Work
1. Verify admin credentials
2. Check MongoDB connection
3. Ensure the admin user exists in the database

## Success Criteria
All tests should pass without errors:
- ✅ Farmer registration successful
- ✅ Admin approval successful
- ✅ Farmer receives WhatsApp welcome message
- ✅ Product listing via WhatsApp works
- ✅ Order placement successful
- ✅ Farmer receives order notification
- ✅ No errors in server logs

## Support
If you encounter issues:
1. Check the server logs in Render dashboard
2. Verify all environment variables are set correctly
3. Ensure your MongoDB Atlas cluster is accessible
4. Confirm Twilio webhook is properly configured