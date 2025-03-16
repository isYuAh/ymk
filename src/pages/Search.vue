<template>
<div class="partContainer DEF-SONGLIST">
    <div class="searchBar">
        <div class="searchInputContainer">
            <input
            @focus="showSuggestBar = true"
            @keydown.enter="search()"
            @keydown.up.prevent="lastSuggest"
            @keydown.down.prevent="nextSuggest"
            @input="refreshSuggests"
            ref="searchInput" type="text" placeholder="搜索" />
            <div class="sourceSelector" @click="showSourceMenu = !showSourceMenu">
                <span>{{sourceMap[source]}}</span>
                <span class="arrow" :class="{down: showSourceMenu}">></span>
                <div class="sourceMenu" v-show="showSourceMenu">
                    <div 
                        v-for="(name, key) in sourceMap" 
                        :key="key"
                        @click="source = key"
                        class="sourceItem"
                        :class="{active: source === key}"
                    >
                        {{name}}
                    </div>
                </div>
            </div>
            <div @click="search()" class="searchButton">
                <svg t="1711784197878" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4252" width="48" height="48"><path d="M454.198549 856.251462c-53.599755 0-105.60827-10.503215-154.582681-31.216979-47.291073-20.00359-89.75828-48.632627-126.219703-85.095074-36.462446-36.462446-65.092507-78.929654-85.095073-126.220726-20.714787-48.974411-31.216979-100.983949-31.216979-154.583705s10.503215-105.60827 31.218002-154.58268c20.002566-47.291073 48.632627-89.757257 85.095074-126.219703 36.462446-36.462446 78.92863-65.092507 126.219703-85.095074C348.59028 72.522734 400.599817 62.019519 454.198549 62.019519s105.60827 10.503215 154.581658 31.218002c47.291073 20.002566 89.75828 48.632627 126.220726 85.095074 36.462446 36.462446 65.091484 78.92863 85.095074 126.219703 20.713764 48.974411 31.216979 100.983949 31.216979 154.58268 0 102.939487-39.223327 200.536292-110.446462 274.812973-9.487072 9.896394-25.200962 10.223852-35.094286 0.736781-9.894348-9.488095-10.223852-25.199938-0.73678-35.094286 62.317301-64.98813 96.635921-150.383032 96.635921-240.455468 0-191.597713-155.87614-347.473853-347.47283-347.473852s-347.472829 155.87614-347.472829 347.473852S262.60186 806.608831 454.198549 806.608831c32.573883 0 64.808028-4.497431 95.808067-13.369495 13.178137-3.765767 26.921139 3.854794 30.692022 17.033955 3.771907 13.179161-3.854794 26.920116-17.033955 30.692023-35.443233 10.143011-72.272024 15.286148-109.466134 15.286148z" fill="currentColor" p-id="4253"></path><path d="M937.143816 960.063829a24.740474 24.740474 0 0 1-17.725709-7.444553l-214.193337-218.475873c-9.596566-9.788947-9.442046-25.50386 0.3469-35.100426 9.78997-9.598612 25.504884-9.441023 35.100426 0.346901l214.193337 218.475873c9.596566 9.788947 9.442046 25.50386-0.346901 35.100426a24.742521 24.742521 0 0 1-17.374716 7.097652z" fill="currentColor" p-id="4254"></path></svg>
            </div>
            <div v-show="showSuggestBar && searchInput!.value" class="suggestBar">
                <div
                @click="acceptSuggest(suggest)"
                v-for="(suggest, index) in suggests" :class="{suggest:true, active: suggestSelected === index}">{{ suggest }}</div>
            </div>
        </div>
    </div>
    <Transition name="cube">
      <div class="searchResult" v-show="tmpSearchVal !== ''">
          <div class="songs searchResultPart OverScrollBehavior-Contain" style="grid-column: span 17">
            <Transition name="cube">
              <div v-show="!songLoading" class="container">
                <simplebar data-auto-hide class="simplebar">
                  <div class="searchResultSongTable forbidSelect">
                    <div
                        @dblclick="tryPlaySong(song as SongTypes.netease)"
                        class="song"
                        :class="{disabled: 'playable' in song && !song.playable}"
                        v-for="(song, index) in resultSongList"
                        @contextmenu="tryShowSongMenu(song)"
                    >
                      <div class="songInfo songIndex">{{index+1}}</div>
                      <div class="songInfo songTitle singleLineTextEl">{{ song.title }}</div>
                      <div class="songInfo songSinger singleLineTextEl">{{ song.singer }}</div>
                    </div>
                  </div>
                </simplebar>
              </div>
            </Transition>
            <Transition name="cube">
              <Pagination v-show="!paginationLoading" @change-page="changePage" :total="total" v-model:group="nowGroup" v-model="nowPage" class="pagination forbidSelect"></Pagination>
            </Transition>
          </div>
        <Transition name="cube">
          <div class="searchResultPart forbidSelect albums" style="grid-column: span 7">
            <div class="header">
              专辑
            </div>
            <Transition name="cube">
              <div v-show="!albumLoading" class="main">
                <div class="albumItem" @click="checkAlbum(album.id)" v-for="album in resultAlbumList">
                  <div class="pic">
                    <img :src="album.coverUrl" alt="">
                  </div>
                  <div class="info singleLineTextEl">
                    <div class="title singleLineTextEl">{{album.name}}</div>
                    <div class="intro singleLineTextEl">{{album.artist.name}} <span style="color: #ccc">共{{album.songCount}}首</span></div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
        <Transition name="cube">
          <div class="searchResultPart forbidSelect singers" style="grid-column: span 12">
            <div class="header">歌手</div>
            <Transition name="cube">
              <div v-show="!singerLoading" class="main">
                <div @click="checkArtist(singer)" class="singerItem" v-for="singer in resultSingerList">
                  <div class="pic">
                    <img :src="singer.avatarUrl" alt="">
                  </div>
                  <div class="name singleLineTextEl">{{singer.name}}</div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
        <Transition name="cube">
          <div class="searchResultPart forbidSelect playlists" style="grid-column: span 12">
            <div class="header">歌单</div>
            <Transition name="cube">
              <div v-show="!playlistLoading" class="main">
                <div @click="checkSearchPlaylist(p)" class="playlistItem" v-for="p in resultPlaylistList">
                  <div class="pic">
                    <img :src="p.coverUrl" alt="">
                  </div>
                  <div class="name singleLineTextEl">{{p.name}}</div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </Transition>
