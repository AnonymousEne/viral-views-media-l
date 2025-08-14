# 🔐 Service Account Key Setup Guide

## Step 1: Download Service Account Key
1. Open: https://console.firebase.google.com/project/viralviews-m802a/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file

## Step 2: Extract Key Information
From your downloaded JSON file, copy these 3 values:

```json
{
  "type": "service_account",
  "project_id": "viralviews-m802a",                    ← Copy this
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  ← Copy this (with \n)
  "client_email": "firebase-adminsdk-...@viralviews-m802a.iam.gserviceaccount.com", ← Copy this
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  ...
}
```

## Step 3: Update .env.local
Replace these values in your `.env.local` file:

```bash
FIREBASE_PROJECT_ID=viralviews-m802a
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@viralviews-m802a.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Actual_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

## Step 4: Test Server-Side Access
After updating .env.local:
1. Restart your dev server: `npm run dev -- -p 3000`
2. Visit: http://localhost:3000/api/test-admin
3. Should see: "Firebase Admin SDK is properly configured! 🎉"

## Important Security Notes
- ✅ .env.local is in .gitignore (safe)
- ❌ NEVER commit the service account JSON file
- ❌ NEVER share the private key publicly
- ✅ Only use admin SDK on server-side (API routes, functions)

## Troubleshooting
If you see errors:
- Check that all 3 environment variables are set
- Ensure private_key includes the \n characters
- Restart dev server after updating .env.local
- Make sure the service account JSON was downloaded from the correct project
