<template>
  <div class="colorSetter" :style="{
    '--ymk-color': colors.elColor,
    '--ymk-text-color': colors.textColor,
    '--ymk-progress-bg-color': colors.progressBgColor,
    '--ymk-progress-fill-color': colors.progressFillColor,
    '--ymk-progress-choose-fill-color': colors.progressChooseFillColor,
    '--ymk-text-shadow-color': colors.textShadowColor,
    '--ymk-container-bg-color': colors.containerBgColor,
  }" @drop.prevent="dropEvent" @dragover.prevent>
    <div v-if="config.bg !== ''" class="backgroundFrame">
      <video autoplay muted loop :src="bgSrc"></video>
    </div>
    <Transition name="uianim">
      <Dialog>
        <Component :is="zks.dialog.dialogEl" />
      </Dialog>
    </Transition>
    <Transition name="uianim">
      <FullPlay v-show="zks.showFullPlay"></FullPlay>
    </Transition>
    <div class="container">
      <div style="-webkit-app-region: drag" class="header forbidSelect">
        <div style="-webkit-app-region: drag" class="title">Yumuzk</div>
        <Transition appear name="playcontroller">
          <div style="-webkit-app-region: no-drag" v-show="!zks.showFullPlay" class="tabs">
            <RouterLink to="/playlist" :class="{tab: true, active: zks.nowTab === 'playlist'}">首页</RouterLink>
            <RouterLink to="/recommendedPlaylists" :class="{tab: true, active: zks.nowTab === 'PlaylistRecommend_netease'}">推荐</RouterLink>
            <RouterLink to="/playlistDetail" v-if="zks.playlist.listIndex !== -1" :class="{tab: true, active: zks.nowTab === 'playlistDetail'}">歌单</RouterLink>
            <RouterLink to="/search" :class="{tab: true, active: zks.nowTab === 'search'}">搜索</RouterLink>
<!--            <RouterLink  to="/blank" @click="zks.nowTab = 'blankPage'" :class="{tab: true, active: zks.nowTab === 'blankPage'}">空白</RouterLink>-->
            <RouterLink to="/userCenter" :class="{tab: true, active: zks.nowTab === 'userCenter'}">
              <div class="text">{{ neteaseUser.nickname || '用户' }}</div>
              <img v-if="neteaseUser.avatarUrl" style="border-radius: 50%;margin-left: 4px;margin-top:6px; height: 28px;" :src="neteaseUser.avatarUrl" alt="">
            </RouterLink>
            <RouterLink to="/settings" :class="{tab: true, active: zks.nowTab === 'Settings'}">设置</RouterLink>
          </div>
        </Transition>
        <div style="-webkit-app-region: no-drag" class="controlbtn">
          <button @click="minimize()" class="btn minimize">-</button>
          <button @click="exit(1)" class="btn close">×</button>
        </div>
      </div>
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition v-show="!zks.showFullPlay" appear name="uianim">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
      <Playbar></Playbar>
    </div>
    <Message />
  </div>
</template>

<script setup lang="ts">
import '@/assets/anim.css'
import { useZKStore } from '@/stores/useZKstore'
import {type list, type song} from '@/types';
import { onUnmounted, provide, shallowRef, watch, computed } from 'vue';
import Playlist from '@/pages/Playlist.vue';
import PlaylistDetail from '@/pages/PlaylistDetail.vue';
import Loading from '@/pages/Loading.vue'
import FullPlay from '@/pages/FullPlay.vue'
import Playbar from '@/pages/Playbar.vue'
import Search from '@/pages/Search.vue'
import UserCenter from '@/pages/UserCenter.vue';
import Message from '@/components/Message.vue';
import Dialog from '@/components/Dialog.vue'
import emitter from '@/emitter';

const {exit, minimize} = (window as any).ymkAPI

if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "",
    artist: ""
  });
  navigator.mediaSession.setActionHandler("play", () => zks.value.play.status = 'play');
  navigator.mediaSession.setActionHandler("pause", () => zks.value.play.status = 'pause');
  navigator.mediaSession.setActionHandler("seekbackward", (e) => console.log('$seekB', e));
  navigator.mediaSession.setActionHandler("seekforward", (e) => console.log('$seekF', e));
  navigator.mediaSession.setActionHandler("previoustrack", () => emitter.emit('playPrevSong'));
  navigator.mediaSession.setActionHandler("nexttrack", () => emitter.emit('playNextSong'))
}
const {zks, neteaseUser, config, colors} = storeToRefs(useZKStore());
//监听cookie
const bgSrc = computed(() => {
  return `http://localhost:35652/api/bg?fn=${config.value.bg}`
})
watch(() => neteaseUser.value.cookie, (nv) => {
  document.cookie = nv;
})

import {storeToRefs} from "pinia";

async function TMP() {
  await useZKStore().playlistToolkit.refreshPlaylists({notReset: false});
  emitter.on('refreshPlaylists', (conf) => {
    useZKStore().playlistToolkit.refreshPlaylists(conf);
  });
}
TMP();

function dropEvent(e: DragEvent) {
  console.log(e)
}

onUnmounted(() => {
  emitter.off('refreshPlaylists')
})
</script>

<style>
body {
    background: rgb(255,255,255);
}
</style>

<style scoped>
.colorSetter {
  text-shadow: var(--ymk-text-shadow-color);
}
.backgroundFrame {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}
.backgroundFrame video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.container {
  display: grid;
  grid-template-rows: 64px 1fr 64px;
  flex-direction: column;
  font-family: HarmonyOS Sans;
  /* border-radius: 4px; */
  width: 100vw;
  height: 100vh;
}
.header {
  position: relative;
  display: flex;
  align-items: center;
  height: 64px;
  /* border-bottom: 1px solid #e2e3e5; */
}
.header .title {
  font-family: NovecentoWide;
  font-size: 22px;
  margin-left: 24px;
  line-height: 32px;
  color: var(--ymk-color);
  opacity: 0.9;
}
.header .controlbtn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  font-size: 20px;
  z-index: 100;
}
.header .controlbtn .btn {
  color: var(--ymk-color);
  width: 32px;
  height: 32px;
  line-height: 1;
  border: none;
  background-color: transparent;
  transition: background-color .2s;
}
.header .controlbtn .btn:hover {
  background-color: rgba(0,0,0,.2);
}
.content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.header .tabs {
    margin-left: 50px;
    display: flex;
}
.header .tab {
  font-family: SourceSansCNM;
  /* font-weight: bold; */
  display: flex;
  font-size: 18px;
  margin: 0 8px;
  padding: 5px 0;
  height: 48px;
  line-height: 40px;
  transition: all .2s;
  color: var(--ymk-text-color);
}
.header .tab img {
  display: inline-block;
}
.header .tab.active {
    border-bottom: 4px solid var(--ymk-color);
}
</style>