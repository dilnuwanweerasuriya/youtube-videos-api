<!-- youtube-videos-api-v2 -->

## Setup

1. Get a YouTube Data API v3 key from the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).
2. Install:
   npm install youtube-videos-api-v2

3. Create an .env file and add below credentials
   YOUTUBE_API_KEY=
   CHANNEL_ID

## Usage

```js
import { YOUTUBEVIDEOSAPIV2 } from 'youtube-videos-api-v2';

const yt = new YOUTUBEVIDEOSAPIV2({ apiKey: process.env.YOUTUBE_API_KEY });

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
