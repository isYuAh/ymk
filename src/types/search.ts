import type { song } from './index';

// 统一的搜索结果类型定义

export type SearchSource = 'netease' | 'kugou';

// 统一的专辑类型
export interface UnifiedAlbum {
  id: string;
  name: string;
  coverUrl: string;
  artist: {
    name: string;
  };
  songCount: number;
  source: SearchSource;
}

// 统一的歌手类型
export interface UnifiedArtist {
  id: string;
  name: string;
  avatarUrl: string;
  source: SearchSource;
}

// 统一的歌单类型
export interface UnifiedPlaylist {
  id: string;
  name: string;
  coverUrl: string;
  source: SearchSource;
}

// 统一的搜索结果类型
export interface SearchResults {
  songs: Array<song>;  // 使用现有的song类型
  albums: Array<UnifiedAlbum>;
  artists: Array<UnifiedArtist>;
  playlists: Array<UnifiedPlaylist>;
  total: number;
  source: SearchSource;
} 