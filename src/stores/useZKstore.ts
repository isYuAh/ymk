import { defineStore } from 'pinia';
import type {list, messageController, song, songInPlay, song_lrc_item, playlistPart} from '@/types'
import CollectDialog from '@/components/Dialogs/CollectDialog.vue';
import { ref, shallowRef, watch} from 'vue';
import emitter from "@/emitter";
import {minmax} from "@/utils/u";

export const useZKStore = defineStore('ZK', () => {
  const {writeConfig, getConfig} = (window as any).ymkAPI;
  const zks = ref({
    playlists: <list[]>[],
    playlistsParts: <playlistPart[]>[],
    nowTab: 'Playlist',
    loading: {
      text: '',
    },
    dialog: {
      show: false,
      dialogEl: <any>shallowRef(CollectDialog),
    },
    dialogData: {
      waitCollect: <song>(null as any)
    },
    message: <messageController>{
      show: false,
      text: '',
      timer: null as any,
    },
    resourceDir: '',
    showFullPlay: false,
    showPlaylistSonglist: false,
    playlist: {
      listIndex: -1,
      raw: <list>{},
      songs: <song[]>[],
    },
    play: {
      playlist: <song[]>([]),
      indexInPlaylist: -1,
      song: <songInPlay>{
        pic: '',
        title: '',
        singer: '',
        type: '',
        url: '',
        lrc: {
          status: 'disabled',
          type: 'local',
          path: '',
          lrc: [],
        },
        translationLrc: {
          status: 'disabled',
          type: 'local',
          path: '',
          lrc: [],
        },
        origin: null as any
      },
      curTime: '',
      lang: 'origin',
      curTimeNum: 0,
      durationTime: '',
      duration: 0,
      status: 'pause',
      mode: 'list',
      activeLrc: -1,
      lrcConfig: <song_lrc_item[]>[],
      show_songface: false,
      volume: 1,
      progress: 0,
      highlightLrcIndex: -1,
    },
    wbi: {},
    history: [],
  });
  const config = ref<any>({});
  const colors = ref<any>({});
  const neteaseUser = ref<any>({});

  function saveConfig() {
    writeConfig(JSON.stringify({config: config.value, neteaseUser: neteaseUser.value, colors: colors.value}))
  }
  getConfig().then((res: any) => {
    if (res) {
      let jp = res;
      config.value = jp.config;
      neteaseUser.value = jp.neteaseUser;
      colors.value = jp.colors;
      if (config.value.volume != undefined) {
        emitter.emit('changeVolumeTo', minmax(config.value.volume, 0, 1));
      }
      if (config.value.mode) {
        zks.value.play.mode = config.value.mode;
      }
    }
    watch([() => zks.value.play.mode, colors, neteaseUser, config], () => {config.value.mode = zks.value.play.mode; saveConfig()}, {deep: true});
  })
  return {zks, config, colors, neteaseUser, saveConfig};
});
