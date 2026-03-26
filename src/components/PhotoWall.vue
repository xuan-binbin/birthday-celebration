<template>
  <transition name="photo-wall">
    <div 
      v-if="visible" 
      class="photo-wall-overlay"
      @wheel.prevent="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        id="photo-ball" 
        class="photo-container"
        :style="containerStyle"
      >
        <template v-for="(item, index) in items" :key="index">
          <img 
            v-if="item.type === 'photo'"
            class="photo"
            :src="item.url"
            :style="getPhotoStyle(index)"
            @click="previewPhoto(item.url)"
          />
          <div 
            v-else
            class="photo color-block"
            :style="[getPhotoStyle(index), { backgroundColor: item.color }]"
          ></div>
        </template>
      </div>
      
      <button class="close-btn" @click="close">×</button>
      
      <div class="zoom-hint">
        <span>滚轮/双指缩放</span>
      </div>
      
      <div class="photo-wall-title">
        <h2>美好回忆</h2>
        <p>2022 - 精彩瞬间</p>
      </div>
      
      <div v-if="previewVisible" class="photo-preview" @click="closePreview">
        <img :src="previewUrl" class="preview-image" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
  '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
  '#D65076', '#45B8AC', '#EFC050', '#5B5EA6', '#9B2335',
  '#DFCFBE', '#55B4B0', '#E15D44', '#7FCDCD', '#BC243C',
  '#C3447A', '#98B4D4', '#FFBF00', '#00A86B', '#E6A8D7',
  '#9E4784', '#4A90A4', '#D4A5A5', '#88D8B0', '#FFCC5C',
  '#FF6F69', '#96E6A1', '#DDA0DD', '#87CEEB', '#FFA07A',
  '#20B2AA', '#778899', '#B0C4DE', '#FFDAB9', '#E6E6FA',
  '#F0E68C', '#D2B48C', '#BC8F8F', '#4682B4', '#D2691E',
  '#CD853F', '#8FBC8F', '#F4A460', '#2E8B57', '#6B8E23',
  '#708090', '#483D8B', '#00CED1', '#9400D3', '#FF1493',
  '#00BFFF', '#228B22', '#FFD700', '#FF4500', '#DC143C',
  '#00FF7F', '#6495ED', '#FF69B4', '#4169E1', '#8A2BE2',
  '#32CD32', '#ADFF2F', '#FF00FF', '#1E90FF', '#FF8C00',
  '#00FA9A', '#7B68EE', '#00FFFF', '#7CFC00', '#E0FFFF'
]

const items = computed(() => {
  const arr = []
  for (let i = 1; i <= 96; i++) {
    if (i <= 17) {
      arr.push({ 
        type: 'photo', 
        url: '/photos/photo' + i + '.jpg' 
      })
    } else {
      arr.push({ 
        type: 'color', 
        color: colors[(i - 18) % colors.length]
      })
    }
  }
  return arr
})

const previewVisible = ref(false)
const previewUrl = ref('')

const scale = ref(1)
const minScale = 0.3
const maxScale = 3

let touchStartDistance = 0
let touchStartScale = 1

const containerStyle = computed(() => ({
  transform: `scale(${scale.value})`
}))

const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(minScale, Math.min(maxScale, scale.value + delta))
}

const getTouchDistance = (touches) => {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    touchStartDistance = getTouchDistance(e.touches)
    touchStartScale = scale.value
  }
}

const handleTouchMove = (e) => {
  if (e.touches.length === 2 && touchStartDistance > 0) {
    const currentDistance = getTouchDistance(e.touches)
    const scaleChange = currentDistance / touchStartDistance
    scale.value = Math.max(minScale, Math.min(maxScale, touchStartScale * scaleChange))
  }
}

const handleTouchEnd = () => {
  touchStartDistance = 0
}

