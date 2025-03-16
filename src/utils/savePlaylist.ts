import type { list } from "@/types";
import { toRaw } from "vue";

export function savePlaylist(playlist: list) {
  if (!playlist.originFilename.endsWith('.json')) return;
  let raw = structuredClone(toRaw(playlist));
  raw.playlist = raw.playlist.map((c) => {
    if (c.type === 'data') {
      return {
        type: 'data',
        songs: c.songs.map((s) => {
          return s
        })
      }
    }else {
      return c
    }
  })

}