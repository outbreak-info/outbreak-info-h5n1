<template>
  <MultiSelectComponent
      :multiple="props.multiple"
      :options="gffFeatures"
      label="Select protein"
      placeholder="Select protein"
      :showButton="props.showButton"
      @buttonClick="gffFeatureSelectedButtonClick"
      @update:modelValue="updateModelValue"
  />
</template>

<script setup>
import { MultiSelectComponent } from 'outbreakInfo';
import {onMounted, ref} from "vue";
import { getRegionToGffFeatureMappingForVariants } from "../services/munninService.js";

const props = defineProps({
  multiple: { type: Boolean, default: false },
  showButton: { type: Boolean, default: false },
  serviceFunction: { type: Function, default: getRegionToGffFeatureMappingForVariants },
  modelValue: { type: Array || String, default: () => [] },
});

const emit = defineEmits(['gffFeatureSelectedButtonClick', 'update:modelValue']);
const gffFeatures = ref([]);

async function getAllGffFeatures(){
  const resp = await props.serviceFunction();
  return Object.keys(resp).map(aaId => ({
    label: resp[aaId] + " (" + aaId + ")",
    value: aaId
  }));
}

async function loadData() {
  gffFeatures.value = await getAllGffFeatures();
}

async function gffFeatureSelectedButtonClick(selectedGffFeature) {
  emit('gffFeatureSelectedButtonClick', selectedGffFeature);
}

async function updateModelValue(selectedGffFeature) {
  emit('update:modelValue', selectedGffFeature);
}


onMounted(loadData)

</script>



<style scoped>

</style>