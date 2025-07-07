<template>
  <MultiSelectComponent
      :multiple="props.multiple"
      :options="allLineages"
      label="Select Lineages"
      placeholder="Select lineages"
      :showButton="props.showButton"
      @buttonClick="lineagesSelectedButtonClick"
      @update:modelValue="updateModelValue"
  />
</template>

<script setup>
import { MultiSelectComponent } from 'outbreakInfo';
import {onMounted, ref} from "vue";
import { getLineagesByLineageSystem} from "../services/munninService.js";

const props = defineProps({
  multiple: { type: Boolean, default: true },
  showButton: { type: Boolean, default: true }
});

const emit = defineEmits(['lineagesSelectedButtonClick', 'update:modelValue']);
const allLineages = ref([]);

async function getAllLineages(lineage_system_name){
  const resp = await getLineagesByLineageSystem(lineage_system_name);
  return resp.map(lineage => ({
    label: lineage.lineage_name,
    value: lineage.lineage_name,
    ...lineage
  }));
}

async function loadData() {
  allLineages.value = await getAllLineages("usda_genoflu");
}

async function lineagesSelectedButtonClick(selectedLineages) {
  emit('lineagesSelectedButtonClick', selectedLineages);
}

async function updateModelValue(selectedLineages) {
  emit('update:modelValue', selectedLineages);
}


onMounted(loadData)

</script>



<style scoped>

</style>