const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export class YouTubeApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'YouTubeApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Low-level request helper. Builds the query string, calls fetch,
 * and throws a YouTubeApiError with useful details on failure.
 */
export async function request(apiKey, endpoint, params = {}) {
  if (!apiKey) {
    throw new Error('YouTube API key is required. Pass it as { apiKey } when constructing YouTubeVideosApiV2.');
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('key', apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `YouTube API request failed with status ${res.status}`;
    throw new YouTubeApiError(message, res.status, data);
  }

  return data;
}

/**
 * Paginates through an endpoint until either there are no more pages
 * or the requested item limit is reached. Used internally when a
 * caller passes { fetchAll: true }.
 */
export async function paginateAll(apiKey, endpoint, params, itemLimit) {
  let items = [];
  let pageToken;

  do {
    const data = await request(apiKey, endpoint, { ...params, pageToken });
    items = items.concat(data.items || []);
    pageToken = data.nextPageToken;

    if (itemLimit && items.length >= itemLimit) {
      items = items.slice(0, itemLimit);
      break;
    }
  } while (pageToken);

  return items;
}

export { BASE_URL };
