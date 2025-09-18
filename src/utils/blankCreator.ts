import type { songInPlay } from "@/types";
import type { song } from "@/types/song";

export class Creator {
  static SongInPlay(song?: song): songInPlay {
    return song ? {
      title: song.title || "",
      type: song.type,
      singer: song.singer || "",
      pic: song.pic || '',
      lrcs: {},
      url: '',
      origin: song,
      lyricConfig: {
        offset: song.lyricOffset || 0,
      }
    } : {
      title: '',
      type: '',
      singer: '',
      pic: '',
      lrcs: {},
      url: '',
      origin: null as any,
      lyricConfig: {
        offset: 0,
      }
    }
  }
}