import { ScrapedArticle } from '../types';
import { RSS_FEEDS } from './feeds';
import { parseFeed } from './rssParser';

export async function scrapeAllFeeds(): Promise<ScrapedArticle[]> {
  const allArticles: ScrapedArticle[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const articles = await parseFeed(feed);
        console.log(`  Scraped ${articles.length} articles from ${feed.name}`);
        return articles;
      } catch (err) {
        console.error(`  Failed to scrape ${feed.name}:`, err);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  console.log(`Total scraped: ${allArticles.length} articles`);
  return allArticles;
}
