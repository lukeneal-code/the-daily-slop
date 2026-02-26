import { Story } from '../types';

interface HeadlineStoryProps {
  story: Story;
}

function HeadlineStory({ story }: HeadlineStoryProps) {
  return (
    <article className="headline-story">
      <div className="headline-image-wrapper">
        <img
          src={story.image_path}
          alt={story.image_alt}
          className="headline-image"
        />
      </div>
      <div className="headline-text">
        <h1 className="headline-title">{story.headline}</h1>
        {story.subheadline && (
          <p className="headline-subtitle">{story.subheadline}</p>
        )}
        <div
          className="headline-body"
          dangerouslySetInnerHTML={{ __html: story.body }}
        />
        {story.outlet && (
          <p className="story-source">
            Based on reporting by <span className="source-outlet">{story.outlet.toUpperCase()}</span>
          </p>
        )}
      </div>
    </article>
  );
}

export default HeadlineStory;
