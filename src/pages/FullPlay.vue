<template>
<div class="partContainer forbidSelect">
  <div class="exitButton" @click="runtimeData.showFullPlay = false">
    <svg t="1711457272465" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4244" width="24" height="24"><path d="M963.2 0L1024 67.2 512 614.4 0 67.2 60.8 0 512 480 963.2 0z" fill="currentColor" p-id="4245"></path></svg>
  </div>
    <div class="lyricPart" @wheel="lyricWheelEvent">
      <Transition name="uianim">
        <div v-if="Object.keys(playerStore.song.lrcs).length" ref="lrcContentEl" class="lrcContent">
            <div ref="lrcContainerEl" class="lrcContainer allPointerEvents">
                <div @click="turnSongToSpecificLyric(l)" v-for="(l, i) in LRC.items" class="lrcItem" :class="{blank: l.text.every(t => t === ''), active: i === playerStore.config.highlightLrcIndex}">
                  <div v-for="t in l.text">{{ t }}</div>
                </div>
            </div>
        </div>
        <div v-else class="lrcStatus">
            <div class="status">「 No lrc 」</div>
        </div>
      </Transition>
      <div class="fixedSongInfo">
        <div class="title" @click="copy(playerStore.song.title, 'title')">
          <div class="singleLineTextEl text">{{ playerStore.song.title }}</div>
          <Transition appear name="fade"><img v-if="copySign.title" src="@/assets/checkmark.svg"/></Transition>
        </div>
        <div class="singer" @click="copy(playerStore.song.singer, 'signer')">
          <div class="singleLineTextEl text">{{ playerStore.song.singer }}</div>
          <Transition appear name="fade"><img v-if="copySign.signer" src="@/assets/checkmark.svg"/></Transition>
        </div>
      </div>
    </div>
    <div class="controllPart">
      <div class="progresses">
        <div class="timeProgress">
          <Progress :tip-progress="true" :progress="playerStore.config.progress" @pclick="changePlayProgress"></Progress>
          <div class="tips">
            <div class="currentTime">{{ playerStore.config.curTime }}</div>
            <div class="controlButtons">
              <div @click="emitter.emit('playPrevSong')" class="playbutton play_last">
                  <svg t="1711336017191" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1537"><path d="M772.930954 40.644923L301.575877 512l471.355077 471.355077a23.809313 23.809313 0 0 1-33.671221 33.67122L251.069046 528.83561a23.809313 23.809313 0 0 1 0-33.67122L739.259733 6.973703a23.809313 23.809313 0 0 1 33.671221 33.67122z" p-id="1538" fill="currentColor" stroke="currentColor" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
              <div class="playbutton play_pause">
                  <svg t="1711335223450" @click="playerStore.config.status = 'pause'" class="icon playbutton_pause" v-show="playerStore.config.status === 'play'" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6684"><path d="M325.008696 0c-28.93913 0-51.2 22.26087-51.2 51.2l0 919.373913c0 28.93913 22.26087 51.2 51.2 51.2s51.2-22.26087 51.2-51.2L376.208696 53.426087C376.208696 24.486957 351.721739 0 325.008696 0zM698.991304 0c-28.93913 0-51.2 22.26087-51.2 51.2l0 919.373913c0 28.93913 22.26087 51.2 51.2 51.2s51.2-22.26087 51.2-51.2L750.191304 53.426087C752.417391 24.486957 727.930435 0 698.991304 0z" fill="currentColor" p-id="6685"></path></svg>
                  <svg t="1711335286889" @click="playerStore.config.status = 'play'" class="icon playbutton_play" v-show="playerStore.config.status === 'pause'" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2003"><path d="M897.113042 467.478259 182.539132 8.904348C166.956523-2.226087 144.695654-2.226087 129.113045 6.678261c-15.582609 8.904348-26.713043 26.713043-26.713043 44.521739l0 919.373909c0 20.034783 11.130435 35.617391 26.713043 44.521739C138.017393 1021.773909 144.695654 1023.999996 153.600001 1023.999996c8.904348 0 20.034783-2.226087 28.93913-8.904348L897.113042 556.521737c15.582609-8.904348 24.486956-26.713043 24.486956-44.521739C921.599998 494.191302 912.695651 478.608694 897.113042 467.478259zM204.800001 877.078257 204.800001 146.921739 774.67826 511.999998 204.800001 877.078257z" fill="currentColor" p-id="2004"></path></svg>
              </div>
              <div @click="emitter.emit('playNextSong')" class="playbutton play_next">
                  <svg t="1711336037990" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1699"><path d="M251.069046 983.355077l471.355077-471.355077L251.069046 40.644923A23.809313 23.809313 0 0 1 284.740267 6.973703l488.190687 488.190687a23.809313 23.809313 0 0 1 0 33.67122L284.740267 1017.026297A23.809313 23.809313 0 0 1 251.069046 983.355077z" fill="currentColor" p-id="1700" stroke="currentColor" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </div>
              <div class="playmodeController">
                  <Transition mode="out-in" name="playcontroller">
                      <div @click="playerStore.config.mode = 'loop'" v-if="playerStore.config.mode === 'list'" class="modeitem mode_list">
                          <svg t="1711798875114" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4579"><path d="M920 760H336c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM920 192H336c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM920 476H336c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM216 712H100c-2.2 0-4 1.8-4 4v34c0 2.2 1.8 4 4 4h72.4v20.5h-35.7c-2.2 0-4 1.8-4 4v34c0 2.2 1.8 4 4 4h35.7V838H100c-2.2 0-4 1.8-4 4v34c0 2.2 1.8 4 4 4h116c2.2 0 4-1.8 4-4V716c0-2.2-1.8-4-4-4zM100 188h38v120c0 2.2 1.8 4 4 4h40c2.2 0 4-1.8 4-4V152c0-4.4-3.6-8-8-8h-78c-2.2 0-4 1.8-4 4v36c0 2.2 1.8 4 4 4zM216 428H100c-2.2 0-4 1.8-4 4v36c0 2.2 1.8 4 4 4h68.4l-70.3 77.7c-1.3 1.5-2.1 3.4-2.1 5.4V592c0 2.2 1.8 4 4 4h116c2.2 0 4-1.8 4-4v-36c0-2.2-1.8-4-4-4h-68.4l70.3-77.7c1.3-1.5 2.1-3.4 2.1-5.4V432c0-2.2-1.8-4-4-4z" p-id="4580" fill="currentColor"></path></svg>
                      </div>
                      <div @click="playerStore.config.mode = 'rand'" v-else-if="playerStore.config.mode === 'loop'" class="modeitem mode_loop">
                          <svg t="1711355991685" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3367"><path d="M912.695652 359.513043V801.391304c0 24.486957-20.034783 44.521739-44.521739 44.521739H212.591304c-24.486957 0-44.521739-20.034783-44.521739-44.521739s20.034783-44.521739 44.521739-44.521739H823.652174V400.695652H263.791304l61.217392 62.330435c17.808696 17.808696 17.808696 46.747826 0 64.556522-8.904348 8.904348-20.034783 13.356522-31.165218 13.356521-11.130435 0-22.26087-4.452174-31.165217-13.356521L124.66087 390.678261c-8.904348-8.904348-13.356522-20.034783-13.356522-31.165218 0-12.243478 4.452174-23.373913 13.356522-31.165217l138.017391-136.904348c17.808696-17.808696 45.634783-17.808696 63.443478 0s16.695652 44.521739 0 62.330435L263.791304 311.652174H868.173913c24.486957 0 44.521739 23.373913 44.521739 47.860869z" p-id="3368" fill="currentColor"></path></svg>
                      </div>
                      <div @click="playerStore.config.mode = 'list'" v-else-if="playerStore.config.mode === 'rand'" class="modeitem mode_rand">
                          <svg t="1711355957905" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3201"><path d="M759.095652 333.913043C712.347826 333.913043 595.478261 449.669565 509.773913 533.147826 380.66087 657.808696 258.226087 779.130435 160.278261 779.130435H100.173913c-24.486957 0-44.521739-20.034783-44.521739-44.521739s20.034783-44.521739 44.521739-44.521739h60.104348c62.330435 0 186.991304-124.66087 287.165217-221.495653 122.434783-117.982609 228.173913-223.721739 311.652174-223.721739h57.878261l-61.217391-58.991304c-17.808696-17.808696-17.808696-43.408696 0-61.217391s45.634783-17.808696 63.443478 0l136.904348 136.904347c8.904348 8.904348 13.356522 20.034783 13.356522 31.165218 0 12.243478-4.452174 23.373913-13.356522 31.165217L818.086957 460.8c-8.904348 8.904348-20.034783 12.243478-31.165218 12.243478-11.130435 0-22.26087-4.452174-31.165217-13.356521-17.808696-17.808696-17.808696-46.747826 0-63.443479l61.217391-62.330435h-57.878261z m58.991305 229.286957c-17.808696-17.808696-45.634783-17.808696-63.443479 0-17.808696 17.808696-17.808696 46.747826 0 64.556522l61.217392 62.330435h-57.878261c-36.730435 0-97.947826-54.53913-158.052174-110.191305-17.808696-16.695652-45.634783-16.695652-63.443478 1.113044-16.695652 17.808696-15.582609 47.86087 2.226086 64.556521 93.495652 85.704348 155.826087 133.565217 220.382609 133.565218h57.878261l-61.217391 58.991304c-17.808696 17.808696-17.808696 44.521739 0 62.330435 8.904348 8.904348 20.034783 12.243478 31.165217 12.243478 11.130435 0 22.26087-4.452174 31.165218-13.356522l136.904347-136.904347c8.904348-8.904348 13.356522-20.034783 13.356522-31.165218 0-12.243478-4.452174-23.373913-13.356522-31.165217L818.086957 563.2zM100.173913 333.913043h60.104348c46.747826 0 116.869565 60.104348 172.521739 110.191305 8.904348 7.791304 18.921739 12.243478 30.052174 12.243478 12.243478 0 24.486957-4.452174 33.391304-14.469565 16.695652-17.808696 15.582609-47.86087-3.33913-64.556522-86.817391-79.026087-160.278261-133.565217-232.626087-133.565217H100.173913c-24.486957 0-44.521739 20.034783-44.521739 44.521739S75.686957 333.913043 100.173913 333.913043z" p-id="3202" fill="currentColor"></path></svg>
                      </div>
                  </Transition>
              </div>
              <VDropdown placement="top" popperClass="langPopperContainer">
              <div
                  class="translate">
                <svg t="1711805276586" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5600"><path d="M661.333333 725.333333c-17.066667 0-32-8.533333-38.4-25.6L586.666667 618.666667h-149.333334l-36.266666 81.066666c-8.533333 21.333333-34.133333 32-55.466667 21.333334-21.333333-8.533333-32-34.133333-21.333333-55.466667l46.933333-106.666667v-2.133333l102.4-234.666667c6.4-14.933333 21.333333-25.6 38.4-25.6s32 10.666667 38.4 25.6l102.4 234.666667v2.133333l46.933333 106.666667c8.533333 21.333333 0 46.933333-21.333333 55.466667-6.4 2.133333-10.666667 4.266667-17.066667 4.266666z m-187.733333-192h74.666667L512 448l-38.4 85.333333z" fill="currentColor" p-id="5601"></path><path d="M921.6 469.333333c-19.2 0-38.4-14.933333-42.666667-34.133333C842.666667 258.133333 684.8 128 503.466667 128 347.733333 128 211.2 221.866667 151.466667 360.533333l49.066666-17.066666c21.333333-6.4 46.933333 4.266667 53.333334 27.733333 6.4 21.333333-4.266667 46.933333-27.733334 53.333333l-128 42.666667c-14.933333 4.266667-29.866667 2.133333-42.666666-8.533333-10.666667-10.666667-14.933333-25.6-12.8-40.533334C87.466667 200.533333 281.6 42.666667 503.466667 42.666667s416 157.866667 460.8 375.466666c4.266667 23.466667-10.666667 44.8-34.133334 51.2h-8.533333zM503.466667 981.333333C281.6 981.333333 87.466667 823.466667 42.666667 605.866667c-4.266667-23.466667 10.666667-44.8 34.133333-51.2 23.466667-4.266667 44.8 10.666667 51.2 34.133333C164.266667 765.866667 322.133333 896 503.466667 896c153.6 0 290.133333-91.733333 349.866666-226.133333l-27.733333 10.666666c-21.333333 8.533333-46.933333-2.133333-55.466667-23.466666-8.533333-21.333333 2.133333-46.933333 23.466667-55.466667l110.933333-42.666667c14.933333-6.4 32-2.133333 42.666667 6.4 12.8 10.666667 17.066667 25.6 14.933333 40.533334C919.466667 823.466667 725.333333 981.333333 503.466667 981.333333z" fill="currentColor" p-id="5602"></path></svg>
              </div>
              <template #popper>
                <div class="chooseLangPanel">
                  <VueDraggable :animation="150" v-model="player.config.langPreferences">
                    <div :class="{disabled: !(item in playerStore.song.lrcs)}" class="langItem" @click="toggleLyricLang(item, !(item in playerStore.song.lrcs))" v-for="(item, i) in player.config.langPreferences">{{ langStringMapper[item] }}</div>
                  </VueDraggable>
                </div>
              </template>
              </VDropdown>
              <div @click="toggleLikeDislike" class="playbutton like">
                <svg v-if="isLiked" t="1742108569321" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5332" id="mx_n_1742108569322" width="24" height="24"><path d="M512 926h-6c-6 0-12-3-15-9L143 569C92 518 62 449 62 374s30-144 81-195c51-51 120-81 195-81 63 0 126 21 174 63 108-90 270-81 369 18 108 108 108 282 0 390L533 917c-6 6-12 9-21 9z" fill="currentColor" p-id="5333"></path></svg>
                <svg v-else t="1742108433940" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2355" width="24" height="24"><path d="M908.8 166.4c-105.6-108.8-278.4-118.4-396.8-25.6-118.4-96-291.2-86.4-396.8 22.4C6.4 281.6 9.6 467.2 128 582.4l348.8 348.8c9.6 9.6 22.4 16 38.4 16s28.8-6.4 38.4-16L896 582.4c118.4-115.2 121.6-300.8 12.8-416z m-57.6 371.2L512 880 172.8 537.6c-92.8-89.6-96-236.8-9.6-326.4 44.8-44.8 105.6-70.4 166.4-70.4 51.2 0 105.6 19.2 147.2 54.4 19.2 19.2 51.2 19.2 73.6 0 92.8-76.8 230.4-70.4 313.6 16 83.2 89.6 80 236.8-12.8 326.4z" fill="currentColor" p-id="2356"></path></svg>
              </div>
            </div>
            <div class="duration">{{ playerStore.config.durationTime }}</div>
          </div>
        </div>
        <div class="volumeProgress">
          <Progress ref="volumeProgressRef" @pclick="changeVolumeProgress" :progress="playerStore.config.volume * 100"></Progress>
          <div ref="volumeTip" class="tips">
            {{ (playerStore.config.volume  * 100).toFixed() }}
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang='ts'>
import emitter from '@/emitter';
import Progress from '@/components/Progress.vue';
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import { minmax } from '@/utils/u';
import type {song_lrc_item} from '@/types';
import {VueDraggable} from "vue-draggable-plus";
import {langStringMapper} from "@/utils/stringMapper";
import {usePlayerStore} from "@/stores/modules/player";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import { showMessage } from '@/utils/message';
import { isSongInPlaylist } from '@/utils/checkSongExist';
import { addSongToPlaylist, removeSongFromPlaylist } from '@/utils/Toolkit';
const {isMinimized, onRestore} = window.ymkAPI;
const runtimeData = useRuntimeDataStore()
const player = usePlayerStore()
const playerStore = usePlayerStore();
const isLiked = computed(() => {
  const [result] = isSongInPlaylist(playerStore.song.origin, runtimeData.defaultPlaylist)
  return result
})
let lrcContentEl = useTemplateRef('lrcContentEl')
let lrcContainerEl = useTemplateRef('lrcContainerEl')
let lyricAutoScrollLock = false;
let lyricAutoScrollLockTimer: any = -2;
const volumeProgressRef = useTemplateRef('volumeProgressRef')
const LRC = computed(() => playerStore.song.lrcs[playerStore.config.lang] || {enableAutoScroll: false, items: []})
function turnSongToSpecificLyric(lrcItem: song_lrc_item) {
  emitter.emit('changeCurTimeTo', lrcItem.time + playerStore.song.lyricConfig.offset)
}

