# Android Widget Solution for QuickXS - 2025 Latest Research

**Research Date**: December 29, 2025
**Goal**: Implement home screen widgets for QuickXS schedule app

---

## 🔍 Latest Research Findings

### **Reality Check (December 2025)**:

❌ **PWA Widgets on Android**: NOT SUPPORTED
- PWA widgets spec exists but only implemented for Windows 11
- Android Chrome does not support PWA widgets
- No browser supports PWA widgets on Android

❌ **TWA Alone**: CANNOT create widgets
- TWA is just a web wrapper (Chrome in fullscreen)
- Widgets require native Android code
- TWA + Native is the only path

✅ **Only Working Solution**: **TWA + Native Android Widgets**

---

## ✅ CONFIRMED WORKING SOLUTION: Jetpack Glance (2025)

### **Modern Approach - Jetpack Glance**

**What is Glance?**
- Google's official library for building widgets (2025)
- Uses Compose-style declarative API (like React)
- Latest version: 1.2.0-rc01 (actively maintained)
- **Much easier than old XML-based widgets**

**Why Glance is Best for 2025:**
```
Old Way (XML):        New Way (Glance):
- Complex XML layouts - Compose-style code
- RemoteViews hassle - Simple @Composable
- Java boilerplate   - Modern Kotlin
- Hard to test       - Built-in testing
```

---

## 📋 Implementation Plan

### **Architecture: TWA + Glance Widgets**

```
┌─────────────────────────────────────┐
│      Android APK Package            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   TWA Wrapper                │  │
│  │   (Main App UI)              │  │
│  │   https://puic.netlify.app   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Native Widgets (Glance)    │  │
│  │   - Current Class Widget     │  │
│  │   - Daily Progress Widget    │  │
│  │   - Events Widget            │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Data Layer                 │  │
│  │   - Supabase API calls       │  │
│  │   - WorkManager updates      │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🛠️ Step-by-Step Implementation

### **Phase 1: Setup Android Studio Project** (2-3 hours)

#### **1.1 Install Android Studio**
```bash
# Download from:
https://developer.android.com/studio

