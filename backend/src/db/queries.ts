import { db } from './database';
import { ScrapedArticle, SourceArticle, Story } from '../types';

const insertArticleStmt = db.prepare(`
  INSERT OR IGNORE INTO source_articles (external_id, outlet, title, description, url, image_url, published_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export function bulkInsertArticles(articles: ScrapedArticle[]): number {
  let inserted = 0;
  const transaction = db.transaction((items: ScrapedArticle[]) => {
    for (const a of items) {
      const result = insertArticleStmt.run(
        a.externalId, a.outlet, a.title, a.description, a.url, a.imageUrl, a.publishedAt
      );
      if (result.changes > 0) inserted++;
    }
  });
  transaction(articles);
  return inserted;
}

export function getRecentUnusedArticles(hoursBack: number = 48): SourceArticle[] {
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT * FROM source_articles
    WHERE used = 0 AND published_at > ?
    ORDER BY published_at DESC
  `).all(cutoff) as SourceArticle[];
}

export function getStoriesByDate(date: string): Story[] {
  return db.prepare(`
    SELECT s.*, sa.outlet, sa.url as source_url, sa.title as original_title
    FROM stories s
    JOIN source_articles sa ON s.source_id = sa.id
    WHERE s.publish_date = ?
    ORDER BY CASE s.slot
      WHEN 'headline' THEN 1
      WHEN 'small_1' THEN 2
      WHEN 'small_2' THEN 3
    END
  `).all(date) as Story[];
}

export function getAllPublishDates(): string[] {
  const rows = db.prepare(`
    SELECT DISTINCT publish_date FROM stories ORDER BY publish_date DESC
  `).all() as { publish_date: string }[];
  return rows.map(r => r.publish_date);
}

export function getStoryCountForDate(date: string): number {
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM stories WHERE publish_date = ?'
  ).get(date) as { count: number };
  return row.count;
}

export function insertStory(
  publishDate: string,
  slot: string,
  headline: string,
  subheadline: string,
  body: string,
  imagePath: string,
  imageAlt: string,
  imagePrompt: string,
  sourceId: number
): void {
  db.prepare(`
    INSERT INTO stories (publish_date, slot, headline, subheadline, body, image_path, image_alt, image_prompt, source_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(publishDate, slot, headline, subheadline, body, imagePath, imageAlt, imagePrompt, sourceId);
}

export function markArticleUsed(id: number): void {
  db.prepare('UPDATE source_articles SET used = 1 WHERE id = ?').run(id);
}

export function updateArticleBodyText(id: number, bodyText: string): void {
  db.prepare('UPDATE source_articles SET body_text = ? WHERE id = ?').run(bodyText, id);
}
