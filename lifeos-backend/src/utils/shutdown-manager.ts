import { Server } from 'http';

type CleanupTask = () => Promise<void> | void;

export class ShutdownManager {
  private static instance: ShutdownManager;
  private cleanupTasks: CleanupTask[] = [];
  private isShuttingDown: boolean = false;
  private server?: Server;

  private constructor() {
    this.registerSignalListeners();
  }

  public static getInstance(): ShutdownManager {
    if (!ShutdownManager.instance) {
      ShutdownManager.instance = new ShutdownManager();
    }
    return ShutdownManager.instance;
  }

  public setServer(server: Server): void {
    this.server = server;
  }

  public registerCleanupTask(task: CleanupTask): void {
    this.cleanupTasks.push(task);
  }

  public registerGlobalExceptionGuards(): void {
    process.on('uncaughtException', (err: Error) => {
      console.error('[CRITICAL] Uncaught Exception detected:', err.name, err.message, err.stack);
      this.shutdown(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      console.error('[CRITICAL] Unhandled Promise Rejection detected:', reason);
      this.shutdown(1);
    });
  }

  private registerSignalListeners(): void {
    process.on('SIGTERM', () => this.handleSignal('SIGTERM'));
    process.on('SIGINT', () => this.handleSignal('SIGINT'));
  }

  private handleSignal(signal: string): void {
    console.log(`[SHUTDOWN] Received signal: ${signal}`);
    this.shutdown(0);
  }

  private async shutdown(exitCode: number): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('[SHUTDOWN] Initiating graceful shutdown sequence...');

    const forceExitTimeout = setTimeout(() => {
      console.error('[SHUTDOWN ERROR] Forced exit due to shutdown timeout!');
      process.exit(exitCode);
    }, 10000);

    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server?.close(() => {
            console.log('[SHUTDOWN] HTTP Server closed successfully.');
            resolve();
          });
        });
      }

      for (const task of this.cleanupTasks) {
        await task();
      }

      console.log('[SHUTDOWN] Graceful shutdown completed cleanly.');
      clearTimeout(forceExitTimeout);
      process.exit(exitCode);
    } catch (error) {
      console.error('[SHUTDOWN ERROR] Error during shutdown tasks:', error);
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  }
}

export const shutdownManager = ShutdownManager.getInstance();
