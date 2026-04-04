import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import healthRoutes from './routes/health.routes';
import wallpaperRoutes from './routes/wallpaper.routes';
import authRoutes from './routes/auth.routes';

const app: Application = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'https://sanjay-murmu-au9.github.io'] }));
app.use(express.json());

// Main App Routes
app.use('/api/health', healthRoutes);
app.use('/api/wallpaper', wallpaperRoutes);
app.use('/api/auth', authRoutes);

// For backwards compatibility during transition or direct root hits
app.use('/health', healthRoutes);
app.use('/generate-wallpaper', wallpaperRoutes);

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