const getPhotoStyle = (index) => {
  const styles = []
  
  if (index < 18) {
    const rotation = 20 * index
    styles.push(`transform: rotateY(${rotation}deg) rotateX(0deg) translateZ(450px)`)
  }
  else if (index >= 18 && index < 34) {
    const rotation = (360/16) * (index - 18)
    styles.push(`transform: rotateY(${rotation + 5}deg) rotateX(21deg) translateZ(450px)`)
  }
  else if (index >= 34 && index < 50) {
    const rotation = (360/16) * (index - 34)
    styles.push(`transform: rotateY(${rotation + 5}deg) rotateX(-21deg) translateZ(450px)`)
  }
  else if (index >= 50 && index < 64) {
    const rotation = (360/14) * (index - 50)
    styles.push(`transform: rotateY(${rotation}deg) rotateX(42deg) translateZ(450px)`)
  }
  else if (index >= 64 && index < 78) {
    const rotation = (360/14) * (index - 64)
    styles.push(`transform: rotateY(${rotation}deg) rotateX(-42deg) translateZ(450px)`)
  }
  else if (index >= 78 && index < 86) {
    const rotation = (360/8) * (index - 78)
    styles.push(`transform: rotateY(${rotation + 10}deg) rotateX(63deg) translateZ(450px)`)
  }
  else if (index >= 86 && index < 94) {
    const rotation = (360/8) * (index - 86)
    styles.push(`transform: rotateY(${rotation + 10}deg) rotateX(-63deg) translateZ(450px)`)
  }
  else if (index >= 94 && index < 95) {
    styles.push(`transform: rotateY(0deg) rotateX(90deg) translateZ(450px)`)
  }
  else if (index >= 95 && index < 96) {
    styles.push(`transform: rotateY(0deg) rotateX(-90deg) translateZ(450px)`)
  }
  
  return styles.join(';')
}

const previewPhoto = (url) => {
  previewUrl.value = url
  previewVisible.value = true
}

const closePreview = () => {
  previewVisible.value = false
}

const close = () => {
  emit('close')
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    scale.value = 1
  }
})
</script>

<style scoped>
.photo-wall-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  z-index: 2000;
  overflow: hidden;
  touch-action: none;
}

.photo-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  transform-style: preserve-3d;
  animation: rotate_Y 15s infinite linear;
  transition: transform 0.1s ease-out;
}

.photo {
  position: absolute;
  width: 100px;
  height: 100px;
  left: calc(50% - 50px);
  top: calc(50% - 50px);
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  box-shadow: -4px 0px 12px rgba(100, 200, 255, 0.5),
              4px 0px 12px rgba(100, 200, 255, 0.5),
              0 -4px 12px rgba(100, 200, 255, 0.5),
              0 4px 12px rgba(100, 200, 255, 0.5);
  transition: transform 1.5s ease-in-out;
  animation: fadeInScale 3s ease-in-out infinite;
  cursor: pointer;
  object-fit: cover;
}

.color-block {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.photo:hover {
  box-shadow: -10px 0px 20px rgba(255, 200, 100, 0.8),
              10px 0px 20px rgba(255, 200, 100, 0.8),
              0 -10px 20px rgba(255, 200, 100, 0.8),
              0 10px 20px rgba(255, 200, 100, 0.8);
}

@keyframes rotate_Y {
  from {
    transform: rotateX(-15deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-15deg) rotateY(360deg);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.95;
  }
  100% {
    opacity: 0.7;
  }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3000;
}

.close-btn:hover {
  background: rgba(255, 107, 107, 0.6);
  transform: rotate(90deg);
}

.zoom-hint {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  z-index: 3000;
  pointer-events: none;
}

.photo-wall-title {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 3000;
  pointer-events: none;
}

.photo-wall-title h2 {
  font-family: 'Great Vibes', cursive;
  font-size: 3rem;
  background: linear-gradient(135deg, #ffd700, #ff69b4, #4ecdc4);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 3s ease infinite;
  margin: 0;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.photo-wall-title p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-top: 8px;
}

.photo-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 4000;
  cursor: pointer;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.photo-wall-enter-active {
  animation: fadeIn 0.5s ease-out;
}

.photo-wall-leave-active {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
