import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['PORT', 'DATABASE_URL', 'JWT_SECRET'];

export const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`[Fatal] Required environment variable ${envVar} is missing.`);
      process.exit(1);
    }
  }
};
