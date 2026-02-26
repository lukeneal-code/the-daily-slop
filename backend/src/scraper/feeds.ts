export interface FeedConfig {
  outlet: string;
  url: string;
  name: string;
}

export const RSS_FEEDS: FeedConfig[] = [
  { outlet: 'bbc', url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' },
  { outlet: 'bbc', url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', name: 'BBC News UK' },
  { outlet: 'guardian', url: 'https://www.theguardian.com/uk-news/rss', name: 'The Guardian UK' },
  { outlet: 'guardian', url: 'https://www.theguardian.com/uk/rss', name: 'The Guardian' },
  { outlet: 'sky', url: 'https://feeds.skynews.com/feeds/rss/home.xml', name: 'Sky News' },
  { outlet: 'independent', url: 'https://www.independent.co.uk/news/uk/rss', name: 'The Independent' },
  { outlet: 'mirror', url: 'https://www.mirror.co.uk/news/?service=rss', name: 'Daily Mirror' },
];
