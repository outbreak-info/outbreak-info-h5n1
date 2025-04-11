<template>
  <h2>{{ title }}</h2>

  <form>
    <div class="row">
      <div class="col mb-3">
        <label :for="elementIds.phenotypeField" class="form-label">Phenotype</label>
        <select :id="elementIds.phenotypeField" v-model="selectedPhenotypeScore" class="form-select">
          <optgroup label="Deep mutational scanning">
            <option value="stability">Stability</option>
            <option value="ferret_sera_escape">Ferret sera escape</option>
            <option value="mouse_sera_escape">Mouse sera escape</option>
            <option value="sa26_usage_increase">SA26 receptor usage increase</option>
            <option value="entry_in_293t_cells">Entry in 293T cells</option>
          </optgroup>
          <optgroup label="Computational prediction">
            <option value="evescape_sigmoid">EVE</option>
          </optgroup>
        </select>
      </div>

      <div class="col log-scale-toggle mb-3 d-flex align-items-end">
        <div class="mb-2 mt-2 form-check">
          <input type="checkbox" v-model="useLogScale" class="form-check-input" :id="elementIds.logScale">
          <label class="form-check-label" :for="elementIds.logScale">
            Log scale
          </label>
        </div>
      </div>
    </div>
  </form>

  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <scatter-chart
          v-else
          :data="chartData"
          :x-key="'phenotypeScore'"
          :y-key="'count'"
          :title-key="'key'"
          :point-color="outbreakInfoColorPalette[6]"
          :x-label="selectedPhenotypeScore"
          :y-label="'Number of samples'"
          :log-scale="useLogScale"
          :tip-format-string="'Mutation: {key}\nCount: {y}\nDMS: {x}'"
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
import { ref, onMounted, watch, useId, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette, SelectBarChart } from 'outbreakInfo';
import { getSampleCountByField, getCountByPhenotypeScore } from '../services/postgresApi.js';

const selectedPhenotypeScore = ref('sa26_usage_increase');
const useLogScale = ref(true);
const chartData = ref([]);
const isLoadingChart = ref(false);
const error = ref(null);
const uuid = useId();
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const elementIds = computed(() => ({
  phenotypeField: `dmsField-${uuid}`,
  logScale: `logScale-${uuid}`,
  hostField: `hostField-${uuid}`,
  isolationSourceField: `isolationSource-${uuid}`
}));

const props = defineProps({
  dataField: { type: String, default: "variants" },
  title: { type: String, default: "Host-level" }
})

const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

async function getCountByPhenotypeScoreFilterByHostAndIsolationSource(region, phenotypeScore, host, isolationSource, dataField) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  return getCountByPhenotypeScore(region, phenotypeScore, q, dataField);
}

async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    chartData.value = await getCountByPhenotypeScoreFilterByHostAndIsolationSource("HA", selectedPhenotypeScore.value, selectedHost.value.key, selectedIsolationSource.value.key, props.dataField);
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");

    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected metric';
    }
  } catch (err) {
    console.error('Error loading DMS data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoadingChart.value = false;
  }
}

onMounted(loadData);
watch(() => selectedPhenotypeScore.value, loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>