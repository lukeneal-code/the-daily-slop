export interface ScrapedArticle {
  externalId: string;
  outlet: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
}

export interface SourceArticle {
  id: number;
  externalId: string;
  outlet: string;
  title: string;
  description: string;
  url: string;
  bodyText: string | null;
  imageUrl: string | null;
  publishedAt: string;
  scrapedAt: string;
  used: number;
}

export interface EnrichedArticle extends SourceArticle {
  bodyText: string;
}

export type StorySlot = 'headline' | 'small_1' | 'small_2';

export interface SatireResponse {
  headline: string;
  subheadline: string;
  body: string;
  imageDescription: string;
}

export interface Story {
  id: number;
  publish_date: string;
  slot: StorySlot;
  headline: string;
  subheadline: string;
  body: string;
  image_path: string;
  image_alt: string;
  image_prompt: string;
  source_id: number;
  created_at: string;
  outlet?: string;
  source_url?: string;
  original_title?: string;
}
