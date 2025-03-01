<template>
<div class="transitionContainer">
    <div @click="router.push('/search')" class="returnBtn">
        <svg t="1711457272465" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4244" width="48" height="48"><path d="M963.2 0L1024 67.2 512 614.4 0 67.2 60.8 0 512 480 963.2 0z" fill="currentColor" p-id="4245"></path></svg>
    </div>
    <div class="partContainer">
        <div class="listInfo">
            <div class="faceImg forbidSelect">
                <img :src="runtimeData.artistPreview.info.pic" alt="">
            </div>
            <div class="info forbidSelect">
                <div class="top">
                  <div class="title">{{ runtimeData.artistPreview.info.name }}</div>
                </div>
                <div class="bottom">
                    <div class="total">TOTAL {{ runtimeData.artistPreview.songs.length }}</div>
                    <div class="intro">{{ runtimeData.artistPreview.info.description || 'AN ARTIST' }}</div>
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
              <VirtualList :item-height="38" :items="showingSonglist" :size="8" v-slot="{item: ITEM}" class-name="songTable">
                <div
                    @dblclick="playSong_withCheck(ITEM.item)"
                    class="song"
                    @contextmenu.prevent="tryShowMenu({song: ITEM.item,si: ITEM.refIndex})">
                  <div class="songInfo title">{{ ITEM.item.title }}<sub>{{ ITEM.item.type }}</sub></div>
                  <div class="songInfo author">{{ ITEM.item.singer }}</div>
                </div>
              </VirtualList>
            </div>
          </div>
          <div v-if="hasMore" class="loadMore forbidSelect">
            <button @click="loadMore" :disabled="loading" class="loadMoreBtn">
              {{ loading ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import {type song} from '@/types'
import {computed, ref, toRaw, watch} from 'vue';
import emitter from '@/emitter';
import '@/assets/songlist.css'
import Fuse from "fuse.js";
import {useRouter} from "vue-router";
import VirtualList from "@/components/VirtualList.vue";
import {showContextMenu} from "@/utils/contextMenu";
import {usePlayerStore} from "@/stores/modules/player";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {neteaseAxios} from "@/utils/axiosInstances";

const router = useRouter();
const runtimeData = useRuntimeDataStore()
const player = usePlayerStore()
let filter = ref('');
let loading = ref(false);
let hasMore = ref(false);
let offset = ref(0);

let FuseVal = ref(new Fuse(runtimeData.artistPreview.songs, {
  keys: ['title', 'singer']
}))

watch(() => runtimeData.artistPreview, (nv) => {
  FuseVal.value = new Fuse(nv.songs, {
    keys: ['title', 'singer']
  })
}, {deep: true})

let showingSonglist = computed(() => {
  if (!filter.value) {
    return runtimeData.artistPreview.songs.map((element, index) => ({item: element, refIndex: index}))
  }else {
    return FuseVal.value.search(filter.value)
  }
})

async function loadMore() {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const artistId = runtimeData.artistPreview.info.id
    if (!artistId) return

    const songs = await neteaseAxios.get(`/artist/songs?id=${artistId}&limit=30&offset=${offset.value + 30}`)
    if (songs.data.code !== 200) return

    const newSongs = songs.data.songs.map((song: any) => ({
      type: 'netease',
      title: song.name,
      id: song.id,
      singer: song.ar.map((ar: any) => ar.name).join(' & '),
      playable: true
    }))

    runtimeData.artistPreview.songs.push(...newSongs)
    offset.value += 30
    hasMore.value = songs.data.more
  } catch (error) {
    console.error('加载更多歌曲失败:', error)
  } finally {
    loading.value = false
  }
}

function tryShowMenu(a: any) {
  showContextMenu({
    menuItems: [{
      title: '收藏',
      action: () => {},
    }],
    args: a
  })
}

function playAll() {
    player.playlist = structuredClone(toRaw(runtimeData.artistPreview.songs))
    if (player.playlist[0]) {
        emitter.emit('playSong',{song: player.playlist[0]})
    }
}

function playSong_withCheck(song: song) {
    if (player.playlist.length) {
        emitter.emit('playSong',{song})
    }else {
        player.playlist = structuredClone(toRaw(runtimeData.artistPreview.songs))
        emitter.emit('playSong',{song})
    }
}
</script>

<style scoped>
.transitionContainer {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

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
    max-height: 230px;
}
.listInfo .faceImg {
    width: 200px;
    height: 200px;
    margin-right: 20px;
}
.listInfo .faceImg img {
    border-radius: 50%;
    object-fit: cover;
    width: 100%;
    height: 100%;
    box-shadow: 0 0 5px rgba(0, 0, 0, .5)
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
.listInfo .info .collectPlaylist {
  cursor: pointer;
  background-color: #18191C;
  display: inline-block;
  color: #fff;
  padding: 0 15px;
  height: 35px;
  line-height: 35px;
}
.listInfo .info .bottom {
  display: flex;
  flex-direction: column;
  min-height: 0;
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

.container.scrollable {
  overflow-y: auto
}
</style> 