<template>
  <div class="cake-page">
    <StarsBackground />
    <BirthdayCake />
  </div>
</template>

<script setup>
import StarsBackground from '../components/StarsBackground.vue'
import BirthdayCake from '../components/BirthdayCake.vue'
</script>

<style scoped>
.cake-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}
</style>
