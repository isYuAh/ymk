<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">预览</div>
    <div class="content">
      <div class="typeChoose">
        <DSelect style="width: 400px" v-model="targetPlatform" :options="options"></DSelect>
      </div>
      <div>
        <input style="width: 400px" v-model="previewLink" type="text" />
      </div>
      <div>
<!--        <input type="checkbox" id="asData" v-model="asData" /><label class="asDataLabel" for="asData">作为data类型</label>-->
      </div>
    </div>
    <div class="footer">
      <button @click="preview" class="dialogBtn confirm">预览</button>
      <button @click="closeDialog" class="dialogBtn cancel">取消</button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import {ref} from 'vue';
import {PlaylistType, type playlistComponent} from "@/types";
import {type AxiosResponse} from "axios";
import DSelect from '@/components/DSelect.vue';
import {neteaseAxios, qqAxios} from "@/utils/axiosInstances";
import {checkDetail} from "@/utils/Toolkit";
import {showMessage} from "@/utils/message";
let previewLink = ref('auto');
let asData = ref(true);
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
const targetPlatform = ref('')
const options = [{
  label: "自动检测",
  value: "auto"
},{
  value: 'netease',
  label: "网易云"
},{
  value: 'qq',
  label: "QQ音乐"
},{
  value: 'siren',
  label: "塞壬唱片"
}]
function preview() {
  showMessage('加载中')
  if (targetPlatform.value === 'auto') {
    if (previewLink.value.startsWith('https://music.163.com/#/playlist?id=') ||
      previewLink.value.startsWith('music.163.com/#/playlist?id=')
    ) {
      let match = previewLink.value.match(/\/playlist\?id=(\d+)/);
      if (match) {
        neteaseAxios.get(`/playlist/detail?id=${match[1]}`).then((res: AxiosResponse) => {
          let playlist: playlistComponent[];
          playlist = <playlistComponent[]>[{
            type: "trace_netease_playlist",
            id: res.data.playlist.id,
          }]
          checkDetail(-2, {
            title: res.data.playlist.name,
            pic: res.data.playlist.coverImgUrl,
            intro: 'NETEASE PREVIEW',
            originFilename: 'REMOTE',
            playlist: playlist,
            type: 'remote_preview'
          })
        })
      }
    }else if(previewLink.value.startsWith('https://i2.y.qq.com/n3/other/pages/share/personalized_playlist_v2/') ||
          previewLink.value.startsWith('i2.y.qq.com/n3/other/pages/share/personalized_playlist_v2/')
    ) {
      let match = previewLink.value.match(/id=(\d+)/);
      if (match) {
        qqAxios.post("/api/y/get_playlistDetail", {
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
            playlist: playlist,
            type: 'remote_preview'
          })
        })
      }
    }
  }else if (targetPlatform.value === 'siren') {
    checkDetail(-2, {
      pic: "https://web.hycdn.cn/siren/pic/20210322/56cbcd1d0093d8ee8ee22bf6d68ab4a6.jpg",
      title: "塞壬唱片",
      intro: "siren preview",
      playlist: [{
        type: "trace_siren"
      }],
      originFilename: 'REMOTE',
      type: PlaylistType.preview
    })
  }else if (targetPlatform.value === 'qq') {
    qqAxios.post("/api/y/get_playlistDetail", {
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
        playlist: playlist,
        type: PlaylistType.preview
      })
    })
  }else if (targetPlatform.value === 'netease') {
    neteaseAxios.get(`/playlist/detail?id=${previewLink.value}`).then((res: AxiosResponse) => {
      let playlist: playlistComponent[];
      playlist = <playlistComponent[]>[{
        type: "trace_netease_playlist",
        id: res.data.playlist.id,
      }]
      checkDetail(-2, {
        title: res.data.playlist.name,
        pic: res.data.playlist.coverImgUrl,
        intro: 'NETEASE PREVIEW',
        originFilename: 'REMOTE',
        playlist: playlist,
        type: PlaylistType.preview
      })
    })
  }
  props.closeDialog()
}
</script>

<style scoped>

</style>