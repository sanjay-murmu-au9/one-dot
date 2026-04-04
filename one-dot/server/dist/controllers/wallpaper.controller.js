"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnWallpaperMeta = exports.validateWallpaperRequest = void 0;
/**
 * Validate requested wallpaper generation parameters
 */
const validateWallpaperRequest = (req, res, next) => {
    const { date, style, resolution } = req.body;
    const validStyles = [
        'dot-grid', 'large-countdown', 'progress-bar', 'minimal-text',
        'yearly-view', 'carpe-diem', 'memento-mori', 'weekly-grid',
    ];
    const validResolutions = {
        iphone: [1170, 2532],
        android: [1080, 2400],
        universal: [1080, 1920]
    };
    if (!date || isNaN(new Date(date).getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
    }
    if (!validStyles.includes(style)) {
        res.status(400).json({ error: 'Invalid style', validStyles });
        return;
    }
    if (!validResolutions[resolution]) {
        res.status(400).json({ error: 'Invalid resolution', validResolutions: Object.keys(validResolutions) });
        return;
    }
    // Pass validated parameters to the next request handler
    const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const [w, h] = validResolutions[resolution];
    res.locals.wallpaperMeta = { style, date, resolution, daysLeft, w, h };
    next();
};
exports.validateWallpaperRequest = validateWallpaperRequest;
/**
 * Controller to handle returning the parsed parameters for client-side generation
 */
const returnWallpaperMeta = (req, res) => {
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
exports.returnWallpaperMeta = returnWallpaperMeta;
