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
import { ref } from 'vue';
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import DSelect from '@/components/DSelect.vue';
import { collectToLocalPlaylist, determinCollectFunction, getAvailableCollectTarget } from '@/utils/CollectHandler';
import type { song } from '@/types';
const props = defineProps<{
  closeDialog: () => void
  data: {
    waitCollect: song
  }
}>()
const options = getAvailableCollectTarget(props.data.waitCollect)
const targetPlaylist = ref(0)
function collect() {
    if (targetPlaylist.value > -1) {
        determinCollectFunction(targetPlaylist.value, props.data.waitCollect)
        props.closeDialog()
    }
}
</script>

<style scoped>

</style>