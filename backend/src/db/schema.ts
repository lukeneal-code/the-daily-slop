import { db } from './database';

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS source_articles (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id   TEXT UNIQUE NOT NULL,
      outlet        TEXT NOT NULL,
      title         TEXT NOT NULL,
      description   TEXT,
      url           TEXT NOT NULL,
      body_text     TEXT,
      image_url     TEXT,
      published_at  TEXT NOT NULL,
      scraped_at    TEXT NOT NULL DEFAULT (datetime('now')),
      used          INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stories (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      publish_date    TEXT NOT NULL,
      slot            TEXT NOT NULL,
      headline        TEXT NOT NULL,
      subheadline     TEXT,
      body            TEXT NOT NULL,
      image_path      TEXT NOT NULL,
      image_alt       TEXT,
      image_prompt    TEXT,
      source_id       INTEGER NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (source_id) REFERENCES source_articles(id),
      UNIQUE(publish_date, slot)
    );

    CREATE INDEX IF NOT EXISTS idx_stories_date ON stories(publish_date);
    CREATE INDEX IF NOT EXISTS idx_source_articles_used ON source_articles(used);
    CREATE INDEX IF NOT EXISTS idx_source_articles_external_id ON source_articles(external_id);
  `);

  console.log('Database initialized.');
}
