<template>
<div ref="mmContainer" v-show="show" class="mouseMenuContainer forbidSelect">
    <div class="menulist">
        <div v-show="m.show !== undefined ? m.show : true" @click="m.ev(arg) || null" v-for="m in menulist" class="menuItem">
            {{ m.title }}
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import { nextTick } from 'vue';
import { ref, watch } from 'vue';
let mmContainer = ref<HTMLDivElement>();
let props = defineProps<{
    show: boolean,
    menulist: any[],
    position: {
        left: number,
        top: number
    }
    arg?: any,
}>()
watch([() => props.show, () => props.position], (v) => {
    if (v) {
        nextTick(() => {
            if (mmContainer.value && props.show) {
                if (props.position.left + mmContainer.value.clientWidth > document.body.clientWidth) {
                    mmContainer.value.style.left = props.position.left - mmContainer.value.clientWidth + "px";
                }else {
                    mmContainer.value.style.left = props.position.left + "px"
                }
            }
            if (mmContainer.value && props.show) {
                if (props.position.top + mmContainer.value.clientHeight > document.body.clientHeight) {
                    mmContainer.value.style.top = props.position.top - mmContainer.value.clientHeight + "px"
                }else {
                    mmContainer.value.style.top = props.position.top + "px"
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
    border-radius: 6px;
    box-shadow: 0 0 5px rgba(0, 0, 0, .4);
    background-color: #fff;
    padding: 10px 0;
    left: 50px;
}
.menuItem {
    padding: 0px 15px;
    height: 40px;
    font-size: 16px;
    line-height: 40px;
    transition: all .25s;
    background-color: #fff;
}
.menuItem:hover {
    cursor: pointer;
    background-color: #eee;
}
</style>