</div>
</template>

<script setup lang='ts'>
import {onMounted, onUnmounted, ref, toRaw} from "vue";
import '@/assets/songlist.css'
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import {BasicSongTypeEnum, type song, type SongTypes, type supportSongTypes} from '@/types/song'
import { type AxiosResponse } from "axios";
import Pagination from '@/components/Pagination.vue'
import emitter from "@/emitter";
import CollectDialog from "@/components/Dialogs/CollectDialog.vue";
import {neteaseAxios, kugouAxios} from "@/utils/axiosInstances";
import {useRouter} from "vue-router";
import {checkDetail, mapCheckSongPlayable, neteaseSongsToSongType} from "@/utils/Toolkit";
import {showDialog} from "@/utils/dialog";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {showContextMenu} from "@/utils/contextMenu";
import type { SearchSource, UnifiedArtist, UnifiedPlaylist } from '@/types/search';
import { replacePicSizeParam } from "@/utils/u";

const router = useRouter();
const runtimeData = useRuntimeDataStore();

// 添加防抖函数
function debounce(fn: Function, delay: number) {
    let timer: any = null;
    return function (this: any, ...args: any[]) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}

let searchInput = ref<HTMLInputElement>();
let resultSongList = ref<song[]>([]);
let resultAlbumList = ref<any[]>([]);
let resultSingerList = ref<any[]>([]);
let resultPlaylistList = ref<any[]>([]);
let total = ref(0);
let url = `/cloudsearch`;
let paginationLoading = ref(false);
let songLoading = ref(false);
let albumLoading = ref(false);
let singerLoading = ref(false);
let playlistLoading = ref(false);
const nowPage = ref(1)
const nowGroup = ref(0)
let showSuggestBar = ref(false);
const tmpSearchVal = ref('')
let suggests = ref<string[]>([])
let suggestSelected = ref(-1);
const source = ref<SearchSource>('netease');
const showSourceMenu = ref(false);
const sourceMap = {
    netease: '网易云音乐',
    kugou: '酷狗音乐'
};
function acceptSuggest(text: string) {
  if (!searchInput.value) return;
  searchInput.value.value = text;
  suggestSelected.value = -1;
  search()
}
function search() {
    if (searchInput.value) {
      showSuggestBar.value = false;
        if (suggestSelected.value === -1) {
          let query = searchInput.value.value;
          nowPage.value = 1;
            if (source.value === 'netease') {
                getNeteaseSearchResults(query);
            } else if (source.value === 'kugou') {
                getKugouSearchResults(query);
            }
          tmpSearchVal.value = query;
        }else {
            suggestSelected.value = -1;
            searchInput.value.value = document.querySelector('.suggest.active') ? (<HTMLDivElement>document.querySelector('.suggest.active')).innerText : searchInput.value.value
        }
    }
}
function getKugouSearchResults(query: string) {
  paginationLoading.value = true;
  songLoading.value = true;
  albumLoading.value = true;
  singerLoading.value = true;
  playlistLoading.value = true;

  kugouAxios.get('/search/complex', {
    params: {
      keywords: query,
      page: nowPage.value,
      pagesize: 30
    }
  }).then(res => {
    console.log(res.data)
    if (res.data.data.lists) {
      // 初始化所有结果为空
      resultSongList.value = [];
      resultAlbumList.value = [];
      resultSingerList.value = [];
      resultPlaylistList.value = [];
      total.value = 0;

      const lists = res.data.data.lists;
      
      // 处理歌曲搜索结果 (index 0)
      if (lists[0]?.lists) {
        resultSongList.value = lists[0].lists.map((song: any) => {
          return <SongTypes.kugou>{
            type: 'kugou',
            symbol: song.FileHash,
            title: song.SongName,
            singer: song.SingerName,
            pic: song.Image
          }
        });
        total.value = lists[0].total || 0;
      }
      songLoading.value = false;

      // 处理歌单搜索结果 (index 4)
      if (lists[4]?.lists) {
        resultPlaylistList.value = lists[4].lists.map((playlist: any) => ({
          id: playlist.gid,
          name: playlist.specialname,
          coverUrl: playlist.img,
          source: 'kugou' as const
        }));
      }
      playlistLoading.value = false;

      // 处理专辑搜索结果 (index 6)
      if (lists[6]?.lists) {
        resultAlbumList.value = lists[6].lists.map((album: any) => ({
          id: album.albumid,
          name: album.albumname,
          coverUrl: album.img,
          artist: {
            name: album.singer
          },
          songCount: album.songcount || 0,
          source: 'kugou' as const
        }));
      }
      albumLoading.value = false;

      // 处理歌手搜索结果 (index 10)
      if (lists[10]?.lists) {
        resultSingerList.value = lists[10].lists.map((singer: any) => ({
          id: singer.AuthorId,
          name: singer.AuthorName,
          avatarUrl: singer.Avatar,
          source: 'kugou' as const
        }));
      }
      singerLoading.value = false;
    }
  }).catch(e => {
    console.error('搜索失败:', e);
    // 清空所有结果
    resultSongList.value = [];
    resultAlbumList.value = [];
    resultSingerList.value = [];
    resultPlaylistList.value = [];
    total.value = 0;
  }).finally(() => {
    console.log('#song#', resultSongList.value);
      console.log('#singer#', resultSingerList.value);
      console.log('#album#', resultAlbumList.value);
      console.log('#playlist#', resultPlaylistList.value);
    songLoading.value = false;
    albumLoading.value = false;
    singerLoading.value = false;
    playlistLoading.value = false;
    paginationLoading.value = false;
  });
}
function getNeteaseSearchResults(query: string, offset = 0) {
  const types = [10, 100, 1000];
  let tasks = [];
  paginationLoading.value = true;
  tasks.push(getSearchSongResult(query))
  for (let type of types) {
    if (type === 10) {
      albumLoading.value = true;
    }
    if (type === 100) {
      singerLoading.value = true;
    }
    if (type === 1000) {
      playlistLoading.value = true;
    }
    tasks.push(new Promise<void>((resolve, reject) => {
      neteaseAxios.get(url, {
        params: {
          keywords: query,
          type,
          limit: 10,
        }
      }).then(res => {
        if (type === 10) {
          resultAlbumList.value = (res.data.result.albums || []).map((album: any) => ({
            id: album.id,
            name: album.name,
            coverUrl: album.picUrl,
            artist: {
              name: album.artist.name
            },
            songCount: album.size || 0,
            source: 'netease' as const
          }));
          albumLoading.value = false;
        }
        if (type === 100) {
          resultSingerList.value = (res.data.result.artists || []).map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            avatarUrl: artist.picUrl,
            source: 'netease' as const
          }));
          singerLoading.value = false;
        }
        if (type === 1000) {
          resultPlaylistList.value = (res.data.result.playlists || []).map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            coverUrl: playlist.coverImgUrl,
            source: 'netease' as const
          }));
          playlistLoading.value = false;
        }
        resolve();
      }).catch((e) => {
        albumLoading.value = false;
        singerLoading.value = false;
        playlistLoading.value = false;
        reject(e);
      })
    }))
  }
  Promise.all(tasks).then(() => {
    console.log('#song#', resultSongList.value);
    console.log('#singer#', resultSingerList.value);
    console.log('#album#', resultAlbumList.value);
    console.log('#playlist#', resultPlaylistList.value);
  })
}
function getSearchSongResult(query: string, offset = 0) {
  return new Promise<void>((resolve, reject) => {
    songLoading.value = true;
    neteaseAxios.get(url, {
      params: {
        keywords: query,
        offset: offset,
      },
    }).then((res: AxiosResponse) => {
      if (res.data.result.songs) {
        let result = res.data.result.songs
        mapCheckSongPlayable(result)
        resultSongList.value = result.map((song: any) => {
          return <song>{
            type: 'netease',
            title: song.name,
            symbol: song.id,
            singer: song.ar.map((ar: any) => ar.name).join(' & '),
            playable: song.playable,
            reason: song.reason
          }
        })
        total.value = res.data.result.songCount || 0;
        resolve();
      }
    }).catch((e) => {
      reject(e)
    }).finally(() => {
      songLoading.value = false;
      paginationLoading.value = false;
    })
  })
}
function changePage() {
  if (source.value === 'netease') {
    getSearchSongResult(tmpSearchVal.value, (nowPage.value - 1) * 30);
  } else if (source.value === 'kugou') {
    getKugouSearchResults(tmpSearchVal.value);
  }
}
function lastSuggest() {
    if (suggestSelected.value > -1) {
        suggestSelected.value--;
    }
}
function nextSuggest() {
    if (suggestSelected.value < 5) {
        suggestSelected.value++;
    }
}
const refreshSuggests = debounce(async function () {
    if (!searchInput.value || !searchInput.value.value) {
        suggests.value = [];
        return;
    }

    const query = searchInput.value.value;
    
    try {
        if (source.value === 'netease') {
            const res = await neteaseAxios.get('/search/suggest', {
                params: {
                    keywords: query,
                    type: 'mobile'
                }
            });
            if (res.data.result.allMatch) {
                suggests.value = res.data.result.allMatch.slice(0, 6).map((match: any) => match.keyword);
            } else {
                suggests.value = [];
            }
        } else if (source.value === 'kugou') {
            const res = await kugouAxios.get('/search/suggest', {
                params: {
                    keywords: query
                }
            });
            if (res.data.data && res.data.data[0]?.RecordDatas) {
                suggests.value = res.data.data[0].RecordDatas.slice(0, 6).map((item: any) => item.HintInfo);
            } else {
                suggests.value = [];
            }
        }
        suggestSelected.value = -1;
        showSuggestBar.value = true;
    } catch (error) {
        console.error('获取搜索建议失败:', error);
        suggests.value = [];
    }
}, 200);
function tryShowSongMenu(song: song) {
  showContextMenu({
    menuItems: [{
      title: '添加到...',
      action: () => {
        showDialog(CollectDialog, {
          waitCollect: structuredClone(toRaw(song))
        })
      }
    }]
  })
}
function tryPlaySong(song: SongTypes.netease) {
  emitter.emit('playSong', {song, justtry: true})
}
function checkSearchPlaylist(playlist: UnifiedPlaylist) {
  console.log("#checkPlaylist#", playlist)
  checkDetail(-2, {
    title: playlist.name,
    pic: playlist.coverUrl,
    intro: 'SEARCH PREVIEW',
    originFilename: 'REMOTE',
    playlist: [{
      type: `trace_${playlist.source}_playlist` as const,
      id: playlist.id,
    }],
    type: 'search_result'
  })
  console.log("#checkPlaylist#", {
    title: playlist.name,
    pic: playlist.coverUrl,
    intro: 'SEARCH PREVIEW',
    originFilename: 'REMOTE',
    playlist: [{
      type: `trace_${playlist.source}_playlist` as const,
      id: playlist.id,
    }]
  })
}
onMounted(() => {
  const l = (e: Event) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT' && 
        !(e.target as HTMLElement).classList.contains('suggest') &&
        !(e.target as HTMLElement).closest('.sourceSelector')) {
      showSuggestBar.value = false;
      showSourceMenu.value = false;
    }
  };
  document.body.addEventListener('click', l)
  onUnmounted(() => {
    document.body.removeEventListener('click', l)
  })
})

