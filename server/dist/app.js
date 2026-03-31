"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const wallpaper_routes_1 = __importDefault(require("./routes/wallpaper.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express_1.default.json());
// Main App Routes
app.use('/api/health', health_routes_1.default);
app.use('/api/wallpaper', wallpaper_routes_1.default);
// For backwards compatibility during transition or direct root hits
app.use('/health', health_routes_1.default);
app.use('/generate-wallpaper', wallpaper_routes_1.default);
// Handle 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint Not Found' });
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
