<template>
  <div class="birthday-app">
    <router-view />
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import BottomNav from './components/BottomNav.vue'

onMounted(() => {
  setTimeout(() => {
    document.body.classList.add('loaded')
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
}
</style>
