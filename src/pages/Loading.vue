<template>
<div class="partContainer">
    <div class="text">Loading</div>
    <div v-show="zks.loading.text" class="tipMessage">{{ zks.loading.text }}</div>
</div>
</template>

<script setup lang='ts'>
import { useZKStore } from '../stores/useZKstore';
import {storeToRefs} from "pinia";
const {zks} = storeToRefs(useZKStore());

</script>

<style scoped>
.partContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
}
.partContainer .text {
  font-family: NovecentoWide;
  font-size: 42px;
  color: var(--ymk-text-color);
  text-shadow: 0 0 5px var(--ymk-text-shadow-color);
}
.partContainer .tipMessage {
  font-family: SourceSansCNM;
  font-size: 24px;
  margin-top: 20px;
  color: var(--ymk-text-color);
  text-shadow: 0 0 5px var(--ymk-text-shadow-color);
}
</style>