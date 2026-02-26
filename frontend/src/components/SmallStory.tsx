import { Story } from '../types';

interface SmallStoryProps {
  story: Story;
}

function SmallStory({ story }: SmallStoryProps) {
  return (
    <article className="small-story">
      <div className="small-story-image-wrapper">
        <img
          src={story.image_path}
          alt={story.image_alt}
          className="small-story-image"
        />
      </div>
      <h2 className="small-story-title">{story.headline}</h2>
      {story.subheadline && (
        <p className="small-story-subtitle">{story.subheadline}</p>
      )}
      <div
        className="small-story-body"
        dangerouslySetInnerHTML={{ __html: story.body }}
      />
      {story.outlet && (
        <p className="story-source">
          Based on reporting by <span className="source-outlet">{story.outlet.toUpperCase()}</span>
        </p>
      )}
    </article>
  );
}

export default SmallStory;
