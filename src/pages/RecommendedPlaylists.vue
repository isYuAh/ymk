<template>
  <div class="partContainer forbidSelect">
    <simplebar class="simplebar">
      <Transition name="uianim">
        <div class="playlistControllers">
          <button @click="refresh" class="controllerButton import">刷新</button>
        </div>
      </Transition>
      <Playlists :from-zks="false" :parts="parts" :playlists="playlists" />
    </simplebar>
  </div>
</template>

<script setup lang='ts'>
import {useZKStore} from '@/stores/useZKstore';
import {storeToRefs} from "pinia";
//@ts-ignore
import emitter from '@/emitter';
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import Playlists from "@/components/Playlists.vue";
import type {list, playlistPart} from "@/types";
import axios from "axios";
import {ref} from "vue";
import {neteaseAxios} from "@/utils/axiosInstances";

const {deletePlaylistFile, showImportPlaylistDialog} = (window as any).ymkAPI;
const {config} = storeToRefs(useZKStore());

const parts = ref<playlistPart[]>([]);
const playlists = ref<list[]>([]);

function refresh() {
  neteaseAxios.get(`/personalized`).then(res => {
    playlists.value = res.data.result.map((playlist: any) => ({
      title: playlist.name,
      pic: playlist.picUrl,
      intro: 'NETEASE RECOMMEND',
      originFilename: 'REMOTE',
      playlist: [{
        type: 'trace_netease_playlist',
        id: playlist.id
      }]
    }))
    parts.value = [{
      title: '网易云推荐',
      begin: 0,
      count: playlists.value.length
    }]
  })
}
refresh();
</script>

<style scoped>
.partContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.partContainer .playlistControllers {
  padding: 10px 20px 0;
}

.controllerButton {
  cursor: pointer;
  font-family: FZTYSJ;
  font-size: 22px;
  background-color: rgba(0, 0, 0, .9);
  box-shadow: 0 0 7px rgba(0, 0, 0, .3);
  border: none;
  color: #fff;
  padding: 5px 10px;
  margin: 0 10px;
  transition: all .25s;
}
.controllerButton:hover {
  box-shadow: 0 0 7px rgba(0, 0, 0, .6);
}

.simplebar {
  height: 100%;
}
</style>