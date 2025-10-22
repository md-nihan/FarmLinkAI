# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

- Install dependencies
  ```bash path=null start=null
  npm install
  pip install -r ai-service/requirements.txt
  ```
- Environment (create a .env in repo root)
  ```bash path=null start=null
  MONGODB_URI="{{your_mongodb_uri}}"
  TWILIO_ACCOUNT_SID="{{your_twilio_account_sid}}"
  TWILIO_AUTH_TOKEN="{{your_twilio_auth_token}}"
  TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886" # or your WhatsApp-enabled number
  AI_SERVICE_URL="http://localhost:5000"         # if running locally
  JWT_SECRET="{{optional_custom_jwt_secret}}"
  ```
- Start services (two terminals)
  ```bash path=null start=null
  # Terminal 1: AI service
  python ai-service/app.py
  
  # Terminal 2: backend API + static frontend
  npm run dev   # or: npm start
  ```
- Open the app
  ```bash path=null start=null
  http://localhost:3001
  ```
- Ad-hoc test scripts (no formal test runner)
  ```bash path=null start=null
  # Run individual flows against a running server on :3001
  node test-farmer-registration.js
  node test-admin-login.js
  node test-pending-farmers.js
  node test-approval.js
  node verify-admin-display.js
  ```
  - Create admin via API (recommended over using local scripts):
    ```bash path=null start=null
    curl -X POST http://localhost:3001/api/auth/create-admin \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123","name":"Admin","email":"admin@example.com"}'
    ```
  - Register a farmer via API:
    ```bash path=null start=null
    curl -X POST http://localhost:3001/api/farmers/register \
      -H "Content-Type: application/json" \
      -d '{"name":"Test Farmer","phone":"+911234567890","village":"Village","district":"District","crops":"Tomato, Onion"}'
    ```
- Linting: not configured in this repo.
- Build: no build step required (script is a placeholder; app runs directly with Node.js and serves static assets).

## High-level architecture and structure

- Backend API (Node/Express)
  - Entry: `server.js` sets up middleware, serves `public/`, and mounts routes:
    - `/api/whatsapp` → `routes/whatsapp.js` (Twilio webhook, message parsing, media download, AI grading call, product creation)
    - `/api/products` → `routes/products.js` (catalog, order flow; sends WhatsApp notifications via Twilio)
    - `/api/farmers` → `routes/farmers.js` (registration + admin approval workflow)
    - `/api/auth` → `routes/auth.js` (JWT auth; `verifyToken` middleware used by admin endpoints)
  - MongoDB via Mongoose models: `models/Farmer.js`, `models/Product.js`, `models/Admin.js` (with useful indexes on `Product` for status and farmer_phone)
  - Configuration via `.env`: `MONGODB_URI`, Twilio creds, `AI_SERVICE_URL`, optional `JWT_SECRET`.

- AI service (Python/Flask) in `ai-service/`
  - Endpoints: `POST /grade`, `GET /health`, `GET /test` (see `ai-service/README.md`)
  - Rule-based image quality scoring using Pillow and simple heuristics; invoked by WhatsApp webhook when an image is present
  - Run locally on `:5000` and referenced by backend through `AI_SERVICE_URL`

- Frontend (static, served by backend)
  - `public/` contains `index.html` (marketplace), `admin.html` (admin panel), `register.html` (farmer registration)
  - Client logic in `public/js/marketplace.js` and `public/js/admin.js`; styles under `public/css/`

- WhatsApp/Twilio integration
  - Incoming messages hit `/api/whatsapp`; media is fetched using Twilio-authenticated requests and stored under `public/uploads/`
  - Outbound farmer notifications are sent from `routes/products.js` and `routes/farmers.js` using `TWILIO_WHATSAPP_NUMBER`

## Operational notes for agents

- Node version: `package.json` specifies Node 16.x.
- Ports: backend listens on `3001`; AI service on `5000` by default.
- Data flow highlights:
  - WhatsApp → Twilio → `/api/whatsapp` → optional AI grading → MongoDB → exposed via `/api/products` and frontend.
  - Orders update product status and notify the farmer on WhatsApp.
- Seeding: prefer API calls shown above. Local helper scripts like `create-admin.js` and `create-test-farmer.js` contain hardcoded URIs; update them before use if you choose to run them.