function resetLyricAutoScrollTimer(lock = true, time = 2500) {
  if (lock) lyricAutoScrollLock = lock;
  clearTimeout(lyricAutoScrollLockTimer);
  lyricAutoScrollLockTimer = setTimeout(() => {
    lyricAutoScrollLock = false;
    freshLrcElement();
  }, time);
}

function changePlayProgress(targetProgress: number) {
  emitter.emit('changeCurTimeTo',minmax(playerStore.config.duration * targetProgress, 0, playerStore.config.duration));
}
const volumeTip = useTemplateRef('volumeTip')
function changeVolumeProgress(target: number, left: number, width: number) {
  playerStore.config.volume = minmax(target, 0, 1)
  nextTick(() => {
    const rect = volumeTip.value!.getBoundingClientRect()
    volumeTip.value!.style.transform = `translateX(${minmax(left - rect.width, 0, width)}px)`;
  })
}
function updateHighlightedIndex(ignoreLock = false) {
  if (!LRC.value.enableAutoScroll) {
    return
  }
  if (!LRC.value) return;
  let offset = playerStore.song.lyricConfig.offset;
  for (let i = 0; i < LRC.value.items.length; i++) {
    // 如果当前时间小于当前歌词的时间，说明当前播放到了这句的上一句歌词
    if (playerStore.config.curTimeNum + offset < LRC.value.items[i].time) {
      // 返回当前歌词的索引
      playerStore.config.highlightLrcIndex = i - 1 >= 0 ? i - 1 : 0;
      freshLrcElement(ignoreLock)
      return;
    }
  }
  playerStore.config.highlightLrcIndex = LRC.value.items.length - 1;
  freshLrcElement(ignoreLock)
  return;
}
function toggleLyricLang(lang: string, sourceDisabled: boolean = false) {
  if (sourceDisabled) return;
  playerStore.config.lang = lang;
}
emitter.on('updateActiveLrcIndex', updateHighlightedIndex)
async function freshLrcElement(force = false) {
  if (!LRC.value) return;
  if (!force && lyricAutoScrollLock) return;
  if (!await isMinimized()) {
    nextTick(() => {
      if (lrcContainerEl.value && lrcContentEl.value) {
        let activeLrcItem = <HTMLDivElement>lrcContainerEl.value.querySelector('.lrcItem.active')
        if (activeLrcItem) {
            let targetOffset = activeLrcItem.offsetTop -
                                lrcContentEl.value.clientHeight / 2 +
                                activeLrcItem.clientHeight / 2;
            lrcContainerEl.value.style.transform = `translateY(${-targetOffset}px)`
        }
      }
    })
  }
}
function lyricWheelEvent(e: WheelEvent) {
  if (!lrcContainerEl.value || !lrcContainerEl.value || !lrcContentEl.value) return;
  let transformCSS = lrcContainerEl.value.style.transform.match(/translateY\(([-\d.]+)p?x?\)/);
  let transformVal
  if (!transformCSS || !transformCSS[1]) {
    transformVal = 0
  }else {
    transformVal = Number(transformCSS[1])
  }
  let firstItem: HTMLDivElement = lrcContainerEl.value.querySelector('.lrcItem')!;
  let lastItem: HTMLDivElement = lrcContainerEl.value.querySelector('.lrcItem:last-child')!;
  if (!firstItem || !lastItem) return;
  let maxV = lrcContentEl.value.clientHeight / 2 - firstItem.clientHeight / 2 - firstItem.offsetTop;
  let minV = lrcContentEl.value.clientHeight / 2 - lastItem.clientHeight / 2 - lastItem.offsetTop;
  LRC.value.enableAutoScroll && resetLyricAutoScrollTimer();
  lrcContainerEl.value.style.transform = `translateY(${minmax(transformVal - e.deltaY, minV, maxV)}px)`
}
freshLrcElement();
watch([() => playerStore.config.lang, () => playerStore.song.lrcs, () => runtimeData.showFullPlay], () => {
  playerStore.config.highlightLrcIndex = -1
  updateHighlightedIndex(true);
}, {deep: true})
onRestore(updateHighlightedIndex);
const copySign = reactive({
  title: false,
  signer: false,
})
onMounted(() => {
  const rect = volumeTip.value!.getBoundingClientRect()
  const fillrect = volumeProgressRef.value!.progressfill!.getBoundingClientRect()
  const maxw = volumeProgressRef.value!.progresscontainer!.getBoundingClientRect().width
  volumeTip.value!.style.transform = `translateX(${minmax(fillrect.width - rect.width, 0, maxw)}px)`;
})
function copy(content: string, sign: keyof typeof copySign) {
  navigator.clipboard.writeText(content)
  showMessage('复制成功')
  copySign[sign] = true
  setTimeout(() => copySign[sign] = false, 2000)
}
function toggleLikeDislike() {
  if (isLiked.value) {
    removeSongFromPlaylist(playerStore.song.origin, runtimeData.defaultPlaylist, true)
  }else {
    addSongToPlaylist(playerStore.song.origin, runtimeData.defaultPlaylist, true)
  }
}
</script>

