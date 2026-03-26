<template>
  <div class="wish-page">
    <StarsBackground />
    <div class="wish-content">
      <WishingWell />
    </div>
  </div>
</template>

<script setup>
import StarsBackground from '../components/StarsBackground.vue'
import WishingWell from '../components/WishingWell.vue'
</script>

<style scoped>
.wish-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.wish-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}
</style>
