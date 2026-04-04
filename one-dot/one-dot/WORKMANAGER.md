# WorkManager Daily Wallpaper Refresh — How It Works

## Overview

WorkManager is Android's built-in background job scheduler. Once scheduled, it runs your job automatically — even if the app is closed, the phone is restarted, or the user hasn't opened the app in days.

In One Dot, we use it to **fetch a fresh wallpaper from our Render backend every 6 hours** and set it as the lock screen automatically.

---

## The Full Flow

```
User taps "Automatic Updates" toggle ON
            ↓
JS calls WallpaperPlugin.setAutoUpdate({ enabled: true, apiUrl })
            ↓
WallpaperPlugin.java saves apiUrl to SharedPreferences
            ↓
WorkManager schedules DailyWallpaperWorker (every 6 hours)
            ↓
            ↓ ← 6 hours later, Android wakes the worker
            ↓
DailyWallpaperWorker.doWork() runs in background
            ↓
HTTP GET → https://one-dot.onrender.com/api/wallpaper/u/{uid}/daily.png
            ↓
Render BE reads user config from Firestore
            ↓
node-canvas generates fresh PNG (new quote, updated grid, time-of-day bg)
            ↓
Worker receives PNG → converts to Bitmap
            ↓
WallpaperManager.setBitmap() → sets lock screen wallpaper
            ↓
User picks up phone → sees updated wallpaper ✅
```

---

## Real Example

### Scenario
- User: Sanjay, born 1995
- Style: Memento Mori (Lifetime grid)
- Auto-update: ON

### Monday 6:00 AM — Worker fires
```
Worker hits: GET https://one-dot.onrender.com/api/wallpaper/u/LGqHzr3Y.../daily.png

Render reads Firestore:
{
  style: "memento-mori",
  birthYear: 1995,
  density: "life",
  accent: "#94a3b8"
}

node-canvas draws:
- Background: warm sunrise gradient (hour = 6, morning mode)
- Grid: 1,534 weeks filled (age 29 × 52 + current week)
- Quote: "The impediment to action advances action. What stands in the way becomes the way." — Marcus Aurelius
- Current week dot: glowing pulse

Returns: 1170×2532 PNG

Worker sets it as lock screen wallpaper.
```

### Monday 12:00 PM — Worker fires again
```
Same URL hit again.

node-canvas draws:
- Background: professional slate (hour = 12, day mode)  ← CHANGED
- Grid: same 1,534 weeks
- Quote: same (changes daily, not hourly)
- Current week dot: dim version (random mood)           ← CHANGED

Lock screen updates silently.
```

### Tuesday 6:00 AM — Worker fires
```
node-canvas draws:
- Grid: still 1,534 weeks (week hasn't changed)
- Quote: NEW quote (day changed)                        ← CHANGED
- Background: morning gradient again
```

### Next Monday — Week ticks over
```
node-canvas draws:
- Grid: 1,535 weeks filled                              ← CHANGED
- The new current week dot glows
- User sees their life grid has advanced by 1 dot
```

---

## Key Files

| File | Role |
|---|---|
| `DailyWallpaperWorker.java` | The background job — fetches PNG, sets wallpaper |
| `WallpaperPlugin.java` | Capacitor bridge — schedules/cancels WorkManager, exposes `triggerNow` |
| `useAutoWallpaperUpdate.js` | React hook — calls plugin methods from JS |
| `GeneratorPage.jsx` | UI — toggle + "Test Refresh Now" button |

---

## WorkManager Schedule

```java
// Runs every 6 hours with a 30 min flex window
// Meaning: Android will run it sometime between 5h30m and 6h after last run
PeriodicWorkRequest.Builder(
    DailyWallpaperWorker.class,
    6, TimeUnit.HOURS,       // repeat interval
    30, TimeUnit.MINUTES     // flex interval
)
```

**Why 6 hours instead of 24?**
- The wallpaper background changes based on time of day (morning/day/night)
- 6 hours ensures the user sees the correct time-of-day theme
- Still battery-friendly (only 4 fetches per day)

---

## What Happens on Failure?

```
Worker tries to fetch wallpaper
        ↓
No internet? → Result.retry() → WorkManager retries with exponential backoff
        ↓
Server error? → Result.retry()
        ↓
Auto-update disabled by user? → Result.success() (skip silently)
        ↓
Success → saves timestamp to SharedPreferences → Result.success()
```

---

## SharedPreferences (Local Storage on Android)

The worker reads these values saved by the plugin:

| Key | Value | Example |
|---|---|---|
| `auto_update_enabled` | boolean | `true` |
| `api_url` | string | `https://one-dot.onrender.com/api/wallpaper/u/LGqHzr3Y.../daily.png` |
| `last_update_timestamp` | long (ms) | `1751234567890` |

---

## Testing Without Waiting 6 Hours

In the app → Generator → Sync → toggle **Automatic Updates ON** → tap **🔄 Test Refresh Now**

This fires a `OneTimeWorkRequest` immediately:
```java
OneTimeWorkRequest testRequest =
    new OneTimeWorkRequest.Builder(DailyWallpaperWorker.class).build();
WorkManager.getInstance(context).enqueue(testRequest);
```

**Watch it in Android Studio Logcat:**
```
Filter by: DailyWallpaperWorker

D/DailyWallpaperWorker: Daily wallpaper worker started
D/DailyWallpaperWorker: Fetching wallpaper from: https://one-dot.onrender.com/...
D/DailyWallpaperWorker: Wallpaper updated successfully
```

---

## Permissions Required

Already declared in `AndroidManifest.xml` by Capacitor:
- `SET_WALLPAPER` — to set the lock screen wallpaper
- `INTERNET` — to fetch from Render backend
- `RECEIVE_BOOT_COMPLETED` — WorkManager uses this to reschedule after reboot

---

## Battery Impact

- 4 network requests per day (~200KB each)
- Only runs when network is connected (`NetworkType.CONNECTED`)
- Only runs when battery is not low (`setRequiresBatteryNotLow(true)`)
- Total: negligible battery impact
