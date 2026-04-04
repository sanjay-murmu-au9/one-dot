import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { 
  generateMementoMoriPNG, 
  generateDotGridPNG, 
  generateLargeCountdownPNG, 
  generateProgressBarPNG,
  generateQuarterlyViewPNG,
  generateYearlyViewPNG,
  generateCarpeDiemPNG,
  generateLifeViewPNG,
  generateWeeklyGridPNG
} from '../utils/canvasEngine';

const ENGINE_MAP: Record<string, any> = {
  'memento-mori':    generateMementoMoriPNG,
  'dot-grid':        generateDotGridPNG,
  'large-countdown': generateLargeCountdownPNG,
  'progress-bar':    generateProgressBarPNG,
  'quarterly-view':  generateQuarterlyViewPNG,
  'yearly-view':     generateYearlyViewPNG,
  'carpe-diem':      generateCarpeDiemPNG,
  'life-view':       generateLifeViewPNG,
  'weekly-grid':     generateWeeklyGridPNG,
  'special-dates':   generateMementoMoriPNG, // Fallback
};

/**
 * NEW: Generate the "Alive" Dynamic Wallpaper for a user
 */
export const generateDailyWallpaper = async (req: Request, res: Response) => {
  const uid = req.params.uid as string;

  try {
    // 1. Fetch user configuration from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User configuration not found' });
      return;
    }

    const config = userDoc.data() || {};
    const style = config.style || 'memento-mori';
    const drawFn = ENGINE_MAP[style] || generateMementoMoriPNG;
    
    // 2. Generate the PNG buffer using our SSR engine
    const buffer = await drawFn(uid, config);

    // 3. Return the PNG with appropriate headers for iOS Shortcuts
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    res.send(buffer);

  } catch (error) {
    console.error('Error generating daily wallpaper:', error);
    res.status(500).json({ error: 'Failed to generate wallpaper' });
  }
};

/**
 * Validate requested wallpaper generation parameters
 */
export const validateWallpaperRequest = (req: Request, res: Response, next: NextFunction) => {
  const { date, style, resolution } = req.body;

  const validStyles = [
    'dot-grid', 'large-countdown', 'progress-bar', 'minimal-text',
    'yearly-view', 'carpe-diem', 'memento-mori', 'weekly-grid',
  ];
  
  const validResolutions: Record<string, [number, number]> = { 
    iphone: [1170, 2532], 
    android: [1080, 2400], 
    universal: [1080, 1920] 
  };

  if (!date || isNaN(new Date(date as string).getTime())) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }
  
  if (!validStyles.includes(style as string)) {
    res.status(400).json({ error: 'Invalid style', validStyles });
    return;
  }
  
  if (!validResolutions[resolution as string]) {
    res.status(400).json({ error: 'Invalid resolution', validResolutions: Object.keys(validResolutions) });
    return;
  }

  // Pass validated parameters to the next request handler
  const daysLeft = Math.ceil((new Date(date as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const [w, h] = validResolutions[resolution as string];

  res.locals.wallpaperMeta = { style, date, resolution, daysLeft, w, h };
  next();
};

/**
 * Controller to handle returning the parsed parameters for client-side generation
 */
export const returnWallpaperMeta = (req: Request, res: Response) => {
  const { style, date, resolution, daysLeft, w, h } = res.locals.wallpaperMeta;

  res.status(200).json({
    success: true,
    meta: {
      style,
      date,
      resolution,
      daysLeft,
      width: w,
      height: h,
      filename: `one-countdown-${style}-${date}.png`,
    },
    message: 'Wallpaper parameters validated. Render client-side using the provided meta.',
  });
};
