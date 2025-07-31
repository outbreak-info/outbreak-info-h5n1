<template>
  <div class="container mt-3">
    <h2>Functional surveillance of mutations</h2>
    <div class="row">
      <div class="col-md-12">
        <TabsWrapper :tabs="countsByPhenotypeTabs" size="large">
          <template #hostLevel>
            <CountsByPhenotypeScore dataField="variants" title="Host-level" />
          </template>

          <template #populationLevel>
            <CountsByPhenotypeScore dataField="mutations" title="Population-level" />
          </template>
        </TabsWrapper>
      </div>
    </div>
  </div>
</template>

<script setup>
import CountsByPhenotypeScore from "../components/CountsByPhenotypeScore.vue";
import { TabsWrapper, HelpTooltip } from 'outbreakInfo';

const countsByPhenotypeTabs = [
  { name: 'Host-level', key: 'hostLevel' },
  { name: 'Population-level', key: 'populationLevel' }
]

// const countsByPhenotypeTabs = [
//   {
//     name: 'Host-level',
//     content: '<CountsByPhenotypeScore dataField="variants" title="Host-level" />'
//   },
//   {
//     name: 'Population-level',
//     content: '<CountsByPhenotypeScore dataField="mutations" title="Population-level" />'
//   }
// ]

</script>

<style scoped>

</style>