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
    <button @click="playDailyRecommend" v-if="user.isLogin.netease" class="floatingButton">每日推荐</button>
    <Playlists :from-zks="true" :parts="runtimeData.playlistsParts" :playlists="runtimeData.playlists" :menu-event="PlaylistMenu"/>
  </simplebar>
</div>
</template>

<script setup lang='ts'>
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import PreviewDialog from "@/components/Dialogs/PreviewDialog.vue";
import Playlists from "@/components/Playlists.vue";
const runtimeData = useRuntimeDataStore()
const user = useUserStore()
import type {playlistPart, list, mouseMenuItem, song} from "@/types";
import {toRaw} from "vue";
import axios from "axios";
import {showContextMenu} from "@/utils/contextMenu";
import {showMessage} from "@/utils/message";
import {showDialog} from "@/utils/dialog";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {refreshPlaylists} from "@/utils/Toolkit";
import AddSongToDialog from "@/components/Dialogs/addSongToDialog.vue";
import { neteaseAxios } from "@/utils/axiosInstances";
import { usePlayerStore } from "@/stores/modules/player";
import emitter from '@/emitter';
import { useUserStore } from "@/stores/modules/user";
import ChangePlaylistFace from "@/components/Dialogs/ChangePlaylistFace.vue";

const {deletePlaylistFile, showImportPlaylistDialog} = window.ymkAPI;
function menu_deletePlaylist({pi}: {pi: number, playlist: list}) {
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
      action: () => showAddSongToDialog({pi: index + part.begin}),
    },{
      title: '修改封面',
      action: () => showChangePlaylistFaceDialog(index + part.begin),
    },{
      title: '删除',
      action: menu_deletePlaylist
    }]
  }else if (part.title === "网易云") {

  }
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
  neteaseAxios.post('/recommend/resource').then((res) => {
    console.log(res)
  })
}
async function testFunc2() {
  neteaseAxios.post('/recommend/songs').then((res) => {
    console.log(res)
  })
}
function showAddSongToDialog(data: any) {
  showDialog(AddSongToDialog, data)
}
function showPreviewDialog() {
  showDialog(PreviewDialog)
}
function showChangePlaylistFaceDialog(targetIndex: number) {
  showDialog(ChangePlaylistFace, {targetPlaylistIndex: targetIndex})
}

const player = usePlayerStore()

function playDailyRecommend() {
  neteaseAxios.post('/recommend/songs').then((res) => {
    const recommendedSongs: song[] = res.data.data.dailySongs.map((song: any) => ({
      id: song.id,
      title: song.name,
      singer: song.ar.map((ar: any) => ar.name).join(' & '),
      pic: song.al.picUrl,
      type: 'netease',
    }))
    player.playlist = structuredClone(recommendedSongs)
    if (!player.playlist.length) {
      return;
    }
    if (player.config.mode === 'rand') {
      emitter.emit('playSong', {song: player.playlist[Math.floor(Math.random() * (player.playlist.length))]})
    } else {
      emitter.emit('playSong', {song: player.playlist[0]})
    }
  })
  
}
</script>

<style scoped>
.partContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
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

.floatingButton {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, .15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 4px;
  font-family: PingFang SC;
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.floatingButton:hover {
  background-color: rgba(255, 255, 255, .25);
  border-color: rgba(255, 255, 255, .3);
}

.floatingButton:active {
  background-color: rgba(255, 255, 255, .2);
  border-color: rgba(255, 255, 255, .25);
}
</style>