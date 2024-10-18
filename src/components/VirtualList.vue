<script setup lang="ts">
import {computed, watch, ref, useTemplateRef, onUnmounted, nextTick} from "vue";
const {
  items,
  itemHeight,
  className = "",
  size = 10,
  eventName = "virtualList-refresh"
} = defineProps<{
  items: Array<any>,
  itemHeight: number,
  className?: string,
  size?: number,
  eventName ?: string,
}>()
const scrollTop = ref(0);

const displayingItems = computed(() => {
  return items.slice(startIndex.value, endIndex.value)
})
const startIndex = computed(() => {
  return Math.floor(scrollTop.value / itemHeight)
})
const endIndex = computed(() => {
  return startIndex.value + size + 1;
});
const transform = computed(() => {
  return scrollTop.value % itemHeight
})
const containerEl = useTemplateRef<HTMLDivElement>('container')
// console.log(displayingItems.value)
function handleScroll() {
  if (!containerEl.value) return;
  scrollTop.value = 0;
  nextTick(() => scrollTop.value = containerEl.value!.scrollTop)
  // console.log(scrollTop.value)
}
function refresh() {
  handleScroll()
}
watch(() => items, refresh)
</script>

<template>
  <div ref="container" :class="className" class="list-container" @scroll.passive="handleScroll">
    <div class="list" :style="{transform: `translateY(${-transform + scrollTop}px)`}">
      <div class="list-item"
           v-for="(item, index) in displayingItems"
           :key="startIndex + index"
           :style="{ height: itemHeight + 'px' }">
        <slot :item="item" :index="startIndex + index"></slot>
      </div>
    </div>
    <div class="wrapper" :style="{height: `${itemHeight * items.length}px`}"></div>
  </div>
</template>

<style scoped>
.list-container {
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
.list {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>