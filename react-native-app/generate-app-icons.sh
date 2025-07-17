#!/bin/bash

# LiftLink App Icon Generator Script
# This script will help you generate all required app icon sizes for iOS and Android

echo "🏋️ LiftLink App Icon Generator"
echo "================================"

# Required iOS icon sizes
declare -A ios_sizes=(
    ["icon-20@2x.png"]="40x40"
    ["icon-20@3x.png"]="60x60"
    ["icon-29@2x.png"]="58x58"
    ["icon-29@3x.png"]="87x87"
    ["icon-40@2x.png"]="80x80"
    ["icon-40@3x.png"]="120x120"
    ["icon-60@2x.png"]="120x120"
    ["icon-60@3x.png"]="180x180"
    ["icon-1024.png"]="1024x1024"
)

# Required Android icon sizes
declare -A android_sizes=(
    ["ic_launcher.png"]="48x48"     # mdpi
    ["ic_launcher.png"]="72x72"     # hdpi
    ["ic_launcher.png"]="96x96"     # xhdpi
    ["ic_launcher.png"]="144x144"   # xxhdpi
    ["ic_launcher.png"]="192x192"   # xxxhdpi
)

echo "📱 Required iOS App Icon Sizes:"
for filename in "${!ios_sizes[@]}"; do
    echo "  - $filename: ${ios_sizes[$filename]}"
done

echo ""
echo "🤖 Required Android App Icon Sizes:"
echo "  - mipmap-mdpi/ic_launcher.png: 48x48"
echo "  - mipmap-hdpi/ic_launcher.png: 72x72"
echo "  - mipmap-xhdpi/ic_launcher.png: 96x96"
echo "  - mipmap-xxhdpi/ic_launcher.png: 144x144"
echo "  - mipmap-xxxhdpi/ic_launcher.png: 192x192"

echo ""
echo "🛠️ To generate app icons:"
echo "1. Use the LiftLink logo image you provided"
echo "2. Use an online app icon generator like:"
echo "   - https://appicon.co"
echo "   - https://makeappicon.com"
echo "   - https://iconverticons.com"
echo "3. Upload your LiftLink logo and download the generated icons"
echo "4. Place the iOS icons in: ios/LiftLinkMobile/Images.xcassets/AppIcon.appiconset/"
echo "5. Place the Android icons in their respective mipmap folders"

echo ""
echo "📁 Directory structure:"
echo "iOS: ios/LiftLinkMobile/Images.xcassets/AppIcon.appiconset/"
echo "Android: android/app/src/main/res/mipmap-*/"

echo ""
echo "✅ After placing the icons, run:"
echo "   cd ios && pod install"
echo "   npx react-native run-ios"
echo "   npx react-native run-android"