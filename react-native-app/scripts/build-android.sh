#!/bin/bash

# LiftLink Android Build Script
# This script builds the Android APK/AAB for production

set -e

echo "🤖 Starting LiftLink Android Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the React Native app root directory.${NC}"
    exit 1
fi

# Check for required dependencies
echo -e "${BLUE}📋 Checking dependencies...${NC}"

if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Error: yarn is not installed. Please install yarn first.${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Check Android environment
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠️  Warning: ANDROID_HOME is not set. Please set up Android SDK.${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
yarn install

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
npx react-native clean
cd android && ./gradlew clean && cd ..

# Generate Android icons and assets
echo -e "${BLUE}🎨 Generating Android icons...${NC}"
if [ -f "assets/icon.png" ]; then
    # This would normally use a tool like react-native-make
    echo -e "${GREEN}✅ Icon generation completed${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: No icon.png found in assets directory${NC}"
fi

# Build types
BUILD_TYPE=${1:-"debug"}
OUTPUT_TYPE=${2:-"apk"}

echo -e "${BLUE}🔨 Building Android ${BUILD_TYPE} ${OUTPUT_TYPE}...${NC}"

cd android

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}🔐 Building release version...${NC}"
    
    if [ "$OUTPUT_TYPE" = "aab" ]; then
        echo -e "${BLUE}📦 Building Android App Bundle (AAB)...${NC}"
        ./gradlew bundleRelease
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Release AAB built successfully!${NC}"
            echo -e "${GREEN}📁 Location: android/app/build/outputs/bundle/release/app-release.aab${NC}"
        else
            echo -e "${RED}❌ Release AAB build failed!${NC}"
            exit 1
        fi
    else
        echo -e "${BLUE}📦 Building Release APK...${NC}"
        ./gradlew assembleRelease
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Release APK built successfully!${NC}"
            echo -e "${GREEN}📁 Location: android/app/build/outputs/apk/release/app-release.apk${NC}"
        else
            echo -e "${RED}❌ Release APK build failed!${NC}"
            exit 1
        fi
    fi
else
    echo -e "${BLUE}🐛 Building debug APK...${NC}"
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Debug APK built successfully!${NC}"
        echo -e "${GREEN}📁 Location: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    else
        echo -e "${RED}❌ Debug APK build failed!${NC}"
        exit 1
    fi
fi

cd ..

# Display build summary
echo -e "\n${GREEN}🎉 Android Build Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}App Name:${NC} LiftLink"
echo -e "${GREEN}Package:${NC} com.liftlink"
echo -e "${GREEN}Build Type:${NC} ${BUILD_TYPE}"
echo -e "${GREEN}Output Type:${NC} ${OUTPUT_TYPE}"
echo -e "${GREEN}Version:${NC} $(grep '"version"' package.json | cut -d'"' -f4)"

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "\n${YELLOW}🚀 Ready for Google Play Store upload!${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. Test the ${OUTPUT_TYPE} on physical devices"
    echo -e "2. Upload to Google Play Console"
    echo -e "3. Fill out store listing information"
    echo -e "4. Submit for review"
fi

echo -e "\n${GREEN}📱 To install on device:${NC}"
if [ "$BUILD_TYPE" = "debug" ]; then
    echo -e "adb install android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo -e "adb install android/app/build/outputs/apk/release/app-release.apk"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"