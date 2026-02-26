import { useStories } from '../hooks/useStories';
import Masthead from '../components/Masthead';
import HeadlineStory from '../components/HeadlineStory';
import SmallStory from '../components/SmallStory';
import DateNavigator from '../components/DateNavigator';
import Footer from '../components/Footer';

interface FrontPageProps {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  datesLoading: boolean;
}

function FrontPage({ date, onPrevious, onNext, hasPrevious, hasNext, datesLoading }: FrontPageProps) {
  const { stories, loading, error } = useStories(date);

  const headline = stories.find((s) => s.slot === 'headline');
  const sidebars = stories.filter((s) => s.slot !== 'headline');

  return (
    <div className="newspaper">
      <Masthead date={date} />

      <hr className="section-rule" />

      {loading ? (
        <div className="loading">
          <p>Fetching today's slop...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>The printing press has jammed. Please try again.</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="no-stories">
          <h2>No Stories For This Date</h2>
          <p>The editorial team appear to have been at the pub. No stories were filed for this edition.</p>
        </div>
      ) : (
        <>
          {headline && <HeadlineStory story={headline} />}

          <hr className="section-rule" />

          {sidebars.length > 0 && (
            <div className="small-stories">
              {sidebars.map((story) => (
                <SmallStory key={story.id} story={story} />
              ))}
            </div>
          )}
        </>
      )}

      <hr className="section-rule" />

      <DateNavigator
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious && !datesLoading}
        hasNext={hasNext && !datesLoading}
      />

      <Footer />
    </div>
  );
}

export default FrontPage;
