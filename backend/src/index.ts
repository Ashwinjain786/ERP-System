import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { validateEnv } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// 1. Validate Environment Variables
validateEnv();

const app: Express = express();
const port = process.env.PORT || 3000;

// 2. Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Restrict CORS to frontend
  credentials: true,
}));

// 3. Rate Limiting (Prevent brute-force/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// 4. Logging & Parsing
app.use(morgan('combined')); // Structured logging
app.use(express.json({ limit: '10kb' })); // Limit body size

import prisma from './config/db';

// 5. Routes
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Perform a lightweight query to ensure database is connected
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Backend and Database are running correctly and securely!' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// 6. Centralized Error Handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
