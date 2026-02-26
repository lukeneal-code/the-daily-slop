import { useState, useEffect } from 'react';
import { Story, StoriesResponse, DatesResponse } from '../types';

export function useStories(date: string) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/stories?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StoriesResponse>;
      })
      .then((data) => {
        setStories(data.stories);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [date]);

  return { stories, loading, error };
}

export function useDates() {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dates')
      .then((res) => res.json() as Promise<DatesResponse>)
      .then((data) => {
        setDates(data.dates);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { dates, loading };
}
