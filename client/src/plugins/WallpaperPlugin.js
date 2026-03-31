import { registerPlugin } from '@capacitor/core';

/**
 * Capacitor plugin for wallpaper management and automatic updates
 */
const WallpaperPlugin = registerPlugin('WallpaperPlugin', {
  web: () => import('./WallpaperPluginWeb').then(m => new m.WallpaperPluginWeb()),
});

export { WallpaperPlugin };
