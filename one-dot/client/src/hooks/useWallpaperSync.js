import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { DRAW_FUNCTIONS, STYLE_ACCENTS, getDaysLeft, drawTimerOverlay } from '../components/WallpaperCanvas';

/**
 * useWallpaperSync - Listens to Firestore for the user's active_wallpaper_config.
 * When it changes, it silently renders the wallpaper to a hidden canvas,
 * exports it as Base64, and passes it to the native Android WallpaperPlugin.
 */
export function useWallpaperSync() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('[OneDot] No user logged in, sync inactive.');
      return;
    }

    // Check if we are running inside native Capacitor (i.e., on an Android device)
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
    if (!isNative) {
      console.log('[OneDot] Running in browser, skipping native wallpaper sync.');
      return;
    }

    console.log('[OneDot] Native sync active for user:', currentUser.uid);

    const userDocRef = doc(db, 'users', currentUser.uid);

    // Variable to hold the minute-ticker interval
    let tickerInterval = null;

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      console.log('[OneDot] Firestore snapshot received, exists:', snapshot.exists());
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      console.log('[OneDot] Has active_wallpaper_config:', !!data?.active_wallpaper_config);
      if (!data?.active_wallpaper_config) return;

      const config = data.active_wallpaper_config;
      console.log('[OneDot] Config:', JSON.stringify({ style: config.style, targetDate: config.targetDate, resolution: config.resolution, hasBackground: !!config.backgroundImage }));

      const renderAndSync = () => {
        const { style, targetDate, resolution, memento_options } = config;
        const resolutions = { iphone: [1170, 2532], android: [1080, 2400], universal: [1080, 1920] };
        const [w, h] = resolutions[resolution] || [1080, 1920];
        const drawFn = DRAW_FUNCTIONS[style];
        const accent = STYLE_ACCENTS[style];
        const daysLeft = getDaysLeft(targetDate);

        console.log('[OneDot] Render attempt:', { style, drawFn: !!drawFn, w, h, daysLeft });
        if (!drawFn) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        const draw = (img = null) => {
          drawFn(ctx, w, h, daysLeft, accent, img, memento_options || undefined);
          
          // Manually draw the clock overlay on the final wallpaper image
          drawTimerOverlay(ctx, w, h, (style === 'memento-mori' || style === 'dot-grid') ? accent : '#ffffff');
          
          const base64 = canvas.toDataURL('image/png');
          const WallpaperPlugin = window.Capacitor.Plugins.WallpaperPlugin;
          console.log('[OneDot] Base64 generated, length:', base64.length);
          if (WallpaperPlugin) {
            console.log('[OneDot] Calling setWallpaper...');
            WallpaperPlugin.setWallpaper({ base64 })
              .then(r => console.log('[OneDot] setWallpaper result:', JSON.stringify(r)))
              .catch(e => console.error('[OneDot] setWallpaper failed:', e));
          } else {
            console.warn('[OneDot] WallpaperPlugin not found on Capacitor.Plugins');
          }
        };

        if (config.backgroundImage) {
          let bgSrc = config.backgroundImage;
          if (isNative && bgSrc.startsWith('/one-dot/')) bgSrc = bgSrc.replace('/one-dot/', '/');
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = bgSrc;
          img.onload = () => draw(img);
          img.onerror = () => draw(null);
        } else {
          draw(null);
        }
      };

      // 1. Initial render/sync on config change
      renderAndSync();

      // 2. Setup/Reset the minute-ticker for "Live" updates
      if (tickerInterval) clearInterval(tickerInterval);
      tickerInterval = setInterval(renderAndSync, 60000);

    }, (error) => {
      console.error('[OneDot] Firestore snapshot error:', error);
    });

    return () => {
      console.log('[OneDot] Cleaning up wallpaper sync listener and ticker.');
      if (tickerInterval) clearInterval(tickerInterval);
      unsubscribe();
    };
  }, [currentUser]);
}
