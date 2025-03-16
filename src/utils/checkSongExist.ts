import type { list } from "@/types";
import type { song } from "@/types/song";

export function isSongInPlaylist (song: song, playlist: list) {
  const components = playlist.playlist
  let result = [-1,-1];
  for (let componentIndex in components) {
    const component = components[componentIndex]
    if (component.type !== 'data') continue;
    const componentData = component.songs
    for (let index in componentData) {
      if (componentData[index].symbol === song.symbol && componentData[index].type === song.type) {
        result = [Number(componentIndex), Number(index)]
      }
    }
  }
  return result
}