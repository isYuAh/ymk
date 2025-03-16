import type { song_lrcConfig } from "."

export enum BasicSongTypeEnum {
  siren = 'siren',
  netease ='netease',
  qq ='qq',
  kugou = 'kugou',
  local = 'local',
  web = 'web',
}
export type supportSongTypes = BasicSongTypeEnum | 'bilibili'

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

export type SongOfType<T extends supportSongTypes> = 
  T extends 'bilibili' 
    ? song_bilibili 
    : basicSong & { type: T };

export type song = basicSong | song_bilibili
export namespace SongTypes {
  export type netease = SongOfType<BasicSongTypeEnum.netease>
  export type qq = SongOfType<BasicSongTypeEnum.qq>
  export type kugou = SongOfType<BasicSongTypeEnum.kugou>
  export type local = SongOfType<BasicSongTypeEnum.local>
  export type web = SongOfType<BasicSongTypeEnum.web>
  export type siren = SongOfType<BasicSongTypeEnum.siren>
  export type bilibili = SongOfType<'bilibili'>
}