<style scoped>

.progresses {
  margin: 10px 0 5px 0;
  width: 100%;
  display: grid;
  gap: 20px;
  grid-template-columns: 4fr 1fr;
  grid-template-rows: 1fr;
  font-family: SourceSansCNM;
  color: #fff;
}
.progresses .progressbar {
  cursor: pointer;
  overflow: hidden;
  height: 4px;
  border-radius: 4px;
  filter: drop-shadow(0 0 5px #999);
  background-color: #999;
}
.progressbar .progressfill {
  transition: width .2s;
  border-radius: 4px;
  height: 100%; 
  background-color: #fff;
}
.progressbar .progresstip {
  height: 100%;
  background-color: #ccc;
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
}
.timeProgress {
  max-width: 100%;
  overflow: hidden;
}
.timeProgress .tips {
  margin-top: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-shadow: 0 0 10px #fff;
}
.volumeProgress {
  color: #fff;
  text-shadow: 0 0 10px #fff;
  gap: 5px;
}
.volumeProgress .progressbar {
  flex: 1;
}
.volumeProgress .tips {
  margin-top: 5px;
  position: relative;
  transition: all .2s;
  display: inline-block;
}
.exitButton {
  app-region: no-drag;
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--ymk-text-color);
}
.exitButton:hover {
  opacity: 1;
}

