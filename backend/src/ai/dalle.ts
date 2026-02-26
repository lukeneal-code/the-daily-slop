import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { StorySlot } from '../types';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function generateImage(
  imageDescription: string,
  slot: StorySlot,
  publishDate: string,
  filename: string
): Promise<string> {
  const stylePrefix = slot === 'headline'
    ? 'Dramatic tabloid newspaper photograph, photojournalistic style, vivid and eye-catching: '
    : 'Black and white pen-and-ink editorial cartoon, crosshatching style, British satirical magazine illustration: ';

  const fullPrompt = `${stylePrefix}${imageDescription}. No text, words, letters, or captions in the image.`;

  const size = slot === 'headline' ? '1792x1024' as const : '1024x1024' as const;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: fullPrompt,
    size,
    quality: 'standard',
    n: 1,
  });

  const imageUrl = response.data[0].url;
  if (!imageUrl) {
    throw new Error('DALL-E returned no image URL');
  }

  // Download and save locally
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  const dir = path.join(config.imagesDir, publishDate);
  fs.mkdirSync(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/images/${publishDate}/${filename}`;
}
