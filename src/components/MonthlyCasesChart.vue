<template>
  <div>
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <MonthlyBarChart v-else :data="monthlyData" />
  </div>
</template>

<script setup>
//import { ref, onMounted } from 'vue';
import { MonthlyBarChart } from 'outbreakInfo';
// TODO: Import API service



</script>

<style scoped>
.loading, .error {
  padding: 20px;
  text-align: center;
}
.error {
  color: red;
}
</style>