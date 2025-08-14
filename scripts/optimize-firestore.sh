#!/bin/bash

# Firestore Database Optimization Script
# This script sets up production-ready Firestore configuration

echo "🔥 Setting up Firestore for Production..."

# Deploy security rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Create composite indexes for common queries
echo "🔍 Creating composite indexes..."

# Battles collection indexes
firebase firestore:indexes:create \
  --collection-group=battles \
  --query-scope=COLLECTION \
  --field-config field-path=status,order=ASCENDING \
  --field-config field-path=createdAt,order=DESCENDING

firebase firestore:indexes:create \
  --collection-group=battles \
  --query-scope=COLLECTION \
  --field-config field-path=participants,array-config=CONTAINS \
  --field-config field-path=status,order=ASCENDING \
  --field-config field-path=createdAt,order=DESCENDING

firebase firestore:indexes:create \
  --collection-group=battles \
  --query-scope=COLLECTION \
  --field-config field-path=createdBy,order=ASCENDING \
  --field-config field-path=createdAt,order=DESCENDING

# Media collection indexes
firebase firestore:indexes:create \
  --collection-group=media \
  --query-scope=COLLECTION \
  --field-config field-path=privacy,order=ASCENDING \
  --field-config field-path=category,order=ASCENDING \
  --field-config field-path=uploadedAt,order=DESCENDING

firebase firestore:indexes:create \
  --collection-group=media \
  --query-scope=COLLECTION \
  --field-config field-path=userId,order=ASCENDING \
  --field-config field-path=uploadedAt,order=DESCENDING

firebase firestore:indexes:create \
  --collection-group=media \
  --query-scope=COLLECTION \
  --field-config field-path=tags,array-config=CONTAINS \
  --field-config field-path=privacy,order=ASCENDING \
  --field-config field-path=uploadedAt,order=DESCENDING

# Chat messages indexes
firebase firestore:indexes:create \
  --collection-group=chat_messages \
  --query-scope=COLLECTION \
  --field-config field-path=battleId,order=ASCENDING \
  --field-config field-path=timestamp,order=ASCENDING

# Users activity indexes
firebase firestore:indexes:create \
  --collection-group=users \
  --query-scope=COLLECTION \
  --field-config field-path=isActive,order=ASCENDING \
  --field-config field-path=lastSeen,order=DESCENDING

echo "✅ Firestore optimization complete!"
echo ""
echo "📈 Performance optimizations applied:"
echo "  • Security rules deployed"
echo "  • Composite indexes created for efficient queries"
echo "  • Battle queries optimized for status, participants, and creation time"
echo "  • Media queries optimized for privacy, category, and upload time"
echo "  • Chat queries optimized for real-time battle communication"
echo "  • User activity tracking optimized"
echo ""
echo "⚠️  Note: Index creation may take several minutes to complete in Firebase Console"
