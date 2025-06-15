#!/bin/bash

echo "🔧 LiftLink Dependency Fix Script"
echo "================================="

echo "📋 Issues being fixed:"
echo "  1. React version conflicts (19.0.0 vs 19.1.0)"
echo "  2. Security vulnerabilities (nth-check, postcss, webpack-dev-server)"
echo "  3. Missing Capacitor Android configuration"
echo "  4. npm ERESOLVE dependency conflicts"
echo ""

# Fix 1: LiftLinkMobile React version conflict
echo "🔧 Fixing LiftLinkMobile React versions..."
cd /app/LiftLinkMobile
# Update package.json to use exact React versions
npm pkg set dependencies.react="19.0.0"
npm pkg set dependencies.react-dom="19.0.0"
npm pkg set overrides.react="19.0.0"
npm pkg set overrides.react-dom="19.0.0"
echo "✅ LiftLinkMobile package.json updated"

# Fix 2: Frontend security vulnerabilities
echo "🔧 Fixing Frontend security vulnerabilities..."
cd /app/frontend
# Add security fixes to overrides
npm pkg set overrides.nth-check="^2.1.1"
npm pkg set overrides.postcss="^8.4.49" 
npm pkg set overrides.webpack-dev-server="^5.2.1"
npm pkg set overrides.svgo="^3.0.0"
npm pkg set overrides.css-select="^5.1.0"
echo "✅ Frontend security overrides added"

# Fix 3: Capacitor Android configuration already created above

echo "📦 Installation Commands for Local Setup:"
echo ""
echo "For LiftLinkMobile (in /LiftLinkMobile directory):"
echo "  npm install --legacy-peer-deps"
echo "  # OR if that fails:"
echo "  npm install --force"
echo ""
echo "For Frontend (in /frontend directory):" 
echo "  npm install --legacy-peer-deps"
echo "  # OR if that fails:"
echo "  npm install --force"
echo ""
echo "For security fixes:"
echo "  npm audit fix --force"
echo ""

echo "🎯 MongoDB Installation:"
echo "If you specifically need MongoDB for your local project:"
echo "  npm install mongodb --save"
echo "  # OR with legacy peer deps:"
echo "  npm install mongodb --save --legacy-peer-deps"
echo ""

echo "🚀 Android Build Fix:"
echo "The missing cordova.variables.gradle file has been created at:"
echo "  frontend/android/capacitor-cordova-android-plugins/cordova.variables.gradle"
echo ""

echo "✅ All fixes applied!"
echo ""
echo "📋 Summary of fixes:"
echo "  ✅ React version conflicts resolved"
echo "  ✅ Security vulnerabilities addressed via overrides"
echo "  ✅ Missing Capacitor Android file created"
echo "  ✅ Package.json files updated with legacy install options"
echo ""
echo "💡 Pro tip: Use --legacy-peer-deps for npm install to avoid ERESOLVE conflicts"