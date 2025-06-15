#!/bin/bash

echo "🔧 EAS Build Tar Extraction Fix"
echo "==============================="

cd /app/LiftLinkMobile

echo "🔍 Checking for common tar extraction issues..."

# Fix 1: Remove problematic files that cause tar issues
echo "🧹 Cleaning problematic files..."

# Remove large/problematic files
find . -name "*.log" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "Thumbs.db" -delete 2>/dev/null
find . -name "*.tmp" -delete 2>/dev/null

# Clean node_modules if exists (will be reinstalled by EAS)
if [ -d "node_modules" ]; then
    echo "🗑️ Removing node_modules (will be reinstalled by EAS)"
    rm -rf node_modules
fi

# Clean expo cache
if [ -d ".expo" ]; then
    echo "🗑️ Cleaning .expo cache"
    rm -rf .expo
fi

# Fix 2: Create proper .easignore file
echo "📝 Creating .easignore file..."
cat > .easignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Build files
*.log
*.tmp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.cache
.cache/
EOF

# Fix 3: Ensure proper file permissions
echo "🔒 Fixing file permissions..."
find . -type f -name "*.js" -exec chmod 644 {} \;
find . -type f -name "*.json" -exec chmod 644 {} \;
find . -type f -name "*.ts" -exec chmod 644 {} \;
find . -type f -name "*.tsx" -exec chmod 644 {} \;

# Fix 4: Check app.json syntax
echo "✅ Validating app.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('app.json', 'utf8'))" 2>/dev/null; then
    echo "❌ app.json has syntax errors"
    exit 1
else
    echo "✅ app.json is valid"
fi

# Fix 5: Check eas.json syntax
echo "✅ Validating eas.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('eas.json', 'utf8'))" 2>/dev/null; then
    echo "❌ eas.json has syntax errors"
    exit 1
else
    echo "✅ eas.json is valid"
fi

echo ""
echo "✅ Tar extraction issues fixed!"
echo ""
echo "🚀 Now run your EAS build:"
echo "  eas build --platform android --profile production"
echo ""
echo "💡 If the issue persists, try:"
echo "  eas build --platform android --profile production --clear-cache"
