import { Router } from 'express';
import { validateWallpaperRequest, returnWallpaperMeta, generateDailyWallpaper } from '../controllers/wallpaper.controller';

const router = Router();

// Endpoint for the "Alive" Dynamic Wallpaper (pings from iOS/Android Shortcuts)
router.get('/u/:uid/daily.png', generateDailyWallpaper);

// Endpoint for validating client-side generated wallpapers
router.post('/', validateWallpaperRequest, returnWallpaperMeta);

export default router;
