# Farmer Registration Flow

This document explains the new farmer self-registration system with the verification funnel.

## Overview

The new system allows farmers to register themselves through a public registration form. After registration, farmers enter a "pending approval" status until an admin verifies and approves them.

## Registration Process

### 1. Farmer Self-Registration

Farmers can register at `/register.html` by providing:
- Full Name
- WhatsApp Number (with country code)
- Village
- District
- Crops Grown (optional)

Upon submission:
- Farmer account is created with `approvalStatus: 'pending'` and `isActive: false`
- Farmer sees success message: "Registration successful! Your account is under review. We will contact you shortly for verification."

### 2. Admin Review

Admins can view pending farmers in the admin panel at `/admin.html`:
- New "Pending Farmer Approvals" section shows all farmers with `approvalStatus: 'pending'`
- Admin can either "Approve" or "Reject" each pending farmer

### 3. Farmer Approval

When admin approves a farmer:
- Farmer's `approvalStatus` changes to `'approved'`
- Farmer's `isActive` changes to `true`
- Farmer receives an automated WhatsApp welcome message with join instructions

### 4. Farmer Rejection

When admin rejects a farmer:
- Farmer's `approvalStatus` changes to `'rejected'`
- Farmer's `isActive` remains `false`
- Admin can optionally provide a rejection reason

## Technical Implementation

### New Files

1. `public/register.html` - Farmer registration page
2. `public/login.html` - Admin login page
3. `FARMER_REGISTRATION.md` - This documentation

### Modified Files

1. `public/admin.html` - Updated to show pending farmers instead of add farmer form
2. `public/index.html` - Added link to farmer registration page
3. `public/js/admin.js` - Updated to handle pending farmers and authentication
4. `public/css/admin.css` - Added styling for new elements
5. `routes/farmers.js` - Existing registration endpoint already supports the flow
6. `routes/auth.js` - Authentication routes for admin login

### API Endpoints

1. `POST /api/farmers/register` - Public endpoint for farmer registration
2. `GET /api/farmers?status=pending` - Admin-only endpoint to get pending farmers
3. `POST /api/farmers/approve/:id` - Admin-only endpoint to approve farmers
4. `POST /api/farmers/reject/:id` - Admin-only endpoint to reject farmers
5. `POST /api/auth/login` - Admin login endpoint

## Testing

Run the test script to verify the flow:
```bash
npm run test-farmer
```

## Security

- All admin endpoints are protected with JWT authentication
- Farmer registration is public but requires all required fields
- Admin login uses bcrypt for password hashing