# Changelog

All notable changes to the FarmLink AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CHANGELOG.md file for tracking project changes
- Image URL fix for mobile device compatibility
- Runtime URL correction for production environment
- Fallback URL handling for deployed applications
- TWILIO_SETUP_FIX.md guide for WhatsApp configuration
- Enhanced Twilio error handling and logging
- WhatsApp messaging failover system for farmers.js
- Debug scripts for testing WhatsApp functionality

### Fixed
- Image display issue on mobile devices
- WhatsApp image URLs pointing to localhost instead of production URL
- Product API returning incorrect image URLs for mobile clients
- Server URL detection logic for production environment
- WhatsApp messaging not working for other numbers (Twilio env vars missing)
- Farmer registration welcome messages not being sent
- Order notification messages not being sent to farmers
- Phone number formatting issues in WhatsApp messages
- Improved error handling and logging for Twilio messages
- Twilio client initialization issue in farmer approval process
- Fixed WhatsApp messaging system to properly send approval messages
- Added lazy initialization of Twilio clients inside message sender to avoid race conditions
- Ensure order notification route initializes Twilio clients if needed

### Changed
- Updated WhatsApp webhook to generate correct production URLs
- Modified products API to fix image URLs at runtime
- Enhanced server configuration for better URL handling
- Improved error handling for image URL generation
- Updated farmers.js to use WhatsApp failover system
- Enhanced Twilio client initialization with better logging
- Improved error messages for missing Twilio configuration
- Added phone normalization (E.164) and WhatsApp address enforcement to reduce delivery failures

## [2025-10-23] - Image Display Fix

### Fixed
- **Critical Bug**: Images uploaded via WhatsApp were not displaying on mobile devices
- **Root Cause**: Image URLs were generated using `http://localhost:3001` instead of production URL
- **Solution**: Updated all URL generation logic to use `https://farmlinkai-7.onrender.com`
- **Impact**: All existing and new images now display correctly on all devices

### Technical Changes
- Modified `routes/whatsapp.js` to generate correct production URLs
- Updated `routes/products.js` to fix image URLs at runtime
- Enhanced `server.js` URL detection logic
- Added fallback URL handling for production environment

### Verification
- ✅ All 8 existing products now have correct image URLs
- ✅ Images are accessible via HTTPS (HTTP 200 status)
- ✅ Mobile devices can now properly load and display images
- ✅ New WhatsApp uploads automatically use correct URLs

---

## [Previous Changes]

### Initial Setup
- WhatsApp integration for farmer product listing
- AI-powered quality grading system
- Mobile-responsive marketplace interface
- Admin panel for farmer management
- Twilio integration for messaging
- MongoDB database integration
- Render deployment configuration