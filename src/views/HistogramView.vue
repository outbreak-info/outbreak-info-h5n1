<template>
  <div class="container mx-auto px-4 flex flex-col items-center">
    <h2 class="my-4">Mutation Frequency Distribution</h2>
    <div class="w-full max-w-screen-xl">
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
      
      <div v-if="isLoading" class="loading-message">
        Loading data...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="mutationResults.length > 0" class="chart-wrapper">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HistogramChart } from 'outbreakInfo';
import { getMutationFrequency } from '../services/postgresApi.js';

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
    const results = await getMutationFrequency(aaQuery.value, ntQuery.value);
    
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
.search-container {
  margin: 1.5rem 0;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
}

.btn-primary {
  background-color: var(--primary-color, #2c3e50);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading-message, .error-message {
  margin: 2rem 0;
  padding: 1rem;
  text-align: center;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border-radius: 4px;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}
</style> 