.partContainer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.partContainer .controllPart {
    display: flex;
    margin: 0 20px;
    flex-direction: column;
    align-items: center;
    position: relative;
}
.partContainer .controllPart .controlButtons {
    margin: 10px 0;
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(6, 1fr);
}
.partContainer .controllPart .controlButtons .playbutton {
    width: 24px;
    height: 24px;
    color: var(--ymk-color);
    margin: 0 20px;
    filter: drop-shadow(0 0 5px currentColor);
}

.partContainer .controllPart .controlButtons .translate {
    width: 24px;
    height: 24px;
    color: var(--ymk-text-color);
    margin: 0 20px;
    filter: drop-shadow(0 0 5px #fff);
}

.lrcContent, .partContainer .lyricPart .lrcStatus {
    height: calc(100% - 20px);
    overflow: hidden;
    position: relative;
}
.lyricPart {
  overflow-y: hidden;
  flex: 1;
  position: relative;
}
.lrcContent {
  margin: 0 20px 0 10px;
  overflow: visible;
}
.lrcContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  transform: translateY(0);
  transition: all .2s;
  left: 0;
  right: 0;
}
.lrcContainer .lrcItem {
  app-region: no-drag;
  display: inline-block;
  padding: 10px 0;
  font-family: SourceSansCNM;
  margin: 5px 0;
  font-size: 16px;
  text-align: center;
  word-break: break-all;
  transition: all .2s;
  color: #ccc;
}
.lrcContainer .lrcItem.active, .lrcContainer .lrcItem:hover {
  cursor: pointer;
}
.lrcContainer .lrcItem.active {
  scale: 1.1
}
.lrcContainer .lrcItem.active:not(.blank), .lrcContainer .lrcItem:not(.blank):hover {
  color: #fff;
  text-shadow: 0 0 10px #fff;
}
.partContainer .playmodeController {
    height: 24px;
    margin: 0 20px;
}
.partContainer .playmodeController .modeitem {
    cursor: pointer;
    color: var(--ymk-color);
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 0 5px #fff);
}
.partContainer .lyricPart .lrcStatus {
    display: flex;
    align-items: center;
    justify-content: center;
}
.partContainer .lyricPart .lrcStatus .status {
    font-family: NovecentoWide, SourceSansCNM;
    font-size: 44px;
    color: var(--ymk-text-color);
    text-shadow: 0 0 5px #000;
    opacity: 0.5;
}

