<!-- src/components/NavBar.vue -->
<template>
  <header id="outbreak-header">
    <nav
      class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero"
    >
      <a class="navbar-brand no-underline" href="">
        <img
          src="@/assets/icon-01.svg"
          width="30"
          height="30"
          class="d-inline-block align-top"
          alt="Outbreak.info"
        />
        outbreak.info
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" />
      </button>
      <div id="navbarNav" class="collapse navbar-collapse">
        <ul class="navbar-nav nav-link">
          <li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/mutation-surveillance' }"
              to="/mutation-surveillance"
            >
              Mutation Surveillance
            </router-link>
          </li>
          <li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/lineage-surveillance' }"
              to="/lineage-surveillance"
            >
              Lineage Surveillance
            </router-link>
          </li>
          <li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/lineage-comparison' }"
              to="/lineage-comparison"
            >
              Lineage Comparison
            </router-link>
          </li>
          <li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/integrated-surveillance' }"
              to="/integrated-surveillance"
            >
              Integrated Surveillance
            </router-link>
          </li>
          <li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/search' }"
              to="/search"
            >
              Search Mutations
            </router-link>
          </li><li class="px-3 nav-item">
            <router-link 
              data-toggle="collapse"
              data-target=".navbar-collapse"
              class="nav-link"
              :class="{ active: $route.path === '/metadata' }"
              to="/metadata"
            >
              Metadata
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <section
    id="notices"
    class="bg-highlight py-2 px-3 text-light text-center fa-sm"
  >
  </section>
</template>

<script setup>
</script>

<style scoped lang="scss">
@import '../styles/global.scss';

.navbar-collapse.collapsing {
  -webkit-transition: height 0s;
  -moz-transition: height 0s;
  -ms-transition: height 0s;
  -o-transition: height 0s;
  transition: height 0s;
}

.dropdown-menu-dark {
  background: $primary-color;
}

.dropdown-menu {
  line-height: 1.2em;
}
</style>
