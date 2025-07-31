<template>
  <div v-if="isLoading" class="loading-message">
    <LoadingSpinner />
  </div>

  <div v-else class="error-message">
    <div class="row">
      <TimeSeriesPointRangeChart
          :data="variantFrequencyOverTime"
          :isPreBinned="true"
          binInterval="month"
          xLabel="Month"
          q1Attribute="alt_freq_q1"
          q3Attribute="alt_freq_q3"
          medianAttribute="alt_freq_median"
          tickInterval="6 month"
          :marginBottom="70"
          :marginLeft="100"
          :marginTop="50"
          :xTickMin="xTicksMinMax[0]"
          :xTickMax="xTicksMinMax[1]"
          yLabel="Frequency of host-level variants"
      />
    </div>
    <div class="row">
      <TimeSeriesBarChart
          :data="mutationCountOverTime"
          :height="500"
          valueKey="n"
          dateKey="date"
          groupKey="lineage_name"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="6 month"
          :marginBottom="70"
          :marginLeft="100"
          :marginTop="50"
          :xTickMin="xTicksMinMax[0]"
          :xTickMax="xTicksMinMax[1]"
          xLabel="Month"
          yLabel="Population-level mutations"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { TimeSeriesPointRangeChart, TimeSeriesBarChart, LoadingSpinner } from 'outbreakInfo';
import { getVariantFrequencyByCollectionDate, getMutationCountsByCollectionDateAndLineage } from '../services/munninService.js';

const isLoading = ref(false);
const error = ref(null);
const variantFrequencyOverTime = ref([]);
const mutationCountOverTime = ref([]);
const xTicksMinMax = ref([null, null]);

// TODO: Get min and max dates to match
function getMinAndMaxDate(timeSeries1, timeSeries2) {
  const combined = [...timeSeries1, ...timeSeries2];
  const min = combined.reduce((min, c) => c < min ? c : min);
  const max = combined.reduce((max, c) => c > max ? c : max);
  return [new Date(min+"-01"), new Date(max+"-01")];
}

async function loadChart() {
  isLoading.value = true;
  error.value = null;

  try {
    // TODO: Add input for mutation
    const tmpVariantFrequencyOverTime = await getVariantFrequencyByCollectionDate("627", "K", "XAJ25426.1");
    const tmpMutationCountOverTime = await getMutationCountsByCollectionDateAndLineage("627", "K", "XAJ25426.1");
    xTicksMinMax.value = getMinAndMaxDate(tmpVariantFrequencyOverTime.map(d => d.date), tmpMutationCountOverTime.map(d => d.date));
    variantFrequencyOverTime.value = tmpVariantFrequencyOverTime;
    mutationCountOverTime.value = tmpMutationCountOverTime;
  } catch (err) {
    variantFrequencyOverTime.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadChart);
</script>

<style scoped>

</style>