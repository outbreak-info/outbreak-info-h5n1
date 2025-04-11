<template>
  <h2>{{ title }}</h2>

  <form>
    <div class="row">
      <div class="col mb-3">
        <label :for="elementIds.selectField" class="form-label">Phenotype</label>
        <select :id="elementIds.selectField" v-model="selectedPhenotypeScore" class="form-select">
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

  <div v-if="isLoading" class="loading">Loading data...</div>
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
</template>

<script setup>
import { ref, onMounted, watch, useId, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette } from 'outbreakInfo';
import { getVariantFrequencyByScore} from '../services/postgresApi.js';

const selectedPhenotypeScore = ref('sa26_usage_increase');
const useLogScale = ref(true);
const chartData = ref([]);
const isLoading = ref(false);
const error = ref(null);
const uuid = useId();

const elementIds = computed(() => ({
  selectField: `dmsField-${uuid}`,
  logScale: `logScale-${uuid}`
}));

const props = defineProps({
  dataService: { type: Function, default: getVariantFrequencyByScore },
  title: { type: String, default: "Host-level" }
})

async function loadData() {
  isLoading.value = true;
  error.value = null;

  try {
    chartData.value = await props.dataService("HA", selectedPhenotypeScore.value);

    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected metric';
    }
  } catch (err) {
    console.error('Error loading DMS data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoading.value = false;
    console.log(chartData.value);
  }
}

onMounted(loadData);
watch(() => selectedPhenotypeScore.value, loadData);
</script>

<style scoped>

</style>