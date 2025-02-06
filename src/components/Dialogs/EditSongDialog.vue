<script setup lang="ts">
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {saveSpecificPlaylist} from "@/utils/Toolkit";
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
const runtimeData = useRuntimeDataStore()
function confirmF() {
  if (typeof props.data.si !== 'number') {
    return;
  }
  let np = runtimeData.playlists[runtimeData.playlist.listIndex];
  if (np.playlist[0].type == "data") {
    Object.assign(np.playlist[0].songs[props.data.si], {
      title: props.data.song.title,
      singer: props.data.song.singer,
    })
  }
  saveSpecificPlaylist(np);
  props.closeDialog()
}
</script>

<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">编辑歌曲</div>
    <div class="content">
      <div>
        <input style="width: 400px" v-model="data.song.title" type="text" />
      </div>
      <div>
        <input style="width: 400px" v-model="data.song.singer" type="text" />
      </div>
    </div>
    <div class="footer">
      <button @click="confirmF" class="dialogBtn confirm">确认</button>
      <button @click="closeDialog" class="dialogBtn cancel">取消</button>
    </div>
  </div>
</template>

<style scoped>

</style>