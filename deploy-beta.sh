#!/bin/bash

# Viral Views Beta Deployment Script
echo "🎤 Deploying Viral Views Beta Release..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Firebase...${NC}"
    firebase login
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Type checking
echo -e "${BLUE}🔍 Running type check...${NC}"
npm run typecheck
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript errors found. Please fix before deploying.${NC}"
    exit 1
fi

# Linting
echo -e "${BLUE}🧹 Running linter...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Linting warnings found. Consider fixing before production.${NC}"
fi

# Build the application
echo -e "${BLUE}🏗️ Building application for production...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Deploy to Firebase
echo -e "${BLUE}🚀 Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 Viral Views Beta is now live!${NC}"
    
    # Get hosting URL
    HOSTING_URL=$(firebase hosting:sites:list --json | jq -r '.result[0].defaultUrl')
    echo -e "${BLUE}🌐 Live URL: $HOSTING_URL${NC}"
    
    echo -e "${YELLOW}📝 Post-deployment checklist:${NC}"
    echo "   • Test user registration and login"
    echo "   • Verify AI battle analysis works"
    echo "   • Check cypher functionality"
    echo "   • Test mobile responsiveness"
    echo "   • Validate all core features"
    
    echo -e "${GREEN}🎵 Ready for beta testing!${NC}"
else
    echo -e "${RED}❌ Deployment failed. Check errors above.${NC}"
    exit 1
fi

# Optional: Create preview channel for testing
read -p "Create a preview channel for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔗 Creating preview channel...${NC}"
    firebase hosting:channel:deploy beta --expires 30d
fi

echo -e "${GREEN}🚀 Beta deployment complete!${NC}"
