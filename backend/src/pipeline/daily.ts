import { scrapeAllFeeds } from '../scraper';
import { scrapeArticleBody } from '../scraper/articleScraper';
import { generateStory } from '../ai/storyGenerator';
import {
  bulkInsertArticles,
  getRecentUnusedArticles,
  getStoryCountForDate,
  insertStory,
  markArticleUsed,
  updateArticleBodyText,
} from '../db/queries';
import { SourceArticle, StorySlot, EnrichedArticle } from '../types';

function selectStories(articles: SourceArticle[]): SourceArticle[] {
  // Sort by published date descending (most recent first)
  const sorted = articles
    .filter(a => !a.used)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const selected: SourceArticle[] = [];
  const usedOutlets = new Set<string>();

  // First pass: pick from diverse outlets
  for (const article of sorted) {
    if (selected.length >= 3) break;
    if (!usedOutlets.has(article.outlet)) {
      selected.push(article);
      usedOutlets.add(article.outlet);
    }
  }

  // Second pass: fill remaining slots
  if (selected.length < 3) {
    for (const article of sorted) {
      if (selected.length >= 3) break;
      if (!selected.find(s => s.id === article.id)) {
        selected.push(article);
      }
    }
  }

  return selected;
}

export async function runDailyPipeline(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n========================================`);
  console.log(`Starting Daily Slop pipeline for ${today}`);
  console.log(`========================================\n`);

  // Check if today's stories already exist
  const existingCount = getStoryCountForDate(today);
  if (existingCount >= 3) {
    console.log(`Stories for ${today} already generated (${existingCount} found). Skipping.`);
    return;
  }

  // Step 1: Scrape all RSS feeds
  console.log('Step 1: Scraping RSS feeds...');
  const scraped = await scrapeAllFeeds();
  const inserted = bulkInsertArticles(scraped);
  console.log(`Inserted ${inserted} new articles into database.\n`);

  // Step 2: Select 3 stories
  console.log('Step 2: Selecting stories...');
  const candidates = getRecentUnusedArticles(48);
  console.log(`Found ${candidates.length} unused recent articles.`);

  const selected = selectStories(candidates);
  if (selected.length < 3) {
    console.error(`Not enough stories to generate. Found only ${selected.length}. Need 3.`);
    return;
  }

  console.log('Selected stories:');
  selected.forEach((s, i) => console.log(`  ${i + 1}. [${s.outlet}] ${s.title}`));
  console.log('');

  const slots: StorySlot[] = ['headline', 'small_1', 'small_2'];

  for (let i = 0; i < 3; i++) {
    const article = selected[i];
    const slot = slots[i];

    console.log(`\nStep 3-5: Processing ${slot} story...`);

    // Step 3: Enrich with full article body
    console.log('  Scraping full article body...');
    const bodyText = await scrapeArticleBody(article.url);
    if (bodyText) {
      updateArticleBodyText(article.id, bodyText);
    }

    const enrichedArticle: EnrichedArticle = {
      ...article,
      bodyText: bodyText || article.description,
    };

    // Steps 4-5: Generate satire text and image
    const generated = await generateStory(enrichedArticle, slot, today);

    // Step 6: Store in database
    console.log('  Saving to database...');
    insertStory(
      today,
      slot,
      generated.satire.headline,
      generated.satire.subheadline,
      generated.satire.body,
      generated.imagePath,
      generated.satire.headline,
      generated.imagePrompt,
      article.id
    );

    // Step 7: Mark source article as used
    markArticleUsed(article.id);
    console.log(`  Done with ${slot} story.`);
  }

  console.log(`\n========================================`);
  console.log(`Successfully generated 3 stories for ${today}`);
  console.log(`========================================\n`);
}
