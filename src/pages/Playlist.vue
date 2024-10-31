<template>
<div class="partContainer forbidSelect">
  <simplebar class="simplebar">
    <Transition name="uianim">
      <div class="playlistControllers">
        <button @click="importPlaylist" class="controllerButton import">导入</button>
        <button @click="useZKStore().playlistToolkit.refreshPlaylists({notReset: false})" class="controllerButton import">刷新</button>
        <button @click="showPreviewDialog" class="controllerButton import">预览</button>
        <button @click="testFunc" class="controllerButton test">测试</button>

      </div>
    </Transition>
    <Playlists :from-zks="true" :parts="zks.playlistsParts" :playlists="zks.playlists" :menu-event="PlaylistMenu" />
  </simplebar>
</div>
</template>

<script setup lang='ts'>
import {useZKStore} from '@/stores/useZKstore';
import {storeToRefs} from "pinia";
import emitter from '@/emitter';
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import PreviewDialog from "@/components/Dialogs/PreviewDialog.vue";
import AddSongToDialog from '@/components/Dialogs/addSongToDialog.vue';
import Playlists from "@/components/Playlists.vue";
const {zks} = storeToRefs(useZKStore());
import {neteaseAxios} from "@/utils/axiosInstances";
import type {playlistPart, list, mouseMenuItem} from "@/types";

const {deletePlaylistFile, showImportPlaylistDialog} = window.ymkAPI;
function menu_deletePlaylist() {
  if (zks.value.mouseMenu.args.pi < zks.value.playlistsParts[0].count) {
    let p = zks.value.playlists[zks.value.mouseMenu.args.pi];
    if ('originFilename' in p && p.originFilename.endsWith('json')) {
      deletePlaylistFile(p.originFilename).then(() => {
        useZKStore().showMessage(`删除${p.title}成功`);
        useZKStore().playlistToolkit.refreshPlaylists({notReset: false});
      }).catch(() => {
        useZKStore().showMessage(`删除${p.originFilename}文件失败`);
      })
    }
  }
}
function importPlaylist() {
    showImportPlaylistDialog();
}
function PlaylistMenu(list: list, index: number, part: playlistPart) {
  let menu = <mouseMenuItem[]>[]
  if (part.title === "本地") {
    menu = [{
      title: '添加歌曲',
      action: showAddSongToDialog,
    },{
      title: '删除',
      action: menu_deletePlaylist
    }]
  }
  menu.length && useZKStore().showMouseMenu(menu, {playlist: list, pi: index + part.begin})
}
async function testFunc() {
  neteaseAxios.get('/recommend/resource', {params: {}}).then(res => console.log(res))
}
function showAddSongToDialog() {
  useZKStore().showDialog(AddSongToDialog)
}
function showPreviewDialog() {
  useZKStore().showDialog(PreviewDialog)
}
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