async function checkAlbum(id: string) {
  router.push('/loading')
  if (source.value === 'netease') {
    neteaseAxios.get(`/album?id=${id}`).then((res) => {
      if (res.data.code !== 200) return
      console.log("#checkAlbum#", res.data)
      runtimeData.albumPreview.info = {
        title: res.data.album.name,
        pic: res.data.album.picUrl,
        creator: res.data.album.artist.name,
        intro: res.data.album.briefDesc
      }
      runtimeData.albumPreview.songs = neteaseSongsToSongType(res.data.songs)
      router.push('/albumPreview')
    })
  } else if (source.value === 'kugou') {
    try {
      const res = await kugouAxios.get(`/album/detail?id=${id}`);
      if (res.data.status !== 1) return;
      console.log("#checkAlbum#", res.data)
      runtimeData.albumPreview.info = {
        title: res.data.data[0].album_name,
        pic: replacePicSizeParam(res.data.data[0].sizable_cover),
        creator: res.data.data[0].author_name,
        intro: res.data.data[0].intro
      }
      
      // 获取专辑歌曲列表
      const songsRes = await kugouAxios.get(`/album/songs?id=${id}`);
      if (songsRes.data.status === 1) {
        runtimeData.albumPreview.songs = songsRes.data.data.songs.map((song: any) => ({
          type: 'kugou',
          title: song.base.audio_name,
          hash: song.audio_info.hash,
          singer: song.base.author_name,
          pic: song.album_info.cover
        }));
      }
      
      router.push('/albumPreview')
    } catch (error) {
      console.error('获取专辑信息失败:', error);
    }
  }
}

