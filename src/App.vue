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
const {onShowMessage, onRefreshPlaylists} = window.ymkAPI;
const user = useUserStore()
const player = usePlayerStore()
const config = useConfigStore()

config.initConfig().finally(() => {
  watch([
    () => player.config.mode,
    () => player.config.langPreferences,
    () => player.config.volume,
    () => user,
    config
  ], () => {config.saveConfig()}, {deep: true, immediate:false});
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