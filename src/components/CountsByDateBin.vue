<template>
  <h2 class="my-4">{{props.title}}</h2>

  <div v-if="props.showSearchBar">
    <div class="row">
      <div class="search-container">
        <div class="input-group">
          <input
              type="text"
              v-model="siteQuery"
              placeholder="238"
              class="form-control"
              @keyup.enter="searchSite"
          />
          <button class="btn btn-primary" @click="searchSite">Submit</button>
        </div>
      </div>
    </div>
  </div>

    <div v-if="isLoading" class="loading-message">
      Loading data...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="results.length > 0" class="chart-wrapper mt-3">
      <TimeSeriesBarChart
          :data="results"
          :height="500"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="6 months"
          :marginBottom="70"
          :marginLeft="100"
          xLabel="Time"
      />
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import { TimeSeriesBarChart } from 'outbreakInfo';
import { getVariantCountByDateBin } from '../services/munninService.js';

const props = defineProps({
  serviceFunction: {
    type: Function,
    default: getVariantCountByDateBin
  },
  defaultQuery: {
    type: String,
    default: '238'
  },
  title: {
    type: String,
    default: 'Detection of intrahost variants over time'
  },
  showSearchBar: {
    type: Boolean,
    default: true
  }
});

const siteQuery = ref(props.defaultQuery);
const isLoading = ref(false);
const error = ref(null);
const results = ref([]);

async function searchSite() {
  if (!siteQuery.value.trim()) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    results.value = await props.serviceFunction(`position_aa=${siteQuery.value} ^ region=HA`);

    console.log(results.value);
    
    if (results.value.length === 0) {
      error.value = `No results found for "${siteQuery.value}"`;
    }
    
  } catch (err) {
    console.error('Error searching site:', err);
    error.value = err.message || 'Failed to search for site. Please try again.';
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(searchSite);
</script>

<style scoped>

</style> 