<template>
<div class="partContainer forbidSelect">
  <simplebar class="simplebar">
    <Transition name="uianim">
      <div v-if="zks.nowTab === 'Playlist'" class="playlistControllers">
        <button @click="importPlaylist" class="controllerButton import">导入</button>
        <button @click="emitter.emit('refreshPlaylists', {notReset: false})" class="controllerButton import">刷新</button>
        <button @click="showPreviewDialog" class="controllerButton import">预览</button>
        <button @click="testFunc" class="controllerButton test">测试</button>
      </div>
    </Transition>
    <div
        v-show="PartVShow[index]"
        v-for="(p, index) in zks.playlistsParts" class="playlistPart">
      <div class="divideTitle">{{p.title}}</div>
      <div class="lists">
        <div @contextmenu.prevent="useZKStore().showMouseMenu([{
            title: '添加歌曲',
            action: showAddSongToDialog,
          },{
            title: '删除',
            action: menu_deletePlaylist
          }], {playlist: list, pi: index + p.begin})" @click="checkDetail(index + p.begin)" v-for="(list, index) in zks.playlists.slice(p.begin, p.begin + p.count)" class="item">
          <TargetBorder>
            <div class="img">
              <img referrerpolicy="no-referrer" :src="list.pic" alt="">
            </div>
          </TargetBorder>
          <div class="title">{{ list.title }}</div>
        </div>
      </div>
    </div>
  </simplebar>
</div>
</template>

<script setup lang='ts'>
import {useZKStore} from '@/stores/useZKstore';
import {computed, toRaw} from 'vue';
import {storeToRefs} from "pinia";
import TargetBorder from '../components/TargetBorder.vue'
//@ts-ignore
import emitter from '@/emitter';
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import PreviewDialog from "@/components/Dialogs/PreviewDialog.vue";
import AddSongToDialog from '@/components/Dialogs/addSongToDialog.vue';

const {deletePlaylistFile, showImportPlaylistDialog} = (window as any).ymkAPI;
const {zks} = storeToRefs(useZKStore());
const {checkDetail} = useZKStore().playlistToolkit
let PartVShow = computed(() => {
  let r = <boolean[]>[];
  if (zks.value.nowTab === 'Playlist') {
    zks.value.playlistsParts.forEach((p, index) => {
      if ('other' in p && 'showInMainPage' in p.other) {
        r[index] = p.other.showInMainPage
      }else {
        r[index] = true;
      }
    })
  }else if (zks.value.nowTab === 'PlaylistRecommend_netease') {
    zks.value.playlistsParts.forEach((p, index) => {
      if ('other' in p && 'type' in p.other) {
        r[index] = p.other.type === 'recommend_netease'
      }else {
        r[index] = false;
      }
    })
  }
  return r;
})
function menu_deletePlaylist() {
  if (zks.value.mouseMenu.args.pi < zks.value.playlistsParts[0].count) {
    let p = zks.value.playlists[zks.value.mouseMenu.args.pi];
    if (p.originFilename.endsWith('json')) {
      deletePlaylistFile(p.originFilename).then(() => {
        useZKStore().showMessage(`删除${p.title}成功`);
        emitter.emit('refreshPlaylists',{notReset: false});
      }).catch(() => {
        useZKStore().showMessage(`删除${p.originFilename}文件失败`);
      })
    }
  }
}
function importPlaylist() {
    showImportPlaylistDialog();
}
function testFunc() {
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
.partContainer .lists {
    flex: 1;
    display: grid;
    padding: 0 20px;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(182px, 1fr));
    justify-content: center;
    grid-auto-rows: 1fr;
}
.item {
    width: 100%;
    cursor: pointer;
}
.item .img {
    border-radius: 2px;
    overflow: hidden;
    width: 162px;
    height: 162px;
    /* box-shadow: 0 0 5px rgba(0, 0, 0, .5) */
}
.item .img img {
    width: 162px;
    height: 162px;
    object-fit: cover;
    box-shadow: 0 0 4px rgba(0, 0, 0, .4);
    transition: transform .2s ease-in-out;
}
.item .title {
    font-family: SourceSansCNM;
    letter-spacing: 1px;
    /* color: #333;
    text-shadow: 0 0 5px rgba(0, 0, 0, .2); */
    text-shadow: 0 0 4px rgba(0, 0, 0, .6);
    color: var(--ymk-text-color);
    margin-top: 5px;
    font-weight: bold;
    font-size: 20px;
    text-align: center;
    line-height: 32px;
}
.item:hover .img img {
    transform: scale(1.03);
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
.divideTitle {
  color: var(--ymk-text-color);
  margin: 20px;
  font-size: 24px;
  font-family: PingFang SC;

}
.simplebar {
  height: 100%;
}
</style>