<template>
  <div class="colorSetter" :style="{
    '--ymk-color': config.colors.elColor,
    '--ymk-text-color': config.colors.textColor,
    '--ymk-progress-bg-color': config.colors.progressBgColor,
    '--ymk-progress-fill-color': config.colors.progressFillColor,
    '--ymk-progress-choose-fill-color': config.colors.progressChooseFillColor,
    '--ymk-text-shadow-color': config.colors.textShadowColor,
    '--ymk-container-bg-color': config.colors.containerBgColor,
  }" @drop.prevent="dropEvent" @dragover.prevent>
    <div v-if="backgroundType" class="backgroundFrame forbidSelect">
      <div class="mask" :style="`background-color: rgba(0,0,0,${config.maskOpacity});`"></div>
      <img :src="config.bg" v-if="backgroundType === 'img'">
      <video ref="videoBg" v-if="backgroundType === 'video'" @pause="videoBg?.play()" autoplay muted loop class="object-cover wh100" :src="config.bg"></video>
    </div>
    <div class="container">
      <div style="-webkit-app-region: drag" class="header forbidSelect noPointerEvents">
        <Transition name="fade">
          <div v-show="!runtimeData.showFullPlay" class="title">Yumuzk</div>
        </Transition>
        <Transition appear name="fade">
          <div style="-webkit-app-region: no-drag;" v-show="!runtimeData.showFullPlay" class="tabs allPointerEvents">
            <RouterLink to="/playlist" :class="{tab: true, active: runtimeData.nowTab === 'playlist'}">首页</RouterLink>
            <RouterLink to="/recommendedPlaylists" :class="{tab: true, active: runtimeData.nowTab === 'recommendedPlaylists'}">推荐</RouterLink>
            <RouterLink to="/playlistDetail" v-if="runtimeData.playlist.listIndex !== -1" :class="{tab: true, active: runtimeData.nowTab === 'playlistDetail'}">歌单</RouterLink>
            <RouterLink @contextmenu.prevent="previewContextMenu('album')" to="/albumPreview" v-if="runtimeData.albumPreview.info.title !== ''" :class="{tab: true, active: runtimeData.nowTab === 'albumPreview'}">专辑</RouterLink>
            <RouterLink @contextmenu.prevent="previewContextMenu('artist')" to="/artistPreview" v-if="runtimeData.artistPreview.info.id !== ''" :class="{tab: true, active: runtimeData.nowTab === 'artistPreview'}">歌手</RouterLink>
            <RouterLink to="/search" :class="{tab: true, active: runtimeData.nowTab === 'search'}">搜索</RouterLink>
            <RouterLink to="/userCenter" :class="{tab: true, active: runtimeData.nowTab === 'userCenter'}">
              <div class="text">{{ user.neteaseUser.nickname || '用户' }}</div>
              <img v-if="user.neteaseUser.avatarUrl" style="border-radius: 50%;margin-left: 4px;margin-top:6px; height: 28px;" :src="user.neteaseUser.avatarUrl" alt="">
            </RouterLink>
            <RouterLink to="/settings" :class="{tab: true, active: runtimeData.nowTab === 'Settings'}">设置</RouterLink>
          </div>
        </Transition>
        <div style="-webkit-app-region: no-drag;" class="controlbtn noPointerEvents">
          <button @click="minimize()" class="btn allPointerEvents minimize">-</button>
          <button @click="exit(1)" class="btn allPointerEvents close">×</button>
        </div>
      </div>
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition v-show="!runtimeData.showFullPlay" appear name="uianim">
            <keep-alive :exclude="['UserCenter', 'PlaylistDetail', 'Settings']">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
      <Playbar></Playbar>
    </div>
    <Transition name="uianim">
      <FullPlay v-show="runtimeData.showFullPlay"></FullPlay>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import '@/assets/anim.css'
import { watch, computed, useTemplateRef } from 'vue';
import FullPlay from '@/pages/FullPlay.vue'
import Playbar from '@/pages/Playbar.vue'
import emitter from '@/emitter';
const {exit, minimize} = window.ymkAPI
const user = useUserStore();
const player = usePlayerStore();
const videoBg = useTemplateRef('videoBg')
const backgroundType = computed(() => {
  if (!config.bg) return 'img'
  if (config.bg.endsWith(".mp4")) return "video"
  else if (config.bg.endsWith(".png") || config.bg.endsWith(".jpg")) return "img"
  else return ""
})

if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "",
    artist: ""
  });
  navigator.mediaSession.setActionHandler("play", () => player.config.status = 'play');
  navigator.mediaSession.setActionHandler("pause", () => player.config.status = 'pause');
  navigator.mediaSession.setActionHandler("seekbackward", (e) => console.log('$seekB', e));
  navigator.mediaSession.setActionHandler("seekforward", (e) => console.log('$seekF', e));
  navigator.mediaSession.setActionHandler("previoustrack", () => emitter.emit('playPrevSong'));
  navigator.mediaSession.setActionHandler("nexttrack", () => emitter.emit('playNextSong'))
}
const runtimeData = useRuntimeDataStore()
const config = useConfigStore()
watch(() => user.neteaseUser.auth, (nv) => {
  document.cookie = nv;
})

import {useUserStore} from "@/stores/modules/user";
import {usePlayerStore} from "@/stores/modules/player";
import {useConfigStore} from "@/stores/modules/config";
import {showContextMenu} from "@/utils/contextMenu";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import router from "@/router";
import {refreshPlaylists} from "@/utils/Toolkit";

refreshPlaylists({notReset: false});

function dropEvent(e: DragEvent) {
  console.log(e)
}
function previewContextMenu(type: string) {
  showContextMenu({
    menuItems: [
      {
        title: "关闭",
        action: (arg) => {
          if (arg === "album") {
            runtimeData.albumPreview = runtimeData.albumPreview = {
              songs: [],
              info: {
                title: "",
                creator: "",
                pic: "",
                intro: '',
              }
            }
          }else if (arg === "artist") {
            runtimeData.artistPreview = {
              songs: [],
              info: {
                name: "",
                description: "",
                pic: "",
                id: ""
              }
            }
          }
          router.push('/playlist')
        }
      }
    ],
    args: type
  })
}
</script>

<style>
body {
    background: rgb(255,255,255);
}
</style>

<style scoped>
.colorSetter {
  text-shadow: var(--ymk-text-shadow-color);
  overflow: hidden;
}
.backgroundFrame {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: -3;
}
.backgroundFrame .mask {
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.backgroundFrame video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.container {
  position: relative;
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
  cursor: pointer;
  font-family: NovecentoWide;
  font-size: 22px;
  margin-left: 24px;
  line-height: 32px;
  color: var(--ymk-color);
  width: 150px;
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