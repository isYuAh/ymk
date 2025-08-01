import {defineStore} from "pinia";
import {ref} from "vue";
import type {apiConfig, config} from "@/types/config";
import {usePlayerStore} from "@/stores/modules/player";
import {useUserStore} from "@/stores/modules/user";
const {writeConfig, writeSpecificConfig} = window.ymkAPI;

export const useConfigStore = defineStore('config', () => {
  const api = ref({
    neteaseApi: <apiConfig>{
      enable: false,
    },
    qqApi: <apiConfig>{
      enable: false,
    },
  })
  const bg = ref("")
  const maskOpacity = ref(0)
  const colors = ref<Record<string, string>>({});
  const defaultPlaylist = ref('isyuah_converted.json');
  const minimizeToTray = ref(false);
  const player = usePlayerStore()
  const user = useUserStore()
  function saveConfig() {
    writeConfig(JSON.stringify({
      config: <config>{
        api: api.value,
        bg: bg.value,
        volume: player.config.volume,
        mode: player.config.mode,
        maskOpacity: maskOpacity.value,
        langPreferences: player.config.langPreferences,
        defaultPlaylist: defaultPlaylist.value,
        minimizeToTray: minimizeToTray.value,
      },
      user: {
        bilibiliUser: user.bilibiliUser,
        kugouUser: user.kugouUser,
        neteaseUser: user.neteaseUser,
      }
    }))
  }
  function saveColors() {
    writeSpecificConfig('colors', JSON.stringify(colors.value))
  }

  return {
    api,
    bg,
    colors,
    maskOpacity,
    defaultPlaylist,
    minimizeToTray,
    saveConfig,
    saveColors,
  }
})