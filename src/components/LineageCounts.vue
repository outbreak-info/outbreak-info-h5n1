<template>
  <div class="row">
    <div class="col mb-3">
      <h5>Lineage counts over time</h5>
      <InfoComponent :embedded="true">
        <span v-html="helpText.lineageSurveillance.lineageCountsOverTime"></span>
      </InfoComponent>
    </div>
  </div>
  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <TimeSeriesBarChart
          v-else
          :data="lineageCountsByDateBinResults"
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
  <div class="row">
    <div class="col">
      <h5>Lineage counts</h5>
      <InfoComponent :embedded="true">
        <span v-html="helpText.lineageSurveillance.lineageCounts"></span>
      </InfoComponent>
    </div>
  </div>
  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <TabsWrapper v-else :tabs="Object.keys(transformedData).map(key => ({'name': lineageSystemLabels[key], 'key': key}))" size="large">
        <template v-for="(value, key) in transformedData" :key="key" v-slot:[key]>
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
        </template>
      </TabsWrapper>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import { BarChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph, PointRangeChart, LoadingSpinner, TimeSeriesBarChart, TabsWrapper, InfoComponent } from 'outbreakInfo';
import {
  getLineageCountByDateBin,
  getLineageCountBySample,
  getLineageSummaryStatsBySample,
  getSampleCountByField
} from '../services/munninService.js';
import helpText from "../helpInfo/helpInfoText.json";

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
const lineageCountsByDateBinResults = ref([]);

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

async function getLineageCountByDateBinByHostAndIsolationSource(host, isolationSource) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  return getLineageCountByDateBin(q);
}

async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
    const [data, stats] = await getLineageData();
    lineageCountsByDateBinResults.value = await getLineageCountByDateBinByHostAndIsolationSource(selectedHost.value.key, selectedIsolationSource.value.key);
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