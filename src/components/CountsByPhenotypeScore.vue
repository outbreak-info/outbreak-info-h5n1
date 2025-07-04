<template>
  <h2>{{ title }}</h2>

  <form>
    <div class="row">
      <div class="col mb-3">
        <label :for="elementIds.phenotypeField" class="form-label">Phenotype</label>
<!--        TODO: Import SelectComponent from component library -->
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
<!--        TODO: Import CheckBoxComponent from component library -->
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
<!--      TODO: Import LoadingComponent from component library -->
      <div v-if="isLoadingChart" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <scatter-chart
          v-else
          :data="chartData"
          :x-key="'phenotypeScore'"
          :y-key="'count'"
          :pointColor="outbreakInfoColorPalette[0]"
          :title-key="'key'"
          :x-label="selectedPhenotypeScore"
          :y-label="'Number of samples'"
          :log-scale="useLogScale"
          :tip-format-string="'Mutation: {key}\nCount: {y}\nDMS: {x}'"
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
</template>

<script setup>
import { ref, onMounted, watch, useId, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph } from 'outbreakInfo';
import { getSampleCountByField, getCountByPhenotypeScore } from '../services/munninService.js';

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
  logScale: `logScale-${uuid}`
}));

const props = defineProps({
  dataField: { type: String, default: "variants" },
  title: { type: String, default: "Host-level" }
})

const hostBarSelected = (item) => {
  selectedHost.value = item;
  console.log(item);
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
    // TODO: Get protein ID from API
    chartData.value = await getCountByPhenotypeScoreFilterByHostAndIsolationSource("XAJ25415.1", selectedPhenotypeScore.value, selectedHost.value.key, selectedIsolationSource.value.key, props.dataField);
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