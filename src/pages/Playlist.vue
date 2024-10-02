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
import {
  type list,
  type list_trace_bilibili_fav,
  type playlistComponent,
  type song
} from '@/types';
import {computed, inject, onUnmounted, ref, shallowRef, toRaw} from 'vue';
import {storeToRefs} from "pinia";
import TargetBorder from '../components/TargetBorder.vue'
//@ts-ignore
import path from 'path-browserify';
import emitter from '@/emitter';
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import {showMsg} from '@/utils/u';
import axios, {type AxiosResponse} from 'axios';
import PreviewDialog from "@/components/Dialogs/PreviewDialog.vue";
import AddSongToDialog from '@/components/Dialogs/addSongToDialog.vue';

const {deletePlaylistFile, writePlaylistFile, showImportPlaylistDialog, getBilibiliFav} = (window as any).ymkAPI;
const {zks, config} = storeToRefs(useZKStore());
let PartVShow = computed(() => {
  let r = <boolean[]>[];
  if (zks.value.nowTab === 'Playlist') {
    zks.value.playlistsParts.forEach((p, index) => {
      if ('other' in p && 'showInMainPage' in p.other) {
        console.log(zks.value.nowTab, p.other, p.other.showInMainPage)
        r[index] = p.other.showInMainPage
      }else {
        console.log(zks.value.nowTab);
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
        showMsg(zks.value.message, 4000, `删除${p.title}成功`);
        emitter.emit('refreshPlaylists',{notReset: false});
      }).catch(() => {
        showMsg(zks.value.message, 4000, `删除${p.originFilename}文件失败`);
      })
    }
  }
}
function parseComponent(comIndex: number, components: playlistComponent[]) {
    let component = components[comIndex];
    if (comIndex >= components.length) {
        zks.value.nowTab = 'PlaylistDetail';
        return;
    }
    if (component.type === 'data') {
        zks.value.loading.text = `加载 Data 数据 ${comIndex + 1} / ${components.length}`;
        zks.value.playlist.songs.push(...component.songs);
        comIndex++;
        parseComponent(comIndex, components);
    }else if (component.type === 'trace_bilibili_fav') {
        let pn = 0;
        let getNextPage = function() {
            zks.value.loading.text = `Bilibili 已加载 ${Math.max(pn)} 页 ${comIndex + 1} / ${components.length}`;
            pn++;
            getBilibiliFav({
                media_id: (component as list_trace_bilibili_fav).favid,
                pn: pn,
                ps: 20,
            }).then((res: any) => {
                zks.value.playlist.songs.push(...res.data.data.medias.map((m: any) => ({
                    type: 'bilibili', 
                    BV: m.bvid, 
                    title: m.title,
                    pic: m.cover,
                    singer: m.upper.name})))
                console.log(res.data.data.has_more, pn);
                if (res.data.data.has_more) {
                    getNextPage()
                }else {
                    comIndex++;
                    parseComponent(comIndex, components);
                }
            })
        }
        getNextPage()
    }else if (component.type === 'trace_siren') {
        let songsApi = 'https://monster-siren.hypergryph.com/api/songs';
        zks.value.loading.text = `加载 塞壬唱片 ${comIndex + 1} / ${components.length}`;
        axios.get(songsApi).then(res => {
            zks.value.playlist.songs.push(...res.data.data.list.map((s: any) => {
                return <song>{
                    title: s.name,
                    singer: s.artists.join(' / '),
                    type: 'siren',
                    cid: s.cid
                }
            }))
            comIndex++;
            parseComponent(comIndex, components);
        })
    }else if (component.type === 'trace_netease_playlist') {
        axios.get(config.value.neteaseApi.url + 'playlist/detail', {
          params: {
              id: component.id,
          }
        }).then(res => {
          zks.value.playlist.songs.push(...res.data.playlist.tracks.map((track: any) => {
            return <song>{
              pic: track.al.picUrl,
              title: track.name,
              type: 'netease',
              singer: track.ar.map((ar: any) => (ar.name)).join(' & '),
              id: track.id,
            }
          }))
          comIndex++;
          parseComponent(comIndex, components);
        })
    }else if (component.type === 'trace_qq_playlist') {
        if (!config.value.qqApi.enable) {
            comIndex++;
            parseComponent(comIndex, components);
            return;
        }
        axios.post(config.value.qqApi.url + 'api/y/get_playlistDetail', {
            type: "qq",
            id: component.id
        }).then((res: AxiosResponse) => {
            let result = res.data.data[0];
            zks.value.playlist.songs.push(...result.songlist.map((r: any) => ({...r, type: 'qq'})));
            comIndex++;
            parseComponent(comIndex, components);
        })
    }
}
function checkDetail(index: number, remote = false, raw: list = ({} as any)) {
    zks.value.nowTab = 'Loading';
    zks.value.loading.text = '';
    if (!remote) {
      if (zks.value.playlist.listIndex === index) {
        zks.value.nowTab = 'PlaylistDetail';
      }else {
        let list = zks.value.playlists[index];
        zks.value.playlist.listIndex = index
        zks.value.playlist.raw = list;
        zks.value.playlist.songs = [];
        let components = list.playlist;
        let comIndex = 0;
        parseComponent(comIndex, components);
      }
    }else {
      zks.value.playlist.listIndex = -2;
      zks.value.playlist.songs = [];
      zks.value.playlist.raw = raw;
      let components = raw.playlist;
      let comIndex = 0;
      parseComponent(comIndex, components);
    }
}
function addSongTo(song: song, save: boolean) {
  if (!song.type || zks.value.mouseMenu.args.pi < 0) {
    return;
  }
  let pl = zks.value.mouseMenu.args.playlist;
  let components = pl.playlist;
  let first = components[0];
  let originFn = pl.originFilename;
  if (first.type === 'data') {
    first.songs.unshift(song);
  }else {
    components.unshift({
      type: "data",
      songs: [song],
    })
  }
  if (zks.value.mouseMenu.args.pi === zks.value.playlist.listIndex) {
    zks.value.playlist.songs.unshift(song)
  }
  if (save) {
    writePlaylistFile(originFn, JSON.stringify(toRaw(zks.value.playlists[zks.value.mouseMenu.args.pi]))).then(() => {
      showMsg(zks.value.message, 4000, '添加成功');
    }).catch(() => {
      showMsg(zks.value.message, 4000, `写入文件${originFn}失败`);
    })
  }
}
function importPlaylist() {
    showImportPlaylistDialog();
}
function testFunc() {
}
function showAddSongToDialog() {
  zks.value.dialog.dialogEl = shallowRef(AddSongToDialog);
  zks.value.dialog.show = true;
}
function showPreviewDialog() {
  zks.value.dialog.dialogEl = shallowRef(PreviewDialog);
  zks.value.dialog.show = true;
}
emitter.on('addSongTo', ({song,save}) => addSongTo(song,save))
emitter.on('checkDetail', ({index,remote,raw}) => checkDetail(index,remote,raw))
onUnmounted(() => {
  emitter.off('checkDetail');
  emitter.off('addSongTo')
})
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