<script setup lang="ts">
import axios, {type AxiosResponse} from "axios";
import {ref} from "vue";
import {type song} from "@/types";
import {neteaseAxios, qqAxios} from "@/utils/axiosInstances";
import {addSongTo} from "@/utils/Toolkit";
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
const {readClipboard, getBilibiliVideoView} = window.ymkAPI
let title = ref("");
let singer = ref("");
let id = ref("");
let selectComponent = ref<HTMLSelectElement>();
async function autoDetectFromClipboard() {
  let clip = await readClipboard() || '';
  if (clip.startsWith('https://music.163.com/#/song?id=') ||
      clip.startsWith('music.163.com/#/song?id=')
  ) {
    let match = clip.match(/\/song\?id=(\d+)/);
    if (match) {
      id.value = match[1];
      selectComponent.value!.value = 'netease';
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
      selectComponent.value!.value = 'bilibili';
      let rawDetail = {} as any;
      getBilibiliVideoView(id.value).then((res: any) => {
        rawDetail = res.data
        title.value = rawDetail.title;
        singer.value = rawDetail.owner.name;
      })
    }
  }else if (clip.startsWith('https://y.qq.com/n/ryqq/songDetail/')) {
    let match = clip.match(/\/songDetail\/([a-zA-Z0-9]+)/);
    if (match) {
      id.value = match[1];
      selectComponent.value!.value = 'qq';
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
      selectComponent.value!.value = 'siren';
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
    type: selectComponent.value!.value,
  } as any;
  switch(selectComponent.value!.value) {
    case 'netease':
      (song as any).id = id.value;
      break;
    case 'qq':
      (song as any).mid = id.value;
      break;
    case 'siren':
      (song as any).id = id.value;
      break;
    case 'bilibili':
      (song as any).BV = id.value;
      break;
    case 'kugou':
      (song as any).hash = id.value;
      break;
    default:
      return;
  }
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
        <select ref="selectComponent" style="width: 400px" name="" id="">
          <option value="bilibili">哔哩哔哩</option>
          <option value="netease">网易云</option>
          <option value="qq">QQ音乐</option>
          <option value="siren">塞壬唱片</option>
          <option value="kugou">酷狗音乐</option>
        </select>
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