import type { song_lrcConfig } from "."

export enum BasicSongTypeEnum {
  siren = 'siren',
  netease ='netease',
  qq ='qq',
  kugou = 'kugou',
  local = 'local',
  web = 'web',
}

export type song_basic = {
  title?: string,
  singer?: string,
  pic?: string,
  lrc?: Record<string, song_lrcConfig>
}

export type song_bilibili = {
  type: 'bilibili',
  symbol: string,
  p?: number
} & song_basic

export type basicSong = {
  type: BasicSongTypeEnum,
  symbol: string,
} & song_basic

export type song = basicSong | song_bilibili