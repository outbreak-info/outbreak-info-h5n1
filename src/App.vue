<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
</script>

<style>
:root {
  --primary-color: #507192;
  --text-color: #333;
  --background-color: #f5f7fa;
  --section-bg-color: #ffffff;
  --border-color: #e0e0e0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'DM Sans', 'Avenir', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
}

/* Navigation styles removed */

main {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

h2 {
  border-bottom: none;
}

select, button {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>