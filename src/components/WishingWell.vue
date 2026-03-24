<template>
  <div class="wishing-well" :class="{ expanded: isExpanded }" @click="toggleWell">
    <div class="well-frame">
      <div class="well-body">
        <div class="well-water" :class="{ ripple: isWishing }"></div>
        <div class="well-coins" v-if="!isExpanded">
          <div
            v-for="coin in visibleCoins"
            :key="coin.id"
            class="coin"
            :style="{
              left: coin.x + '%',
              animationDelay: coin.delay + 's',
              animationDuration: coin.duration + 's'
            }"
          >
            <span v-html="coin.text"></span>
          </div>
        </div>
      </div>
      <div class="well-bridge"></div>
    </div>

    <transition name="slide">
      <div class="wishing-panel" v-if="isExpanded" @click.stop>
        <h3>许下心愿</h3>
        <p class="instruction">写下你的愿望，投入井中</p>
        <textarea
          v-model="wishText"
          placeholder="在这里写下你的愿望..."
          class="wish-input"
          :disabled="wishSubmitted"
        ></textarea>
        <button
          v-if="!wishSubmitted"
          class="submit-wish"
          @click="submitWish"
          :disabled="!wishText.trim()"
        >
          投入井中
        </button>
        <div v-else class="wish-success">
          <div class="success-icon" v-html="'&#10004;'"></div>
          <p>愿望已投入井中</p>
          <p class="wish-echo">"{{ submittedWish }}"</p>
        </div>
        <div class="previous-wishes" v-if="previousWishes.length > 0">
          <h4>之前的心愿</h4>
          <div class="wish-list">
            <div
              v-for="(wish, index) in previousWishes"
              :key="index"
              class="wish-item"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              {{ wish }}
            </div>
          </div>
        </div>
        <button class="close-panel" @click="isExpanded = false">关闭</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isExpanded = ref(false)
const isWishing = ref(false)
const wishText = ref('')
const wishSubmitted = ref(false)
const submittedWish = ref('')
const previousWishes = ref([])

const coins = [
  { id: 1, text: '&#9829;', x: 30, delay: 0, duration: 3 },
  { id: 2, text: '&#9733;', x: 50, delay: 0.5, duration: 4 },
  { id: 3, text: '&#9829;', x: 70, delay: 1, duration: 3.5 },
  { id: 4, text: '&#9734;', x: 40, delay: 1.5, duration: 4.5 },
  { id: 5, text: '&#9829;', x: 60, delay: 2, duration: 3.8 }
]

const visibleCoins = computed(() => {
  return isExpanded.value ? [] : coins
})

const toggleWell = () => {
  if (!isExpanded.value) {
    isExpanded.value = true
  }
}

const submitWish = () => {
  if (!wishText.value.trim()) return

  isWishing.value = true
  submittedWish.value = wishText.value

  setTimeout(() => {
    previousWishes.value.unshift(wishText.value)
    if (previousWishes.value.length > 5) {
      previousWishes.value.pop()
    }
    wishText.value = ''
    wishSubmitted.value = true
    isWishing.value = false
  }, 1500)
}
</script>

<style scoped>
.wishing-well {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wishing-well:hover {
  transform: scale(1.05);
}

.well-frame {
  width: 120px;
  height: 100px;
  position: relative;
}

.well-body {
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, #8b4513, #654321);
  border-radius: 50% 50% 0 0 / 30% 30% 0 0;
  position: relative;
  overflow: hidden;
  box-shadow:
    inset 0 -10px 20px rgba(0, 0, 0, 0.3),
    0 5px 15px rgba(0, 0, 0, 0.3);
}

.well-water {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 40%;
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  border-radius: 50%;
  animation: waterWave 3s ease-in-out infinite;
}

.well-water.ripple {
  animation: waterRipple 0.5s ease-out;
}

@keyframes waterWave {
  0%, 100% {
    transform: translateY(0) scaleX(1);
  }
  50% {
    transform: translateY(-3px) scaleX(1.05);
  }
}

@keyframes waterRipple {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.well-coins {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  height: 30px;
}

.coin {
  position: absolute;
  bottom: 0;
  font-size: 20px;
  animation: coinFloat var(--duration) ease-in-out var(--delay) infinite;
}

@keyframes coinFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

.well-bridge {
  width: 140%;
  height: 15px;
  background: linear-gradient(135deg, #a0522d, #8b4513);
  margin-left: -20%;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
}

.wishing-well.expanded {
  bottom: 20px;
  right: 20px;
}

.wishing-panel {
  position: absolute;
  bottom: 110px;
  right: 0;
  width: 320px;
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.95));
  border-radius: 20px;
  padding: 25px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.wishing-panel h3 {
  font-family: 'Great Vibes', cursive;
  font-size: 2rem;
  color: #ffd700;
  text-align: center;
  margin-bottom: 10px;
}

.instruction {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.wish-input {
  width: 100%;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
}

.wish-input:focus {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.wish-input:disabled {
  opacity: 0.6;
}

.wish-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.submit-wish {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  border: none;
  border-radius: 25px;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-wish:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

.submit-wish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wish-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin: 0 auto 15px;
  animation: successPop 0.5s ease-out;
}

@keyframes successPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.wish-echo {
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10px;
  font-size: 0.9rem;
}

.previous-wishes {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.previous-wishes h4 {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.wish-list {
  max-height: 100px;
  overflow-y: auto;
}

.wish-item {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  animation: wishSlide 0.3s ease-out;
}

@keyframes wishSlide {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.close-panel {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-panel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .wishing-well {
    bottom: 10px;
    right: 10px;
  }

  .well-frame {
    width: 80px;
    height: 70px;
  }

  .well-body {
    height: 50px;
  }

  .wishing-panel {
    width: 280px;
    right: -10px;
  }
}
</style>