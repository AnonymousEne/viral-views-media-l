#!/bin/bash
# Automated setup for Vercel + Firebase + Custom Domain (viralviewsmedia.com)
# Usage: bash setup-vercel-firebase.sh

set -e

# 1. Vercel login (if not already logged in)
echo "Logging into Vercel..."
vercel login || true

# 2. Link local project to Vercel (if not already linked)
echo "Linking project to Vercel..."
vercel link || true

# 3. Add custom domain to Vercel project
echo "Adding custom domain to Vercel..."
vercel domains add viralviewsmedia.com || true

# 4. Set environment variables for Firebase (edit as needed)
echo "Setting Firebase env variables in Vercel..."
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# 5. Deploy to Vercel
vercel --prod

echo "\nSetup complete!"
echo "Check your site at: https://viralviewsmedia.com (DNS propagation may take a few minutes)"
echo "Firebase backend is still fully supported."
