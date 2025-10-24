<template>
<div class="transitionContainer">
    <div @click="router.push('/playlist')" class="returnBtn">
        <svg t="1711457272465" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4244" width="48" height="48"><path d="M963.2 0L1024 67.2 512 614.4 0 67.2 60.8 0 512 480 963.2 0z" fill="currentColor" p-id="4245"></path></svg>
    </div>
    <div class="partContainer DEF-SONGLIST">
        <div class="listInfo">
            <div class="faceImg forbidSelect">
                <img :src="runtimeData.playlist.raw.pic" alt="">
            </div>
            <div class="info forbidSelect">
                <div class="top">
                  <div class="title">{{ runtimeData.playlist.raw.title }}</div>
                  <button @click="subscribeToggle" class="subscribeBtn" v-if="runtimeData.playlist.extraInfo.type === 'pureNeteasePlaylist' && runtimeData.playlist.extraInfo.infos.subscribe > 0">{{runtimeData.playlist.extraInfo.infos.subscribe === 1 ? '取消收藏' : '收藏'}}</button>
<!--                  <button @click="console.log(runtimeData.playlist)">{{runtimeData.playlist.extraInfo}}</button>-->
                </div>
                <div class="bottom">
                    <div class="total">TOTAL {{ runtimeData.playlist.songs.length }}</div>
                    <div class="intro">{{ runtimeData.playlist.raw.intro || 'AN ALBUM CREATED'}}</div>
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
<!--              <simplebar data-auto-hide class="simplebar">-->
<!--                <div class="songTable forbidSelect">-->
<!--                  <div-->
<!--                      @dblclick="playSong_withCheck(ITEM.item)"-->
<!--                      class="song"-->
<!--                      :class="{disabled: ITEM.item.type==='netease' && 'playable' in ITEM.item ? !ITEM.item.playable : false}"-->
<!--                      @contextmenu.prevent="tryShowMenu({song: ITEM.item,si: ITEM.refIndex})"-->
<!--                      v-for="ITEM in showingSonglist">-->
<!--                    <div class="songInfo title">{{ ITEM.item.title }}<sub>{{ ITEM.item.type }}</sub></div>-->
<!--                    <div class="songInfo author">{{ ITEM.item.singer }}</div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </simplebar>-->
              <VirtualList :item-height="38" :items="showingSonglist" :size="8" v-slot="{item: ITEM}" class-name="songTable">
                <div
                    @dblclick="playSong_withCheck(ITEM.item)"
                    class="song"
                    :class="{disabled: (ITEM.item.type==='netease' && 'playable' in ITEM.item) ? !ITEM.item.playable : false}"
                    @contextmenu.prevent="tryShowMenu({song: ITEM.item,si: ITEM.refIndex})">
                  <div class="songInfo title">{{ ITEM.item.title }}<sub>{{ ITEM.item.type }}</sub></div>
                  <div class="songInfo author">{{ ITEM.item.singer }}</div>
                </div>
              </VirtualList>
            </div>
          </div>
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import type {list_data, list_trace_netease_playlist} from '@/types'
import type {song} from '@/types/song'
import {computed, nextTick, ref, toRaw, watch} from 'vue';
import emitter from '@/emitter';
import '@/assets/songlist.css'
import Fuse from "fuse.js";
import EditSongDialog from "@/components/Dialogs/EditSongDialog.vue";
import {useRouter} from "vue-router";
import {neteaseAxios} from "@/utils/axiosInstances";
import VirtualList from "@/components/VirtualList.vue";
import {showContextMenu} from "@/utils/contextMenu";
import {usePlayerStore} from "@/stores/modules/player";
import {showMessage} from "@/utils/message";
import {showDialog} from "@/utils/dialog";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {refreshPlaylists} from "@/utils/Toolkit";
import { pinyin } from 'pinyin-pro';
const router = useRouter();
const {writePlaylistFile} = window.ymkAPI;
const runtimeData = useRuntimeDataStore()
const player = usePlayerStore()
let filter = ref('');

const songsWithPinyin = computed(() => {
  return runtimeData.playlist.songs.map(song => {
    const titlePinyinFull = pinyin(song.title || '', { toneType: 'none', type: 'array' }).join('');
    const singerPinyinFull = pinyin(song.singer || '', { toneType: 'none', type: 'array' }).join('');
    const titlePinyinInitial = pinyin(song.title || '', { toneType: 'none', type: 'array', pattern: 'initial' }).join('');
    const singerPinyinInitial = pinyin(song.singer || '', { toneType: 'none', type: 'array', pattern: 'initial' }).join('');
    
    return {
      ...song,
      titlePinyin: titlePinyinFull,
      singerPinyin: singerPinyinFull,
      titlePinyinInitial: titlePinyinInitial,
      singerPinyinInitial: singerPinyinInitial
    };
  });
});

