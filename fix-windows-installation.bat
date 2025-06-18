@echo off
echo 🔧 Fixing LiftLink Installation Issues
echo =====================================

cd /d "C:\Users\ksure\OneDrive\Apps\LiftLink-1\LiftLinkMobile"

echo 🧹 Cleaning corrupted installation...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 🧽 Clearing npm cache...
npm cache clean --force

echo 📦 Installing dependencies properly...
npm install --legacy-peer-deps

echo ✅ Testing expo installation...
npx expo --version

echo 🎯 Testing config command...
npx expo config --help

echo.
echo ✅ Installation fixed! Now run:
echo   npx eas login
echo   npx eas project:init
echo   npx eas build --platform android