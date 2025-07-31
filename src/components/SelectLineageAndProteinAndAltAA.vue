<template>
  <div class="row">
    <div class="col col-md-6">
      <LineageMultiSelect :multiple="false" :showButton="false" @update:modelValue="updateSelectedLineage" />
    </div>
    <div class="col col-md-6">
      <GffFeatureMultiSelect @update:modelValue="updateSelectedGffFeature" :serviceFunction="props.serviceFunction"/>
    </div>
    <div class="col col-md-4 mb-4">
      <TextInput
          placeholder="Site"
          :modelValue="selectedSite"
          @update:modelValue="selectedSite = $event"
          :showButton="false"
      />
    </div>
    <div class="col col-md-4 mb-4">
      <TextInput
          placeholder="Alternate amino acid"
          :modelValue="selectedAltAA"
          @update:modelValue="selectedAltAA = $event"
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
import {ref} from "vue";
import GffFeatureMultiSelect from "./GffFeatureMultiSelect.vue";
import {getRegionToGffFeatureMappingForVariants} from "../services/munninService";

const props = defineProps({
  serviceFunction: {
    type: Function,
    default: getRegionToGffFeatureMappingForVariants
  },
});

const selectedAltAA = ref(null);
const selectedSite = ref(null);
const selectedLineage = ref(null);
const selectedGffFeature = ref(null);
const emit = defineEmits(['selectSite']);

// TODO: Pass model value to underlying components and remove updateSelectedLineage and updatedSelectedGffFeature.
async function updateSelectedLineage(lineage) {
  selectedLineage.value = lineage;
}

async function updateSelectedGffFeature(gffFeature) {
  selectedGffFeature.value = gffFeature;
}

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