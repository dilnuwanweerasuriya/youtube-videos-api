import { YouTubeVideosApiV2 } from '../src/index.js';

// Set YOUTUBE_API_KEY and CHANNEL_ID in your environment before running,
// e.g.  YOUTUBE_API_KEY=xxx CHANNEL_ID=UCxxxx node examples/basic.js
const apiKey = process.env.YOUTUBE_API_KEY;
const channelId = process.env.CHANNEL_ID;

async function main() {
  const yt = new YouTubeVideosApiV2({ apiKey });

  console.log('--- Live videos ---');
  const live = await yt.getLiveVideos(channelId, { maxResults: 5 });
  console.log(live.items);

  console.log('--- All videos (first page) ---');
  const all = await yt.getAllVideos(channelId, { maxResults: 5 });
  console.log(all.items, 'nextPageToken:', all.nextPageToken);

  console.log('--- Search ---');
  const results = await yt.searchVideos('lofi beats', { maxResults: 5 });
  console.log(results.items);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
