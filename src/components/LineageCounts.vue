<template>
  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <BarChart
          :data="chartData"
          :horizontal="horizontal"
          :height="500"
          :marginLeft="180"
          :barColor="outbreakInfoColorPalette.primary"
          xLabel="Lineage"
          yLabel="Count"
      />
    </div>

    <div class="col col-md-3">
      <label :for="elementIds.hostField" class="form-label">Host</label>
      <select :id="elementIds.hostField" v-model="selectedHost" class="form-select">
        <option :key="null" :value="{key: null, value: null}">All</option>
        <option v-for="item in hostData" :key="item.key" :value="{ key: item.key, value: item.value }">
          {{ item.key }} ({{ item.value }})
        </option>
      </select>
      <br />

      <SelectBarChart @bar-selected="hostBarSelected" :selectedBarKey="selectedHost" :horizontal="true" :data="hostData.slice(0, 10)" :marginLeft="75" :height="300" :width="300" fieldName="Host" />
    </div>

    <div class="col col-md-3">
      <label :for="elementIds.isolationSourceField" class="form-label">Isolation Source</label>
      <select :id="elementIds.isolationSourceField" v-model="selectedIsolationSource" class="form-select">
        <option :key="null" :value="{key: null, value: null}">All</option>
        <option v-for="item in isolationSourceData" :key="item.key" :value="{ key: item.key, value: item.value }">
          {{ item.key }} ({{ item.value }})
        </option>
      </select>
      <br />

      <SelectBarChart @bar-selected="isolationSourceBarSelected" :selectedBarKey="selectedIsolationSource" :horizontal="true" :data="isolationSourceData.slice(0, 10)" :marginLeft="75" :height="300" :width="300" fieldName="Isolation Source" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, useId, watch} from 'vue';
import { BarChart, outbreakInfoColorPalette, SelectBarChart } from 'outbreakInfo';
import {getLineageCountBySample, getSampleCountByField} from '../services/postgresApi.js';

const horizontal = ref(false);
const rawData = ref([]);
const chartData = ref([]);
const isLoadingChart = ref(false);
const error = ref(null);
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const uuid = useId();

const elementIds = computed(() => ({
  hostField: `hostField-${uuid}`,
  isolationSourceField: `isolationSource-${uuid}`
}));

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

async function getLineageCountsFilterByHostAndIsolationSource(host, isolationSource) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  return getLineageCountBySample(q);
}


async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
    rawData.value = await getLineageCountsFilterByHostAndIsolationSource(selectedHost.value.key, selectedIsolationSource.value.key);
    chartData.value = transformData(rawData.value)["usda_genoflu"]; //TODO: Generalize the lineage system

    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected filters';
    }
  } catch (err) {
    console.error('Error loading lineage counts:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
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