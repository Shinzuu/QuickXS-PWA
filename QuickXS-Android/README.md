# QuickXS - Native Android App with Widgets 🎓📱

A complete native Android application for QuickXS student schedule manager with **3 functional home screen widgets**.

## 🎯 Features

### Main App
- WebView wrapper for QuickXS PWA (https://puic.netlify.app)
- Full offline support
- Material 3 design
- QuickXS theme (dark cyan)

### 📊 Home Screen Widgets

**1. Current Class Widget** (250x150dp)
- Shows NOW/NEXT class
- Teacher & classroom info
- Time remaining countdown
- Auto-updates every 15 min

**2. Daily Progress Widget** (180x120dp)
- Completion percentage (circle)
- Completed/Total classes
- Progress tracking

**3. Next Event Widget** (250x120dp)
- Upcoming event details
- Days until event
- Event type icon
- Urgency indicator

## 🚀 Quick Start

```bash
# 1. Open in Android Studio
Open folder: QuickXS-Android/

# 2. Wait for Gradle sync (~10 min first time)
# 3. Build APK
Build → Generate Signed Bundle / APK → APK

# 4. Install on phone
Run → Select device → Install
```

**Detailed instructions**: See [BUILD_GUIDE.md](BUILD_GUIDE.md)

## 📦 Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose + Glance 1.0.0
- **Architecture**: MVVM
- **Network**: Retrofit 2.9.0
- **Background**: WorkManager 2.9.0
- **Database**: Supabase (REST API)
- **Material**: Material 3

## 📁 Project Structure

```
app/src/main/
├── java/app/netlify/puic/
│   ├── MainActivity.kt              # WebView app
│   ├── data/                        # Models & Repository
│   ├── widgets/                     # 3 Glance widgets
│   └── workers/                     # Auto-update logic
└── res/
    ├── layout/                      # UI layouts
    ├── xml/                         # Widget configs
    └── values/                      # Colors & strings
```

## 🔧 Requirements

- Android Studio Hedgehog (2023.1.1) or newer
- Android SDK 26+ (Android 8.0+)
- Java 17+
- 5GB disk space

## 📱 Compatibility

- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 34 (Android 14)
- **Tested on**: Android 8.0 - 14

## 🛠️ Build

**Debug APK** (for testing):
```bash
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

**Release APK** (for distribution):
```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

## 🎨 Customization

### Change Colors
Edit `app/src/main/res/values/colors.xml`

### Change Update Interval
Edit `QuickXSApplication.kt` line 20

### Change PWA URL
Edit `MainActivity.kt` line 47

## 📤 Distribution

**Option 1**: GitHub Releases (free)
**Option 2**: Google Play Store ($25)

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for details.

## 🐛 Troubleshooting

### Widget not updating?
- Check internet connection
- Settings → Apps → QuickXS → Battery → Unrestricted

### Build failing?
- Clean project: Build → Clean Project
- Invalidate caches: File → Invalidate Caches
- Check Java version: File → Project Structure

### App crashes?
- Check Logcat in Android Studio
- Filter by "puic" or "QuickXS"

## 📊 Checkpoints

All major components are complete and functional:
- ✅ Project structure
- ✅ Gradle configuration
- ✅ MainActivity (WebView)
- ✅ Supabase data layer
- ✅ Current Class Widget
- ✅ Daily Progress Widget
- ✅ Next Event Widget
- ✅ WorkManager setup
- ✅ Android Manifest
- ✅ Resources & themes

See [CHECKPOINT.md](CHECKPOINT.md) for fallback points.

## 📄 License

MIT License - See LICENSE file

## 👤 Author

**shinzuu**
- GitHub: [@Shinzuu](https://github.com/Shinzuu)
- Project: QuickXS PWA

## 🙏 Acknowledgments

- Jetpack Glance team for modern widget framework
- Material Design 3 for beautiful UI
- Supabase for backend infrastructure

---

**Ready to build?** Open in Android Studio and follow [BUILD_GUIDE.md](BUILD_GUIDE.md)!
