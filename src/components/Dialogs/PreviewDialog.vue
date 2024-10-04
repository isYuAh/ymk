<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">预览</div>
    <div class="content">
      <div class="typeChoose">
        <select ref="selectComponent" style="width: 400px" name="" id="">
          <option value="auto">自动检测</option>
          <option value="netease">网易云</option>
          <option value="qq">QQ音乐</option>
          <option value="siren">塞壬唱片</option>
        </select>
      </div>
      <div>
        <input style="width: 400px" v-model="previewLink" type="text" />
      </div>
      <div>
        <input type="checkbox" id="asData" v-model="asData" /><label class="asDataLabel" for="asData">作为data类型</label>
      </div>
    </div>
    <div class="footer">
      <button @click="preview" class="dialogBtn confirm">预览</button>
      <button @click="cancel" class="dialogBtn cancel">取消</button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useZKStore } from '@/stores/useZKstore';
import {ref} from 'vue';
import {storeToRefs} from "pinia";
import {type playlistComponent, type song} from "@/types";
import axios, {type AxiosResponse} from "axios";
const {zks, config} = storeToRefs(useZKStore());
const {checkDetail} = useZKStore().playlistToolkit;
let previewLink = ref('');
let asData = ref(true);
let selectComponent = ref<HTMLSelectElement>();
function preview() {
  if (selectComponent.value) {
    useZKStore().showMessage('加载中')
    if (selectComponent.value.value === 'auto') {
      if (previewLink.value.startsWith('https://music.163.com/#/playlist?id=') ||
        previewLink.value.startsWith('music.163.com/#/playlist?id=')
      ) {
        let match = previewLink.value.match(/\/playlist\?id=(\d+)/);
        if (match) {
          axios.get(`${config.value.neteaseApi.url}playlist/detail?id=${match[1]}`).then((res: AxiosResponse) => {
            let playlist: playlistComponent[];
            if (!asData.value) {
              playlist = <playlistComponent[]>[{
                type: "trace_netease_playlist",
                id: res.data.playlist.id,
              }]
            } else {
              playlist = <playlistComponent[]>[{
                type: "data",
                songs: res.data.playlist.tracks.map((track: any) => {
                  return <song>{
                    pic: track.al.picUrl,
                    title: track.name,
                    type: 'netease',
                    singer: track.ar.map((ar: any) => (ar.name)).join(' & '),
                    id: track.id,
                  }
                })
              }]
            }
            checkDetail(-2, {
              title: res.data.playlist.name,
              pic: res.data.playlist.coverImgUrl,
              intro: 'NETEASE PREVIEW',
              originFilename: 'REMOTE',
              playlist: playlist
            })
          })
        }
      }else if(previewLink.value.startsWith('https://i2.y.qq.com/n3/other/pages/share/personalized_playlist_v2/') ||
            previewLink.value.startsWith('i2.y.qq.com/n3/other/pages/share/personalized_playlist_v2/')
      ) {
        let match = previewLink.value.match(/id=(\d+)/);
        if (match) {
          axios.post(config.value.qqApi.url + "api/y/get_playlistDetail", {
            type: "qq",
            id: match[1],
          }).then((res: AxiosResponse) => {
            let playlist = [];
            if (!asData.value) {
              playlist = [{
                type: "trace_qq_playlist",
                id: match[1],
              }]
            }else {
              playlist = res.data.data.songlist.map((s:any) => ({...s, type: 'qq'}));
            }
            checkDetail(-2, {
              title: res.data.data.info.title,
              pic: res.data.data.info.pic,
              intro: 'QQ PREVIEW',
              originFilename: 'REMOTE',
              playlist: playlist
            })
          })
        }
      }
    }else if (selectComponent.value.value === 'siren') {
      checkDetail(-2, {
        pic: "https://web.hycdn.cn/siren/pic/20210322/56cbcd1d0093d8ee8ee22bf6d68ab4a6.jpg",
        title: "塞壬唱片",
        intro: "siren preview",
        playlist: [{
          type: "trace_siren"
        }],
        originFilename: 'REMOTE'
      })
    }else if (selectComponent.value.value === 'qq') {
      axios.post(config.value.qqApi.url + "api/y/get_playlistDetail", {
        type: "qq",
        id: previewLink.value,
      }).then((res: AxiosResponse) => {
        let playlist = [];
        if (!asData.value) {
          playlist = [{
            type: "trace_qq_playlist",
            id: previewLink.value,
          }]
        }else {
          playlist = res.data.data.songlist.map((s:any) => ({...s, type: 'qq'}));
        }
        checkDetail(-2, {
          title: res.data.data.info.title,
          pic: res.data.data.info.pic,
          intro: 'QQ PREVIEW',
          originFilename: 'REMOTE',
          playlist: playlist
        })
      })
    }else if (selectComponent.value.value === 'netease') {
      axios.get(`${config.value.neteaseApi.url}playlist/detail?id=${previewLink.value}`).then((res: AxiosResponse) => {
        let playlist = <playlistComponent[]>[];
        if (!asData.value) {
          playlist = <playlistComponent[]>[{
            type: "trace_netease_playlist",
            id: res.data.playlist.id,
          }]
        }else {
          playlist = <playlistComponent[]>[{
            type: "data",
            songs: res.data.playlist.tracks.map((track: any) => {
              return <song>{
                pic: track.al.picUrl,
                title: track.name,
                type: 'netease',
                singer: track.ar.map((ar: any) => (ar.name)).join(' & '),
                id: track.id,
              }
            })
          }]
        }
        checkDetail(-2, {
          title: res.data.playlist.name,
          pic: res.data.playlist.coverImgUrl,
          intro: 'NETEASE PREVIEW',
          originFilename: 'REMOTE',
          playlist: playlist
        })
      })
    }
    zks.value.dialog.show = false;
  }
}
function cancel() {
  zks.value.dialog.show = false;
}
</script>

<style scoped>

</style>