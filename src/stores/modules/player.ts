import {defineStore} from "pinia";
import type {songInPlay} from "@/types";
import type {song} from '@/types/song'
import {ref, shallowRef} from "vue";
export const usePlayerStore = defineStore('player', () => {
  const song = ref(<songInPlay>{
    pic: '',
    title: '',
    singer: '',
    type: '',
    url: '',
    lrcs: {},
    origin: null as any
  })
  const config = ref({
    curTime: '',
    lang: 'origin',
    curTimeNum: 0,
    durationTime: '',
    duration: 0,
    status: 'pause',
    mode: 'list',
    activeLrc: -1,
    show_songface: false,
    volume: 1,
    progress: 0,
    highlightLrcIndex: -1,
    indexInPlaylist: -1,
    langPreferences: ["mixed", "origin", "translation"]
  })
  const playlist = shallowRef(<song[]>[])
  return {
    song,
    config,
    playlist
  }
})