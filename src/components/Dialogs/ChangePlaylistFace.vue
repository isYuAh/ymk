//https://p2.music.126.net/4_QfmUoHTL1bpewUpImOlg==/109951169292401406.jpg
<template>
  <div class="dialogChangeFaceContainer DEF-DIALOG-CONTENT">
      <div class="header">修改封面 - {{ runtimeData.playlists[data.targetPlaylistIndex].title }}</div>
      <div class="content">
          <div>
            <label for="">封面url：</label>
            <input style="width: 400px" v-model="faceimg" type="text"/>
          </div>
      </div>
      <div class="footer">
          <button @click="changeFace" class="dialogBtn confirm">确认</button>
          <button @click="closeDialog" class="dialogBtn cancel">取消</button>
      </div>
  </div>
  </template>
  
  <script setup lang='ts'>
  import { ref, toRaw } from 'vue';
  import {showMessage} from "@/utils/message";
  import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
  const {writePlaylistFile} = window.ymkAPI;
  const runtimeData = useRuntimeDataStore()
  const props = defineProps<{
    closeDialog: () => void
    data: {
      targetPlaylistIndex: number
    }
  }>()
  const faceimg = ref('')
  function changeFace() {
      if (faceimg.value !== '') {
          let targetPlaylist = structuredClone(toRaw(runtimeData.playlists[props.data.targetPlaylistIndex]))
          targetPlaylist.pic = faceimg.value
          const originFn = targetPlaylist.originFilename
          writePlaylistFile(originFn, JSON.stringify(targetPlaylist)).then(() => {
              showMessage('修改成功，请手动刷新');
          }).catch(() => {
              showMessage(`写入文件${originFn}失败`);
          })
          props.closeDialog()
      }
  }
  </script>