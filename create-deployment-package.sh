#!/bin/bash

# LiftLink Complete Expo Deployment Package Creator
# This creates a deployable package for local execution

echo "📦 Creating LiftLink Deployment Package"
echo "======================================="

# Create deployment directory
DEPLOY_DIR="LiftLink_Deployment_Package"
mkdir -p $DEPLOY_DIR

# Copy LiftLinkMobile app
echo "📱 Copying Expo mobile app..."
cp -r /app/LiftLinkMobile $DEPLOY_DIR/

# Copy deployment scripts
echo "🚀 Copying deployment scripts..."
cp /app/deploy-ios-expo.sh $DEPLOY_DIR/
cp /app/APP_STORE_CONNECT_SETUP.md $DEPLOY_DIR/
cp /app/FINAL_DEPLOYMENT_CHECKLIST.md $DEPLOY_DIR/

# Create README for deployment
cat > $DEPLOY_DIR/README.md << 'EOF'
# 🍎 LiftLink iOS App Store Deployment Package

## 🚀 **Quick Start (5 minutes to deploy!)**

### **Step 1: Setup**
```bash
# Install Node.js from https://nodejs.org (if not already installed)
# Then run:
npm install -g @expo/cli eas-cli
```

### **Step 2: Deploy to App Store**
```bash
# Make script executable and run
chmod +x deploy-ios-expo.sh
./deploy-ios-expo.sh
```

### **Step 3: App Store Connect Setup**
Follow the detailed guide in `APP_STORE_CONNECT_SETUP.md`

### **Credentials Ready:**
- **Expo Account**: ksurepalli259 / c.tqL2MD9B++?xv
- **Apple Developer**: lift.link.email@gmail.com / Monkey@Durham*1
- **Bundle ID**: com.liftlink.app

### **Expected Timeline:**
- **Setup & Build**: 30 minutes
- **Apple Review**: 24-48 hours  
- **Total**: 1-3 days to live on App Store!

## 📱 **What's Included:**

✅ **Complete Expo mobile app** with live features
✅ **Automated deployment script** for one-command deploy
✅ **App Store Connect setup guide** with all details filled in
✅ **Pre-configured credentials** and bundle IDs
✅ **Professional app description** ready to copy-paste

## 🎯 **Your app is ready for App Store launch!**

Just run `./deploy-ios-expo.sh` and follow the prompts.
EOF

# Create package info
cat > $DEPLOY_DIR/PACKAGE_INFO.txt << 'EOF'
🍎 LiftLink iOS Deployment Package
==================================

Created: $(date)
App Version: 1.0.0
Bundle ID: com.liftlink.app
Target: iOS App Store + Google Play Store

Credentials Configured:
- Expo: ksurepalli259
- Apple: lift.link.email@gmail.com

Files Included:
- LiftLinkMobile/ (Complete Expo app)
- deploy-ios-expo.sh (Automated deployment)
- APP_STORE_CONNECT_SETUP.md (Setup guide)
- FINAL_DEPLOYMENT_CHECKLIST.md (Complete reference)

Ready to deploy: YES ✅
EOF

# Create archive
echo "📦 Creating deployment archive..."
tar -czf LiftLink_Deployment_Package.tar.gz $DEPLOY_DIR

echo ""
echo "✅ Deployment package created successfully!"
echo ""
echo "📂 Package contents:"
echo "   - LiftLink_Deployment_Package/ (directory)"
echo "   - LiftLink_Deployment_Package.tar.gz (archive)"
echo ""
echo "🚀 To deploy:"
echo "   1. Download the package to your local machine"
echo "   2. Extract: tar -xzf LiftLink_Deployment_Package.tar.gz"
echo "   3. Run: cd LiftLink_Deployment_Package && ./deploy-ios-expo.sh"
echo ""
echo "⏱️ Your app will be live on App Store in 1-3 days!"

# Show package size
echo ""
echo "📊 Package size: $(du -sh LiftLink_Deployment_Package.tar.gz | cut -f1)"
echo "📊 Directory size: $(du -sh $DEPLOY_DIR | cut -f1)"