.chooseLangPanel {
  padding: 10px;
}
.chooseLangPanel .langItem {
  text-align: center;
  cursor: pointer;
  line-height: 40px;
  height: 40px;
  margin: 0 5px;
  padding: 0 5px;
}
.chooseLangPanel .langItem.disabled {
  cursor: not-allowed;
  color: #aaa;
}
.chooseLangPanel .langItem:not(.disabled):hover {
  background-color: #eee;
}
.fixedSongInfo {
  font-family: SourceSansCNM;
  max-width: 25%;
  overflow: hidden;
  opacity: 0.5;
  position: absolute;
  left: 20px;
  color: #fff;
  /* text-shadow: 0 0 5px #fff; */
  bottom: 5px;
}
.fixedSongInfo > div {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.fixedSongInfo .singleLineTextE .text {
  max-width: 100%;
}
.fixedSongInfo .singleLineTextEl img {
  max-height: 100%;
}
.fixedSongInfo .title {
  height: 24px;
  font-size: 20px;
}
.fixedSongInfo .singer {
  height: 20px;
  margin-top: 2px;
  font-size: 16px;
  opacity: 0.8;
}

.playbutton.like {
  transition: all .3s;
  &:hover {
    scale: 1.05;
  }
  &:active {
    scale: 0.95;
  }
}
</style>