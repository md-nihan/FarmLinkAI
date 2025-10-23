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

## [2025-10-23] - WhatsApp inbound not replying (fast fix + plan captured)

### Fix: Resilient welcome + order notifications
- Added Farmer.welcomeSentAt and ensured late-welcome is sent on first inbound even if previous attempts weren’t recorded.
- After a product is listed, if welcome wasn’t recorded, a compact welcome is sent automatically.
- Approval flow now records welcomeSentAt.
- No breaking changes to APIs.

User report: After verification on WhatsApp, no "Congratulations" or "Product Listed" replies when sending messages like "Banana 50kg"; products not appearing on website.

Actions executed fast:
- Added webhook alias so both `POST /api/whatsapp` (primary) and `POST /whatsapp` (alias) are handled by the same router. This catches common Twilio Console misconfiguration and restores inbound processing immediately.
- Left existing `/api/whatsapp/test` health route for quick verification.

Operator steps to verify now:
1. In Twilio Console → WhatsApp Sandbox, set "When a message comes in" to:
   - https://<your-domain>/api/whatsapp  (preferred) or
   - https://<your-domain>/whatsapp      (now also accepted)
   Method: POST.
2. Send a WhatsApp message: `Banana 50kg`.
   - Expected immediate reply with confirmation.
   - Product should appear on marketplace homepage.
3. If still no reply, check server logs for `📱 WhatsApp Message from` and Twilio delivery logs.

Notes:
- No schema changes. Safe deploy.
- This entry documents the conversation-driven fix and plan.

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

## [2025-10-23] - Messaging Reliability Improvements

### Added
- Phone normalization and WhatsApp address utilities (`utils/phone.js`) enforcing E.164 and `whatsapp:+` format
- Lazy initialization of Twilio clients when first sending a message
- Normalization of Twilio sender number to `whatsapp:+E164` during client setup
- `.gitignore` rule to exclude `public/uploads/`

### Fixed
- Welcome WhatsApp after admin approval not delivering (number normalization + Twilio init)
- Order notification WhatsApp not delivering (ensured init + strict formatting)
- Delivery failures due to inconsistent phone formats across flows

### Changed
- `routes/farmers.js`: normalize phone on registration/update; approval uses enforced `whatsapp:+E164`
- `routes/products.js`: uses `ensureWhatsAppAddress` for notifications
- `routes/whatsapp.js`: enforces proper `from` and `to` formats; keeps lazy client init

### Verification
- `/api/test-twilio` OK (multi-account ready)
- `test-farmer-messaging.js` approval flow sends welcome WhatsApp
- `test-order-notification.js` + placing order triggers WhatsApp notification
- `/api/health` OK

### Operational Notes (conversation summary)
- Report: farmers not receiving welcome/order WhatsApps; images previously fixed
- Actions: implemented normalization, enforced formats, ensured Twilio init, updated docs and .gitignore
- Added late-welcome delivery on first inbound WhatsApp from approved farmer and surfaced join instructions to admin UI after approval
- If still no delivery in production: ensure farmer has joined Twilio sandbox by sending "join organization-organized" to +14155238886 (or use TWILIO_SANDBOX_NUMBER/CODE); verify env vars `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `BACKEND_PUBLIC_URL`, `DEFAULT_COUNTRY_CODE`; re-approve/update farmers to normalize phones; share server logs around "Sending welcome message" for Twilio error codes

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