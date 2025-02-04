import { defineStore } from 'pinia';
import type {
  list,
  song,
  playlistPart,
} from '@/types'
import {type Component, ref, shallowRef, toRaw, watch} from 'vue';
import router from "@/router";
import type {config} from "@/types/config";
import {neteaseAxios} from "@/utils/axiosInstances";
import {useUserStore} from "@/stores/modules/user";
import {usePlayerStore} from "@/stores/modules/player";
import {useConfigStore} from "@/stores/modules/config";
import {showMessage} from "@/utils/message";
import {refreshPlaylists} from "@/utils/Toolkit";

const {writePlaylistFile, onShowMessage, onRefreshPlaylists} = window.ymkAPI;

export const useZKStore = defineStore('ZK', () => {
  const {writeConfig, getConfig, writeSpecificConfig, getSpecificConfig} = window.ymkAPI;
  const user = useUserStore()
  const player = usePlayerStore()
  const config = useConfigStore()
  const zks = ref({
    playlists: <list[]>[],
    playlistsParts: <playlistPart[]>[],
    nowTab: '',
    loading: {
      text: '',
    },
    resourceDir: '',
    showFullPlay: false,
    // showPlaylistSonglist: false,
    playlist: {
      listIndex: -1, //-1:无 -2:非本地
      raw: <list>{},
      songs: <song[]>[],
      extraInfo: {
        type: '',
        infos: <Record<string, any>>{},
      }
    },
    albumPreview: {
      songs: <song[]>[],
      info: {
        title: "",
        creator: "",
        pic: "",
      }
    },
  });
  const colors = ref<Record<string, string>>({});

  router.beforeEach((to, from) => {
    if (to.path === '/playlistDetail' && zks.value.playlist.listIndex === -1) return {path: '/playlist'};
    if (to.path === '/albumPreview' && zks.value.albumPreview.info.title === "") return {path: '/search'};
    if (to.path !== '/') zks.value.nowTab = to.path.substring(1)
    return true
  })

  function saveConfig() {
    writeConfig(JSON.stringify({
      config: <config>{
        api: config.api,
        bg: config.bg,
        volume: player.config.volume,
        mode: player.config.mode,
        langPreferences: player.config.langPreferences
      },
      neteaseUser: user.neteaseUser,
      kugouUser: user.kugouUser
    }))
  }
  function saveColors() {
    writeSpecificConfig('colors', JSON.stringify(colors.value))
  }
  getConfig().then((res: any) => {
    if (res) {
      let jp = res;
      user.neteaseUser = jp.neteaseUser || {};
      user.kugouUser = jp.kugouUser || {};
      jp.config.api && (config.api = jp.config.api);
      jp.config.bg && (config.bg = jp.config.bg);
      if (jp.config.mode) {
        player.config.mode = jp.config.mode;
      }
      if (jp.config.langPreferences) {
        player.config.langPreferences = jp.config.langPreferences;
      }
      if (jp.config.volume) {
        player.config.volume = jp.config.volume
      }
    }
    watch([
        () => player.config.mode,
      () => player.config.langPreferences,
      () => player.config.volume,
      user,
      config
    ], () => {saveConfig()}, {deep: true});
  })
  getSpecificConfig('colors').then((res: any) => {
    if (res) {
      colors.value = res;
    }
  })

  onShowMessage((m: any) => showMessage(m))

  onRefreshPlaylists(() => refreshPlaylists({notReset: false}))

  function saveSpecificPlaylist(playlist: list) {
    if (!playlist.originFilename.endsWith(".json")) return;
    writePlaylistFile(playlist.originFilename, JSON.stringify(toRaw(playlist))).then(() => {
      showMessage(`保存成功${playlist.originFilename}`);
    }).catch(() => {
      showMessage(`写入文件${playlist.originFilename}失败`);
    })
  }
  function neteaseSongToSongType(s: any) {
    return <song>{
      id: s.id,
      pic: s.al.picUrl,
      singer: s.ar.map((a: any) => a.name).join(" & "),
      type: 'netease',
      title: s.name,
    }
  }
  function neteaseSongsToSongType(ss: any) {
    return <song[]>ss.map((s: any) => neteaseSongToSongType(s))
  }

  return {
    zks,
    config,
    colors,
    user,
    saveConfig,
    saveColors,
    showMessage,
    playlistToolkit: {
      refreshPlaylists,
      saveSpecificPlaylist,
    },
    songToolkit: {
      neteaseSongsToSongType,
    },
  };
});

