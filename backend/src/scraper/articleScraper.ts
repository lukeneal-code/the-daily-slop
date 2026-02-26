import * as cheerio from 'cheerio';

export async function scrapeArticleBody(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return '';
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, header, footer, aside, .ad, .social-share, .related-articles, noscript, iframe').remove();

    // Try common article body selectors across UK news sites
    const selectors = [
      'article [data-component="text-block"]',
      'article .ssrcss-11r1m41-RichTextComponentWrapper',
      '.article-body',
      '.content__article-body',
      '.article__body',
      '[data-testid="article-body"]',
      'article p',
      '.story-body p',
    ];

    for (const sel of selectors) {
      const elements = $(sel);
      if (elements.length > 0) {
        const text = elements.map((_, el) => $(el).text().trim()).get().join('\n\n');
        if (text.length > 200) {
          return text.slice(0, 3000);
        }
      }
    }

    // Fallback: get all paragraphs from the body
    const fallback = $('body p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    return fallback.slice(0, 3000);
  } catch (err) {
    console.warn(`Error scraping article body from ${url}:`, err);
    return '';
  }
}
