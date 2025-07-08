<template>
  <div class="container mt-3">
    <h2>Host-level</h2>
    <hr>
    <div class="row">
      <div class="col col-md-6">
        <SearchHostLevel />
      </div>
      <div class="col col-md-6">
        <CountsByDateBin />
      </div>
    </div>
    <h2>Population-level</h2>
    <hr>
    <div class="row">
      <div class="col col-md-6">
        <CountsByDateBin :serviceFunction="getMutationCountByDateBin" title="Detection of mutations over time" defaultQuery="HA:172" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchHostLevel from "../components/SearchHostLevel.vue";
import CountsByDateBin from "../components/CountsByDateBin.vue";
import { getMutationCountByDateBin } from '../services/munninService.js';
import { getLineageCountByDateBin } from '../services/munninService.js';
</script>

<style scoped>

</style>