# Install required:
- Android Studio Ladybug | 2024.2.1 or newer
- Android SDK 34
- Gradle 8.x
- Kotlin 2.0+
```

#### **1.2 Create New Project**
1. Open Android Studio
2. New Project → "Empty Activity"
3. Name: QuickXS
4. Package: `app.netlify.puic.twa`
5. Language: **Kotlin**
6. Minimum SDK: **API 21** (Android 5.0)
7. Build system: Gradle

#### **1.3 Add Dependencies**

**In `build.gradle.kts` (app level)**:
```kotlin
dependencies {
    // TWA support
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")

    // Jetpack Glance for widgets
    implementation("androidx.glance:glance-appwidget:1.2.0-rc01")
    implementation("androidx.glance:glance-material3:1.2.0-rc01")

    // Compose (required by Glance)
    implementation("androidx.compose.runtime:runtime:1.6.0")
    implementation("androidx.compose.ui:ui:1.6.0")

    // WorkManager for periodic updates
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // HTTP client for Supabase API
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

---

### **Phase 2: Setup TWA** (1 hour)

#### **2.1 Configure TWA in AndroidManifest.xml**
```xml
<manifest>
    <application>
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:theme="@style/Theme.QuickXS"
            android:exported="true">

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="https://puic.netlify.app" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Widget receivers will go here -->
    </application>
</manifest>
```

#### **2.2 Add Digital Asset Links**
```xml
<!-- res/values/strings.xml -->
<string name="asset_statements">
    [{
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "web",
        "site": "https://puic.netlify.app"
      }
    }]
</string>
```

---

### **Phase 3: Create Widgets with Glance** (10-15 hours)

#### **3.1 Setup Data Model**

**Create `data/SupabaseApi.kt`**:
```kotlin
package app.netlify.puic.twa.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

data class ClassInfo(
    val subject: String,
    val teacher: String,
    val classroom: String,
    val time: String,
    val day: String,
    val duration: Int
)

data class Event(
    val name: String,
    val date: String,
    val time: String,
    val info: String?,
    val priority: String
)

class SupabaseApi {
    private val client = OkHttpClient()
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val baseUrl = "https://gymdfwvseuhsusyfsnpb.supabase.co"
    private val anonKey = "YOUR_PUBLISHABLE_KEY_HERE"

    suspend fun getTodayClasses(): List<ClassInfo> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl/rest/v1/routines?select=*")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $anonKey")
            .build()

        val response = client.newCall(request).execute()
        val json = response.body?.string() ?: "[]"

        moshi.adapter<List<ClassInfo>>().fromJson(json) ?: emptyList()
    }

    suspend fun getUpcomingEvents(): List<Event> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl/rest/v1/events?select=*&order=date.asc&limit=5")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $anonKey")
            .build()

        val response = client.newCall(request).execute()
        val json = response.body?.string() ?: "[]"

        moshi.adapter<List<Event>>().fromJson(json) ?: emptyList()
    }
}
```

#### **3.2 Create Current Class Widget**

**Create `widgets/CurrentClassWidget.kt`**:
```kotlin
package app.netlify.puic.twa.widgets

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.text.FontWeight
import androidx.glance.unit.ColorProvider
import androidx.glance.appwidget.cornerRadius
import app.netlify.puic.twa.data.ClassInfo
import app.netlify.puic.twa.data.SupabaseApi

class CurrentClassWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: android.content.Context, id: GlanceId) {
        val api = SupabaseApi()
        val classes = api.getTodayClasses()
        val currentClass = getCurrentClass(classes)

        provideContent {
            CurrentClassContent(currentClass)
        }
    }

    @Composable
    private fun CurrentClassContent(classInfo: ClassInfo?) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(ColorProvider(0xFF222831))
                .cornerRadius(16.dp)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (classInfo != null) {
                // Class emoji/icon
                Text(
                    text = "📚",
                    style = TextStyle(
                        fontSize = 48.sp
                    )
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                // NOW label
                Text(
                    text = "NOW",
                    style = TextStyle(
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = ColorProvider(0xFF00ADB5)
                    )
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                // Subject
                Text(
                    text = classInfo.subject,
                    style = TextStyle(
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = ColorProvider(0xFFEEEEEE)
                    )
                )

                Spacer(modifier = GlanceModifier.height(4.dp))

                // Teacher & Room
                Text(
                    text = "${classInfo.teacher} • Room ${classInfo.classroom}",
                    style = TextStyle(
                        fontSize = 14.sp,
                        color = ColorProvider(0xFFB0B0B0)
                    )
                )

                Spacer(modifier = GlanceModifier.height(12.dp))

                // Time
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "⏰",
                        style = TextStyle(fontSize = 16.sp)
                    )
                    Spacer(modifier = GlanceModifier.width(4.dp))
                    Text(
                        text = formatTime(classInfo.time),
                        style = TextStyle(
                            fontSize = 16.sp,
                            color = ColorProvider(0xFFEEEEEE)
                        )
                    )
                }
            } else {
                Text(
                    text = "✨",
                    style = TextStyle(fontSize = 48.sp)
                )
                Spacer(modifier = GlanceModifier.height(8.dp))
                Text(
                    text = "No Classes",
                    style = TextStyle(
                        fontSize = 20.sp,
                        color = ColorProvider(0xFFEEEEEE)
                    )
                )
                Text(
                    text = "Enjoy your break!",
                    style = TextStyle(
                        fontSize = 14.sp,
                        color = ColorProvider(0xFFB0B0B0)
                    )
                )
            }
        }
    }

    private fun getCurrentClass(classes: List<ClassInfo>): ClassInfo? {
        // Logic to find current class based on time
        // Implementation here...
        return classes.firstOrNull()
    }

    private fun formatTime(time: String): String {
        val (hours, minutes) = time.split(":").map { it.toInt() }
        val period = if (hours >= 12) "PM" else "AM"
        val displayHour = if (hours % 12 == 0) 12 else hours % 12
        return "$displayHour:${minutes.toString().padStart(2, '0')} $period"
    }
}

class CurrentClassWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = CurrentClassWidget()
}
```

#### **3.3 Create Widget XML Configuration**

**Create `res/xml/current_class_widget_info.xml`**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="250dp"
    android:targetCellWidth="4"
    android:targetCellHeight="4"
    android:updatePeriodMillis="1800000"
    android:previewImage="@drawable/widget_preview"
    android:initialLayout="@layout/widget_loading"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/current_class_widget_description" />
```

#### **3.4 Register Widget in Manifest**

**Update `AndroidManifest.xml`**:
```xml
<receiver
    android:name=".widgets.CurrentClassWidgetReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/current_class_widget_info" />
</receiver>
```

---

### **Phase 4: Periodic Updates with WorkManager** (2-3 hours)

**Create `workers/WidgetUpdateWorker.kt`**:
```kotlin
package app.netlify.puic.twa.workers

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.*
import app.netlify.puic.twa.widgets.CurrentClassWidget
import java.util.concurrent.TimeUnit

class WidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            CurrentClassWidget().updateAll(applicationContext)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        fun enqueue(context: Context) {
            val request = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
                15, TimeUnit.MINUTES
            ).setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "widget_update",
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }
    }
}
```

---

### **Phase 5: Build & Test** (2-3 hours)

#### **5.1 Build APK**
```bash
# In Android Studio:
Build → Generate Signed Bundle / APK
→ APK
→ Create new keystore (save it!)
→ Build release APK
```

#### **5.2 Test on Device**
1. Install APK on Android device
2. Long-press home screen
3. Tap "Widgets"
4. Find "QuickXS" widgets
5. Drag to home screen
6. Verify data loads from Supabase

---

## 📊 Time Estimate Breakdown

| Task | Time | Difficulty |
|------|------|------------|
| Android Studio setup | 2-3 hours | Easy |
| TWA configuration | 1 hour | Easy |
| Learn Glance basics | 3-4 hours | Medium |
| Current Class Widget | 4-5 hours | Medium |
| Daily Progress Widget | 3-4 hours | Medium |
| Events Widget | 3-4 hours | Medium |
| Data layer + API | 4-5 hours | Medium |
| WorkManager updates | 2-3 hours | Easy |
| Testing & debugging | 4-6 hours | Medium |
| Build & package | 1-2 hours | Easy |
| **TOTAL** | **27-39 hours** | **Medium** |

**Realistic estimate for first-time**: **35-40 hours**

---

## 📚 Learning Resources

### **Official Documentation**:
1. **Jetpack Glance**: https://developer.android.com/develop/ui/compose/glance
2. **TWA Guide**: https://developer.android.com/develop/ui/views/layout/webapps/twa
3. **WorkManager**: https://developer.android.com/topic/libraries/architecture/workmanager

### **Tutorials** (2025):
1. **"Modern Android Widgets Using Glance"** by Syed Ovais Akhtar (Medium)
2. **"Jetpack Compose by Tutorials"** - Chapter 16 (Kodeco)
3. **Android Developers Blog** - Announcing Jetpack Glance

### **Code Examples**:
```bash
# Official Glance samples
git clone https://github.com/android/compose-samples
cd compose-samples/JetNews  # Has Glance widgets example
```

---

## ⚡ Quick Start Path (Fastest Route)

### **Option A: Start with Template** (Recommended)
1. Clone Compose Samples repo
2. Copy Glance widget code
3. Adapt for QuickXS data
4. Add Supabase API calls
5. Integrate with TWA

### **Option B: Use AI Assistance**
1. Use GitHub Copilot / ChatGPT with Glance docs
2. Generate widget code from examples
3. Test and iterate
4. Reduces time to ~20-25 hours

### **Option C: Hire Developer**
- **Cost**: $500-1500
- **Time**: 1-2 weeks
- **Outcome**: Professional implementation

---

## 🎯 Simplified Minimal Widget (If Time-Constrained)

### **Single Widget Approach** (10-15 hours):

Focus on ONE essential widget first:
- **Current/Next Class Widget** (4x2 size)
- Shows only: Subject, Time, Room
- Updates every 30 minutes
- No fancy animations

**Once working**, add others later.

---

## 🚀 RECOMMENDED ACTION PLAN

### **Path 1: DIY Implementation** (35-40 hours)
✅ Pros:
- Full control
- Learn Android development
- No cost

❌ Cons:
- Significant time investment
- Learning curve
- Debugging challenges

### **Path 2: Hybrid Approach** (20-25 hours)
✅ Use:
- AI code generation (Copilot/ChatGPT)
- Copy/paste from official samples
- Follow video tutorials

### **Path 3: Developer Hire** ($500-1500)
✅ Fastest to working widget
❌ Cost involved

---

## ✅ FINAL VERDICT: Widgets ARE Possible in 2025

**Summary**:
- ❌ PWA widgets alone: NOT possible on Android
- ❌ TWA alone: NOT possible
- ✅ **TWA + Glance widgets: FULLY POSSIBLE**

**Modern Solution (2025)**:
- Use **Jetpack Glance** (newest, easiest)
- Compose-style API (familiar if you know React)
- Official Google library (well-supported)
- Active development (latest release: 1.2.0-rc01)

**Time Investment**: 35-40 hours (first time)
**Difficulty**: Medium (doable with tutorials)
**Outcome**: Real Android widgets working with your PWA data

---

## 🎬 Next Steps

1. ✅ **Read this document** (done!)
2. **Decide**: DIY, AI-assisted, or hire?
3. **If DIY**: Install Android Studio (2-3 hours)
4. **Follow Phase 1-5** above
5. **Test on device**
6. **Distribute via GitHub Releases**

---

**You CAN have widgets, but it requires native Android development.**
**Glance makes it much easier than it used to be.**
**Your choice: invest time or money to get there.**

---

*Last Updated: December 29, 2025*
*Based on latest Android documentation and Jetpack Glance 1.2.0-rc01*
