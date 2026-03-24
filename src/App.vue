<template>
  <div class="birthday-app" ref="appContainer">
    <BirthdayMessage />
    <div id="cake-section">
      <BirthdayCake />
    </div>
    <div id="timeline-section">
      <Timeline />
    </div>
    <StarsBackground />
    <Fireworks />
    <Confetti />
    <Balloons />
    <FloatingNumbers />
    <div id="wish-section">
      <WishingWell />
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StarsBackground from './components/StarsBackground.vue'
import Fireworks from './components/Fireworks.vue'
import BirthdayCake from './components/BirthdayCake.vue'
import FloatingNumbers from './components/FloatingNumbers.vue'
import Confetti from './components/Confetti.vue'
import Balloons from './components/Balloons.vue'
import BirthdayMessage from './components/BirthdayMessage.vue'
import WishingWell from './components/WishingWell.vue'
import Timeline from './components/Timeline.vue'
import BottomNav from './components/BottomNav.vue'

const appContainer = ref(null)

onMounted(() => {
  setTimeout(() => {
    if (appContainer.value) {
      appContainer.value.classList.add('loaded')
    }
  }, 100)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

.birthday-app {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #1a1a2e;
}

#cake-section {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 500px;
  z-index: 10;
  display: block;
}

#timeline-section {
  position: relative;
  z-index: 10;
  background: rgba(26, 26, 46, 0.9);
}

#wish-section {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 100;
}
</style>
