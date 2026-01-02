# QuickXS Native Android App - Build Guide

## 🎉 What You Have

A **complete native Android app** with **3 functional home screen widgets** built with Jetpack Glance!

### Features:
- ✅ WebView wrapper for PWA (https://puic.netlify.app)
- ✅ **Current Class Widget** - Shows NOW/NEXT class with countdown
- ✅ **Daily Progress Widget** - Shows completion percentage
- ✅ **Next Event Widget** - Shows upcoming events with urgency badges
- ✅ Auto-updates every 15 minutes via WorkManager
- ✅ Supabase integration for real-time data
- ✅ Material 3 design with QuickXS theme colors

---

## 📋 Prerequisites

### 1. Install Android Studio
**Download**: https://developer.android.com/studio

**System Requirements**:
- Windows/Mac/Linux
- 8GB RAM minimum (16GB recommended)
- 5GB free disk space
- Java 17+ (included with Android Studio)

### 2. Install Android Studio
1. Download Android Studio from link above
2. Run installer
3. Follow setup wizard
4. Install Android SDK (API 26-34)
5. Wait for initial setup to complete (~10-15 minutes)

---

## 🚀 Building the APK

### Step 1: Open Project in Android Studio

1. Launch Android Studio
2. Click **"Open"**
3. Navigate to: `/home/shinzuu/QuickXS-PWA/QuickXS-Android/`
4. Click **"OK"**

### Step 2: Wait for Gradle Sync

When project opens, Android Studio will:
- Download Gradle wrapper (2 minutes)
- Download dependencies (5-10 minutes first time)
- Index files

**Wait for "Gradle sync finished" message** in bottom status bar.

### Step 3: Build APK

**Option A: Release APK (Recommended)**
```
1. Click "Build" → "Generate Signed Bundle / APK"
2. Select "APK"
3. Click "Next"
4. Click "Create new..." to create keystore:
   - Key store path: Choose location (save this!)
   - Password: Create strong password (SAVE THIS!)
   - Alias: "quickxs"
   - Alias password: Same as keystore password
   - Validity: 25 years
   - First/Last name: Your name
5. Click "Next"
6. Select "release"
7. Check "V2 (Full APK Signature)"
8. Click "Finish"
9. Wait 2-3 minutes
10. APK location: `app/release/app-release.apk`
```

**Option B: Debug APK (Faster)**
```
1. Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
2. Wait 2-3 minutes
3. Click "locate" in notification
4. APK location: `app/debug/app-debug.apk`
```

---

## 📱 Installing on Android Device

### Method 1: USB Cable
```
1. Enable Developer Options on phone:
   - Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options
   - Turn on "USB Debugging"
3. Connect phone to computer via USB
4. In Android Studio: Click "Run" (green play button)
5. Select your device
6. App installs automatically
```

### Method 2: Share APK File
```
1. Copy APK to phone (email/cloud/USB)
2. Open APK on phone
3. Tap "Install"
4. If blocked: Settings → Security → "Allow from this source"
5. Tap "Install" again
```

---

## 🎨 Adding Widgets to Home Screen

### After installing app:

**1. Add Current Class Widget:**
```
1. Long-press on home screen
2. Tap "Widgets"
3. Find "QuickXS"
4. Drag "Current Class" to home screen
5. Resize as needed (250dp x 150dp minimum)
```

**2. Add Daily Progress Widget:**
```
1. Same as above
2. Drag "Daily Progress" widget
3. Resize (180dp x 120dp minimum)
```

**3. Add Next Event Widget:**
```
1. Same as above
2. Drag "Next Event" widget
3. Resize (250dp x 120dp minimum)
```

**Widgets update automatically every 15 minutes!**

---

## 🐛 Troubleshooting

### Build Errors

**"SDK not found"**
```
1. Android Studio → Tools → SDK Manager
2. Install "Android 13.0 (API 33)" or higher
3. Install "Android SDK Build-Tools 34"
4. Click "Apply" and wait
5. Rebuild project
```

**"Gradle sync failed"**
```
1. File → Invalidate Caches → Invalidate and Restart
2. Wait for Android Studio to restart
3. Let Gradle sync again
```

**"Java version mismatch"**
```
1. File → Project Structure
2. SDK Location → JDK location
3. Select Java 17 or higher
4. Click "Apply"
```

### Widget Not Updating

**Check Internet Connection:**
- Widgets need internet to fetch data from Supabase
- Check phone has WiFi/data connection

**Force Update:**
```
1. Long-press widget
2. Tap "Remove"
3. Re-add widget from widget menu
4. Widget will refresh immediately
```

**Check WorkManager:**
```
1. Settings → Apps → QuickXS
2. Battery → Unrestricted
3. This allows background updates
```

### App Crashes

**Check Logs:**
```
1. In Android Studio: View → Tool Windows → Logcat
2. Filter by "QuickXS" or "app.netlify.puic"
3. Look for red error messages
4. Share error with developer
```

---

## 📦 Project Structure

```
QuickXS-Android/
├── app/
│   ├── src/main/
│   │   ├── java/app/netlify/puic/
│   │   │   ├── MainActivity.kt           # Main app (WebView)
│   │   │   ├── QuickXSApplication.kt    # App setup
│   │   │   ├── data/
│   │   │   │   ├── Models.kt            # Data models
│   │   │   │   ├── SupabaseApi.kt       # API interface
│   │   │   │   └── SupabaseRepository.kt # Business logic
│   │   │   ├── widgets/
│   │   │   │   ├── CurrentClassWidget.kt
│   │   │   │   ├── DailyProgressWidget.kt
│   │   │   │   └── NextEventWidget.kt
│   │   │   └── workers/
│   │   │       └── WidgetUpdateWorker.kt # Auto-updates
│   │   ├── res/
│   │   │   ├── layout/              # UI layouts
│   │   │   ├── xml/                 # Widget configs
│   │   │   ├── values/              # Colors, strings, themes
│   │   │   └── mipmap/              # App icons
│   │   └── AndroidManifest.xml      # App configuration
│   └── build.gradle.kts             # Dependencies
├── build.gradle.kts                 # Project config
└── settings.gradle.kts              # Gradle settings
```

---

## 🔧 Customization

### Change Widget Update Interval

**File**: `app/src/main/java/app/netlify/puic/QuickXSApplication.kt`

```kotlin
// Change from 15 minutes to 30 minutes:
val updateRequest = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
    30, TimeUnit.MINUTES  // Change this value
)
```

### Change Theme Colors

**File**: `app/src/main/res/values/colors.xml`

```xml
<!-- Modify these colors: -->
<color name="quickxs_bg">#222831</color>        <!-- Background -->
<color name="quickxs_card">#393E46</color>      <!-- Widget background -->
<color name="quickxs_accent">#00ADB5</color>    <!-- Highlight color -->
<color name="quickxs_text">#EEEEEE</color>      <!-- Text color -->
```

### Change PWA URL

**File**: `app/src/main/java/app/netlify/puic/MainActivity.kt`

```kotlin
// Line 47:
webView.loadUrl("https://puic.netlify.app")  // Change URL here
```

---

## 📤 Distribution

### Option 1: GitHub Releases (Free)

```
1. Build release APK (see above)
2. Go to: https://github.com/Shinzuu/QuickXS-PWA/releases
3. Click "Create new release"
4. Tag: v1.0.0
5. Upload APK file
6. Publish release
7. Users download and install
```

### Option 2: Google Play Store ($25 one-time fee)

```
1. Create Google Play Console account
2. Pay $25 registration fee
3. Create new app listing
4. Build signed AAB instead of APK:
   Build → Generate Signed Bundle
5. Upload AAB to Play Console
6. Fill out store listing
7. Submit for review (1-3 days)
8. Publish when approved
```

---

## 🎯 Next Steps

1. ✅ Build APK (10-15 minutes)
2. ✅ Install on phone
3. ✅ Add widgets to home screen
4. ✅ Test all 3 widgets
5. ✅ Distribute via GitHub Releases

---

## 💡 Tips

**Faster Builds:**
- Close other apps while building
- Use release build only when ready to distribute
- Use debug build for testing

**Better Performance:**
- Enable "Unrestricted battery" for QuickXS app
- Keep internet connection active
- Widgets update every 15 minutes automatically

**Icon Customization:**
- Replace files in `app/src/main/res/mipmap-*/`
- Use Android Studio → New → Image Asset → Launcher Icons
- Or use: https://romannurik.github.io/AndroidAssetStudio/

---

## 📊 Build Time Estimates

- **First time build**: 15-20 minutes (downloads dependencies)
- **Subsequent builds**: 2-3 minutes
- **APK size**: ~8-10 MB
- **Widget memory**: ~2-5 MB per widget

---

## ✅ Checklist

Before distributing:

- [ ] App builds successfully
- [ ] App opens and shows PWA
- [ ] Current Class Widget works
- [ ] Daily Progress Widget works
- [ ] Next Event Widget works
- [ ] Widgets update automatically
- [ ] App icon looks good
- [ ] App name is correct
- [ ] Version number is set
- [ ] Signed with release keystore (if distributing)

---

## 🆘 Support

**Build Issues**: Check Android Studio Logcat for errors

**Widget Issues**: Ensure internet connection and battery optimization is off

**Data Issues**: Check Supabase API is accessible

**Questions**: Create GitHub issue with:
- Android Studio version
- Phone model & Android version
- Error message from Logcat
- Screenshots

---

**Built with ❤️ using Jetpack Glance & Kotlin**

Last Updated: December 29, 2025
