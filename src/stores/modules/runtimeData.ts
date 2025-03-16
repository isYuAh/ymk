import {defineStore} from "pinia";
import {computed, ref} from "vue";
import type {list, playlistPart} from "@/types";
import type {song} from '@/types/song'
import { useConfigStore } from "./config";

export const useRuntimeDataStore = defineStore('runtimeData', () => {
  const config = useConfigStore()
  const playlists = ref<list[]>([])
  const defaultPlaylist = computed(() => {
    if (!config.defaultPlaylist) return undefined;
    return playlists.value.find((p) => {
      return p.originFilename === config.defaultPlaylist
    })
  });
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
      intro: "",
    }
  })
  const artistPreview = ref({
    songs: <song[]>[],
    info: {
      name: "",
      pic: "",
      id: "",
      description: ""
    }
  })
  return {
    playlists,
    playlistsParts,
    nowTab,
    loading,
    showFullPlay,
    playlist,
    albumPreview,
    artistPreview,
    defaultPlaylist,
  }
})