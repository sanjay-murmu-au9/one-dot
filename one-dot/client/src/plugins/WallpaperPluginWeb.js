/**
 * Web implementation of WallpaperPlugin (no-op for browser)
 */
export class WallpaperPluginWeb {
  async setWallpaper() {
    console.warn('WallpaperPlugin.setWallpaper() not available on web');
    return { success: false, error: 'Not available on web' };
  }

  async setAutoUpdate() {
    console.warn('WallpaperPlugin.setAutoUpdate() not available on web');
    return { success: false, error: 'Not available on web' };
  }

  async getAutoUpdateStatus() {
    return {
      enabled: false,
      lastUpdate: 0,
      apiUrl: ''
    };
  }
}
