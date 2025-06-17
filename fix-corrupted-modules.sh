#!/bin/bash

echo "🔧 Fixing Corrupted Node Modules"
echo "================================="

echo "🎯 Issue: Double node_modules path indicates corrupted installation"
echo "📍 Path error: node_modules\\node_modules\\expo\\bin\\cli"
echo ""

# Navigate to the LiftLinkMobile directory
cd LiftLinkMobile

echo "🧹 Step 1: Cleaning corrupted installations..."

# Remove corrupted node_modules
if [ -d "node_modules" ]; then
    echo "🗑️ Removing corrupted node_modules..."
    rm -rf node_modules
fi

# Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
    echo "🗑️ Removing package-lock.json..."
    rm -f package-lock.json
fi

# Clear npm cache
echo "🧽 Clearing npm cache..."
npm cache clean --force

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "🚀 Now run these commands IN ORDER:"
echo ""
echo "1. Install dependencies:"
echo "   npm install --legacy-peer-deps"
echo ""
echo "2. Verify expo works:"
echo "   npx expo --version"
echo ""
echo "3. Test config command:"
echo "   npx expo config"
echo ""
echo "4. If config works, proceed with EAS:"
echo "   npx eas login"
echo "   npx eas project:init"
echo "   npx eas build --platform android"
echo ""
echo "💡 If npm install fails, try:"
echo "   npm install --force"
echo "   # OR"
echo "   yarn install"
