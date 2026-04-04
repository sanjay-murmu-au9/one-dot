"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallpaper_controller_1 = require("../controllers/wallpaper.controller");
const router = (0, express_1.Router)();
// Endpoint for validating client-side generated wallpapers
router.post('/', wallpaper_controller_1.validateWallpaperRequest, wallpaper_controller_1.returnWallpaperMeta);
exports.default = router;
