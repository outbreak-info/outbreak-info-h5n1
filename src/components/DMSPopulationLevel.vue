<template>
    <h2>Population-level</h2>

    <form>
      <div class="row">
        <div class="col mb-3">
          <label for="dmsFieldPopulation" class="form-label">Phenotype</label>
          <select id="dmsFieldPopulation" v-model="selectedMetric" class="form-select">
            <option value="stability">Stability</option>
            <option value="ferret_sera_escape">Ferret sera escape</option>
            <option value="mouse_sera_escape">Mouse sera escape</option>
            <option value="sa26_usage_increase">SA26 receptor usage increase</option>
            <option value="entry_in_293t_cells">Entry in 293T cells</option>
          </select>
        </div>
      
        <div class="col log-scale-toggle mb-3 d-flex align-items-end">
          <div class="mb-2 mt-2 form-check">
            <input type="checkbox" v-model="useLogScale" class="form-check-input" id="logScale">
            <label class="form-check-label" for="logScale">
              Log scale
            </label>
          </div>
        </div>
      </div>
    </form>
    
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <scatter-chart
      v-else
      :data="chartData"
      :point-color="outbreakInfoColorPalette[6]"
      :x-label="selectedMetric"
      :y-label="'Mutation Frequency'"
      :log-scale="useLogScale"
      :tip-format-string="'Mutation: {key}\nFrequency: {y}\nScore: {x}'"
    />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ScatterChart, outbreakInfoColorPalette } from 'outbreakInfo';
import { getMutationFrequencyByScore } from '../services/postgresApi.js';

const selectedMetric = ref('sa26_usage_increase');
const selectedRegion = ref('HA');
const useLogScale = ref(true);
const chartData = ref([]);
const isLoading = ref(false);
const error = ref(null);

async function loadData() {
  isLoading.value = true;
  error.value = null;
  
  try {
    chartData.value = await getMutationFrequencyByScore(selectedRegion.value, selectedMetric.value);
    
    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected parameters';
    }
  } catch (err) {
    console.error('Error loading mutation frequency data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadData);
watch([() => selectedMetric.value, () => selectedRegion.value], loadData);
</script>

<style scoped>

</style> 