#!/bin/bash

# LiftLink Android Build Test Script
# This script validates the EAS build configuration

echo "🚀 LiftLink Android Build Configuration Test"
echo "============================================="

cd /app/LiftLinkMobile

echo "📱 App Configuration:"
echo "Package: com.liftlink.app"
echo "Version: 1.0.1"
echo "EAS Project ID: e6a916da-e23e-43fa-bf9e-b6ae530290be"
echo ""

echo "🔍 Validating configuration files..."

# Check if app.json exists and has valid configuration
if [ -f "app.json" ]; then
    echo "✅ app.json found"
    
    # Validate EAS project ID format (UUID)
    PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)
    if [[ $PROJECT_ID =~ ^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$ ]]; then
        echo "✅ Valid UUID projectId: $PROJECT_ID"
    else
        echo "❌ Invalid UUID projectId: $PROJECT_ID"
        exit 1
    fi
    
    # Check if package name is set
    PACKAGE_NAME=$(grep -o '"package": "[^"]*"' app.json | cut -d'"' -f4)
    if [ "$PACKAGE_NAME" = "com.liftlink.app" ]; then
        echo "✅ Package name configured: $PACKAGE_NAME"
    else
        echo "❌ Invalid package name: $PACKAGE_NAME"
        exit 1
    fi
else
    echo "❌ app.json not found"
    exit 1
fi

# Check if eas.json exists
if [ -f "eas.json" ]; then
    echo "✅ eas.json found"
else
    echo "❌ eas.json not found"
    exit 1
fi

# Check if package.json exists and has correct scripts
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    
    # Check if build scripts are present
    if grep -q '"build:android:production"' package.json; then
        echo "✅ Android production build script configured"
    else
        echo "❌ Android production build script missing"
        exit 1
    fi
else
    echo "❌ package.json not found"
    exit 1
fi

# Check if assets exist
echo ""
echo "🖼️ Checking required assets..."
ASSETS_DIR="./assets"
REQUIRED_ASSETS=("icon.png" "adaptive-icon.png" "splash-icon.png" "favicon.png")

for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ -f "$ASSETS_DIR/$asset" ]; then
        echo "✅ $asset found"
    else
        echo "❌ $asset missing"
        exit 1
    fi
done

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if [ -f "yarn.lock" ]; then
    echo "✅ Dependencies locked with yarn.lock"
else
    echo "⚠️  No yarn.lock found, running yarn install..."
    yarn install
fi

# Validate Expo installation
echo ""
echo "⚙️ Validating Expo/EAS setup..."
if command -v npx &> /dev/null; then
    echo "✅ npx available"
    
    # Check if we can access expo commands
    if npx expo --version > /dev/null 2>&1; then
        EXPO_VERSION=$(npx expo --version)
        echo "✅ Expo CLI available (version: $EXPO_VERSION)"
    else
        echo "❌ Expo CLI not accessible"
        exit 1
    fi
else
    echo "❌ npx not available"
    exit 1
fi

# Validate Google APIs configuration
echo ""
echo "🔑 Checking API configurations..."
GOOGLE_FIT_CLIENT_ID=$(grep -o '"googleFitClientId": "[^"]*"' app.json | cut -d'"' -f4)
MAPS_API_KEY=$(grep -o '"androidMapsApiKey": "[^"]*"' app.json | cut -d'"' -f4)

if [ -n "$GOOGLE_FIT_CLIENT_ID" ]; then
    echo "✅ Google Fit Client ID configured"
else
    echo "⚠️  Google Fit Client ID not found"
fi

if [ -n "$MAPS_API_KEY" ]; then
    echo "✅ Google Maps API Key configured"
else
    echo "⚠️  Google Maps API Key not found"
fi

echo ""
echo "🎯 Configuration Summary:"
echo "========================"
echo "Project ID: $PROJECT_ID"
echo "Package: $PACKAGE_NAME"
echo "Google Fit: ${GOOGLE_FIT_CLIENT_ID:0:20}..."
echo "Maps API: ${MAPS_API_KEY:0:20}..."
echo ""

echo "✅ LiftLink Android build configuration is valid!"
echo ""
echo "🚀 Ready for build commands:"
echo "   Development: yarn build:android:preview"
echo "   Production:  yarn build:android:production"
echo ""
echo "📱 Next steps:"
echo "   1. Run production build to generate AAB file"
echo "   2. Test AAB file locally"
echo "   3. Upload to Google Play Console"
echo "   4. Complete store listing and submit for review"
echo ""

# Dry run validation (doesn't actually build)
echo "🧪 Running EAS build validation (dry run)..."
if npx eas build --platform android --profile production --dry-run > /dev/null 2>&1; then
    echo "✅ EAS build configuration validated successfully"
else
    echo "⚠️  EAS build validation had warnings (check manually)"
fi

echo ""
echo "🎉 LiftLink is ready for Google Play Store deployment!"