async function checkArtist(singer: UnifiedArtist) {
  console.log('#singer#', singer)
  router.push('/loading')
  runtimeData.loading.text = '加载歌手信息中...'
  
  if (singer.source === 'netease') {
    try {
      const artistInfo = await neteaseAxios.get(`/artist/detail?id=${singer.id}`)
      if (artistInfo.data.code !== 200) return

      runtimeData.artistPreview.info = {
        name: singer.name,
        pic: artistInfo.data.data.artist.avatar,
        description: artistInfo.data.data.artist.briefDesc || '',
        id: singer.id
      }

      let allSongs: any[] = []
      let offset = 0
      let hasMore = true

      while (hasMore) {
        runtimeData.loading.text = `加载歌手歌曲中...(${allSongs.length})`
        const songs = await neteaseAxios.get(`/artist/songs?id=${singer.id}&limit=100&offset=${offset}`)
        if (songs.data.code !== 200) break

        allSongs = allSongs.concat(songs.data.songs)
        hasMore = songs.data.more
        offset += 100
      }

      runtimeData.artistPreview.songs = allSongs.map((song: any) => ({
        type: BasicSongTypeEnum.netease,
        title: song.name,
        symbol: song.id,
        singer: song.ar.map((ar: any) => ar.name).join(' & '),
      }))

      router.push('/artistPreview')
    } catch (error) {
      console.error('加载歌手信息失败:', error)
      runtimeData.loading.text = '加载失败'
    }
  } else if (singer.source === 'kugou') {
    try {
      const artistInfo = await kugouAxios.get(`/artist/detail?id=${singer.id}`);
      if (artistInfo.data.status !== 1) return;
      runtimeData.artistPreview.songs = [];
      runtimeData.artistPreview.info = {
        name: artistInfo.data.data.author_name,
        pic: replacePicSizeParam(artistInfo.data.data.sizable_avatar),
        description: artistInfo.data.data.intro || '',
        id: singer.id
      }

      let currentAmount =  0
      let page = 1
      let total = 0
      let sign = false
      while (currentAmount < total || !sign) {
        sign = true
        const songsRes = await kugouAxios.get(`/artist/audios?id=${singer.id}`, {
          params: {
            page,
            pagesize: 30
          }
        });
        if (songsRes.data.status === 1 && songsRes.data.data) {
          runtimeData.artistPreview.songs.push(...songsRes.data.data.map((song: any) => ({
            type: 'kugou',
            title: song.audio_name,
            hash: song.hash,
            singer: song.author_name,
            pic: song.trans_param.union_cover
          })))
          page++;
          total = songsRes.data.total;
          currentAmount += songsRes.data.data.length;
          runtimeData.loading.text = `加载歌手歌曲中...(${currentAmount} / ${total})`
          // console.log(page, total, currentAmount, songsRes)
          // if (page > 5) break;
        }
      }

      router.push('/artistPreview')
    } catch (error) {
      console.error('加载歌手信息失败:', error);
      runtimeData.loading.text = '加载失败'
    }
  }
}

