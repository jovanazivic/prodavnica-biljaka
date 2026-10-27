<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storageVersion, UserService } from './services/user.service';
import { computed, onMounted, ref, watch } from 'vue';
import Chatbot from './components/Chatbot.vue';
import { showConfirm } from './utils';

const router = useRouter()

function logout() {
  showConfirm('Da li ste sigurni da želite da se odjavite?', () => {
    UserService.logout()
    router.push('/login')
  })
}

const reservedCount = computed(() => {
  // citamo storageVersion samo da bi se broj osvezio posle svake izmene korpe
  storageVersion.value
  return UserService.getReservedCount()
})

const searchInput = ref<string>('')
const themeSwitch = ref<boolean>(false)

watch(themeSwitch, () => {
  const theme = themeSwitch.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  document.body.setAttribute('data-bs-theme', theme)
})

function search() {
  const q = searchInput.value.trim()

  if (q == '')
    return

  searchInput.value = ''

  router.push({
    path: '/',
    query: {
      search: q
    }
  })
}

onMounted(() => {
  const theme = localStorage.getItem('theme')

  document.body.setAttribute('data-bs-theme', theme ?? 'light')
  themeSwitch.value = theme == 'dark'
})
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom mb-3">
    <div class="container">
      <RouterLink class="navbar-brand text-success fw-bold" to="/">
        <i class="fa-solid fa-seedling"></i> Zeleni kutak
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Prikaži meni">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" exact-active-class="active" to="/">
              <i class="fa-solid fa-leaf"></i> Katalog
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/cart">
              <i class="fa-solid fa-basket-shopping"></i> Korpa
              <span class="badge rounded-pill text-bg-success" v-if="reservedCount > 0">
                {{ reservedCount }}
              </span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/about">
              <i class="fa-solid fa-circle-question"></i> Pomoć
            </RouterLink>
          </li>
        </ul>

        <!-- Pretraga po nazivu iz menija -->
        <form class="d-flex me-lg-3 mb-2 mb-lg-0" role="search" @submit.prevent="search">
          <input class="form-control me-2" type="search" placeholder="Pretraži biljke" aria-label="Pretraga"
            v-model="searchInput" />

          <button class="btn btn-outline-success" type="submit" title="Pretraži">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <ul class="navbar-nav mb-2 mb-lg-0">
          <!-- Ulogovan korisnik -->
          <template v-if="UserService.getActiveUser()">
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/user">
                <i class="fa-solid fa-user"></i> {{ UserService.getActiveUser()?.firstName }}
              </RouterLink>
            </li>

            <li class="nav-item">
              <button type="button" class="nav-link" @click="logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Odjava
              </button>
            </li>
          </template>

          <!-- Gost -->
          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/login">
                <i class="fa-solid fa-right-to-bracket"></i> Prijava
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/signup">
                <i class="fa-solid fa-user-plus"></i> Registracija
              </RouterLink>
            </li>
          </template>
        </ul>

        <!-- Svetla / tamna tema -->
        <div class="form-check form-switch ms-lg-3">
          <input class="form-check-input" type="checkbox" role="switch" id="themeSwitch" v-model="themeSwitch" />

          <label class="form-check-label" for="themeSwitch" title="Tamna tema">
            <i class="fa-solid fa-moon"></i>
          </label>
        </div>
      </div>
    </div>
  </nav>

  <div class="container mb-4">
    <RouterView :key="$route.fullPath" />
  </div>

  <footer class="mt-auto py-3 bg-body-tertiary border-top">
    <div class="container small text-body-secondary d-flex flex-wrap justify-content-between gap-2">
      <span><i class="fa-solid fa-seedling text-success"></i> Zeleni kutak - prototip digitalne prodavnice biljaka</span>
      <span>Programiranje i dizajn korisničkih interfejsa, 2026.</span>
    </div>
  </footer>

  <!-- Asistent je dostupan na svakoj stranici -->
  <Chatbot />
</template>
