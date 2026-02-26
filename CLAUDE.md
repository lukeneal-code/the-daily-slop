# The Daily Slop

A satirical newspaper website in the style of The Daily Mash and Private Eye.

## Project Structure

- `backend/` — Node.js/Express API with SQLite (better-sqlite3), TypeScript
- `frontend/` — React + Vite + TypeScript
- `scripts/` — CLI utilities (seed, migrate)

## Tech Stack

- **Backend**: Express, better-sqlite3, rss-parser, cheerio, node-cron
- **Frontend**: React 19, Vite, TypeScript
- **AI**: Anthropic Claude API (satire generation), OpenAI DALL-E 3 (images)
- **Database**: SQLite via better-sqlite3

## Key Commands

```bash
# Install all dependencies (from root)
npm install

# Development
npm run dev:backend    # Express on port 3001 (tsx watch)
npm run dev:frontend   # Vite on port 5173 (proxies /api and /images to backend)

# Database
npx tsx scripts/migrate.ts   # Initialize/migrate the database
npx tsx scripts/seed.ts      # Manually trigger the daily pipeline

# Build frontend for production
npm run build:frontend
```

## Environment Variables

Required in `.env` at project root:
- `ANTHROPIC_API_KEY` — Claude API key for satire generation
- `OPENAI_API_KEY` — OpenAI API key for DALL-E image generation
- `PORT` — Backend port (default: 3001)
- `DATABASE_PATH` — SQLite DB path (default: ./backend/data/slop.db)

## Architecture

### Daily Pipeline (backend/src/pipeline/daily.ts)
1. Scrape RSS feeds from BBC, Guardian, Daily Mail, Sky News, Telegraph
2. Select 3 diverse stories from different outlets
3. Enrich with full article body text (cheerio scraping)
4. Generate satirical rewrites via Claude (claude-sonnet-4-6)
5. Generate images via DALL-E 3 (1 headline photo + 2 editorial cartoons)
6. Store in SQLite and save images to disk

### API Endpoints
- `GET /api/stories?date=YYYY-MM-DD` — Stories for a date (defaults to today)
- `GET /api/dates` — All dates with published stories

### Database Tables
- `source_articles` — Scraped RSS items (deduplicated by external_id)
- `stories` — Generated satirical stories (unique per publish_date + slot)

### Frontend
- Single-page newspaper front page with date navigation
- 1 headline story (large image) + 2 sidebar stories (cartoon images)
- UK tabloid style: Playfair Display + Lora serif fonts, aged paper background

## Conventions

- All backend source in TypeScript, run with tsx
- CSS is vanilla (no framework), organized in frontend/src/styles/
- Images stored at backend/public/images/YYYY-MM-DD/
- Cron runs daily at 6:00 AM Europe/London
- Claude model: claude-sonnet-4-6 for satire generation
- DALL-E model: dall-e-3 for image generation