let FuseVal = ref(new Fuse(songsWithPinyin.value, {
  keys: ['title', 'singer', 'titlePinyin', 'singerPinyin', 'titlePinyinInitial', 'singerPinyinInitial'],
  threshold: 0.3
}))

watch(() => runtimeData.playlist, (nv) => {
  FuseVal.value = new Fuse(songsWithPinyin.value, {
    keys: ['title', 'singer', 'titlePinyin', 'singerPinyin', 'titlePinyinInitial', 'singerPinyinInitial'],
    threshold: 0.3
  })
}, {deep: true})
let showingSonglist = computed(() => {
  nextTick(() => emitter.emit('virtualList-refresh'))
  if (!filter.value) {
    return runtimeData.playlist.songs.map((element, index) => ({item: element, refIndex: index}))
  } else {
    // 使用拼音搜索
    const searchResults = FuseVal.value.search(filter.value);
    // 将搜索结果映射回原始歌曲列表
    return searchResults.map(result => {
      const originalIndex = runtimeData.playlist.songs.findIndex(song => 
        song.title === result.item.title && song.singer === result.item.singer
      );
      return {
        item: runtimeData.playlist.songs[originalIndex],
        refIndex: originalIndex
      };
    });
  }
})
function tryShowMenu(a: any) {
  if (runtimeData.playlist.raw.playlist.length !== 1 || runtimeData.playlist.raw.playlist[0].type !== 'data') return
  showContextMenu({
    menuItems: [{
      title: '编辑',
      action: menu_edit,
    }, {
      title: '删除',
      action: menu_deleteSong,
    }],
    args: a
  })
}
function subscribeToggle() {
  let t = runtimeData.playlist.extraInfo.infos.subscribe === 1 ? 2 : 1
  neteaseAxios.get(`/playlist/subscribe`, {
    params: {
      timestamp: new Date().getTime(),
      t,
      id: (runtimeData.playlist.raw.playlist[0] as list_trace_netease_playlist).id,
    }
  }).then(res => {
    if (res.data.code == 200) {
      runtimeData.playlist.extraInfo.infos.subscribe = t;
      showMessage(`${t === 1 ? '' : '取消'}收藏成功`)
    }
  })
}
function playAll() {
  player.playlist = structuredClone(toRaw(runtimeData.playlist.songs))
  if (!player.playlist.length) {
    return;
  }
  if (player.config.mode === 'rand') {
    emitter.emit('playSong', {song: player.playlist[Math.floor(Math.random() * (player.playlist.length))]})
  }else {
    emitter.emit('playSong',{song: player.playlist[0]})
  }
}

function menu_edit(arg: any) {
  showDialog(EditSongDialog, {
    song: structuredClone(toRaw(arg.song)),
    si: arg.si
  })
}
function menu_deleteSong(arg: any) {
    if (arg.song && arg.si >= 0) {
        let ser = arg.si + 1;
        let componentIndex = -1;
        let np = runtimeData.playlists[runtimeData.playlist.listIndex];
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
            runtimeData.playlist.songs.splice(arg.si, 1);
            writePlaylistFile(originFn, JSON.stringify(toRaw(np))).then(() => {
                showMessage('删除成功');
            }).catch(() => {
                showMessage(`写入文件${originFn}失败`);
            })
            
        }
    }
}
function playSong_withCheck(song: song) {
    if (player.playlist.length) {
        emitter.emit('playSong',{song})
    }else {
        player.playlist = structuredClone(toRaw(runtimeData.playlist.songs))
        emitter.emit('playSong',{song})
    }
}
function collectPlaylist() {
  let id = runtimeData.playlist.raw.title;
  // if (runtimeData.playlist.raw.playlist[0].type === 'trace_netease_playlist') {
  //
  // }
  writePlaylistFile(`${id}.json`, JSON.stringify({
    title: runtimeData.playlist.raw.title,
    pic: runtimeData.playlist.raw.pic,
    intro: runtimeData.playlist.raw.intro,
    playlist: runtimeData.playlist.raw.playlist,
  })).then(() => {
    showMessage('收藏成功');
    refreshPlaylists({notReset: true});
  }).catch(() => {
    showMessage(`写入文件${id}.json失败`);
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
.listInfo .info .total, .listInfo .info .intro {
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
  flex: 1;
  min-height: 0;
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
    background-color: transparent;
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

.container.scrollable {
  overflow-y: auto
}

.listInfo .info .intro {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.listInfo .info .bottom {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

</style>