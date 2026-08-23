import mongoose from 'mongoose';
import { envConfig } from './environment-config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(envConfig.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DATABASE] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[DATABASE WARNING] Could not connect to MongoDB (${error.message}). Running in mock/offline server mode.`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE WARNING] MongoDB disconnected!');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DATABASE ERROR] MongoDB connection error: ${err.message}`);
});

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[DATABASE] MongoDB connection closed gracefully.');
  } catch (error: any) {
    console.error(`[DATABASE ERROR] Error during disconnection: ${error.message}`);
  }
};
