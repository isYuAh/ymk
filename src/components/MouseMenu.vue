<template>
<div ref="mmContainer" class="mouseMenuContainer forbidSelect">
    <div class="menulist">
        <div v-show="m.show ?? true" @click="handleClick(m)"
             v-for="m in menuItems" class="menuItem">
            {{ m.title }}
        </div>
    </div>
</div>
</template>

<script setup lang='ts'>


import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type {mouseMenuItem} from "@/types";

const props = defineProps<{
  menuItems: mouseMenuItem[]
  position: { left: number; top: number }
  args?: any
}>()

const emit = defineEmits(['close'])
const mmContainer = ref<HTMLDivElement>()
const adjustPosition = () => {
  if (!mmContainer.value) return

  nextTick(() => {
    const container = mmContainer.value!
    const { innerWidth, innerHeight } = window
    // 水平调整
    if (props.position.left + container.offsetWidth > innerWidth) {
      container.style.left = `${props.position.left - container.offsetWidth}px`
    } else {
      container.style.left = `${props.position.left}px`
    }

    // 垂直调整
    if (props.position.top + container.offsetHeight > innerHeight) {
      container.style.top = `${props.position.top - container.offsetHeight}px`
    } else {
      container.style.top = `${props.position.top}px`
    }
  })
}

// 菜单点击处理
const handleClick = (menuItem: mouseMenuItem) => {
  menuItem.action?.(props.args)
  emit('close')
}

// 点击外部关闭
const clickHandler = (e: MouseEvent) => {
  if (!mmContainer.value?.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  console.log(props)
  adjustPosition()
  document.addEventListener('click', clickHandler)
})

onUnmounted(() => {
  document.removeEventListener('click', clickHandler)
})
</script>

<style scoped>
.mouseMenuContainer {
    z-index: 300;
    position: fixed;
    box-shadow: 0 0 5px rgba(0, 0, 0, .4);
    background-color: #fff;
    border-radius: 6px;
    padding: 10px 0;
    min-width: 100px;
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