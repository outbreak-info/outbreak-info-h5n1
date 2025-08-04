<template>
  <div class="row">
    <div class="col col-md-6">
      <LineageMultiSelect :multiple="false" :showButton="false" v-model="selectedLineageObject" />
    </div>
    <div class="col col-md-6">
      <GffFeatureMultiSelect v-model="selectedGffFeatureObject" :serviceFunction="props.serviceFunction"/>
    </div>
    <div class="col col-md-4 mb-4">
      <TextInput
          placeholder="Site"
          v-model="selectedSite"
          :showButton="false"
      />
    </div>
    <div class="col col-md-4 mb-4">
      <TextInput
          placeholder="Alternate amino acid"
          v-model="selectedAltAA"
          :showButton="false"
      />
    </div>
    <div class="col col-md-4 mb-4">
      <ButtonComponent text="Run" :onClick="selectSite" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LineageMultiSelect from "./LineageMultiSelect.vue";
import { TextInput, ButtonComponent } from 'outbreakInfo';
import { ref, computed } from "vue";
import GffFeatureMultiSelect from "./GffFeatureMultiSelect.vue";
import {getRegionToGffFeatureMappingForVariants} from "../services/munninService";

const props = defineProps({
  serviceFunction: {
    type: Function,
    default: getRegionToGffFeatureMappingForVariants
  },
});

const selectedLineageObject = ref({
  label: '',
  value: null
});
const selectedGffFeatureObject = ref({
  label: '',
  value: null
})

const selectedLineage = computed(() => {
  if (selectedLineageObject.value.value === null)
    return null;
  return selectedLineageObject.value.value;
})
const selectedGffFeature = computed(() => {
  if (selectedGffFeatureObject.value.value === null)
    return null;
  return selectedGffFeatureObject.value.value;
})

const selectedAltAA = ref(null);
const selectedSite = ref(null);

const emit = defineEmits(['selectSite']);

async function selectSite() {
  emit('selectSite', {
    lineage: selectedLineage.value,
    gffFeature: selectedGffFeature.value,
    site: selectedSite.value,
    altAA: selectedAltAA.value
  });
}

</script>

<style scoped>

</style>