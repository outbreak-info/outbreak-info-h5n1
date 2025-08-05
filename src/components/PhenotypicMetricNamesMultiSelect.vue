<template>
  <MultiSelectComponent
      :multiple="props.multiple"
      :options="phenotypes"
      label="Select a phenotype"
      placeholder="Select a phenotype"
      :showButton="props.showButton"
      @buttonClick="phenotypeSelectedButtonClick"
      v-model="props.modelValue"
      @update:modelValue="updateModelValue"
  />
</template>

<script setup>
import { MultiSelectComponent } from 'outbreakInfo';
import {onMounted, ref} from "vue";
import { getPhenotypeMetrics } from "../services/munninService.js";
import { phenotypeMetricLabels } from "../constants/labels.js";

const props = defineProps({
  multiple: { type: Boolean, default: false },
  modelValue: { type: Array || String, default: () => [] },
  showButton: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'phenotypeSelectedButtonClick']);

const phenotypes = ref([]);

async function getSelectPhenotypeMetrics(){
  const resp = await getPhenotypeMetrics();
  return resp.filter(
      phenotype => phenotype.name in phenotypeMetricLabels
  ).map(phenotype => ({
    label: phenotypeMetricLabels[phenotype.name],
    value: phenotype.name,
    ...phenotype
  }));
}

async function loadData() {
  phenotypes.value = await getSelectPhenotypeMetrics();
}

async function phenotypeSelectedButtonClick(phenotypes) {
  emit('phenotypeSelectedButtonClick', phenotypes);
}

async function updateModelValue(phenotypes) {
  emit('update:modelValue', phenotypes);
}

onMounted(loadData)

</script>



<style scoped>

</style>