import express from 'express';
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import { config } from './config';
import { initDatabase } from './db/schema';
import apiRouter from './api/router';
import { runDailyPipeline } from './pipeline/daily';

const app = express();

app.use(cors());
app.use(express.json());

// Serve generated images statically
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API routes
app.use('/api', apiRouter);

// Initialize database
initDatabase();

// Schedule daily pipeline at 6:00 AM London time
cron.schedule('0 6 * * *', async () => {
  console.log('Cron triggered: starting daily pipeline...');
  try {
    await runDailyPipeline();
  } catch (err) {
    console.error('Daily pipeline failed:', err);
  }
}, {
  timezone: 'Europe/London',
});

// In production, serve the React frontend build
if (config.nodeEnv === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`The Daily Slop backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
