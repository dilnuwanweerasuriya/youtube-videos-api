# youtube-videos-api-v2

Lightweight Node.js wrapper around the [YouTube Data API v3](https://developers.google.com/youtube/v3) for three common needs:

- **`getLiveVideos(channelId)`** — currently live (or upcoming) broadcasts on a channel
- **`getAllVideos(channelId)`** — all videos a channel has uploaded
- **`searchVideos(query)`** — query-based video search

No dependencies — uses Node's built-in `fetch` (Node 18+).

## Setup

1. Get a YouTube Data API v3 key from the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).
2. Install:
   ```bash
   npm install youtube-videos-api-v2
   ```
   (or just copy the `src/` folder into your project.)

## Usage

```js
import { YouTubeVideosApiV2 } from 'youtube-videos-api-v2';

const yt = new YouTubeVideosApiV2({ apiKey: process.env.YOUTUBE_API_KEY });

// 1. Live videos
const { items: liveVideos } = await yt.getLiveVideos(process.env.CHANNEL_ID);

// 2. All videos on a channel (single page)
const { items: videos, nextPageToken } = await yt.getAllVideos(process.env.CHANNEL_ID, {
  maxResults: 50,
});

// ...or pull every video the channel has (auto-paginates)
const { items: everyVideo } = await yt.getAllVideos(process.env.CHANNEL_ID, {
  fetchAll: true,
});

// 3. Search
const { items: results } = await yt.searchVideos('lofi beats', {
  maxResults: 10,
  order: 'date',
});
```

Run the bundled example:

```bash
YOUTUBE_API_KEY=xxx 
CHANNEL_ID=UCxxxx 
npm run example
```

## API

### `new YouTubeVideosApiV2({ apiKey })`

### `getLiveVideos(channelId, options?)`
| option | default | notes |
|---|---|---|
| `eventType` | `'live'` | `'live'` \| `'upcoming'` \| `'completed'` |
| `maxResults` | `25` | 1–50 |
| `pageToken` | — | for manual pagination |

Returns `{ items, nextPageToken }`.

### `getAllVideos(channelId, options?)`
Internally resolves the channel's **uploads playlist** and reads from `playlistItems`, which costs **1 quota unit per page** instead of the 100 units `search.list` costs — much cheaper for listing a whole channel.

| option | default | notes |
|---|---|---|
| `maxResults` | `50` | 1–50, ignored when `fetchAll` is true (always requests 50/page) |
| `pageToken` | — | for manual pagination |
| `fetchAll` | `false` | keep paginating until every video is fetched |
| `limit` | — | cap total items when `fetchAll` is true |

Returns `{ items, nextPageToken }` (no `nextPageToken` when `fetchAll` is used).

### `searchVideos(query, options?)`
| option | default | notes |
|---|---|---|
| `channelId` | — | restrict search to one channel |
| `order` | `'relevance'` | `date` \| `rating` \| `relevance` \| `title` \| `videoCount` \| `viewCount` |
| `maxResults` | `25` | 1–50 |
| `pageToken` | — | for manual pagination |
| `fetchAll` | `false` | keep paginating until `limit` (or all results) |
| `limit` | — | cap total items when `fetchAll` is true |

Returns `{ items, nextPageToken }`.

Each returned item is normalized to:
```js
{
  videoId, title, description, channelId, channelTitle,
  publishedAt, thumbnails, /* plus liveBroadcastContent or position depending on source */
}
```

## Reusing this in future projects

You don't have to publish to npm to reuse it elsewhere:

- **`npm link` (local dev):** run `npm link` inside this folder once, then `npm link youtube-videos-api` inside any other project to symlink it in — edits here show up there immediately.
- **Git dependency:** push this folder to a GitHub repo, then in another project run `npm install github:yourusername/youtube-videos-api`.
- **Publish to npm:** if you want `npm install youtube-videos-api` to work anywhere, publish it — see the publishing steps covered earlier.

## Quota notes

- `search.list` (used by `getLiveVideos` and `searchVideos`) costs **100 units per call**.
- `playlistItems.list` + one-time `channels.list` lookup (used by `getAllVideos`) costs **~1 unit per page**.
- A fresh Google Cloud project defaults to **10,000 units/day**. Use `fetchAll`/`limit` carefully with `search.list`-backed methods.

## Error handling

All methods throw `YouTubeApiError` (exported from the package) on API errors, with `.status` and `.body` for details:

```js
import { YouTubeApiError } from 'youtube-videos-api-v2';

try {
  await yt.getLiveVideos('bad-channel-id');
} catch (err) {
  if (err instanceof YouTubeApiError) {
    console.error(err.status, err.body);
  }
}
```
