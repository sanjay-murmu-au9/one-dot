import app from './app';

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ OneCountdown TS API running at http://localhost:${PORT}`);
});

/**
 * Handle unhandled promise rejections system-wide to prevent silent crashes
 */
process.on('unhandledRejection', (reason: Error | any) => {
  console.error(`Unhandled Rejection: ${reason.message || reason}`);
  server.close(() => process.exit(1));
});
