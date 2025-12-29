#!/bin/bash

# QuickXS PWA - TWA Build Automation Script
# Run this after setup-twa.sh and bubblewrap init

set -e

echo "🔨 QuickXS PWA - Building Android APK"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if bubblewrap is installed
if ! command -v bubblewrap &> /dev/null; then
    echo -e "${RED}❌ Bubblewrap not found${NC}"
    echo "Please run ./scripts/setup-twa.sh first"
    exit 1
fi

# Check if twa-manifest.json exists (created by bubblewrap init)
if [ ! -f "twa-manifest.json" ]; then
    echo -e "${RED}❌ twa-manifest.json not found${NC}"
    echo ""
    echo "Please run bubblewrap init first:"
    echo -e "${YELLOW}  bubblewrap init --manifest=https://YOUR-APP.netlify.app/manifest.json${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Found twa-manifest.json${NC}"
echo ""

# Build the APK
echo "📦 Building Android APK..."
echo "This may take a few minutes..."
echo ""

bubblewrap build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ APK built successfully!${NC}"
    echo ""

    # Find the APK file
    APK_FILE=$(find . -name "app-release-signed.apk" -o -name "*.apk" | head -n 1)

    if [ -n "$APK_FILE" ]; then
        echo "📱 Your APK is ready:"
        echo -e "${YELLOW}  $APK_FILE${NC}"
        echo ""
        echo "File size: $(du -h "$APK_FILE" | cut -f1)"
        echo ""
        echo "Next steps:"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Install from Unknown Sources' in Settings"
        echo "3. Open the APK file to install"
        echo "4. Test the app on your device"
        echo ""
        echo "For Play Store:"
        echo "1. Create a Google Play Developer account ($25)"
        echo "2. Create a new app in Play Console"
        echo "3. Upload this APK or generate AAB:"
        echo "   bubblewrap build --skipPwaValidation"
        echo "4. Complete store listing and submit for review"
    else
        echo -e "${YELLOW}⚠️  APK file not found in expected location${NC}"
        echo "Check the build output for the APK location"
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check the error messages above"
    exit 1
fi
