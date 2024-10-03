<template>
<div class="partContainer">
    <div class="searchBar">
        <div class="searchInputContainer">
            <input
            @focus="showSuggestBar = true"
            @blur="showSuggestBar = false"
            @keydown.enter="search(0)"
            @keydown.up.prevent="lastSuggest"
            @keydown.down.prevent="nextSuggest"
            @input="refreshSuggests"
            ref="searchInput" type="text" placeholder="搜索" />
            <div @click="search(0)" class="searchButton">
                <svg t="1711784197878" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4252" width="48" height="48"><path d="M454.198549 856.251462c-53.599755 0-105.60827-10.503215-154.582681-31.216979-47.291073-20.00359-89.75828-48.632627-126.219703-85.095074-36.462446-36.462446-65.092507-78.929654-85.095073-126.220726-20.714787-48.974411-31.216979-100.983949-31.216979-154.583705s10.503215-105.60827 31.218002-154.58268c20.002566-47.291073 48.632627-89.757257 85.095074-126.219703 36.462446-36.462446 78.92863-65.092507 126.219703-85.095074C348.59028 72.522734 400.599817 62.019519 454.198549 62.019519s105.60827 10.503215 154.581658 31.218002c47.291073 20.002566 89.75828 48.632627 126.220726 85.095074 36.462446 36.462446 65.091484 78.92863 85.095074 126.219703 20.713764 48.974411 31.216979 100.983949 31.216979 154.58268 0 102.939487-39.223327 200.536292-110.446462 274.812973-9.487072 9.896394-25.200962 10.223852-35.094286 0.736781-9.894348-9.488095-10.223852-25.199938-0.73678-35.094286 62.317301-64.98813 96.635921-150.383032 96.635921-240.455468 0-191.597713-155.87614-347.473853-347.47283-347.473852s-347.472829 155.87614-347.472829 347.473852S262.60186 806.608831 454.198549 806.608831c32.573883 0 64.808028-4.497431 95.808067-13.369495 13.178137-3.765767 26.921139 3.854794 30.692022 17.033955 3.771907 13.179161-3.854794 26.920116-17.033955 30.692023-35.443233 10.143011-72.272024 15.286148-109.466134 15.286148z" fill="currentColor" p-id="4253"></path><path d="M937.143816 960.063829a24.740474 24.740474 0 0 1-17.725709-7.444553l-214.193337-218.475873c-9.596566-9.788947-9.442046-25.50386 0.3469-35.100426 9.78997-9.598612 25.504884-9.441023 35.100426 0.346901l214.193337 218.475873c9.596566 9.788947 9.442046 25.50386-0.346901 35.100426a24.742521 24.742521 0 0 1-17.374716 7.097652z" fill="currentColor" p-id="4254"></path></svg>
            </div>
            <div v-show="showSuggestBar && searchInput!.value" class="suggestBar">
                <div
                @click="suggestSelected = index;search()"
                v-for="(suggest, index) in suggests.slice(virtualSuggestStart, virtualSuggestStart + 10)" :class="{suggest:true, active: suggestSelected === index}">{{ suggest }}</div>
            </div>
        </div>
    </div>
    <div class="songs">
        <div class="container">
            <simplebar data-auto-hide class="simplebar">
                <div class="songTable forbidSelect">
                    <div
                        @dblclick="tryPlaysong(song as song_netease)"
                        class="song"
                        :class="{disabled: !(song as any).playable}"
                        v-for="song in resultList">
                        <div class="songInfo title">{{ song.title }}<sub>{{ song.type }}</sub></div>
                        <div class="songInfo author">{{ song.singer }}</div>
                        <div v-if="(song as any).playable" @click="dealSearchResultSong($event, song)" class="songInfo deal"> <!-- 操作 -->
                            <svg fill="currentColor" t="1712052325059" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6676" width="24" height="24"><path d="M0 465.454545l1024 0 0 93.090909-1024 0 0-93.090909Z" p-id="6677"></path><path d="M465.454545 0l93.090909 0 0 1024-93.090909 0 0-1024Z" p-id="6678"></path></svg>
                        </div>
                    </div>
                </div>
            </simplebar>
        </div>
    </div>
    <Pagination @change-page="changePage" :total="total" v-model:group="nowGroup" v-model="nowPage" class="pagination forbidSelect"></Pagination>
