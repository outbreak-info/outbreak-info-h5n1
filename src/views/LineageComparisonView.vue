<template>
  <div class="container mt-3">
    <div class="row">
      <h2>Compare lineages</h2>
    </div>
    <div class="row">
      <div class="col-md-12 mb-5">
        <TabsWrapper :tabs="countsByPhenotypeTabs" size="large">
          <template #mutationProfile>
            <MutationProfileComparison />
          </template>
          <template #lineageComparison>
            <LineageComparisonHeatMap />
          </template>
        </TabsWrapper>

      </div>
    </div>
  </div>
</template>

<script setup>
import LineageComparisonHeatMap from "../components/LineageComparisonHeatMap.vue";
import MutationProfileComparison from "../components/MutationProfileComparison.vue";
import {TabsWrapper} from 'outbreakInfo';

const countsByPhenotypeTabs = [
  { name: 'Compare nucleotide mutation profiles', key: 'mutationProfile' },
  { name: 'Compare amino acid mutations', key: 'lineageComparison' }
]
</script>

<style scoped>

</style>