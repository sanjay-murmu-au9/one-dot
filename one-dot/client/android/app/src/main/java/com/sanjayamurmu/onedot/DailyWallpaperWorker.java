package com.sanjayamurmu.onedot;

import android.app.WallpaperManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * WorkManager Worker that automatically fetches and sets the daily wallpaper
 *
 * This runs in the background once per day to keep the wallpaper fresh with:
 * - New daily quotes
 * - Time-of-day backgrounds
 * - Updated life grid progression
 */
public class DailyWallpaperWorker extends Worker {

    private static final String TAG = "DailyWallpaperWorker";
    private static final String PREFS_NAME = "OneDotPrefs";
    private static final String KEY_AUTO_UPDATE_ENABLED = "auto_update_enabled";
    private static final String KEY_API_URL = "api_url";
    private static final String KEY_LAST_UPDATE = "last_update_timestamp";

    public DailyWallpaperWorker(
            @NonNull Context context,
            @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Daily wallpaper worker started");

        try {
            SharedPreferences prefs = getApplicationContext()
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

            // Check if auto-update is enabled
            boolean autoUpdateEnabled = prefs.getBoolean(KEY_AUTO_UPDATE_ENABLED, false);
            if (!autoUpdateEnabled) {
                Log.d(TAG, "Auto-update disabled by user");
                return Result.success();
            }

            // Get the API URL from cache
            String apiUrl = prefs.getString(KEY_API_URL, null);
            if (apiUrl == null || apiUrl.isEmpty()) {
                Log.e(TAG, "No API URL configured");
                return Result.failure();
            }

            Log.d(TAG, "Fetching wallpaper from: " + apiUrl);

            // Fetch wallpaper from server
            Bitmap wallpaperBitmap = downloadWallpaper(apiUrl);
            if (wallpaperBitmap == null) {
                Log.e(TAG, "Failed to download wallpaper");
                return Result.retry();
            }

            // Set wallpaper
            WallpaperManager wm = WallpaperManager.getInstance(getApplicationContext());
            wm.setBitmap(wallpaperBitmap);

            // Set lock screen wallpaper (Android N+)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                wm.setBitmap(wallpaperBitmap, null, true, WallpaperManager.FLAG_LOCK);
            }

            // Update last update timestamp
            prefs.edit()
                .putLong(KEY_LAST_UPDATE, System.currentTimeMillis())
                .apply();

            Log.d(TAG, "Wallpaper updated successfully");
            return Result.success();

        } catch (Exception e) {
            Log.e(TAG, "Error updating wallpaper: " + e.getMessage(), e);
            return Result.retry();
        }
    }

    /**
     * Downloads wallpaper image from the API URL
     */
    private Bitmap downloadWallpaper(String urlString) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                Log.e(TAG, "Server returned error code: " + responseCode);
                return null;
            }

            InputStream inputStream = connection.getInputStream();
            Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
            inputStream.close();

            return bitmap;

        } catch (Exception e) {
            Log.e(TAG, "Error downloading wallpaper: " + e.getMessage(), e);
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
