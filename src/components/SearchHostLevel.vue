<template>
  <h2 class="my-4">Search variants at host-level</h2>

  <div class="row">
      <div class="search-container">
        <div class="input-group">
          <input 
            type="text" 
            v-model="aaQuery" 
            placeholder="HA:Q238R"
            class="form-control"
            @keyup.enter="searchMutation"
          />
          <button class="btn btn-primary" @click="searchMutation">Submit</button>
        </div>
      </div>
    </div>
      
    <div v-if="isLoading" class="loading-message">
      Loading data...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="mutationResults.length > 0" class="chart-wrapper mt-3">
      <HistogramChart
        :data="mutationResults"
        :frequencyKey="'frequency'"
        :barColor="chartColor"
        :height="500"
        :width="800"
        xLabel="Frequency Range"
        yLabel="Number of Samples"
        :xMin="0"
        :xMax="1"
        :binCount="10"
      />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HistogramChart } from 'outbreakInfo';
import { getVariantFrequency } from '../services/munninService.js';

const chartColor = '#2c3e50';

const aaQuery = ref('HA:Q238R');
const ntQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const mutationResults = ref([]);

async function searchMutation() {
  if (!aaQuery.value.trim()) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // Call the Postgres API with amino acid query
    const results = await getVariantFrequency(aaQuery.value, ntQuery.value);
    
    mutationResults.value = results;
    
    if (mutationResults.value.length === 0) {
      error.value = `No results found for "${aaQuery.value}"`;
    }
    
  } catch (err) {
    console.error('Error searching mutation:', err);
    error.value = err.message || 'Failed to search for mutation. Please try again.';
    mutationResults.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(searchMutation);
</script>

<style scoped>

</style> 