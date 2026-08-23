import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database-config';
import { envConfig } from './config/environment-config';
import { shutdownManager } from './utils/shutdown-manager';
import { socketService } from './services/socket-service';

// 1. Initialize process exception guards
shutdownManager.registerGlobalExceptionGuards();

// 2. Register database disconnection as graceful shutdown cleanup task
shutdownManager.registerCleanupTask(disconnectDB);

// 3. Start Application & HTTP Listener
const bootstrap = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);

  // Initialize Socket.io Realtime WebSockets
  socketService.init(httpServer);

  const server = httpServer.listen(envConfig.port, () => {
    console.log(`[LIFE OS SERVER] Running in [${envConfig.nodeEnv}] mode on port [${envConfig.port}]`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[CRITICAL] Port ${envConfig.port} is already in use by another process.`);
    } else {
      console.error('[CRITICAL] Server startup error:', err);
    }
  });

  shutdownManager.setServer(server);
};

bootstrap();
