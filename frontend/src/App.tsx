import { useState } from 'react';
import { useDates } from './hooks/useStories';
import FrontPage from './pages/FrontPage';

function App() {
  const { dates, loading: datesLoading } = useDates();
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // If we have dates and the current date has no stories, default to the most recent date
  const effectiveDate = dates.length > 0 && !dates.includes(currentDate)
    ? dates[0]
    : currentDate;

  const currentIndex = dates.indexOf(effectiveDate);

  const goToPrevious = () => {
    if (currentIndex < dates.length - 1) {
      setCurrentDate(dates[currentIndex + 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex > 0) {
      setCurrentDate(dates[currentIndex - 1]);
    }
  };

  const hasPrevious = currentIndex < dates.length - 1;
  const hasNext = currentIndex > 0;

  return (
    <FrontPage
      date={effectiveDate}
      onPrevious={goToPrevious}
      onNext={goToNext}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      datesLoading={datesLoading}
    />
  );
}

export default App;
