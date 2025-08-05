<template>

  <div class="row">
    <div class="col col-md-6 mt-3">
      <SelectLineageAndProteinAndAltAA @selectSite="loadChart" :serviceFunction="gffFeatureToRegionMappingFunction" />
    </div>
  </div>


  <div v-if="isLoading" class="loading-message">
    <LoadingSpinner />
  </div>

  <div class="row" v-else>
    <div class="col col-md-6">
      <div v-if="variantFrequencyError">
        {{variantFrequencyError.value}}
      </div>
      <TimeSeriesPointRangeChart
          v-else
          :data="variantFrequencyOverTime"
          :isPreBinned="true"
          binInterval="month"
          xLabel="Month"
          groupBy=""
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
    <div class="col col-md-6">
      <div v-if="mutationCountError">
        {{mutationCountError.value}}
      </div>
      <TimeSeriesBarChart
          v-else
          :data="mutationCountOverTime"
          :height="500"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="6 months"
          :marginBottom="70"
          :marginLeft="100"
          xLabel="Month"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { TimeSeriesPointRangeChart, TimeSeriesBarChart, LoadingSpinner } from 'outbreakInfo';
import {
  getVariantFrequencyByCollectionDate,
  getRegionToGffFeatureMappingForMutations,
  getRegionToGffFeatureMappingForVariants, getMutationCountByDateBin
} from '../services/munninService.js';
import SelectLineageAndProteinAndAltAA from "./SelectLineageAndProteinAndAltAA.vue";

const isLoading = ref(false);
const variantFrequencyError = ref(null);
const mutationCountError = ref(null);
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

async function loadChart(selectedSite) {
  if(selectedSite.site === null || selectedSite.gffFeature === null)
    return;
  isLoading.value = true;
  variantFrequencyError.value = null;
  mutationCountError.value = null;

  try {
    let q = `position_aa=${selectedSite.site} ^ gff_feature=${selectedSite.gffFeature}`
    if (selectedSite.lineage !== null && selectedSite.lineage.lineage_name !== null) {
     q += `^ lineage_name=${selectedSite.lineage.lineage_name}`; // TODO: Include lineage_system_name as well
    }
    if (selectedSite.altAA !== '' && selectedSite.altAA !== null) {
      q += ' ^ alt_aa=' + selectedSite.altAA;
    }

    const tmpMutationCountOverTime = await getMutationCountByDateBin(q);
    const tmpVariantFrequencyOverTime = await getVariantFrequencyByCollectionDate(q);
    console.log(tmpVariantFrequencyOverTime);
    if (tmpMutationCountOverTime.length === 0) {
      mutationCountError.value = `No results found for ${selectedSite.gffFeature}:${selectedSite.site}${selectedSite.altAA} in ${selectedSite.lineage}`;
    }

    if (tmpVariantFrequencyOverTime.length === 0) {
      variantFrequencyError.value = `No results found for ${selectedSite.gffFeature}:${selectedSite.site}${selectedSite.altAA} in ${selectedSite.lineage}`;
    }

    xTicksMinMax.value = getMinAndMaxDate(tmpVariantFrequencyOverTime.map(d => d.date), tmpMutationCountOverTime.map(d => d.date));
    variantFrequencyOverTime.value = tmpVariantFrequencyOverTime;
    mutationCountOverTime.value = tmpMutationCountOverTime;
  } catch (err) {
    console.error(`Error loading chart for variant frequency and mutation counts by collection date`, err);
  } finally {
    isLoading.value = false;
  }
}

async function gffFeatureToRegionMappingFunction(){
  const regionToGFFMutations = await getRegionToGffFeatureMappingForMutations();
  const regionToGFFVariants = await getRegionToGffFeatureMappingForVariants();
  return Object.keys(regionToGFFMutations)
      .filter(key => key in regionToGFFVariants)
      .reduce((acc, key) => {
        acc[key] = regionToGFFMutations[key];
        return acc;
      }, {});
}

// onMounted(loadChart);
</script>

<style scoped>

</style>