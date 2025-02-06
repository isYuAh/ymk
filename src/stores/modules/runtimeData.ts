import {defineStore} from "pinia";
import {ref} from "vue";
import type {list, playlistPart, song} from "@/types";

export const useRuntimeDataStore = defineStore('runtimeData', () => {
  const playlists = ref<list[]>([])
  const playlistsParts = ref<playlistPart[]>([])
  const nowTab = ref('');
  const loading = ref({
    text: ''
  });
  const showFullPlay = ref(false)
  const playlist = ref({
    listIndex: -1, //-1:无 -2:非本地
    raw: <list>{},
    songs: <song[]>[],
    extraInfo: {
      type: '',
      infos: <Record<string, any>>{},
    }
  })
  const albumPreview = ref({
    songs: <song[]>[],
    info: {
      title: "",
      creator: "",
      pic: "",
    }
  })
  return {
    playlists,
    playlistsParts,
    nowTab,
    loading,
    showFullPlay,
    playlist,
    albumPreview
  }
})