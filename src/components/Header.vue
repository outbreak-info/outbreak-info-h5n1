<!-- src/components/NavBar.vue -->
<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <a class="navbar-brand no-underline" href="http://localhost:5173/">
        <img
            src="/assets/favicon.svg"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt="Outbreak.info"
        />
        outbreak.info
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarNav" aria-controls="navbarNav"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/mutation-surveillance"
                         :class="{ active: $route.path === '/mutation-surveillance' }">
              Mutation Surveillance
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/lineage-surveillance"
                         :class="{ active: $route.path === '/lineage-surveillance' }">
              Lineage Surveillance
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/metadata"
                         :class="{ active: $route.path === '/metadata' }">
              Metadata
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/search"
                         :class="{ active: $route.path === '/search' }">
              Search host-level mutations
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/box-plot"
                         :class="{ active: $route.path === '/box-plot' }">
              Lineage Prevalence
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  background-color: rgb(44, 62, 80);
  position: relative;
}

.navbar-brand, .nav-link {
  position: relative;
  z-index: 2;
}

.navbar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 40%;
  height: 100%;
  background-image: url('../assets/navback-01.svg');
  background-repeat: no-repeat;
  background-position: left top; /* Changed to left top */
  background-size: cover;
  z-index: 0;
  pointer-events: none;
}

.navbar .container,
.navbar-collapse,
.navbar-nav {
  position: relative;
  z-index: 1;
}

.navbar-brand {
  padding-left: 10px; /* Add some padding if needed */
}
</style>