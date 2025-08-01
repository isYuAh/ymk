<script setup lang="ts">
import axios, {type AxiosResponse} from "axios";
import {ref} from "vue";
import {BasicSongTypeEnum, type song, type supportSongTypes} from "@/types/song";
import {neteaseAxios, qqAxios} from "@/utils/axiosInstances";
import {addSongTo} from "@/utils/Toolkit";
import DSelect from "@/components/DSelect.vue";
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
const {readClipboard} = window.ymkAPI
import {getBilibiliVideoView} from '@/utils/bilibiliAPI'
let title = ref("");
let singer = ref("");
let id = ref("");
const songTypeOptions = ref([
  {
    value: "bilibili",
    label: "哔哩哔哩"
  },
  {
    value: "netease",
    label: "网易云"
  },
  {
    value: "qq",
    label: "QQ音乐"
  },
  {
    value: "siren",
    label: "塞壬唱片"
  },
  {
    value: "kugou",
    label: "酷狗音乐"
  }
])
const songType = ref<supportSongTypes>("bilibili");
async function autoDetectFromClipboard() {
  let clip = await readClipboard() || '';
  if (clip.startsWith('https://music.163.com/#/song?id=') ||
      clip.startsWith('music.163.com/#/song?id=')
  ) {
    let match = clip.match(/\/song\?id=(\d+)/);
    if (match) {
      id.value = match[1];
      songType.value = BasicSongTypeEnum.netease;
      let rawDetail = {} as any;
      neteaseAxios.get(`/song/detail?ids=${id.value}`).then((res: AxiosResponse) => {
        rawDetail = res.data['songs'][0];
        title.value = rawDetail.name;
        singer.value = rawDetail.ar.map((artist: any) => artist.name).join(' & ');
      })
    }
  }else if (clip.startsWith('https://www.bilibili.com/video/BV')) {
    let match = clip.match(/\/video\/BV([a-zA-Z0-9]+)/);
    if (match) {
      id.value = match[1];
      songType.value = 'bilibili';
      let rawDetail = {} as any;
      getBilibiliVideoView(id.value).then((res: any) => {
        rawDetail = res.data.data
        title.value = rawDetail.title;
        singer.value = rawDetail.owner.name;
      })
    }
  }else if (clip.startsWith('https://y.qq.com/n/ryqq/songDetail/')) {
    let match = clip.match(/\/songDetail\/([a-zA-Z0-9]+)/);
    if (match) {
      id.value = match[1];
      songType.value = BasicSongTypeEnum.qq;
      let rawDetail = {} as any;
      qqAxios.post(`/api/y/get_song`, {
        type: "qq",
        mid: id.value,
      }).then((res: AxiosResponse) => {
        rawDetail = res.data.data[0]
        title.value = rawDetail.title;
        singer.value = rawDetail.owner.singer;
      })
    }
  }else if (clip.startsWith('https://monster-siren.hypergryph.com/music/')) {
    let match = clip.match(/\/music\/(\d+)/);
    if (match) {
      id.value = match[1];
      songType.value = BasicSongTypeEnum.siren;
      let rawDetail = {} as any;
      axios.get(`https://monster-siren.hypergryph.com/api/song/${id.value}`).then((res: AxiosResponse) => {
        rawDetail = res.data.data
        title.value = rawDetail.name;
        singer.value = rawDetail.artists.join(' & ');
      })
    }
  }
}
function addSong() {
  let song: song = {
    title: title.value,
    singer: singer.value,
    type: songType.value,
    symbol: id.value
  };
  addSongTo({
    song,
    playlistIndex: props.data.pi,
  })
  props.closeDialog()
}
</script>

<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">添加歌曲</div>
    <div class="content">
      <div class="typeChoose">
        <label for="">类型：</label>
        <DSelect style="width: 400px; margin: 5px 0" v-model="songType" :options="songTypeOptions"></DSelect>
      </div>
      <div>
        <label for="">歌名：</label>
        <input style="width: 400px" v-model="title" type="text"/>
      </div>
      <div>
        <label for="">歌手：</label>
        <input style="width: 400px" v-model="singer" type="text"/>
      </div>
      <div>
        <label for="">id：</label>
        <input style="width: 400px" v-model="id"/>
      </div>
    </div>
    <div class="footer">
      <button @click="autoDetectFromClipboard" class="dialogBtn confirm">从剪贴板</button>
      <button @click="addSong" class="dialogBtn confirm">添加</button>
      <button @click="closeDialog" class="dialogBtn cancel">取消</button>
    </div>
  </div>
</template>

<style scoped>
</style>