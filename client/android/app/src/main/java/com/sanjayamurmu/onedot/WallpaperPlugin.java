package com.sanjayamurmu.onedot;

import android.app.WallpaperManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.TimeUnit;

@CapacitorPlugin(name = "WallpaperPlugin")
public class WallpaperPlugin extends Plugin {

    private static final String PREFS_NAME = "OneDotPrefs";
    private static final String KEY_AUTO_UPDATE_ENABLED = "auto_update_enabled";
    private static final String KEY_API_URL = "api_url";
    private static final String KEY_LAST_UPDATE = "last_update_timestamp";
    private static final String WORK_NAME = "DailyWallpaperWork";

    @PluginMethod
    public void setWallpaper(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null) {
            call.reject("Must provide base64 image data");
            return;
        }

        try {
            // Remove header if present (e.g. "data:image/png;base64,")
            String cleanBase64 = base64;
            if (base64.contains(",")) {
                cleanBase64 = base64.split(",")[1];
            }

            byte[] decodedString = Base64.decode(cleanBase64, Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            WallpaperManager wm = WallpaperManager.getInstance(getContext());

            // Set for Home Screen
            wm.setBitmap(decodedByte);

            // Set for Lock Screen (v24+)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                wm.setBitmap(decodedByte, null, true, WallpaperManager.FLAG_LOCK);
            }

            // Free native memory — wallpaper bitmaps can be ~11 MB uncompressed
            decodedByte.recycle();

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to set wallpaper: " + e.getLocalizedMessage());
        }
    }

    /**
     * Trigger wallpaper update immediately (for testing)
     */
    @PluginMethod
    public void triggerNow(PluginCall call) {
        androidx.work.OneTimeWorkRequest testRequest =
            new androidx.work.OneTimeWorkRequest.Builder(DailyWallpaperWorker.class).build();
        WorkManager.getInstance(getContext()).enqueue(testRequest);
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Wallpaper refresh triggered. Check lock screen in a few seconds.");
        call.resolve(ret);
    }

    /**
     * Enable automatic daily wallpaper updates
     * @param call - expects { apiUrl: string, enabled: boolean }
     */
    @PluginMethod
    public void setAutoUpdate(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", false);
        String apiUrl = call.getString("apiUrl");

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        editor.putBoolean(KEY_AUTO_UPDATE_ENABLED, enabled);
        if (apiUrl != null && !apiUrl.isEmpty()) {
            editor.putString(KEY_API_URL, apiUrl);
        }
        editor.apply();

        if (enabled) {
            scheduleDailyWork();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Auto-update enabled. Wallpaper will refresh daily.");
            call.resolve(ret);
        } else {
            cancelDailyWork();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Auto-update disabled.");
            call.resolve(ret);
        }
    }

    /**
     * Get auto-update status and last update time
     */
    @PluginMethod
    public void getAutoUpdateStatus(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        boolean enabled = prefs.getBoolean(KEY_AUTO_UPDATE_ENABLED, false);
        long lastUpdate = prefs.getLong(KEY_LAST_UPDATE, 0);
        String apiUrl = prefs.getString(KEY_API_URL, "");

        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        ret.put("lastUpdate", lastUpdate);
        ret.put("apiUrl", apiUrl);
        call.resolve(ret);
    }

    /**
     * Schedule daily wallpaper updates using WorkManager
     */
    private void scheduleDailyWork() {
        // Constraints: requires network and battery not low
        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build();

        // Periodic work request (every 6 hours to keep date/time in sync)
        PeriodicWorkRequest dailyWorkRequest = new PeriodicWorkRequest.Builder(
                DailyWallpaperWorker.class,
                6, TimeUnit.HOURS,
                30, TimeUnit.MINUTES) // Flex interval: can run within 30 min window
            .setConstraints(constraints)
            .build();

        // Schedule work — UPDATE keeps the existing schedule if unchanged,
        // avoiding unnecessary restarts (REPLACE was deprecated in WorkManager 2.8)
        WorkManager.getInstance(getContext())
            .enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                dailyWorkRequest
            );
    }

    /**
     * Cancel daily wallpaper updates
     */
    private void cancelDailyWork() {
        WorkManager.getInstance(getContext())
            .cancelUniqueWork(WORK_NAME);
    }
}
