<template>
  <RouterView></RouterView>
</template>

<script setup lang='ts'>
import { RouterView } from 'vue-router';
import {watch} from "vue";
import {showMessage} from "@/utils/message";
import {refreshPlaylists} from "@/utils/Toolkit";
import {useUserStore} from "@/stores/modules/user";
import {usePlayerStore} from "@/stores/modules/player";
import {useConfigStore} from "@/stores/modules/config";
const {onShowMessage, onRefreshPlaylists, getConfig, getSpecificConfig} = window.ymkAPI;
const user = useUserStore()
const player = usePlayerStore()
const config = useConfigStore()
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
  ], () => {config.saveConfig()}, {deep: true});
})
getSpecificConfig('colors').then((res: any) => {
  if (res) {
    config.colors = res;
  }
})

onShowMessage((m: any) => showMessage(m))

onRefreshPlaylists(() => refreshPlaylists({notReset: false}))


</script>

<style scoped>
:root {
  --ymk-color: #fff;
  --ymk-text-color: #fff;
  --ymk-text-shadow-color: #000;
  --ymk-progress-bg-color: #fff;
  --ymk-progress-fill-color: #fff;
  --ymk-progress-choose-fill-color: #fff;
  --ymk-container-bg-color: rgba(0,0,0,.2);
}
</style>