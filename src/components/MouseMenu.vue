<template>
<div ref="mmContainer" v-show="zks.mouseMenu.show" class="mouseMenuContainer forbidSelect">
    <div class="menulist">
        <div v-show="m.show !== undefined ? m.show : true" @click="m.action(zks.mouseMenu.args)" v-for="m in zks.mouseMenu.menu" class="menuItem">
            {{ m.title }}
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import {nextTick, onMounted, onUnmounted} from 'vue';
import { ref, watch } from 'vue';
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";
const {zks} = storeToRefs(useZKStore())
let mmContainer = ref<HTMLDivElement>();
onMounted(() => {
  const l = () => {
    zks.value.mouseMenu.show=false
  };
  document.body.addEventListener('click', l)
  onUnmounted(() => {
    document.body.removeEventListener('click', l)
  })
})
watch([() => zks.value.mouseMenu.show, () => zks.value.mouseMenu.position], (v) => {
    if (v) {
        nextTick(() => {
            if (mmContainer.value && zks.value.mouseMenu.show) {
                if (zks.value.mouseMenu.position.left + mmContainer.value.clientWidth > document.body.clientWidth) {
                    mmContainer.value.style.left = zks.value.mouseMenu.position.left - mmContainer.value.clientWidth + "px";
                }else {
                    mmContainer.value.style.left = zks.value.mouseMenu.position.left + "px"
                }
            }
            if (mmContainer.value && zks.value.mouseMenu.show) {
                if (zks.value.mouseMenu.position.top + mmContainer.value.clientHeight > document.body.clientHeight) {
                    mmContainer.value.style.top = zks.value.mouseMenu.position.top - mmContainer.value.clientHeight + "px"
                }else {
                    mmContainer.value.style.top = zks.value.mouseMenu.position.top + "px"
                }
            }
        })
    }
}, {deep: true})
</script>

<style scoped>
.mouseMenuContainer {
    z-index: 300;
    position: fixed;
    box-shadow: 0 0 5px rgba(0, 0, 0, .4);
    background-color: #fff;
    padding: 10px 0;
    left: 50px;
    min-width: 150px;
}
.menuItem {
    text-align: center;
    padding: 0px 15px;
    height: 30px;
    font-size: 14px;
    line-height: 30px;
    transition: all .25s;
    background-color: #fff;
}
.menuItem:hover {
    cursor: pointer;
    background-color: #eee;
}
</style>