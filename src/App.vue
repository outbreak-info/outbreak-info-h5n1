<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'DM Sans', 'Avenir', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  background-color: #f8f9fa;
  color: #2c3e50;
}

.chart-container svg text {
  font-size: 16px; /* Base font size for all text elements */
}

.chart-container :deep(.tick text) {
  font-size: 14px; /* Font size for axis tick labels */
}

.chart-container :deep(.axis-label) {
  font-size: 18px; /* Font size for axis labels */
  font-weight: 500;
}

/* If you need to adjust specific elements */
.chart-container :deep(.y-axis text) {
  font-size: 14px; /* Y-axis specific font size */
}

.chart-container :deep(.x-axis text) {
  font-size: 14px; /* X-axis specific font size */
}
</style>