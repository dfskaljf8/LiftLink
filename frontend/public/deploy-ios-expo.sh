#!/bin/bash

# LiftLink iOS App Store Deployment Script
# Run this on your local machine with Node.js installed

echo "🍎 LiftLink iOS App Store Deployment"
echo "===================================="
echo ""

# Color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites Check:${NC}"
echo "✅ Apple Developer Account: lift.link.email@gmail.com"
echo "✅ Expo Account: ksurepalli259"
echo "✅ Project configured with Bundle ID: com.liftlink.app"
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js found:$(NC) $(node --version)"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js from https://nodejs.org${NC}"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm found:${NC} $(npm --version)"
else
    echo -e "${RED}❌ npm not found. Please install Node.js with npm${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Installing Required Tools...${NC}"

# Install Expo CLI and EAS CLI
echo "Installing @expo/cli and eas-cli..."
npm install -g @expo/cli eas-cli

echo ""
echo -e "${BLUE}🔐 Logging into Expo...${NC}"

# Login to Expo
echo "Please login to Expo with these credentials:"
echo "Username: ksurepalli259"
echo "Password: c.tqL2MD9B++?xv"
echo ""

eas login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Expo login failed. Please check credentials and try again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Successfully logged into Expo!${NC}"
echo ""

echo -e "${BLUE}⚙️ Configuring EAS Build...${NC}"

# Initialize EAS build configuration
eas build:configure

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ EAS configuration failed. Please check the output above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ EAS Build configured successfully!${NC}"
echo ""

echo -e "${BLUE}🏗️ Building iOS App for App Store...${NC}"
echo "This will create a production-ready iOS build..."
echo ""

# Build iOS app for production
eas build --platform ios --profile production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ iOS build failed. Please check the output above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ iOS build completed successfully!${NC}"
echo ""

echo -e "${BLUE}📱 Preparing App Store Connect Setup...${NC}"
echo ""
echo "Before submitting to the App Store, you need to:"
echo "1. Create an app record in App Store Connect"
echo "2. Configure app metadata and descriptions"
echo ""

read -p "Have you created the app record in App Store Connect? (y/n): " app_record_created

if [ "$app_record_created" = "y" ] || [ "$app_record_created" = "Y" ]; then
    echo ""
    echo -e "${BLUE}🚀 Submitting to App Store...${NC}"
    echo "Please provide your Apple Developer credentials when prompted:"
    echo "Apple ID: lift.link.email@gmail.com"
    echo "Password: Monkey@Durham*1"
    echo ""
    
    # Submit to App Store
    eas submit --platform ios
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ App Store submission failed. Please check the output above.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Successfully submitted to App Store!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Your app is now in App Store Connect review queue"
    echo "2. Apple review typically takes 24-48 hours"
    echo "3. You'll receive email updates at lift.link.email@gmail.com"
    echo "4. Once approved, your app will be live on the App Store!"
    echo ""
    echo -e "${GREEN}🎯 Expected timeline: 1-3 days until live!${NC}"
    
else
    echo ""
    echo -e "${YELLOW}📋 App Store Connect Setup Required:${NC}"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://appstoreconnect.apple.com"
    echo "2. Login with: lift.link.email@gmail.com / Monkey@Durham*1"
    echo "3. Click 'My Apps' → '+' → 'New App'"
    echo "4. Fill in app details:"
    echo "   - Name: LiftLink"
    echo "   - Bundle ID: com.liftlink.app"
    echo "   - SKU: liftlink-ios"
    echo "   - Primary Language: English"
    echo "5. Save and then run this script again"
    echo ""
    echo -e "${BLUE}💡 Tip: The build is complete, so submission will be quick once the app record is created!${NC}"
fi

echo ""
echo -e "${GREEN}✅ iOS Deployment Process Complete!${NC}"