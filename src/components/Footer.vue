<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="list-inline-item nav-link nav-item">
            <a target="_blank" href="https://github.com/andersen-lab/avian-influenza/">Data sources</a>
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
  color: #ECECEC;
}

a {
  color: #ECECEC;
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