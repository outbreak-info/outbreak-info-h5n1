<template>
  <div class="row">
    <div class="col col-md-6">
      <CountsByDateBin :serviceFunction="getLineageCountByDateBin" title="Detection of lineages over time" :showSearchBar="false"/>
    </div>
  </div>
  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-for="(value, key) in transformedData" :key="key">
        <h4>{{ lineageSystemLabels[key] }}</h4>
        <hr>
        <BarChart
            :data="value"
            :horizontal="false"
            :height="500"
            :marginLeft="180"
            :marginBottom="100"
            :barColor="outbreakInfoColorPalette[0]"
            xLabel="Lineage"
            yLabel="Count"
        />

        <div v-if="key in transformedStats">
          <PointRangeChart
              :data="transformedStats[key]"
              :height="500"
              :marginLeft="180"
              :marginBottom="100"
              xAttribute="lineage_name"
              medianAttribute="abundance_median"
              q3Attribute="abundance_q3"
              q1Attribute="abundance_q1"
              yLabel="Abundance (%)"
              xLabel="Lineage"
          />
        </div>
      </div>
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="hostData"
          fieldName="Host"
          :selectedItem="selectedHost"
          @item-selected="hostBarSelected"
          :width="330"
          :height="310"
          :marginLeft="60" />
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="isolationSourceData"
          fieldName="Isolation Source"
          :selectedItem="selectedIsolationSource"
          @item-selected="isolationSourceBarSelected"
          :width="300"
          :height="310" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import { BarChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph, PointRangeChart, LoadingSpinner } from 'outbreakInfo';
import {
  getLineageCountByDateBin,
  getLineageCountBySample,
  getLineageSummaryStatsBySample,
  getSampleCountByField
} from '../services/munninService.js';
import CountsByDateBin from "./CountsByDateBin.vue";

const transformedData = ref({});
const transformedStats = ref({});
const isLoadingChart = ref(false);
const error = ref(null);
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});
const lineageSystemLabels = ref({ //TODO: Store system label in API
  "usda_genoflu": "USDA GenoFLU",
  "freyja_demixed": "Custom Nomenclature"
});

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

function transformData(data) {
  const result = {};
  data.forEach(item => {
    const system = item.lineage_system || "unknown";
    if (!result[system]) {
      result[system] = [];
    }
    result[system].push({
      key: item.lineage || "unknown",
      value: item.count
    });
  });
  return result;
}

function transformSummaryStatsData(data) {
  const result = {};
  data.forEach(item => {
    const {lineage_system_name, ...other} = item;
    const system = lineage_system_name;
    if (!result[system]) {
      result[system] = [];
    }
    result[system].push(other);
  });
  return result;
}

async function getLineageData(){
  let rawData = await getLineageStatsFilterByHostAndIsolationSource(selectedHost.value.key, selectedIsolationSource.value.key);
  rawData = transformData(rawData);
  let rawStatsData = await getLineageStatsFilterByHostAndIsolationSource(selectedHost.value.key, selectedIsolationSource.value.key, true);
  console.log(rawStatsData);
  rawStatsData = transformSummaryStatsData(rawStatsData);

  return [rawData, rawStatsData];
}

async function getLineageStatsFilterByHostAndIsolationSource(host, isolationSource, summaryStats = false) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  if(summaryStats)
    return getLineageSummaryStatsBySample(q);
  return getLineageCountBySample(q);
}

async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
    const [data, stats] = await getLineageData();
    transformedData.value = data;
    transformedStats.value = stats;

    if (transformedData.value.length === 0) {
      error.value = 'No data found for the selected filters';
    }
  } catch (err) {
    console.error('Error loading lineage counts:', err);
    error.value = 'Failed to load data. Please try again later.';
  } finally {
    isLoadingChart.value = false;
  }
}

onMounted(loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>