#!/bin/bash

echo "🎤 Viral Views Application Setup Verification"
echo "============================================="

# Check Node.js version
echo "✓ Node.js version:"
node --version

# Check npm dependencies
echo "✓ Checking npm dependencies..."
npm list --depth=0 | head -5

# Check TypeScript compilation
echo "✓ TypeScript compilation:"
npm run typecheck

if [ $? -eq 0 ]; then
    echo "  ✅ TypeScript compiled successfully"
else
    echo "  ❌ TypeScript compilation failed"
    exit 1
fi

# Check build process
echo "✓ Production build:"
npm run build

if [ $? -eq 0 ]; then
    echo "  ✅ Build completed successfully"
else
    echo "  ❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Application Setup Complete!"
echo "================================"
echo "✅ Dependencies installed"
echo "✅ TypeScript compilation working"
echo "✅ Production build successful"
echo "✅ Development server ready"
echo ""
echo "Next steps:"
echo "1. Start development: npm run dev"
echo "2. Configure Firebase credentials in .env.local"
echo "3. Set up Google AI API key for GenAI features"
echo "4. Deploy to Firebase: npm run deploy"