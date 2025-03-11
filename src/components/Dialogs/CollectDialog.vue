<template>
<div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">收藏</div>
    <div class="content">
        <DSelect style="width: 400px" :options="options" v-model="targetPlaylist"></DSelect>
    </div>
    <div class="footer">
        <button @click="collect" class="dialogBtn confirm">收藏</button>
        <button @click="closeDialog" class="dialogBtn cancel">取消</button>
    </div>
</div>
</template>

<script setup lang='ts'>
import { ref, toRaw } from 'vue';
import {showMessage} from "@/utils/message";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
const {writePlaylistFile} = window.ymkAPI;
import DSelect from '@/components/DSelect.vue';
const runtimeData = useRuntimeDataStore()
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
const options = runtimeData.playlists.filter((val, index) => {
    return index < runtimeData.playlistsParts[0].count
}).map((p, index) => {
    return {
        label: p.title,
        value: index
    }
})
const targetPlaylist = ref(0)
function collect() {
    if (targetPlaylist.value > -1) {
        let components = runtimeData.playlists[targetPlaylist.value].playlist;
        let first = components[0];
        let originFn = runtimeData.playlists[targetPlaylist.value].originFilename;
        if (first.type === 'data') {
            first.songs.unshift(props.data.waitCollect);
        }else {
            components.unshift({
                type: "data",
                songs: [props.data.waitCollect],
            })
        }
        if (targetPlaylist.value === runtimeData.playlist.listIndex) {
            runtimeData.playlist.songs.unshift(props.data.waitCollect)
        }
        writePlaylistFile(originFn, JSON.stringify(toRaw(runtimeData.playlists[targetPlaylist.value]))).then(() => {
            showMessage('添加成功');
        }).catch(() => {
            showMessage(`写入文件${originFn}失败`);
        })
        props.closeDialog()
    }
}
</script>

<style scoped>

</style>