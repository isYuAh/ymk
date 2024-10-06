<template>
<div class="transitionContainer">
    <div @click="router.push('/playlist')" class="returnBtn">
        <svg t="1711457272465" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4244" width="48" height="48"><path d="M963.2 0L1024 67.2 512 614.4 0 67.2 60.8 0 512 480 963.2 0z" fill="currentColor" p-id="4245"></path></svg>
    </div>
    <div class="partContainer">
        <div class="listInfo">
            <div class="faceImg forbidSelect">
                <img :src="zks.playlist.raw.pic" alt="">
            </div>
            <div class="info forbidSelect">
                <div class="top">
                  <div class="title">{{ zks.playlist.raw.title }}</div>
                  <button @click="subscribeToggle" class="subscribeBtn" v-if="zks.playlist.extraInfo.type === 'pureNeteasePlaylist' && zks.playlist.extraInfo.infos.subscribe > 0">{{zks.playlist.extraInfo.infos.subscribe === 1 ? '取消收藏' : '收藏'}}</button>
<!--                  <button @click="console.log(zks.playlist)">{{zks.playlist.extraInfo}}</button>-->
                </div>
                <div class="bottom">
                    <div class="total">TOTAL {{ zks.playlist.songs.length }}</div>
                    <div class="total">{{ zks.playlist.raw.intro || 'AN ALBUM CREATED'}}</div>
                    <button @click="playAll" class="PlayAll">
                        <div class="svgIcon">
                            <svg t="1711448701001" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3437"><path d="M73.142857 0 910.957714 512 73.142857 1024Z" fill="currentColor" p-id="3438"></path></svg>
                        </div>
                        <div class="text">播放全部</div>
                        <div class="fill"></div>
                    </button>
                </div>
            </div>
        </div>
        <div class="tablePartContainer">
          <div class="divider forbidSelect">
            <div class="dividerTip">歌曲列表</div>
            <div class="divideLine"></div>
            <input v-model="filter" class="search" placeholder="搜索" />
          </div>
          <div class="songs">
            <div class="container">
              <simplebar data-auto-hide class="simplebar">
                <div class="songTable forbidSelect">
                  <div
                      @dblclick="playSong_withCheck(ITEM.item)"
                      class="song"
                      :class="{disabled: ITEM.item.type==='netease' && 'playable' in ITEM.item ? !ITEM.item.playable : false}"
                      @contextmenu.prevent="tryShowMenu({song: ITEM.item,si: ITEM.refIndex})"
                      v-for="ITEM in showingSonglist">
                    <div class="songInfo title">{{ ITEM.item.title }}<sub>{{ ITEM.item.type }}</sub></div>
                    <div class="songInfo author">{{ ITEM.item.singer }}</div>
                  </div>
                </div>
              </simplebar>
            </div>
          </div>
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import {type list_data, type list_trace_netease_playlist, type song} from '@/types'
import simplebar from 'simplebar-vue';
import 'simplebar-vue/dist/simplebar.min.css'
import {computed, onMounted, onUnmounted, ref, toRaw, watch} from 'vue';
import { useZKStore } from '@/stores/useZKstore';
import {storeToRefs} from "pinia";
import emitter from '@/emitter';
import '@/assets/songlist.css'
import Fuse from "fuse.js";
import axios from "axios";
import EditSongDialog from "@/components/Dialogs/EditSongDialog.vue";
import {useRouter} from "vue-router";
const router = useRouter();
const {writePlaylistFile} = (window as any).ymkAPI;
const {zks, config, neteaseUser} = storeToRefs(useZKStore());
let filter = ref('');
let FuseVal = ref(new Fuse(zks.value.playlist.songs, {
  keys: ['title', 'singer']
}))
watch(() => zks.value.playlist, (nv) => {
  FuseVal.value = new Fuse(nv.songs, {
    keys: ['title', 'singer']
  })
}, {deep: true})
let showingSonglist = computed(() => {
  if (!filter.value) {
    return zks.value.playlist.songs.map((element, index) => ({item: element, refIndex: index}))
  }else {
    return FuseVal.value.search(filter.value)
  }
})
function tryShowMenu(a: any) {
  if (zks.value.playlist.raw.playlist.length !== 1 || zks.value.playlist.raw.playlist[0].type !== 'data') return
  useZKStore().showMouseMenu([{
    title: '编辑',
    action: menu_edit,
  },{
    title: '删除',
    action: menu_deleteSong,
  }], a)
}
function subscribeToggle() {
  let t = zks.value.playlist.extraInfo.infos.subscribe === 1 ? 2 : 1
  axios.get(`${config.value.neteaseApi.url}playlist/subscribe`, {
    params: {
      timestamp: new Date().getTime(),
      t,
      id: (zks.value.playlist.raw.playlist[0] as list_trace_netease_playlist).id,
      cookie: neteaseUser.value.cookie
    }
  }).then(res => {
    if (res.data.code == 200) {
      zks.value.playlist.extraInfo.infos.subscribe = t;
      useZKStore().showMessage(`${t === 1 ? '' : '取消'}收藏成功`)
    }
  })
}
function playAll() {
    // zks.value.play.mode = 'list';
    zks.value.play.playlist = structuredClone(toRaw(zks.value.playlist.songs))
    if (zks.value.play.playlist[0]) {
        emitter.emit('playSong',{song: zks.value.play.playlist[0]})
    }
}

