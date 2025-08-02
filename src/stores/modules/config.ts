import {defineStore} from "pinia";
import {ref} from "vue";
import type {apiConfig, config} from "@/types/config";
import {usePlayerStore} from "@/stores/modules/player";
import {useUserStore} from "@/stores/modules/user";
const {writeConfig, writeSpecificConfig, getConfig, getSpecificConfig} = window.ymkAPI;

export const useConfigStore = defineStore('config', () => {
  const api = ref({
    neteaseApi: <apiConfig>{
      enable: false,
      url: '',
    },
    qqApi: <apiConfig>{
      enable: false,
      url: '',
    },
  })
  const bg = ref("")
  const maskOpacity = ref(0)
  const colors = ref<Record<string, string>>({});
  const defaultPlaylist = ref('isyuah_converted.json');
  const minimizeToTray = ref(false);
  const isInitialized = ref(false);
  const isInitializing = ref(false);
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

  async function initConfig() {
    if (isInitializing.value) {
      return;
    }
    
    isInitializing.value = true;
    
    try {
      const [configData, colorsData] = await Promise.all([
        getConfig(),
        getSpecificConfig('colors')
      ]);
      
      if (configData) {
        const jp = configData;
        console.log('$jsonConfig', jp);
        
        user.neteaseUser = jp.user.neteaseUser || {};
        user.bilibiliUser = jp.user.bilibiliUser || {};
        user.kugouUser = jp.user.kugouUser || {};
        
        if (jp.config.api) {
          api.value = jp.config.api;
        }
        if (jp.config.bg) {
          bg.value = jp.config.bg;
        }
        if (jp.config.maskOpacity !== undefined) {
          maskOpacity.value = jp.config.maskOpacity;
        }
        if (jp.config.minimizeToTray !== undefined) {
          minimizeToTray.value = jp.config.minimizeToTray;
        }
        if (jp.config.mode) {
          player.config.mode = jp.config.mode;
        }
        if (jp.config.langPreferences) {
          player.config.langPreferences = jp.config.langPreferences;
        }
        if (jp.config.volume) {
          player.config.volume = jp.config.volume;
        }
        if (jp.config.defaultPlaylist) {
          defaultPlaylist.value = jp.config.defaultPlaylist;
        }
      }
      
      if (colorsData) {
        colors.value = colorsData;
      }
    } catch (error) {
      console.error('Failed to initialize config:', error);
    } finally {
      isInitialized.value = true;
      isInitializing.value = false;
    }
  }

  return {
    api,
    bg,
    colors,
    maskOpacity,
    defaultPlaylist,
    minimizeToTray,
    isInitialized,
    isInitializing,
    saveConfig,
    saveColors,
    initConfig,
  }
})