#!/bin/bash

# LiftLink Certificate Information Script

echo "🔑 LiftLink Android Certificate Information"
echo "=========================================="
echo ""

echo "📱 Package Name: com.liftlink.app"
echo ""

echo "🛠️  DEBUG CERTIFICATE:"
echo "Keystore: /app/liftlink-debug.keystore"
echo "SHA-1: F4:9E:00:F6:44:A9:DB:3B:61:92:FD:4F:31:B0:5E:4E:D5:D4:B0:F5"
echo ""

echo "🚀 PRODUCTION CERTIFICATE:"
echo "Keystore: /app/liftlink-release.keystore" 
echo "SHA-1: C1:E8:E4:6A:4F:0A:88:F9:20:2A:06:F7:76:A9:50:FF:92:3A:F3:3E"
echo ""

echo "✅ GOOGLE FIT INTEGRATION:"
echo "Client ID: 464466068216-4sfg6htsflfler6ri9f9hqbsvgl7n7ij.apps.googleusercontent.com"
echo "Status: Configured and ready for testing"
echo ""

echo "📋 To view full certificate details:"
echo "Debug:      keytool -keystore /app/liftlink-debug.keystore -list -v -alias liftlink -storepass android"
echo "Production: keytool -keystore /app/liftlink-release.keystore -list -v -alias liftlink -storepass liftlink2024"
echo ""

echo "🔗 Health API Setup URLs:"
echo "Google Fit:     https://console.cloud.google.com/"
echo "Fitbit:         https://dev.fitbit.com/apps"
echo "Garmin:         https://developer.garmin.com/"
echo "Apple Health:   https://developer.apple.com/"
echo ""

echo "🎯 Next Steps:"
echo "1. Add Google Fit Client Secret to Google Cloud Console"
echo "2. Register Fitbit app with package name: com.liftlink.app"
echo "3. Register Garmin app with package name: com.liftlink.app"
echo "4. Test Google Fit integration in Enhanced Analytics tab"