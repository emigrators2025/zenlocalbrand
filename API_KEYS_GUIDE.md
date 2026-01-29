# API Keys & Environment Variables Guide

## Required API Keys for ZEN LOCAL BRAND

This document lists all the API keys and environment variables required to deploy and run the ZEN LOCAL BRAND website.

---

## 1. Firebase Configuration (REQUIRED)

Firebase provides authentication, database, and storage for the website.

### Get your Firebase credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project "zenlocalbrand"
3. Go to Project Settings > General > Your apps > Web app
4. Copy the configuration values

### Environment Variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 2. Firebase Setup Steps

### Enable Authentication:
1. In Firebase Console, go to Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. (Optional) Enable Google, Facebook, or other providers

### Enable Firestore Database:
1. Go to Firestore Database
2. Click "Create Database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select your preferred location
5. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Products collection (public read, admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Settings collection (public read, admin write)
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Contacts collection
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Activity logs
    match /activity_logs/{logId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

### Enable Storage:
1. Go to Storage
2. Click "Get Started"
3. Set up security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 3. Optional: Payment Integration (Stripe)

If you want to accept payments, add Stripe:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setup Steps:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from Developers > API keys
3. Set up webhooks for order processing

---

## 4. Optional: Email Service (Resend/SendGrid)

For sending order confirmations and notifications:

```env
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG....
```

---

## 5. Optional: Analytics

### Google Analytics:
```env
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Complete .env.local File Template

Create a `.env.local` file in your project root with these variables:

```env
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Stripe (Optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email Service (Optional)
RESEND_API_KEY=

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=
```

---

## Deployment Checklist

Before deploying:

1.  Firebase project created and configured
2.  Firestore security rules set up
3.  Storage security rules set up
4.  Authentication enabled
5.  All environment variables set in deployment platform
6.  Firebase indexes created (automatic when first query runs)
7.  Admin account credentials saved securely

---

## Admin Panel Access

- **URL**: `/zen-admin/login`
- **Username**: `ZenAdmin2026`
- **Password**: `Ma23072007ZenLocal2026`
- **Signing Key**: `ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1`

 **IMPORTANT**: Change these credentials in production by editing `lib/admin-config.ts`

---

## Support

If you encounter any issues during setup, check:
1. Firebase Console for error logs
2. Browser console for client-side errors
3. Network tab for failed API requests
