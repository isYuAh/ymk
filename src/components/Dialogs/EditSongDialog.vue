<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useZKStore} from "@/stores/useZKstore";

const {zks} = storeToRefs(useZKStore())
function confirmF() {
  if (!zks.value.dialog.data.si) {
    return;
  }
  let np = zks.value.playlists[zks.value.playlist.listIndex];
  if (np.playlist[0].type == "data") {
    Object.assign(np.playlist[0].songs[zks.value.dialog.data.si], {
      title: zks.value.dialog.data.song.title,
      singer: zks.value.dialog.data.song.singer,
    })
  }
  useZKStore().playlistToolkit.saveSpecificPlaylist(np);
  zks.value.dialog.show = false;
}
function cancelF() {
  zks.value.dialog.show = false;
}
</script>

<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">编辑歌曲</div>
    <div class="content">
      <div>
        <input style="width: 400px" v-model="zks.dialog.data.song.title" type="text" />
      </div>
      <div>
        <input style="width: 400px" v-model="zks.dialog.data.song.singer" type="text" />
      </div>
    </div>
    <div class="footer">
      <button @click="confirmF" class="dialogBtn confirm">确认</button>
      <button @click="cancelF" class="dialogBtn cancel">取消</button>
    </div>
  </div>
</template>

<style scoped>

</style>