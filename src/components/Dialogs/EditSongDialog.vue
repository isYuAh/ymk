<script setup lang="ts">
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import {saveSpecificPlaylist} from "@/utils/Toolkit";
import { ref, watch } from "vue";
import DSelect from "@/components/DSelect.vue";

const props = defineProps<{
  closeDialog: () => void
  data: any
}>()

const runtimeData = useRuntimeDataStore()
const customLyricType = ref('')
const customLyricSymbol = ref('')

const lyricOptions = [
  { value: '', label: '不使用自定义歌词' },
  { value: 'netease', label: '网易云音乐' },
  { value: 'kugou', label: '酷狗音乐' }
]

watch(() => props.data.song, (newSong) => {
  if (newSong.customLyric) {
    customLyricType.value = newSong.customLyric.type
    customLyricSymbol.value = newSong.customLyric.symbol
  } else {
    customLyricType.value = ''
    customLyricSymbol.value = ''
  }
}, { immediate: true })

function confirmF() {
  if (typeof props.data.si !== 'number') {
    return;
  }
  let np = runtimeData.playlists[runtimeData.playlist.listIndex];
  if (np.playlist[0].type == "data") {
    const updatedSong = {
      title: props.data.song.title,
      singer: props.data.song.singer,
    }
    
    if (customLyricType.value && customLyricSymbol.value) {
      Object.assign(updatedSong, {
        customLyric: {
          type: customLyricType.value,
          symbol: customLyricSymbol.value
        }
      })
    } else {
      Object.assign(updatedSong, { customLyric: undefined })
    }
    
    Object.assign(np.playlist[0].songs[props.data.si], updatedSong)
  }
  saveSpecificPlaylist(np);
  props.closeDialog()
}

function clearCustomLyric() {
  customLyricType.value = ''
  customLyricSymbol.value = ''
}
</script>

<template>
  <div class="dialogPreviewContainer DEF-DIALOG-CONTENT">
    <div class="header">编辑歌曲</div>
    <div class="content">
      <div class="input-group">
        <label>歌曲标题</label>
        <input style="width: 400px" v-model="data.song.title" type="text" />
      </div>
      <div class="input-group">
        <label>歌手</label>
        <input style="width: 400px" v-model="data.song.singer" type="text" />
      </div>
      
      <div class="custom-lyric-section">
        <h3>自定义歌词</h3>
        <div class="input-group">
          <label>歌词来源</label>
          <DSelect 
            v-model="customLyricType" 
            :options="lyricOptions" 
            placeholder="选择歌词来源"
            style="width: 200px"
          />
        </div>
        
        <div v-if="customLyricType" class="input-group">
          <label>歌曲ID/Hash</label>
          <input 
            style="width: 400px" 
            v-model="customLyricSymbol" 
            type="text" 
            :placeholder="customLyricType === 'netease' ? '请输入网易云音乐ID' : '请输入酷狗音乐Hash'"
          />
          <button @click="clearCustomLyric" class="clear-btn">清除</button>
        </div>
      </div>
    </div>
    <div class="footer">
      <button @click="confirmF" class="dialogBtn">确认</button>
      <button @click="closeDialog" class="dialogBtn">取消</button>
    </div>
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-group label {
  width: 100px;
  text-align: right;
  font-weight: 500;
  color: #333;
}

.custom-lyric-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.custom-lyric-section h3 {
  margin: 0 0 16px 0;
  color: #1976d2;
  font-size: 16px;
  font-weight: 600;
}

.clear-btn {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 200, 200, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #2c3e50;
  transition: all 0.25s;
  font-family: SourceSansCNM;
  font-weight: 500;
}

.clear-btn:hover {
  background-color: rgba(240, 240, 240, 0.95);
  border-color: rgba(150, 150, 150, 0.9);
  color: #1a252f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clear-btn:active {
  scale: 0.95;
}
</style>