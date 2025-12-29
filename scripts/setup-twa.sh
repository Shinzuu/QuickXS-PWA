#!/bin/bash

# QuickXS PWA - TWA Setup Automation Script
# This script automates the setup of Bubblewrap for building Android APKs

set -e  # Exit on error

echo "🚀 QuickXS PWA - TWA Setup Automation"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Check if JDK is installed
if ! command -v javac &> /dev/null; then
    echo -e "${YELLOW}⚠️  JDK not found${NC}"
    echo "Installing Bubblewrap will require JDK 11 or higher"
    echo ""
    echo "To install JDK:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-11-jdk"
    echo "  macOS: brew install openjdk@11"
    echo "  Windows: Download from https://adoptium.net/"
    echo ""
    read -p "Continue without JDK? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ JDK found: $(javac -version 2>&1)${NC}"
fi

echo ""
echo "📦 Installing Bubblewrap CLI globally..."
echo ""

# Install Bubblewrap globally
npm install -g @bubblewrap/cli

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bubblewrap installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install Bubblewrap${NC}"
    exit 1
fi

echo ""
echo "🔧 Initializing Bubblewrap..."
echo ""

# Initialize Bubblewrap (this will prompt for app details)
# You can skip this and run manually with: bubblewrap init --manifest=https://your-url.netlify.app/manifest.json

echo "To initialize your TWA project, run:"
echo ""
echo -e "${YELLOW}  bubblewrap init --manifest=https://YOUR-APP.netlify.app/manifest.json${NC}"
echo ""
echo "This will prompt you for:"
echo "  - App name"
echo "  - Package name (e.g., com.yourname.quickxs)"
echo "  - Host URL"
echo "  - Icon paths"
echo ""

echo -e "${GREEN}✅ TWA setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy your PWA to Netlify (if not already done)"
echo "2. Run: bubblewrap init --manifest=https://YOUR-APP.netlify.app/manifest.json"
echo "3. Run: bubblewrap build"
echo "4. Find your APK in: ./app-release-signed.apk"
echo ""
echo "See TWA_IMPLEMENTATION_PLAN.md for detailed instructions"
