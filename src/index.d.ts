export type EventType = 'live' | 'upcoming' | 'completed';
export type SearchOrder =
  | 'date'
  | 'rating'
  | 'relevance'
  | 'title'
  | 'videoCount'
  | 'viewCount';

export interface Video {
  videoId?: string;
  title?: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnails?: Record<string, Thumbnail>;
  liveBroadcastContent?: string;
  position?: number;
}

export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface VideoResult {
  items: Video[];
  nextPageToken?: string;
}

export interface ApiOptions {
  maxResults?: number;
  pageToken?: string;
}

export interface LiveVideoOptions extends ApiOptions {
  eventType?: EventType;
}

export interface VideoListOptions extends ApiOptions {
  fetchAll?: boolean;
  limit?: number;
}

export interface SearchVideoOptions extends VideoListOptions {
  channelId?: string;
  order?: SearchOrder;
}

export interface YOUTUBEVIDEOSAPIV2Config {
  apiKey?: string;
}

export class YOUTUBEVIDEOSAPIV2 {
  constructor(config?: YOUTUBEVIDEOSAPIV2Config);
  getLiveVideos(channelId: string, options?: LiveVideoOptions): Promise<VideoResult>;
  getAllVideos(channelId: string, options?: VideoListOptions): Promise<VideoResult>;
  searchVideos(query: string, options?: SearchVideoOptions): Promise<VideoResult>;
}

export class YouTubeApiError extends Error {
  status: number;
  body: unknown;
}