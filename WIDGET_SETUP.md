# PWA Widgets Setup Guide

## Overview

QuickXS now supports experimental PWA widgets for **Android Chrome 125+**. This feature allows you to add home screen widgets showing:

1. **Current Class Widget** (4x4) - Shows NOW/NEXT class with countdown
2. **Daily Progress Widget** (4x2) - Shows completion progress
3. **Next Event Widget** (4x2) - Shows upcoming events

## Requirements

### Device & Browser
- **Android 12+** recommended
- **Chrome 125+** (or Edge 125+)
- **HTTPS** connection (production deployment)

### Enable Experimental Features

Widgets are currently experimental. You must enable them in Chrome:

1. Open Chrome on your Android device
2. Navigate to `chrome://flags`
3. Search for **"Web App Widgets"**
4. Enable the flag
5. Restart Chrome

## Installation Steps

### 1. Install the PWA

1. Visit the QuickXS website (HTTPS required)
2. Tap the install prompt or:
   - Menu (⋮) → "Install app" or "Add to Home Screen"
3. Wait for installation to complete

### 2. Add Widgets to Home Screen

#### Method 1: Long Press on App Icon
1. Long-press the QuickXS app icon on home screen
2. Look for "Widgets" option
3. Select widget type (Current Class, Daily Progress, or Next Event)
4. Drag to desired position

#### Method 2: Widget Picker
1. Long-press empty space on home screen
2. Tap "Widgets"
3. Find "QuickXS" in the app list
4. Select widget type
5. Drag to home screen

### 3. Configure Widgets

Widgets automatically update every 60 seconds with:
- Current/next class information
- Progress statistics
- Upcoming events

No configuration needed - widgets pull data from the app.

## Widget Specifications

### Current Class Widget
- **Size**: 4x4 grid cells
- **Updates**: Every 60 seconds
- **Shows**:
  - NOW badge (if class is ongoing)
  - NEXT badge (if class is upcoming)
  - Subject name
  - Teacher, Classroom, Time
  - Countdown (minutes until/since)

### Daily Progress Widget
- **Size**: 4x2 grid cells
- **Updates**: Every 60 seconds
- **Shows**:
  - Circular progress indicator
  - Completion percentage
  - Completed / Remaining / Total classes

### Next Event Widget
- **Size**: 4x2 grid cells
- **Updates**: Every 60 seconds
- **Shows**:
  - Event type (CT, Mid, Assignment, etc.)
  - Event name and details
  - Countdown (days until event)
  - URGENT badge (if within 2 days)

## How Widgets Work

### Data Flow
```
App (Svelte) → widgetService.js → widget-data.json → Widget HTML
     ↓                ↓                    ↓
  Store Updates   Every 60s          Cache (1 min)
```

### Widget Files
- **Templates**: `/public/widgets/*.html`
- **Data**: `/public/widget-data.json`
- **Service**: `/src/lib/widgetService.js`
- **Config**: `vite.config.js` (manifest.widgets)

### Update Frequency
- Widgets fetch data every **60 seconds**
- Data refreshes when:
  - App is opened
  - Tab becomes visible
  - Data changes in store
  - Every 1 minute (background)

## Troubleshooting

### Widgets Not Showing

**Problem**: Can't find widgets in widget picker

**Solutions**:
1. Ensure Chrome flags are enabled
2. Reinstall the PWA
3. Clear Chrome cache
4. Update Chrome to latest version

### Widgets Not Updating

**Problem**: Widget shows old/stale data

**Solutions**:
1. Open the app to trigger data refresh
2. Check internet connection
3. Remove and re-add widget
4. Clear site data and reinstall

### Widgets Show "Loading..."

**Problem**: Widget stuck on loading screen

**Solutions**:
1. Check if app is installed properly
2. Verify internet connection
3. Check if Supabase is accessible
4. Open app to initialize data

### Widget Data Not Available

**Problem**: Widget shows "Failed to load"

**Solutions**:
1. Open the app at least once
2. Check browser console for errors
3. Verify `/widget-data.json` is accessible
4. Check service worker status

## Browser Support

| Platform | Browser | Support | Notes |
|----------|---------|---------|-------|
| Android 12+ | Chrome 125+ | ✅ Experimental | Requires flag |
| Android 12+ | Edge 125+ | ✅ Experimental | Requires flag |
| iOS | Safari | ❌ No | Not supported |
| Desktop | Chrome | ❌ No | Android only |

## Technical Details

### Manifest Configuration

```json
{
  "widgets": [
    {
      "name": "Current Class",
      "tag": "current-class",
      "template": "current-class",
      "ms_ac_template": "widgets/current-class.html",
      "data": "widget-data.json",
      "update": 60
    }
  ]
}
```

### Widget Data Schema

```json
{
  "currentClass": {
    "subject": "String",
    "teacher": "String",
    "classroom": "String",
    "time": "HH:MM",
    "duration": "Number",
    "minutesUntil": "Number"
  },
  "nextClass": { /* same structure */ },
  "todayClasses": [ /* array of classes */ ],
  "upcomingEvents": [ /* array of events */ ],
  "lastUpdated": "ISO 8601 timestamp"
}
```

### Service Worker Caching

Widgets use `NetworkFirst` strategy:
- Cache expiration: **60 seconds**
- Falls back to cache if offline
- Updates cache on successful fetch

## Future Enhancements

- [ ] Widget customization (themes, size options)
- [ ] Interactive widgets (click to open class)
- [ ] Multiple widget sizes (2x2, 4x1, etc.)
- [ ] Lock screen widgets (when supported)
- [ ] Widget configuration UI in app

## Resources

- [Web App Widgets Explainer](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/PWAWidgets/explainer.md)
- [Chrome Platform Status](https://chromestatus.com/feature/5174635984084992)
- [PWA Widgets Specification (Draft)](https://w3c.github.io/manifest-app-info/)

## Feedback

If widgets aren't working or you have suggestions:
1. Check this guide first
2. Open GitHub issue with:
   - Device model
   - Chrome version
   - Screenshot of issue
   - Browser console logs

---

**Note**: This is an experimental feature and may not work on all devices. The Widget API is still under development and subject to change.

**Last Updated**: December 29, 2025
