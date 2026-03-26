<template>
  <div class="home-page">
    <StarsBackground />
    <Confetti v-if="showBirthday" />
    <Balloons v-if="showBirthday" />
    <FloatingNumbers v-if="showBirthday" />
    <BirthdayMessage v-if="showBirthday" />

    <transition name="fade">
      <div v-if="showInitialPopup" class="initial-popup-overlay">
        <div class="initial-popup" @click="openSurprise">
          <div class="gift-icon">🎁</div>
          <h2 class="popup-title">您有一份生日惊喜</h2>
          <p class="popup-subtitle">请签收</p>
          <div class="tap-hint">
            <span class="tap-text">点击打开</span>
            <span class="tap-arrow">👇</span>
          </div>
        </div>
      </div>
    </transition>

    <transition name="explode">
      <div v-if="showSurprisePopup" class="surprise-overlay">
        <div 
          v-for="(particle, index) in particles" 
          :key="index"
          class="particle"
          :class="{ explode: isExploding }"
          :style="particle.style"
        ></div>
        
        <transition name="birthday-text">
          <div v-if="showBirthdayText" class="birthday-text-container">
            <div class="birthday-text">
              <span v-for="(char, index) in birthdayChars" :key="index" class="char" :style="{ animationDelay: index * 0.1 + 's' }">
                {{ char }}
              </span>
            </div>
            <div class="birthday-subtitle">Happy 20th Birthday!</div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StarsBackground from '../components/StarsBackground.vue'
import Confetti from '../components/Confetti.vue'
import Balloons from '../components/Balloons.vue'
import FloatingNumbers from '../components/FloatingNumbers.vue'
import BirthdayMessage from '../components/BirthdayMessage.vue'

const showInitialPopup = ref(true)
const showSurprisePopup = ref(false)
const isExploding = ref(false)
const showBirthdayText = ref(false)
const showBirthday = ref(false)

const birthdayChars = ['生', '日', '快', '乐', '！']
const particles = ref([])

const colors = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff69b4',
  '#00d2d3', '#ff9ff3', '#feca57', '#48dbfb',
  '#ffd700', '#ff3f6b', '#00ffff', '#ff1493'
]

const generateParticles = () => {
  const count = 60
  const newParticles = []
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const distance = 50 + Math.random() * 30
    
    newParticles.push({
      style: {
        left: '50%',
        top: '50%',
        width: Math.random() * 20 + 10 + 'px',
        height: Math.random() * 20 + 10 + 'px',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: Math.random() > 0.5 ? '50%' : Math.random() * 10 + 'px',
        '--tx': Math.cos(angle) * distance + 'vw',
        '--ty': Math.sin(angle) * distance + 'vh',
        '--rotate': Math.random() * 720 - 360 + 'deg',
        '--scale': Math.random() * 2 + 1,
        '--delay': Math.random() * 0.3 + 's'
      }
    })
  }
  
  particles.value = newParticles
}

const openSurprise = () => {
  showInitialPopup.value = false
  generateParticles()
  
  setTimeout(() => {
    showSurprisePopup.value = true
  }, 300)
  
  setTimeout(() => {
    isExploding.value = true
  }, 800)
  
  setTimeout(() => {
    showBirthdayText.value = true
  }, 1500)
  
  setTimeout(() => {
    showSurprisePopup.value = false
    showBirthday.value = true
  }, 3500)
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})
</script>

<style scoped>
.home-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.initial-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.initial-popup {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(78, 205, 196, 0.2));
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 50px 60px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  animation: pulse 2s ease-in-out infinite;
}

.initial-popup:hover {
  transform: scale(1.05);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 60px rgba(255, 215, 0, 0.3);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
  }
  50% {
    box-shadow: 0 0 60px rgba(255, 107, 107, 0.5);
  }
}

.gift-icon {
  font-size: 80px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.popup-title {
  font-family: 'Great Vibes', cursive;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #ffd700, #ff69b4, #4ecdc4);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 3s ease infinite;
  margin: 20px 0 10px;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.popup-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.tap-hint {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tap-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.tap-arrow {
  font-size: 24px;
  animation: arrowBounce 1s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.surprise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95));
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.particle {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition-delay: var(--delay);
  opacity: 1;
}

.particle.explode {
  transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rotate)) scale(var(--scale));
  opacity: 0;
}

.birthday-text-container {
  position: absolute;
  text-align: center;
  z-index: 10;
}

.birthday-text {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.birthday-text .char {
  font-family: 'Great Vibes', cursive;
  font-size: 6rem;
  font-weight: bold;
  background: linear-gradient(135deg, #ffd700, #ff69b4, #4ecdc4, #ffd700);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: charAppear 0.5s ease-out forwards, gradientFlow 2s ease infinite;
  opacity: 0;
  transform: scale(0) rotate(-20deg);
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
}

@keyframes charAppear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-20deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.birthday-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  color: #fff;
  letter-spacing: 5px;
  animation: fadeInUp 0.8s ease-out forwards;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.explode-enter-active {
  animation: explodeIn 0.3s ease-out;
}

.explode-leave-active {
  animation: explodeOut 0.5s ease-in;
}

@keyframes explodeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes explodeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.birthday-text-enter-active {
  animation: textIn 0.5s ease-out;
}

.birthday-text-leave-active {
  animation: textOut 0.3s ease-in;
}

@keyframes textIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes textOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .initial-popup {
    padding: 40px 30px;
    margin: 20px;
  }

  .gift-icon {
    font-size: 60px;
  }

  .popup-title {
    font-size: 2rem;
  }

  .birthday-text .char {
    font-size: 3.5rem;
  }

  .birthday-subtitle {
    font-size: 1.2rem;
  }
}
</style>
