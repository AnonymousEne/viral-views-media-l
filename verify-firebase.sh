#!/bin/bash

echo "🔥 Firebase Setup Verification Script"
echo "=================================="

echo "📋 Checking Firebase CLI status..."
firebase --version

echo "📋 Checking Firebase project..."
firebase projects:list

echo "📋 Checking Firestore rules..."
if firebase deploy --only firestore:rules --dry-run >/dev/null 2>&1; then
    echo "✅ Firestore rules: Valid"
else
    echo "❌ Firestore rules: Invalid"
fi

echo "📋 Checking Storage rules..."
if firebase deploy --only storage --dry-run >/dev/null 2>&1; then
    echo "✅ Storage rules: Valid"
else
    echo "❌ Storage rules: Invalid"
fi

echo "📋 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    if grep -q "your_firebase_api_key_here" .env.local; then
        echo "⚠️  API key needs to be updated"
    else
        echo "✅ API key configured"
    fi
else
    echo "❌ .env.local missing"
fi

echo "📋 Checking if dev server is running..."
if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ Dev server running on localhost:3000"
else
    echo "❌ Dev server not accessible"
fi

echo ""
echo "🎯 Next Action: Update your .env.local with real Firebase credentials!"
echo "   Then visit http://localhost:3000 to test authentication"
