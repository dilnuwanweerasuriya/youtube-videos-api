import { request, paginateAll, YouTubeApiError } from './client.js';

export class YOUTUBEVIDEOSAPIV2 {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - YouTube Data API v3 key.
   */
  constructor({ apiKey } = {}) {
    this.apiKey = apiKey;
    this._uploadsPlaylistCache = new Map();
  }

  /**
   * Get videos currently live (or upcoming) on a channel.
   *
   * @param {string} channelId
   * @param {Object} [options]
   * @param {'live'|'upcoming'|'completed'} [options.eventType='live']
   * @param {number} [options.maxResults=25] - 1-50
   * @param {string} [options.pageToken]
   * @returns {Promise<{items: Array, nextPageToken?: string}>}
   */
  async getLiveVideos(channelId, options = {}) {
    if (!channelId) throw new Error('channelId is required.');
    const { eventType = 'live', maxResults = 25, pageToken } = options;

    const data = await request(this.apiKey, 'search', {
      part: 'snippet',
      channelId,
      eventType,
      type: 'video',
      maxResults,
      pageToken,
    });

    return {
      items: (data.items || []).map(mapSearchItem),
      nextPageToken: data.nextPageToken,
    };
  }

  /**
   * Get all videos uploaded by a channel, via the channel's uploads
   * playlist (cheap: 1 quota unit/page vs 100 for search.list).
   *
   * @param {string} channelId
   * @param {Object} [options]
   * @param {number} [options.maxResults=50] - items per page (1-50)
   * @param {string} [options.pageToken]
   * @param {boolean} [options.fetchAll=false] - paginate through every video
   * @param {number} [options.limit] - cap total items when fetchAll is true
   * @returns {Promise<{items: Array, nextPageToken?: string}>}
   */
  async getAllVideos(channelId, options = {}) {
    if (!channelId) throw new Error('channelId is required.');
    const { maxResults = 50, pageToken, fetchAll = false, limit } = options;

    const uploadsPlaylistId = await this._getUploadsPlaylistId(channelId);

    if (fetchAll) {
      const items = await paginateAll(
        this.apiKey,
        'playlistItems',
        { part: 'snippet,contentDetails', playlistId: uploadsPlaylistId, maxResults: 50 },
        limit
      );
      return { items: items.map(mapPlaylistItem) };
    }

    const data = await request(this.apiKey, 'playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults,
      pageToken,
    });

    return {
      items: (data.items || []).map(mapPlaylistItem),
      nextPageToken: data.nextPageToken,
    };
  }

  /**
   * Search for videos matching a text query.
   *
   * @param {string} query
   * @param {Object} [options]
   * @param {string} [options.channelId] - restrict search to a channel
   * @param {string} [options.order='relevance'] - date|rating|relevance|title|videoCount|viewCount
   * @param {number} [options.maxResults=25]
   * @param {string} [options.pageToken]
   * @param {boolean} [options.fetchAll=false]
   * @param {number} [options.limit]
   * @returns {Promise<{items: Array, nextPageToken?: string}>}
   */
  async searchVideos(query, options = {}) {
    if (!query) throw new Error('query is required.');
    const {
      channelId,
      order = 'relevance',
      maxResults = 25,
      pageToken,
      fetchAll = false,
      limit,
    } = options;

    const baseParams = {
      part: 'snippet',
      q: query,
      type: 'video',
      order,
      channelId,
    };

    if (fetchAll) {
      const items = await paginateAll(
        this.apiKey,
        'search',
        { ...baseParams, maxResults: 50 },
        limit
      );
      return { items: items.map(mapSearchItem) };
    }

    const data = await request(this.apiKey, 'search', {
      ...baseParams,
      maxResults,
      pageToken,
    });

    return {
      items: (data.items || []).map(mapSearchItem),
      nextPageToken: data.nextPageToken,
    };
  }

  async _getUploadsPlaylistId(channelId) {
    if (this._uploadsPlaylistCache.has(channelId)) {
      return this._uploadsPlaylistCache.get(channelId);
    }

    const data = await request(this.apiKey, 'channels', {
      part: 'contentDetails',
      id: channelId,
    });

    const uploadsPlaylistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error(`Could not resolve uploads playlist for channel "${channelId}". Check the channel ID.`);
    }

    this._uploadsPlaylistCache.set(channelId, uploadsPlaylistId);
    return uploadsPlaylistId;
  }
}

function mapSearchItem(item) {
  return {
    videoId: item.id?.videoId,
    title: item.snippet?.title,
    description: item.snippet?.description,
    channelId: item.snippet?.channelId,
    channelTitle: item.snippet?.channelTitle,
    publishedAt: item.snippet?.publishedAt,
    thumbnails: item.snippet?.thumbnails,
    liveBroadcastContent: item.snippet?.liveBroadcastContent,
  };
}

function mapPlaylistItem(item) {
  return {
    videoId: item.contentDetails?.videoId,
    title: item.snippet?.title,
    description: item.snippet?.description,
    channelId: item.snippet?.channelId,
    channelTitle: item.snippet?.channelTitle,
    publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt,
    thumbnails: item.snippet?.thumbnails,
    position: item.snippet?.position,
  };
}

export { YouTubeApiError };
