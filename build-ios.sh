#!/bin/bash

# LiftLink iOS Build Script
# Run this script on macOS with Xcode installed

echo "🍎 LiftLink iOS Build Script"
echo "=============================="
echo ""

echo "📋 Prerequisites Check:"
echo "- macOS with Xcode 14+ installed"
echo "- Apple Developer Account"
echo "- CocoaPods installed"
echo "- Node.js and Yarn installed"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must run on macOS with Xcode"
    echo ""
    echo "📱 To build for iOS:"
    echo "1. Transfer this project to a Mac"
    echo "2. Install Xcode from App Store"
    echo "3. Install CocoaPods: sudo gem install cocoapods"
    echo "4. Run this script again"
    exit 1
fi

echo "✅ Running on macOS"

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from the App Store"
    exit 1
fi

echo "✅ Xcode found"

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods not found. Installing..."
    sudo gem install cocoapods
fi

echo "✅ CocoaPods ready"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

echo ""
echo "🔨 Building iOS App..."
echo ""

# Install iOS dependencies
echo "📦 Installing iOS dependencies..."
cd ios/App && pod install
cd ../..

# Build the web assets
echo "🌐 Building web assets..."
yarn build

# Sync with Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# Open Xcode for final build
echo "🚀 Opening Xcode..."
echo ""
echo "📱 Next Steps in Xcode:"
echo "1. Select your development team"
echo "2. Configure signing certificates"
echo "3. Build and run on device/simulator"
echo "4. Archive for App Store distribution"
echo ""

npx cap open ios