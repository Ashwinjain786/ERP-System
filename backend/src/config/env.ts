import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['PORT'];

export const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`[Warning] Environment variable ${envVar} is missing. Falling back to defaults where possible.`);
    }
  }
};
