<template>
  <div class="host-view">
    <h1>Samples by host</h1>
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-for="(data, gene) in chartData.mutation_counts" :key="gene" class="chart-section">
      <h2>{{ gene }}</h2>
      <HeatMapChart
          :data="data"
          x="mut"
          y="lineage"
          val="prevalence"
          :cellWidth="20"
          :cellHeight="10"
          yLabel=""
          xLabel=""
          :domain="[0.75, 1]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HeatMapChart } from 'outbreakInfo';
import { getLineageMutationIncidence } from '../services/munninService.js';

const chartData = ref([]);
const isLoading = ref(false);

async function loadData() {
  isLoading.value = true;
  chartData.value = await getLineageMutationIncidence("D1.1");
  console.log(chartData.value);
  isLoading.value = false;
}

onMounted(loadData);
</script>

<style scoped>

</style>