</script>

<style scoped>
.partContainer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.searchBar {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.searchBar .searchInputContainer {
    width: 50%;
    position: relative;
}
.searchBar input {
    border: none;
    height: 28px;
    line-height: 28px;
    border-bottom: 1px solid var(--ymk-text-color);
    background-color: transparent;
    font-size: 18px;
    width: 100%;
    color: var(--ymk-text-color);
    padding: 5px 10px;
    font-family: SourceSansCNM;
}
.searchBar .searchButton {
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    top: 2px;
}
.searchBar .searchButton svg {
    width: 100%;
    height: 100%;
    color: var(--ymk-text-color);
}
.searchBar .searchInputContainer .suggestBar {
    color: var(--ymk-text-color);
    position: absolute;
    width: 100%;
    border: 1px solid var(--ymk-text-color);
    background-color: rgba(0,0,0,.4);
    border-top: 0;
    z-index: 102;
    max-height: 320px;
}
.searchBar .searchInputContainer .suggestBar .suggest {
    height: 32px;
    line-height: 32px;
    padding: 0 5px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    word-break: break-all;
    transition: all .15s;
}
.searchBar .searchInputContainer .suggestBar .suggest.active {
    background-color: rgba(0,0,0,.6);
    color: #fff;
}
.pagination {
    margin: 20px 0;
}
.searchResult {
  flex: 1;
  min-height: 0;
  display: grid;
  padding: 10px 20px;
  grid-gap: 20px;
  grid-template-columns: repeat(24, 1fr);
  grid-template-rows: 100%;
  overflow-y: scroll;
}
.searchResult::-webkit-scrollbar, .searchResultPart .main::-webkit-scrollbar {
  display: none;
}
.searchResultSongTable .song {
  display: grid;
  grid-template-columns: 40px 1fr 1fr;
  grid-auto-rows: 45px;
  line-height: 45px;
}
.songs {
  flex-direction: column;
}
.songs .container {
  min-height: 0;
}
.searchResultPart {
  background-color: var(--ymk-container-bg-color);
  box-shadow: 0 0 5px var(--ymk-container-bg-color);
  backdrop-filter: blur(2px);
  color: #fff;
}
.searchResultSongTable .song.disabled {
  color: #aaa
}
.searchResultSongTable {
  color: var(--ymk-text-color);
}
.searchResultSongTable .song {
  transition: background .15s;
}
.searchResultSongTable .song:hover, .searchResultSongTable .song.active {
  background-color: rgba(0,0,0,.35);
  color: #fff;
}
.searchResultSongTable .song .songTitle, .searchResultSongTable .song .songSinger {
  padding: 0 10px;
}
.searchResultSongTable .song .songIndex {
  text-align: center;
  color: #eee;
  font-weight: bold;
}

.searchResultPart {
  height: 100%;
}

.searchResultPart.albums {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
  font-family: SourceSansCNM;
}
.searchResultPart .header {
  padding: 10px;
  font-size: 22px;
}
.searchResultPart .main {
  min-height: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior-y: contain;
}
.searchResultPart.albums .main {
  flex: 1;
}
.searchResultPart.albums .albumItem {
  cursor: pointer;
  padding: 10px;
  height: 80px;
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: 60px;
  grid-column-gap: 10px;
  transition: all .15s;
}
.searchResultPart.albums .albumItem:hover {
  background-color: rgba(0,0,0,.35);
}
.searchResultPart.albums .albumItem .info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.searchResultPart.albums .albumItem .info .title {
  font-size: 18px;
  margin-bottom: 5px;
}
.searchResultPart.albums .albumItem .info .intro {
  font-size: 14px;
}
.searchResultPart img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.searchResultPart.singers .main, .searchResultPart.playlists .main {
  justify-content: center;
  display: grid;
  padding: 10px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-rows: 130px;
  grid-gap: 15px;
}
.searchResultPart.singers .main .singerItem, .searchResultPart.playlists .main .playlistItem {
  cursor: pointer;
  display: grid;
  grid-template-rows: 100px 20px;
  grid-gap: 10px;
  text-align: center;
}
.searchResultPart.singers .main .singerItem img {
  border-radius: 50%;
}
.searchResultPart.singers .main .singerItem .name, .searchResultPart.playlists .main .playlistItem .name {
  font-size: 16px;
  line-height: 20px;
}
.searchResultPart.singers .main .pic, .searchResultPart.playlists .main .pic {
  width: 100%;
}
.sourceSelector {
    position: absolute;
    right: 30px;
    top: 2px;
    height: 28px;
    line-height: 28px;
    padding: 0 10px;
    cursor: pointer;
    color: var(--ymk-text-color);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.sourceSelector .arrow {
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 0.2s;
}

.sourceSelector .arrow.down {
    transform: rotate(180deg);
}

.sourceMenu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--ymk-container-bg-color);
    border: 1px solid var(--ymk-text-color);
    border-radius: 4px;
    min-width: 120px;
    z-index: 103;
}

.sourceItem {
    padding: 8px 15px;
    transition: all 0.2s;
}

.sourceItem:hover, .sourceItem.active {
    background-color: rgba(0,0,0,.35);
    color: #fff;
}

.searchBar input {
    padding-right: 100px;
}
</style>