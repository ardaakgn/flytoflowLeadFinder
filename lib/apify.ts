export interface ScraperResult {
  title?: string;
  categoryName?: string;
  address?: string;
  website?: string;
  totalScore?: number;
  reviewsCount?: number;
  [key: string]: any;
}

export async function runScraper(query: string, location: string, maxResults: number): Promise<ScraperResult[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error('APIFY_TOKEN is not defined in environment variables.');
  }

  const queryCombined = `${query} ${location}`;
  
  const url = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${token}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchStrings: [queryCombined],
      searchStringsArray: [queryCombined],
      maxCrawledPlacesPerSearch: maxResults,
      language: 'tr',
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Apify scraper call failed with status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data as ScraperResult[];
}
