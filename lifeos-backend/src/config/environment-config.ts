import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

const validateEnv = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '5000', 10);
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lifeos';
  const jwtSecret = process.env.JWT_SECRET || 'dev_lifeos_secret_key_change_in_prod';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (nodeEnv === 'production' && jwtSecret.includes('dev_lifeos_secret')) {
    console.warn('[WARNING] Using default JWT_SECRET in production mode! Set a strong JWT_SECRET in .env');
  }

  return {
    port,
    nodeEnv,
    mongoUri,
    jwtSecret,
    jwtExpiresIn,
  };
};

export const envConfig = validateEnv();
