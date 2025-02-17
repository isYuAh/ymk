<script setup lang="ts">
import type {list, playlistPart} from "@/types";
import TargetBorder from "@/components/TargetBorder.vue";
import { ref, watch } from 'vue';

const {
  parts,
  playlists,
  fromZks,
  defaultExpandedStatus,
  menuEvent = () => {}
} = defineProps<{
  parts: playlistPart[],
  playlists: list[],
  fromZks: boolean,
  defaultExpandedStatus?: boolean[],
  menuEvent?: (list: list, pi: number, part: playlistPart) => void
}>()

import {checkDetail} from "@/utils/Toolkit";
const expandedStates = ref<boolean[]>(defaultExpandedStatus || playlists.map(() => true));
watch([() => defaultExpandedStatus], (nv) => {
  expandedStates.value = defaultExpandedStatus || playlists.map(() => true);
}, {immediate: true})
function toggleExpand(index: number) {
  expandedStates.value[index] = !expandedStates.value[index];
}

function checkPlaylist(i: number) {
  if (fromZks) {
    checkDetail(i);
  }else {
    checkDetail(-2, playlists[i])
  }
}
</script>

<template>
  <div
      v-for="(p, pi) in parts" 
      :key="pi"
      class="playlistPart">
    <div class="divideTitle" @click="toggleExpand(pi)">
      <span class="arrow" :class="{ expanded: expandedStates[pi] }">▶</span>
      {{p.title}}
    </div>
    <transition name="expand">
      <div v-show="expandedStates[pi]" class="lists">
        <div 
          @contextmenu.prevent="menuEvent(list, index, p)" 
          @click="checkPlaylist(index + p.begin)" 
          v-for="(list, index) in playlists.slice(p.begin, p.begin + p.count)" 
          :key="index"
          class="item">
          <TargetBorder>
            <div class="img">
              <img referrerpolicy="no-referrer" :src="list.pic" alt="">
            </div>
          </TargetBorder>
          <div class="title">{{ list.title }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.divideTitle {
  color: var(--ymk-text-color);
  margin: 20px;
  font-size: 24px;
  font-family: PingFang SC;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}

.arrow {
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.2s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-in-out;
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

.lists {
  flex: 1;
  display: grid;
  padding: 0 20px;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(182px, 1fr));
  justify-content: center;
  grid-auto-rows: 1fr;
  transform-origin: top;
}

.item {
  width: 100%;
  cursor: pointer;
}
.item .img {
  border-radius: 2px;
  overflow: hidden;
  width: 162px;
  height: 162px;
  /* box-shadow: 0 0 5px rgba(0, 0, 0, .5) */
}
.item .img img {
  width: 162px;
  height: 162px;
  object-fit: cover;
  box-shadow: 0 0 4px rgba(0, 0, 0, .4);
  transition: transform .2s ease-in-out;
}
.item .title {
  font-family: SourceSansCNM;
  letter-spacing: 1px;
  /* color: #333;
  text-shadow: 0 0 5px rgba(0, 0, 0, .2); */
  text-shadow: 0 0 4px rgba(0, 0, 0, .6);
  color: var(--ymk-text-color);
  margin-top: 5px;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  line-height: 32px;
}
.item:hover .img img {
  transform: scale(1.03);
}
</style>