<template>
<div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">收藏</div>
    <div class="content">
        <select ref="selectComponent" style="width: 400px" name="" id="">
            <option v-show="index < runtimeData.playlistsParts[0].count" v-for="(list, index) in runtimeData.playlists" :value="list.title">{{ list.title }}</option>
        </select>
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
const runtimeData = useRuntimeDataStore()
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
let selectComponent = ref<HTMLSelectElement>();
function collect() {
    if (selectComponent.value && selectComponent.value.selectedIndex > -1) {
        let components = runtimeData.playlists[selectComponent.value.selectedIndex].playlist;
        let first = components[0];
        let originFn = runtimeData.playlists[selectComponent.value.selectedIndex].originFilename;
        if (first.type === 'data') {
            first.songs.unshift(props.data.waitCollect);
        }else {
            components.unshift({
                type: "data",
                songs: [props.data.waitCollect],
            })
        }
        if (selectComponent.value.selectedIndex === runtimeData.playlist.listIndex) {
            runtimeData.playlist.songs.unshift(props.data.waitCollect)
        }
        writePlaylistFile(originFn, JSON.stringify(toRaw(runtimeData.playlists[selectComponent.value.selectedIndex]))).then(() => {
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