<template>
<div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">收藏</div>
    <div class="content">
        <select ref="selectComponent" style="width: 400px" name="" id="">
            <option v-show="index < zks.playlistsParts[0].count" v-for="(list, index) in zks.playlists" :value="list.title">{{ list.title }}</option>
        </select>
    </div>
    <div class="footer">
        <button @click="collect" class="dialogBtn confirm">收藏</button>
        <button @click="closeDialog" class="dialogBtn cancel">取消</button>
    </div>
</div>
</template>

<script setup lang='ts'>
import { useZKStore } from '@/stores/useZKstore';
import { ref, toRaw } from 'vue';
import {storeToRefs} from "pinia";
import {showMessage} from "@/utils/message";
const {writePlaylistFile} = window.ymkAPI;
const {zks} = storeToRefs(useZKStore());
const props = defineProps<{
  closeDialog: () => void
  data: any
}>()
let selectComponent = ref<HTMLSelectElement>();
function collect() {
    if (selectComponent.value && selectComponent.value.selectedIndex > -1) {
        let components = zks.value.playlists[selectComponent.value.selectedIndex].playlist;
        let first = components[0];
        let originFn = zks.value.playlists[selectComponent.value.selectedIndex].originFilename;
        if (first.type === 'data') {
            first.songs.unshift(props.data.waitCollect);
        }else {
            components.unshift({
                type: "data",
                songs: [props.data.waitCollect],
            })
        }
        if (selectComponent.value.selectedIndex === zks.value.playlist.listIndex) {
            zks.value.playlist.songs.unshift(props.data.waitCollect)
        }
        writePlaylistFile(originFn, JSON.stringify(toRaw(zks.value.playlists[selectComponent.value.selectedIndex]))).then(() => {
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