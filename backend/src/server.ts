import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import dns from 'dns';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Fix Node 18+ IPv6 fetch timeout issues with Undici
dns.setDefaultResultOrder('ipv4first');

import { connectRedis } from './config/redis';

// Routes
import authRoutes from './routes/auth.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import profileRoutes from './routes/profile.routes';
import workersRoutes from './routes/workers.routes';

dotenv.config();

const app: Express = express();
const port = env.PORT || 3000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*', // Allow all origins for mobile apps
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LaborLink API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workers', workersRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(Number(port), '0.0.0.0', async () => {
  await connectRedis();
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
