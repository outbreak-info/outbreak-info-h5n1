<template>
  <h2 class="my-4">{{props.title}}</h2>

 <SelectLineageAndProteinAndAltAA @selectSite="searchSite" :serviceFunction="gffFeatureToRegionMappingFunction" />

    <div v-if="isLoading" class="loading-message">
      <LoadingSpinner />
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
import { ref} from 'vue';
import { TimeSeriesBarChart, LoadingSpinner } from 'outbreakInfo';
import {getRegionToGffFeatureMappingForVariants, getVariantCountByDateBin} from '../services/munninService.js';
import SelectLineageAndProteinAndAltAA from './SelectLineageAndProteinAndAltAA.vue';

const props = defineProps({
  serviceFunction: {
    type: Function,
    default: getVariantCountByDateBin
  },
  gffFeatureToRegionMappingFunction: {
    type: Function,
    default: getRegionToGffFeatureMappingForVariants
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

const isLoading = ref(false);
const error = ref(null);
const results = ref([]);

async function searchSite(selectedSite) {
  isLoading.value = true;
  error.value = null;

  console.log(selectedSite);

  try {
    let q = `position_aa=${selectedSite.site} ^ gff_feature=${selectedSite.gffFeature} ^ lineage_name=${selectedSite.lineage}`
    if (selectedSite.altAA !== '' && selectedSite.altAA !== null) {
      q += ' ^ alt_aa=' + selectedSite.altAA;
    }
    console.log(q);
    results.value = await props.serviceFunction(q);

    if (results.value.length === 0) {
      error.value = `No results found for ${selectedSite.gffFeature}:${selectedSite.site}${selectedSite.altAA} in ${selectedSite.lineage}`;
    }
    
  } catch (err) {
    console.error('Error searching site:', err);
    error.value = err.message || 'Failed to search for site. Please try again.';
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}

// onMounted(searchSite);
</script>

<style scoped>

</style> 