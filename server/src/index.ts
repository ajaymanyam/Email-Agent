import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

import { copilotService } from './services/copilotService';

async function start(): Promise<void> {
  await connectDB();

  // Background worker: dispatch due scheduled emails every 60 seconds
  setInterval(() => {
    copilotService.dispatchDueScheduledEmails().catch((err) => {
      logger.error('Error in scheduled email worker', { error: err.message });
    });
  }, 60000);

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, {
      environment: env.NODE_ENV,
      port: env.PORT,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: String(reason) });
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { error: String(err) });
  process.exit(1);
});
