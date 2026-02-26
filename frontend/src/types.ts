export interface Story {
  id: number;
  publish_date: string;
  slot: 'headline' | 'small_1' | 'small_2';
  headline: string;
  subheadline: string;
  body: string;
  image_path: string;
  image_alt: string;
  outlet?: string;
  source_url?: string;
  original_title?: string;
}

export interface StoriesResponse {
  date: string;
  stories: Story[];
}

export interface DatesResponse {
  dates: string[];
}
