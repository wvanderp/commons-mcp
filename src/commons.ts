import fetch from 'cross-fetch';

export interface CommonsSearchItem {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  author?: string;
  license?: string;
}

export interface SearchOptions {
  limit?: number;
}

interface ExtMetadata {
  ImageDescription?: { value: string };
  Artist?: { value: string };
  LicenseShortName?: { value: string };
  License?: { value: string };
}

interface ImageInfo {
  url: string;
  thumburl?: string;
  extmetadata?: ExtMetadata;
}

interface MediaWikiPage {
  title: string;
  fullurl?: string;
  imageinfo?: ImageInfo[];
}

interface MediaWikiApiResponse {
  query?: {
    pages?: Record<string, MediaWikiPage>;
  };
}

const USER_AGENT =
  process.env.MCP_USER_AGENT ||
  'commons-mcp/0.1 (+https://www.mediawiki.org/wiki/API:Etiquette)';

// Wikimedia Commons API endpoint
const API_URL = 'https://commons.wikimedia.org/w/api.php';

function buildQueryURL(query: string, limit: number): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrlimit: String(limit),
    gsrsearch: query,
    // restrict generator to the File namespace so returned pages are image files
    // (namespace 6 is "File" on Wikimedia projects)
    gsrnamespace: '6',
    prop: 'imageinfo|info',
    inprop: 'url',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    iiurlheight: '1200',
  });
  return `${API_URL}?${params.toString()}`;
}

export async function searchCommons(
  query: string,
  { limit = 5 }: SearchOptions = {},
): Promise<CommonsSearchItem[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const url = buildQueryURL(query.trim(), limit);
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Commons API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as MediaWikiApiResponse;
  const pages = json?.query?.pages;
  if (!pages) return [];

  const items: CommonsSearchItem[] = Object.values(pages)
    .filter((p: MediaWikiPage) => p?.imageinfo?.length)
    .map((p: MediaWikiPage) => {
      const info = p.imageinfo![0]; // We know it exists from filter above
      const meta = info.extmetadata || {};
      const description =
        meta.ImageDescription?.value?.replace(/<[^>]+>/g, '') || p.title || '';
      const author = meta.Artist?.value?.replace(/<[^>]+>/g, '');
      const license = meta.LicenseShortName?.value || meta.License?.value;
      const imageUrl = info.thumburl || info.url;
      const pageUrl =
        p.fullurl ||
        `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`;
      return {
        title: p.title,
        description,
        imageUrl,
        pageUrl,
        author,
        license,
      };
    });

  // Stable sort by title to make results deterministic-ish
  items.sort((a, b) => a.title.localeCompare(b.title));
  return items;
}
