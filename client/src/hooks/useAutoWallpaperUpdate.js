import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to manage automatic daily wallpaper updates (Android only)
 *
 * Uses WorkManager to schedule daily background jobs that:
 * - Fetch fresh wallpaper from server
 * - Apply time-of-day backgrounds
 * - Show daily quotes
 * - Update life grid progression
 */
export function useAutoWallpaperUpdate() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running on native platform
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    if (native) {
      loadStatus();
    }
  }, []);

  const loadStatus = async () => {
    try {
      const { WallpaperPlugin } = await import('../plugins/WallpaperPlugin');
      const status = await WallpaperPlugin.getAutoUpdateStatus();

      setIsEnabled(status.enabled);
      setLastUpdate(status.lastUpdate ? new Date(status.lastUpdate) : null);
    } catch (error) {
      console.error('Failed to load auto-update status:', error);
    }
  };

  const enableAutoUpdate = async (apiUrl) => {
    if (!isNative) {
      console.warn('Auto-update only available on native platform');
      return { success: false, error: 'Not available on web' };
    }

    setLoading(true);
    try {
      const { WallpaperPlugin } = await import('../plugins/WallpaperPlugin');
      const result = await WallpaperPlugin.setAutoUpdate({
        enabled: true,
        apiUrl: apiUrl
      });

      setIsEnabled(true);
      await loadStatus();

      return { success: true, message: result.message };
    } catch (error) {
      console.error('Failed to enable auto-update:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disableAutoUpdate = async () => {
    if (!isNative) {
      return { success: false, error: 'Not available on web' };
    }

    setLoading(true);
    try {
      const { WallpaperPlugin } = await import('../plugins/WallpaperPlugin');
      const result = await WallpaperPlugin.setAutoUpdate({
        enabled: false
      });

      setIsEnabled(false);

      return { success: true, message: result.message };
    } catch (error) {
      console.error('Failed to disable auto-update:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const triggerNow = async () => {
    if (!isNative) return { success: false, error: 'Not available on web' };
    setLoading(true);
    try {
      const { WallpaperPlugin } = await import('../plugins/WallpaperPlugin');
      const result = await WallpaperPlugin.triggerNow();
      await loadStatus();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    isNative,
    isEnabled,
    lastUpdate,
    loading,
    enableAutoUpdate,
    disableAutoUpdate,
    triggerNow,
    refresh: loadStatus
  };
}