function menu_edit(arg: any) {
  useZKStore().showDialog(EditSongDialog, {
    song: structuredClone(toRaw(arg.song)),
    si: arg.si
  })
}
function menu_deleteSong(arg: any) {
    if (arg.song && arg.si >= 0) {
        let ser = arg.si + 1;
        let componentIndex = -1;
        let np = zks.value.playlists[zks.value.playlist.listIndex];
        for (let cI = 0; cI < np.playlist.length; cI++) {
            let  c = np.playlist[cI];
            if (c.type === 'data') {
                if (c.songs.length >= ser) {
                    componentIndex = cI
                    break;
                }else {
                    ser -= c.songs.length;
                }
            }
        }
        if (componentIndex >= 0) {
            let originFn = np.originFilename;
            (np.playlist[componentIndex] as list_data).songs.splice(ser - 1, 1);
            zks.value.playlist.songs.splice(arg.si, 1);
            writePlaylistFile(originFn, JSON.stringify(toRaw(np))).then(() => {
                useZKStore().showMessage('删除成功');
            }).catch(() => {
                useZKStore().showMessage(`写入文件${originFn}失败`);
            })
            
        }
    }
}
function playSong_withCheck(song: song) {
    if (zks.value.play.playlist.length) {
        emitter.emit('playSong',{song})
    }else {
        zks.value.play.playlist = structuredClone(toRaw(zks.value.playlist.songs))
        emitter.emit('playSong',{song})
    }
}
function collectPlaylist() {
  let id = zks.value.playlist.raw.title;
  // if (zks.value.playlist.raw.playlist[0].type === 'trace_netease_playlist') {
  //
  // }
  writePlaylistFile(`${id}.json`, JSON.stringify({
    title: zks.value.playlist.raw.title,
    pic: zks.value.playlist.raw.pic,
    intro: zks.value.playlist.raw.intro,
    playlist: zks.value.playlist.raw.playlist,
  })).then(() => {
    useZKStore().showMessage('收藏成功');
    emitter.emit('refreshPlaylists', {notReset: true});
  }).catch(() => {
    useZKStore().showMessage(`写入文件${id}.json失败`);
  });
}

</script>


<style scoped>
.returnBtn {
    width: 24px;
    color: var(--ymk-color);
    height: 24px;
    position: absolute;
    top:15px;
    right:30px;
    transition: all .25s;
}
.returnBtn svg {
    height: 100%;
    width: 100%;
}
.partContainer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.listInfo {
    display: flex;
    padding: 15px;
}
.listInfo .faceImg {
    width: 200px;
    height: 200px;
    margin-right: 20px;
    box-shadow: 0 0 5px rgba(0, 0, 0, .5)
}
.listInfo .faceImg img {
    object-fit: cover;
    width: 100%;
    height: 100%;
}
.listInfo .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0;
}
.listInfo .info .title {
    font-family: SourceSansCNM;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 20px;
    color: var(--ymk-text-color);
    text-shadow: 0 0 5px rgba(0, 0, 0, .2);
    /* letter-spacing: 1px; */
}
.listInfo .info .total {
    margin-top: 2px;
    /* margin-left: 5px; */
    color: var(--ymk-text-color);
    font-size: 18px;
    font-weight: bold;
    font-family: NovecentoWide;
}
.listInfo .info .collectPlaylist {
  cursor: pointer;
  background-color: #18191C;
  display: inline-block;
  color: #fff;
  padding: 0 15px;
  height: 35px;
  line-height: 35px;
}
.listInfo .info .bottom .PlayAll {
    position: relative;
    display: flex;
    outline: none;
    border: none;
    width: 100%;
    background-color: transparent;
    padding: 0;
    margin-top: 10px;
    font-family: SourceHanSansCNM;
    font-weight: bold;
    height: 32px;
    text-align: left;
    transition: all .15s;
    color: var(--ymk-text-color);
}
.listInfo .info .bottom .PlayAll .text {
    line-height: 32px;
    font-size: 18px;
    margin-left: 10px;
}
.listInfo .info .bottom .PlayAll .svgIcon, .listInfo .info .bottom .PlayAll .svgIcon svg {
    height: 32px;
    width: 32px
}
.listInfo .info .bottom .PlayAll .fill {
    transition: all .3s ease-in-out;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
    width: 0;
    background-color: rgba(0,0,0,.3);
}
.listInfo .info .bottom .PlayAll:hover {
    color: #fff;
}
.listInfo .info .bottom .PlayAll:hover .fill {
    width: calc(100% - 20px);
}
.tablePartContainer {
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 4px var(--ymk-container-bg-color);
  /*backdrop-filter: blur(2px);*/
  background-color: var(--ymk-container-bg-color);
  min-height: 100%;
}
.divider {
    display: flex;
    width: 100%;
    align-items: center;
    padding: 15px;
}
.divider .dividerTip {
    margin-right: 10px;
    font-family: HarmonyOS SC;
    font-weight: bold;
    color: var(--ymk-text-color);
}
.divider .search {
    background-color: transparent;
    margin: 0 5px;
    font-family: SourceSansCNM;
    border: none;
    color: var(--ymk-text-color);
    border-bottom: 2px solid var(--ymk-text-color);
    padding-bottom: 5px;
}
.divideLine {
    height: 1px;
    flex: 1;
    background-color: #e2e3e5;
}
.transitionContainer {
    width: 100%;
    height: 100%;
}
.songTable .song.disabled {
  color: #aaa
}
.songTable .song {
    grid-template-columns: 12fr 10fr;
}

.subscribeBtn {
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  min-width: 60px;
  outline: none;
  padding: 0 10px;
  background-color: rgba(0,0,0,.6);
  color: var(--ymk-text-color);
  border: 1px solid #18191C;
}
</style>