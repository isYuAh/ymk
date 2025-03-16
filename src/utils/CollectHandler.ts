import { useRuntimeDataStore } from "@/stores/modules/runtimeData";
import type { song, song_netease } from "@/types";
import { toRaw } from "vue";
import { showMessage } from "./message";
import { neteaseAxios } from "./axiosInstances";
const {writePlaylistFile} = window.ymkAPI;

export function collectToLocalPlaylist(targetPlaylistIndex: number, song: song) {
  const runtimeData = useRuntimeDataStore()
  let components = runtimeData.playlists[targetPlaylistIndex].playlist;
  let first = components[0];
  let originFn = runtimeData.playlists[targetPlaylistIndex].originFilename;
  if (first.type === 'data') {
      first.songs.unshift(song);
  }else {
      components.unshift({
          type: "data",
          songs: [song],
      })
  }
  if (targetPlaylistIndex === runtimeData.playlist.listIndex) {
      runtimeData.playlist.songs.unshift(song)
  }
  writePlaylistFile(originFn, JSON.stringify(toRaw(runtimeData.playlists[targetPlaylistIndex]))).then(() => {
      showMessage('添加成功');
  }).catch(() => {
      showMessage(`写入文件${originFn}失败`);
  })
}

export function collectToNeteasePlaylist(targetPlaylistIndex: number, song: song_netease) {
  const runtimeData = useRuntimeDataStore()
  let components = runtimeData.playlists[targetPlaylistIndex].playlist;
  if (components[0].type === 'trace_netease_playlist') {
    const id = components[0].id
    neteaseAxios.post('/playlist/tracks', {
      op: 'add',
      pid: id,
      tracks: `${song.id}`
    }).then(() => {
      showMessage('添加成功');
    }).catch(() => {
      showMessage(`添加失败`);
    })
  }else {
    showMessage('不合法操作')
  }
}

//TODO: collectTOKugouPlaylist

export function determinCollectFunction(targetPlaylistIndex: number, song: song) {
  const runtimeData = useRuntimeDataStore()
  const p = runtimeData.playlists[targetPlaylistIndex]
  console.log(p)
  if (p.type === 'local') {
    collectToLocalPlaylist(targetPlaylistIndex, song)
  }else if (p.type === 'netease_self') {
    collectToNeteasePlaylist(targetPlaylistIndex, song as song_netease)
  }else if (p.type === 'kugou') {
    // collectToKugouPlaylist(targetPlaylistIndex, song)
  }else {
    showMessage('不支持的操作')
  }
}

export function getAvailableCollectTarget(song: song) {
  const runtimeData = useRuntimeDataStore()
  return <{
    label: string,
    value: number
  }[]>runtimeData.playlists.map((val, index) => {
    if (index < runtimeData.playlistsParts[0].count) return {
      label: val.title,
      value: index
    }
    console.log(val, 'val')
    if (val.type === 'netease_self' && song.type === 'netease') {
      return {
        label: val.title,
        value: index
      }
    }

    if (val.playlist[0].type === 'trace_kugou_playlist' && song.type === 'kugou') return {
      label: val.title,
      value: index
    }
    return undefined
  }).filter(p => p)
}