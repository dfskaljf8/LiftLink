#!/bin/bash

# LiftLink Logo to App Icon Converter
# Place your LiftLink logo image as "liftlink-logo.png" in this directory and run this script

LOGO_FILE="liftlink-logo.png"
IOS_PATH="ios/LiftLinkMobile/Images.xcassets/AppIcon.appiconset"
ANDROID_PATH="android/app/src/main/res"

echo "🏋️ Converting LiftLink logo to app icons..."

# Check if logo file exists
if [ ! -f "$LOGO_FILE" ]; then
    echo "❌ Error: $LOGO_FILE not found!"
    echo "Please place your LiftLink logo image as 'liftlink-logo.png' in this directory"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick not found!"
    echo "Please install ImageMagick:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    echo "  Or use online generators: https://appicon.co"
    exit 1
fi

echo "📱 Creating iOS app icons..."

# Create iOS icons
convert "$LOGO_FILE" -resize 40x40 "$IOS_PATH/icon-20@2x.png"
convert "$LOGO_FILE" -resize 60x60 "$IOS_PATH/icon-20@3x.png"
convert "$LOGO_FILE" -resize 58x58 "$IOS_PATH/icon-29@2x.png"
convert "$LOGO_FILE" -resize 87x87 "$IOS_PATH/icon-29@3x.png"
convert "$LOGO_FILE" -resize 80x80 "$IOS_PATH/icon-40@2x.png"
convert "$LOGO_FILE" -resize 120x120 "$IOS_PATH/icon-40@3x.png"
convert "$LOGO_FILE" -resize 120x120 "$IOS_PATH/icon-60@2x.png"
convert "$LOGO_FILE" -resize 180x180 "$IOS_PATH/icon-60@3x.png"
convert "$LOGO_FILE" -resize 1024x1024 "$IOS_PATH/icon-1024.png"

echo "🤖 Creating Android app icons..."

# Create Android icons
convert "$LOGO_FILE" -resize 48x48 "$ANDROID_PATH/mipmap-mdpi/ic_launcher.png"
convert "$LOGO_FILE" -resize 72x72 "$ANDROID_PATH/mipmap-hdpi/ic_launcher.png"
convert "$LOGO_FILE" -resize 96x96 "$ANDROID_PATH/mipmap-xhdpi/ic_launcher.png"
convert "$LOGO_FILE" -resize 144x144 "$ANDROID_PATH/mipmap-xxhdpi/ic_launcher.png"
convert "$LOGO_FILE" -resize 192x192 "$ANDROID_PATH/mipmap-xxxhdpi/ic_launcher.png"

# Create additional Play Store icon
convert "$LOGO_FILE" -resize 512x512 "play-store-icon.png"

echo "✅ App icons created successfully!"
echo ""
echo "📁 iOS icons created in: $IOS_PATH"
echo "📁 Android icons created in: $ANDROID_PATH/mipmap-*"
echo "📁 Play Store icon: play-store-icon.png"
echo ""
echo "🔧 Next steps:"
echo "1. Open Xcode and verify iOS icons are loaded"
echo "2. Run: cd ios && pod install"
echo "3. Test with: npx react-native run-ios"
echo "4. Test with: npx react-native run-android"
echo "5. Upload play-store-icon.png to Google Play Console"
echo ""
echo "🚀 Your LiftLink app is ready with the new icon!"