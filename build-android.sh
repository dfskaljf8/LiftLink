#!/bin/bash

# LiftLink Android Build Script
# This can run on Linux, macOS, or Windows

echo "🤖 LiftLink Android Build Script"
echo "================================="
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

echo "🔨 Building Android App..."
echo ""

# Build the web assets
echo "🌐 Building web assets..."
yarn build

# Sync with Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Check if Android SDK is available
if command -v ./android/gradlew &> /dev/null; then
    echo "📱 Building Android APK..."
    
    # Build debug APK
    cd android
    ./gradlew assembleDebug
    
    echo ""
    echo "✅ Debug APK built successfully!"
    echo "📂 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    
    # Build release APK (if keystore is configured)
    if [ -f "../liftlink-release.keystore" ]; then
        echo "🚀 Building Release APK..."
        ./gradlew assembleRelease
        
        echo ""
        echo "✅ Release APK built successfully!"
        echo "📂 Location: android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "⚠️  Release keystore not found. Debug APK only."
        echo "💡 Copy your release keystore to build release APK"
    fi
    
    cd ..
else
    echo "❌ Android Gradle wrapper not found"
    echo ""
    echo "📱 To build Android APK:"
    echo "1. Install Android Studio"
    echo "2. Install Android SDK and build tools"
    echo "3. Run this script again"
    echo ""
    echo "🔧 Alternative: Open Android Studio and import project:"
    echo "   File → Open → Select 'android' folder"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Test APK on Android device"
echo "2. Sign with release keystore for production"
echo "3. Upload to Google Play Store"