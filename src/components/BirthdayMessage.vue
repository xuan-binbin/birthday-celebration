<template>
  <div class="birthday-message">
    <div class="message-container">
      <h1 class="title">
        <span class="title-word" v-for="(word, index) in titleWords" :key="index" :style="{ animationDelay: index * 0.2 + 's' }">
          {{ word }}
        </span>
      </h1>
      <div class="subtitle">
        <span class="subtitle-line" v-for="(line, index) in subtitleLines" :key="index" :style="{ animationDelay: index * 0.3 + 1 + 's' }">
          {{ line }}
        </span>
      </div>
      <div class="age-display">
        <span class="age-number" v-for="(num, index) in ageNumbers" :key="index" :style="{ animationDelay: index * 0.15 + 2 + 's' }">
          {{ num }}
        </span>
      </div>
      <p class="blessings">{{ currentBlessing }}</p>
    </div>
    <div class="scroll-indicator" v-if="showScrollIndicator">
      <span>向下滑动</span>
      <div class="scroll-arrow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const blessingsVisible = ref(false)
const showScrollIndicator = ref(true)
const currentBlessingIndex = ref(0)

const titleWords = ['生', '日', '快', '乐']
const subtitleLines = ['愿你的每一天都充满阳光', '愿你的每一个梦想都能实现']
const ageNumbers = ['2', '0']

const blessings = [
  '愿这特别的日子为你带来无限欢乐，愿你的未来如星光般璀璨。',
  '愿你永远保持这颗年轻的心，勇敢追逐自己的梦想。',
  '愿你的笑容永远灿烂如初，你的人生精彩纷呈。',
  '愿所有的美好都与你不期而遇，所有的幸运都与你形影不离。',
  '新的一年，新的开始，愿你遇见更好的自己。'
]

const currentBlessing = computed(() => blessings[currentBlessingIndex.value])

let blessingInterval

const handleScroll = () => {
  if (window.scrollY > 100) {
    showScrollIndicator.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 500)

  setTimeout(() => {
    blessingsVisible.value = true
  }, 3000)

  // 轮换祝福语
  blessingInterval = setInterval(() => {
    currentBlessingIndex.value = (currentBlessingIndex.value + 1) % blessings.length
  }, 8000)

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  clearInterval(blessingInterval)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.birthday-message {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  text-align: center;
}

.birthday-message.visible {
  opacity: 1;
  transform: translateY(0);
}

.message-container {
  max-width: 800px;
}

.title {
  font-family: 'Great Vibes', cursive;
  font-size: 6rem;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.title-word {
  display: inline-block;
  background: linear-gradient(135deg, #ffd700, #ff69b4, #4ecdc4);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleGlow {
  0%, 100% {
    background-position: 0% 50%;
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  }
  50% {
    background-position: 100% 50%;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  }
}

.subtitle {
  margin-bottom: 40px;
}

.subtitle-line {
  display: block;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 3px;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.age-display {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.age-number {
  font-family: 'Poppins', sans-serif;
  font-size: 8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700, #ff6b6b);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.age-number:nth-child(2) {
  animation-delay: 0.15s;
}

@keyframes agePulse {
  0%, 100% {
    transform: scale(1);
    background-position: 0% 50%;
  }
  50% {
    transform: scale(1.05);
    background-position: 100% 50%;
  }
}

.blessings {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.blessings.visible {
  opacity: 1;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  animation: bounce 2s infinite;
}

.scroll-arrow {
  width: 20px;
  height: 20px;
  border-right: 2px solid rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid rgba(255, 255, 255, 0.6);
  transform: rotate(45deg);
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10px);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 3.5rem;
  }

  .age-number {
    font-size: 5rem;
  }

  .subtitle-line {
    font-size: 1.1rem;
  }

  .blessings {
    font-size: 1rem;
  }
}
</style>