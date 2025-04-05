<!-- src/components/NavBar.vue -->
<template>
  <!--      TODO: Add outbreak.info logo -->
  <!--  TODO: Fix header background -->
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
            <router-link class="nav-link" to="/metadata"
                         :class="{ active: $route.path === '/metadata' }">
              Metadata
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/box-plot"
                         :class="{ active: $route.path === '/box-plot' }">
              Lineage Prevalence
            </router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="mutationDropdown" role="button"
               data-bs-toggle="dropdown" aria-expanded="false"
               @mouseover="showDropdown" @mouseleave="hideDropdown">
              Mutations
            </a>
            <ul class="dropdown-menu" :class="{ show: isDropdownVisible }" aria-labelledby="mutationDropdown"
                @mouseover="showDropdown" @mouseleave="hideDropdown">
              <li>
                <router-link class="dropdown-item" to="/histogram"
                            :class="{ active: $route.path === '/histogram' }">
                  Frequency Distribution
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/mutations"
                            :class="{ active: $route.path === '/mutations' }">
                  Frequency by Phenotype Score
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isDropdownVisible = ref(false)

const showDropdown = () => {
  isDropdownVisible.value = true
}

const hideDropdown = () => {
  isDropdownVisible.value = false
}
</script>

<style scoped>
/* In your global CSS or component scoped CSS */
.navbar {
  background-color: rgb(44, 62, 80);
  position: relative;
}

.navbar-brand, .nav-link {
  position: relative;
  z-index: 2; /* Keep text above the background */
}

/* Container for the svg background at the left side */
.navbar::before {  /* Changed from after to before */
  content: '';
  position: absolute;
  left: 0;  /* Changed from right to left */
  top: 0;
  width: 40%; /* Adjust width as needed */
  height: 100%;
  background-image: url('../assets/navback-01.svg');
  background-repeat: no-repeat;
  background-position: left top; /* Changed to left top */
  background-size: cover;
  z-index: 0;
  pointer-events: none;
}

/* Ensure navbar content is above the SVG background */
.navbar .container,
.navbar-collapse,
.navbar-nav {
  position: relative;
  z-index: 1;
}

/* Make sure brand text is still visible over the SVG */
.navbar-brand {
  padding-left: 10px; /* Add some padding if needed */
}

/* Style dropdown menu */
.dropdown-menu {
  background-color: rgb(44, 62, 80);
  margin-top: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  z-index: 9999; /* Increased z-index */
  min-width: 250px;
  top: 100%;
  left: 0;
  display: none; /* Hide by default */
}

.dropdown-menu.show {
  display: block !important; /* Force display when shown */
}

.dropdown-item {
  color: white !important;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Ensure dropdown is above other content */
.dropdown {
  position: relative;
}
</style>