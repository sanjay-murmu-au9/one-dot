# Android Studio - Running After Changes

This guide explains how to properly run and test your Android app in Android Studio every time you make changes.

## Project Structure
- **Frontend Code**: `client/src/` (Capacitor/Web)
- **Android Native Code**: `client/android/`

## Quick Reference

### After Making Web/Frontend Changes (TypeScript, HTML, CSS, JavaScript)

1. **Build the web assets**:
   ```bash
   cd client
   npm run build
   ```

2. **Sync changes to Android**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio** (if not already open):
   ```bash
   npx cap open android
   ```

4. **Run the app**:
   - Click the green "Run" button (▶️) in Android Studio toolbar
   - Or use: `Shift + F10` (Windows/Linux) or `Ctrl + R` (Mac)

### After Making Android Native Changes (Java/Kotlin in `android/` folder)

1. **Gradle Sync** (usually automatic, but if needed):
   - Click "Sync Project with Gradle Files" button in toolbar
   - Or: `File → Sync Project with Gradle Files`

2. **Run the app**:
   - Click the green "Run" button (▶️)
   - Or use: `Shift + F10` (Windows/Linux) or `Ctrl + R` (Mac)

## Detailed Workflows

### Workflow 1: Frontend Code Changes

When you modify files in `client/src/`:

```bash
# Navigate to client directory
cd client

# Build the web assets
npm run build

# Sync built files to Android
npx cap sync android

# Open Android Studio (if not already open)
npx cap open android
```

Then in Android Studio:
- Wait for Gradle sync to complete (bottom status bar)
- Click Run (▶️) or press `Shift + F10`

### Workflow 2: Native Android Code Changes

When you modify files in `client/android/app/src/`:

1. Android Studio will auto-detect changes
2. Wait for Gradle sync (if triggered)
3. Click Run (▶️) or press `Shift + F10`

### Workflow 3: Plugin/Dependency Changes

When you add/remove Capacitor plugins or modify `package.json`:

```bash
cd client

# Install new dependencies
npm install

# Sync everything to Android
npx cap sync android

# Update native dependencies
cd android
./gradlew clean build
cd ..

# Open Android Studio
npx cap open android
```

## Common Commands

### Full Clean Build
```bash
cd client

# Clean and rebuild web assets
rm -rf dist/
npm run build

# Clean Android build
cd android
./gradlew clean
cd ..

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Live Reload (Development)
```bash
cd client

# Start dev server
npm run dev

# In another terminal, sync to Android
npx cap sync android
npx cap open android
```

Then configure the app to point to your local dev server (usually in capacitor.config.ts).

## Android Studio Shortcuts

- **Run App**: `Shift + F10` (Windows/Linux) or `Ctrl + R` (Mac)
- **Debug App**: `Shift + F9` (Windows/Linux) or `Ctrl + D` (Mac)
- **Stop App**: `Ctrl + F2` (Windows/Linux) or `Cmd + F2` (Mac)
- **Rebuild Project**: `Ctrl + Shift + F9` (Windows/Linux) or `Cmd + Shift + F9` (Mac)
- **Sync with Gradle**: `Ctrl + Shift + O` (Windows/Linux) or `Cmd + Shift + O` (Mac)

## Troubleshooting

### Changes Not Appearing?

1. **Verify web build**:
   ```bash
   cd client
   npm run build
   npx cap sync android
   ```

2. **Clean Gradle cache**:
   ```bash
   cd client/android
   ./gradlew clean
   ```

3. **In Android Studio**:
   - `Build → Clean Project`
   - `Build → Rebuild Project`

4. **Clear app data on device/emulator**:
   - Settings → Apps → Your App → Storage → Clear Data

### Gradle Sync Failed?

1. **Invalidate caches**:
   - `File → Invalidate Caches → Invalidate and Restart`

2. **Check Gradle version** in `client/android/gradle/wrapper/gradle-wrapper.properties`

3. **Update dependencies**:
   ```bash
   cd client
   npm install
   npx cap sync android
   ```

### App Crashes on Launch?

1. Check Logcat in Android Studio (bottom panel)
2. Look for red error messages
3. Common issues:
   - Missing permissions in `AndroidManifest.xml`
   - Plugin compatibility issues
   - Native code errors

## Best Practices

1. **Always build before syncing**:
   ```bash
   npm run build && npx cap sync android
   ```

2. **Use live reload during development** for faster iterations

3. **Test on real devices** in addition to emulators

4. **Keep Android Studio updated** for latest tools and fixes

5. **Run Gradle sync** after pulling changes from git

6. **Check Logcat regularly** for warnings and errors

## Quick Checklist

- [ ] Made web changes? → Build + Sync + Run
- [ ] Made native changes? → Just Run
- [ ] Added plugins? → Install + Sync + Run
- [ ] Changes not showing? → Clean + Build + Sync + Run
- [ ] Gradle errors? → Invalidate caches + Restart

---

**Pro Tip**: Create an alias for quick sync:
```bash
# Add to ~/.zshrc or ~/.bashrc
alias capsync="npm run build && npx cap sync android && npx cap open android"
```

Then just run: `capsync` 🚀
