import type { list } from "@/types";
import type { song } from "@/types/song";

export function isSongInPlaylist (song?: song, playlist?: list): [boolean, number, number] {
  if (!playlist || !song) return [false, -1, -1]
  const components = playlist.playlist
  for (let componentIndex in components) {
    const component = components[componentIndex]
    if (component.type !== 'data') continue;
    const componentData = component.songs
    for (let index in componentData) {
      if (componentData[index].symbol === song.symbol && componentData[index].type === song.type) {
        return [true, Number(componentIndex), Number(index)]
      }
    }
  }
  return [false, -1,-1]
}