</div>
</template>

<script setup lang='ts'>
import { ref, inject, toRaw, shallowRef } from "vue";
import '@/assets/songlist.css'
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import {type song, type song_netease} from "@/types";
import axios, { type AxiosResponse } from "axios";
import {storeToRefs} from "pinia";
import LoadingMask from '@/components/LoadingMask.vue'
import Pagination from '@/components/Pagination.vue'
import emitter from "@/emitter";
import { useZKStore } from "@/stores/useZKstore";
import CollectDialog from "@/components/Dialogs/CollectDialog.vue";
const {zks, config, neteaseUser} = storeToRefs(useZKStore());
let searchInput = ref<HTMLInputElement>();
let resultList = ref<song[]>([])
let total = ref(0);
let loading = ref(false);
const nowPage = ref(1)
const nowGroup = ref(0)
let showSuggestBar = ref(false);
const tmpSearchVal = ref('')
let suggests = ref<string[]>([])
let virtualSuggestStart = ref(0);
let suggestSelected = ref(-1);
function search(offset = 0) {
    if (searchInput.value) {
        if (suggestSelected.value === -1) {
            let query = searchInput.value.value;
            if (query !== tmpSearchVal.value) {
              nowPage.value = 1;
            }
            tmpSearchVal.value = query;
            let url = `${config.value.neteaseApi.url}cloudsearch`;
            loading.value = true;
            axios.get(url, {
                params: {
                    keywords: query,
                    offset: offset,
                    cookie: neteaseUser.value.cookie
                },
            }).then((res: AxiosResponse) => {
                if (res.data.result.songs) {
                  let result = res.data.result.songs
                  useZKStore().mapCheckSongPlayable(result)
                  resultList.value = result.map((song: any) => {
                      return <song>{
                          type: 'netease',
                          title: song.name,
                          id: song.id,
                          singer: song.ar.map((ar: any) => ar.name).join(' & '),
                          playable: song.playable,
                          reason: song.reason
                      }
                  })
                  total.value = res.data.result.songCount || 0;
                }
            }).finally(() => {
                loading.value = false;
            })
        }else {
            suggestSelected.value = -1;
            searchInput.value.value = document.querySelector('.suggest.active') ? (<HTMLDivElement>document.querySelector('.suggest.active')).innerText : searchInput.value.value
        }
    }
}
function changePage() {
    search((nowPage.value - 1) * 30)
}
function lastSuggest() {
    if (suggestSelected.value > -1) {
        suggestSelected.value--;
    }
}
function nextSuggest() {
    if (suggestSelected.value < 9) {
        suggestSelected.value++;
    }
}
function refreshSuggests () {
    if (searchInput.value && searchInput.value.value) {
        let query = searchInput.value.value
        let url = `${config.value.neteaseApi.url}search/suggest`
        axios.get(url, {
            params: {
                keywords: query,
                type: 'mobile'
            }
        }).then((res: AxiosResponse) => {
            if (res.data.result.allMatch) {
                suggests.value = res.data.result.allMatch.map((match: any) => match.keyword)
                suggestSelected.value = -1;
            }
        })
    }
}
function dealSearchResultSong(_e:any, song: song) {
    zks.value.dialogData.waitCollect = toRaw(song);
    zks.value.dialog.dialogEl = shallowRef(CollectDialog);
    zks.value.dialog.show = true;
}
function tryPlaysong(song: song_netease) {
  if (song.playable) {
    emitter.emit('playSong', {song, justtry: true})
  }else {
    useZKStore().showMessage(song.reason)
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
    margin: 20px 0;
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
.LoadingMask {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
}
.songTable .song {
    grid-template-columns: 12fr 10fr 50px;
}
.songTable .song .deal {
    cursor: pointer;
}
.songs .container {
  background-color: var(--ymk-container-bg-color);
  box-shadow: 0 0 5px var(--ymk-container-bg-color);
  /* backdrop-filter: blur(2px); */
}
.songTable .song.disabled {
  color: #aaa
}
</style>