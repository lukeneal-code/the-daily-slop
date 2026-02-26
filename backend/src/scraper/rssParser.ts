import Parser from 'rss-parser';
import { ScrapedArticle } from '../types';
import { FeedConfig } from './feeds';

type CustomItem = {
  guid?: string;
  link?: string;
  title?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  enclosure?: { url?: string };
  'media:thumbnail'?: { $?: { url?: string } };
  'media:content'?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
      ['media:content', 'media:content', { keepArray: false }],
    ],
  },
  timeout: 15000,
});

export async function parseFeed(feed: FeedConfig): Promise<ScrapedArticle[]> {
  const result = await parser.parseURL(feed.url);
  const articles: ScrapedArticle[] = [];

  for (const item of result.items) {
    const externalId = item.guid || item.link || '';
    if (!externalId) continue;

    const imageUrl =
      (item['media:thumbnail'] as any)?.$?.url ||
      (item['media:content'] as any)?.$?.url ||
      item.enclosure?.url ||
      null;

    articles.push({
      externalId,
      outlet: feed.outlet,
      title: item.title || '',
      description: item.contentSnippet || item.content || '',
      url: item.link || '',
      imageUrl,
      publishedAt: item.isoDate || new Date().toISOString(),
    });
  }

  return articles;
}
