<template>
<div class="partContainer forbidSelect">
  <simplebar class="simplebar">
    <Transition name="uianim">
      <div class="playlistControllers">
        <button @click="importPlaylist" class="controllerButton import">导入</button>
        <button @click="refreshPlaylists({notReset: false})" class="controllerButton import">刷新</button>
        <button @click="showPreviewDialog" class="controllerButton import">预览</button>
        <button @click="uploadPlaylists" class="controllerButton sync">同步</button>
        <button @click="testFunc" class="controllerButton test">测试</button>
        <button @click="testFunc2" class="controllerButton test">测试2</button>

      </div>
    </Transition>
    <Playlists :from-zks="true" :parts="runtimeData.playlistsParts" :playlists="runtimeData.playlists" :menu-event="PlaylistMenu" />
  </simplebar>
</div>
</template>

<script setup lang='ts'>
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import PreviewDialog from "@/components/Dialogs/PreviewDialog.vue";
import Playlists from "@/components/Playlists.vue";
const runtimeData = useRuntimeDataStore()
import type {playlistPart, list, mouseMenuItem} from "@/types";
import {toRaw} from "vue";
import axios from "axios";
import {showContextMenu} from "@/utils/contextMenu";
import {showMessage} from "@/utils/message";
import {showDialog} from "@/utils/dialog";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {refreshPlaylists} from "@/utils/Toolkit";

const {deletePlaylistFile, showImportPlaylistDialog} = window.ymkAPI;
function menu_deletePlaylist({pi, playlist}: {pi: number, playlist: list}) {
  if (pi < runtimeData.playlistsParts[0].count) {
    let p = runtimeData.playlists[pi];
    if ('originFilename' in p && p.originFilename.endsWith('json')) {
      deletePlaylistFile(p.originFilename).then(() => {
        showMessage(`删除${p.title}成功`);
        refreshPlaylists({notReset: false});
      }).catch(() => {
        showMessage(`删除${p.originFilename}文件失败`);
      })
    }
  }
}
function importPlaylist() {
    showImportPlaylistDialog();
}
function PlaylistMenu(list: list, index: number, part: playlistPart) {
  let menu = <mouseMenuItem[]>[]
  if (part.type !== "init") return;
  if (part.title === "本地") {
    menu = [{
      title: '添加歌曲',
      action: showAddSongToDialog,
    },{
      title: '删除',
      action: menu_deletePlaylist
    }]
  }else if (part.title === "网易云") {

  }
  // useZKStore().showMouseMenu(menu, {playlist: list, pi: index + part.begin})
  showContextMenu({
    menuItems: menu,
    args: {playlist: list, pi: index + part.begin}
  })

}
async function uploadPlaylists() {
  axios.post("http://suonan.xyz:2389/User/SignIn", {
    id: "isyuah",
    password: "icfi666"
  }).then(res => {
    console.log(res)
    let waitToUpload = structuredClone(toRaw(runtimeData.playlists).slice(0, runtimeData.playlistsParts[0].count));
    axios.post("http://suonan.xyz:2389/Playlist/Uploads", waitToUpload, {
      headers: {
        Token: res.headers.token
      }
    }).then(response => {
      console.log(response)
    })
  })
}
async function testFunc() {
  axios.post('http://suonan.xyz:2389/User/SignIn', {
    id: "isyuah",
    password: "icfi666"
  })
  // kugouAxios.post('/user/playlist').then((res) => {
  //   console.log(res)
  //   if ('status' in res.data && res.data.status === 1) {
  //     const data = res.data.data;
  //
  //   }
  // })
}
async function testFunc2() {
  showDialog(PreviewDialog)
}
function showAddSongToDialog() {
  // useZKStore().showDialog(AddSongToDialog)
}
function showPreviewDialog() {
  // useZKStore().showDialog(PreviewDialog)
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