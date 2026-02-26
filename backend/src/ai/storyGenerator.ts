import { generateSatire } from './claude';
import { generateImage } from './dalle';
import { buildSatirePrompt } from './prompts';
import { EnrichedArticle, StorySlot, SatireResponse } from '../types';

export interface GeneratedStory {
  satire: SatireResponse;
  imagePath: string;
  imagePrompt: string;
}

export async function generateStory(
  article: EnrichedArticle,
  slot: StorySlot,
  publishDate: string
): Promise<GeneratedStory> {
  // Generate satirical text
  const prompt = buildSatirePrompt(
    article.outlet,
    article.title,
    article.description,
    article.bodyText,
    slot
  );

  console.log(`  Generating satire for: "${article.title.slice(0, 60)}..."`);
  const satire = await generateSatire(prompt);
  console.log(`  Generated headline: "${satire.headline}"`);

  // Generate image
  const imageFilename = `${slot}-${article.id}.png`;
  console.log(`  Generating ${slot === 'headline' ? 'photograph' : 'cartoon'} image...`);

  let imagePath: string;
  try {
    imagePath = await generateImage(satire.imageDescription, slot, publishDate, imageFilename);
  } catch (err) {
    console.error(`  Image generation failed, retrying with simplified prompt...`, err);
    // Retry with a safer prompt
    const safeDescription = `A ${slot === 'headline' ? 'newspaper photograph' : 'simple editorial cartoon'} about British current affairs`;
    imagePath = await generateImage(safeDescription, slot, publishDate, imageFilename);
  }

  console.log(`  Image saved to: ${imagePath}`);

  return {
    satire,
    imagePath,
    imagePrompt: satire.imageDescription,
  };
}
