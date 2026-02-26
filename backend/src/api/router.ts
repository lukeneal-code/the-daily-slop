import { Router } from 'express';
import { getStoriesByDate, getAllPublishDates } from '../db/queries';

const router = Router();

// GET /api/stories?date=YYYY-MM-DD
router.get('/stories', (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  const stories = getStoriesByDate(date);
  res.json({ date, stories });
});

// GET /api/dates — all dates with published stories
router.get('/dates', (_req, res) => {
  const dates = getAllPublishDates();
  res.json({ dates });
});

export default router;
