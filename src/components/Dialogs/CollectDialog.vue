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
        <button @click="cancel" class="dialogBtn cancel">取消</button>
    </div>
</div>
</template>

<script setup lang='ts'>
import { useZKStore } from '@/stores/useZKstore';
import { ref, toRaw } from 'vue';
import {storeToRefs} from "pinia";
const {writePlaylistFile} = (window as any).ymkAPI;
const {zks} = storeToRefs(useZKStore());
let selectComponent = ref<HTMLSelectElement>();
function collect() {
    if (selectComponent.value && selectComponent.value.selectedIndex > -1) {
        let components = zks.value.playlists[selectComponent.value.selectedIndex].playlist;
        let first = components[0];
        let originFn = zks.value.playlists[selectComponent.value.selectedIndex].originFilename;
        if (first.type === 'data') {
            first.songs.unshift(zks.value.dialog.data.waitCollect);
        }else {
            components.unshift({
                type: "data",
                songs: [zks.value.dialog.data.waitCollect],
            })
        }
        if (selectComponent.value.selectedIndex === zks.value.playlist.listIndex) {
            zks.value.playlist.songs.unshift(zks.value.dialog.data.waitCollect)
        }
        writePlaylistFile(originFn, JSON.stringify(toRaw(zks.value.playlists[selectComponent.value.selectedIndex]))).then(() => {
            useZKStore().showMessage('添加成功');
        }).catch(() => {
            useZKStore().showMessage(`写入文件${originFn}失败`);
        })
        zks.value.dialog.show = false;
    }
}
function cancel() {
    zks.value.dialog.show = false;
}
</script>

<style scoped>

</style>