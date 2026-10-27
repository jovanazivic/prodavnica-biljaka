<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue';
import PlantCard from '@/components/PlantCard.vue';
import type { CategoryModel } from '@/models/category.model';
import type { PlantModel } from '@/models/plant.model';
import type { ReviewModel } from '@/models/review.model';
import { PlantService } from '@/services/plant.service';
import { ReviewService } from '@/services/review.service';
import { UserService } from '@/services/user.service';
import { showError } from '@/utils';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const PAGE_SIZE = 12

const route = useRoute()
const plants = ref<PlantModel[]>([])
const categories = ref<CategoryModel[]>([])
const climates = ref<CategoryModel[]>([])
const seasons = ref<CategoryModel[]>([])
const reviews = ref<ReviewModel[]>(ReviewService.getAll())
const isLoading = ref(true)
const showAdvanced = ref(false)
const visibleCount = ref(PAGE_SIZE)
const sort = ref('name')
const user = UserService.getActiveUser()

function emptySearch() {
  return {
    name: '',
    description: '',
    category: 'any',
    climate: 'any',
    season: 'any',
    plantType: 'any',
    intendedUse: 'any',
    audience: 'any',
    dateFrom: '',
    dateTo: '',
    priceFrom: '',
    priceTo: '',
    rating: 0,
    reviewText: ''
  }
}

const search = ref(emptySearch())
search.value.name = route.query.search as string ?? ''

// sve potrebno ucitavamo odjednom
Promise.all([
  PlantService.getPlants(),
  PlantService.getCategories(),
  PlantService.getClimates(),
  PlantService.getSeasons()
])
  .then(([p, c, cl, s]) => {
    plants.value = p
    categories.value = c
    climates.value = cl
    seasons.value = s
  })
  .catch(() => showError('Nije moguće učitati biljke. Proverite internet konekciju i pokušajte ponovo.'))
  .finally(() => isLoading.value = false)

// vrednosti za padajuce liste koje API ne vraca posebno
function getUnique(field: 'plantType' | 'intendedUse' | 'targetAudience') {
  return Array.from(new Set(plants.value.map(p => p[field]))).sort()
}

function getReviews(plantId: number) {
  return reviews.value.filter(r => r.plantId == plantId)
}

function getRating(plantId: number) {
  return ReviewService.getAverage(getReviews(plantId))
}

// Funkcija pretrage - svaki kriterijum se proverava odvojeno
const filtered = computed(() => {
  const s = search.value

  const result = plants.value
    .filter(p => p.name.toLowerCase().includes(s.name.toLowerCase())
      || p.latinName.toLowerCase().includes(s.name.toLowerCase()))
    .filter(p => {
      // svetlost i zalivanje su posebna polja u API-ju, a spadaju pod negu
      const text = `${p.description} ${p.planting} ${p.care} ${p.light} ${p.watering}`.toLowerCase()
      return text.includes(s.description.toLowerCase())
    })
    .filter(p => s.category == 'any' || p.category == s.category)
    .filter(p => s.climate == 'any' || p.climate == s.climate)
    .filter(p => s.season == 'any' || p.season == s.season)
    .filter(p => s.plantType == 'any' || p.plantType == s.plantType)
    .filter(p => s.intendedUse == 'any' || p.intendedUse == s.intendedUse)
    .filter(p => s.audience == 'any' || p.targetAudience == s.audience)
    .filter(p => {
      const produced = new Date(p.productionDate).getTime()

      if (s.dateFrom != '' && produced < new Date(s.dateFrom).getTime())
        return false

      if (s.dateTo != '' && produced > new Date(s.dateTo).getTime())
        return false

      return true
    })
    .filter(p => s.priceFrom === '' || p.price >= Number(s.priceFrom))
    .filter(p => s.priceTo === '' || p.price <= Number(s.priceTo))
    .filter(p => s.rating == 0 || getRating(p.id) >= s.rating)
    .filter(p => {
      if (s.reviewText == '')
        return true

      return getReviews(p.id).some(r => r.comment.toLowerCase().includes(s.reviewText.toLowerCase()))
    })

  return result.sort((a, b) => {
    if (sort.value == 'price-asc')
      return a.price - b.price

    if (sort.value == 'price-desc')
      return b.price - a.price

    if (sort.value == 'rating')
      return getRating(b.id) - getRating(a.id)

    if (sort.value == 'date')
      return new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()

    return a.name.localeCompare(b.name, 'sr')
  })
})

const visiblePlants = computed(() => filtered.value.slice(0, visibleCount.value))

// koliko filtera je trenutno ukljuceno, prikazuje se na dugmetu
const activeFilters = computed(() => {
  const empty = emptySearch()
  let count = 0

  for (let key in empty) {
    const k = key as keyof typeof empty
    if (search.value[k] != empty[k])
      count++
  }

  return count
})

function resetFilters() {
  search.value = emptySearch()
  visibleCount.value = PAGE_SIZE
}

// prikaz biljaka iz omiljenih kategorija ulogovanog korisnika
function showFavourite(category: string) {
  resetFilters()
  search.value.category = category
}
</script>

<template>
  <div class="hero rounded-3 p-4 mb-3">
    <h2 class="fw-bold text-success mb-1"><i class="fa-solid fa-seedling"></i> Dobrodošli u Zeleni kutak</h2>
    <p class="mb-2">
      Pretražite ponudu sobnih, baštenskih i začinskih biljaka, sadnica i semena. Rezervišite biljku, a mi ćemo
      je pripremiti za preuzimanje ili dostavu.
    </p>
    <div v-if="user && user.favouriteCategories.length > 0" class="small">
      <span class="text-body-secondary">Vaše omiljene vrste:</span>
      <button v-for="fav in user.favouriteCategories" :key="fav" type="button"
        class="btn btn-sm btn-outline-success rounded-pill ms-1 mb-1" @click="showFavourite(fav)">
        {{ fav }}
      </button>
    </div>
  </div>

  <!-- Pretraga -->
  <div class="card mb-3 shadow-sm">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="name" class="form-label">Naziv:</label>
          <input type="text" class="form-control" id="name" placeholder="npr. Lavanda" v-model="search.name">
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="description" class="form-label">Opis, sadnja i nega:</label>
          <input type="text" class="form-control" id="description" placeholder="npr. polusenka, drenaža"
            v-model="search.description">
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="category" class="form-label">Kategorija:</label>
          <select class="form-select" id="category" v-model="search.category">
            <option value="any">Sve kategorije</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }} ({{ c.plant_count }})</option>
          </select>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="sort" class="form-label">Sortiraj po:</label>
          <select class="form-select" id="sort" v-model="sort">
            <option value="name">Nazivu (A-Ž)</option>
            <option value="price-asc">Ceni - od najniže</option>
            <option value="price-desc">Ceni - od najviše</option>
            <option value="rating">Oceni kupaca</option>
            <option value="date">Datumu proizvodnje - najnovije</option>
          </select>
        </div>
      </div>

      <!-- Dodatni kriterijumi, skriveni dok ih korisnik ne otvori -->
      <div class="row" v-if="showAdvanced">
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label for="climate" class="form-label">Podneblje:</label>
          <select class="form-select" id="climate" v-model="search.climate">
            <option value="any">Sva podneblja</option>
            <option v-for="c in climates" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label for="season" class="form-label">Sezona:</label>
          <select class="form-select" id="season" v-model="search.season">
            <option value="any">Sve sezone</option>
            <option v-for="s in seasons" :key="s.id" :value="s.name">{{ s.name }}</option>
          </select>
        </div>
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label for="type" class="form-label">Tip proizvoda:</label>
          <select class="form-select" id="type" v-model="search.plantType">
            <option value="any">Svi tipovi</option>
            <option v-for="t in getUnique('plantType')" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label for="use" class="form-label">Namena:</label>
          <select class="form-select" id="use" v-model="search.intendedUse">
            <option value="any">Sve namene</option>
            <option v-for="u in getUnique('intendedUse')" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label for="audience" class="form-label">Ciljna grupa:</label>
          <select class="form-select" id="audience" v-model="search.audience">
            <option value="any">Svi kupci</option>
            <option v-for="a in getUnique('targetAudience')" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="col-6 col-md-4 col-lg-3 mb-3">
          <label for="dateFrom" class="form-label">Proizvedeno od:</label>
          <input type="date" class="form-control" id="dateFrom" v-model="search.dateFrom">
        </div>
        <div class="col-6 col-md-4 col-lg-3 mb-3">
          <label for="dateTo" class="form-label">Proizvedeno do:</label>
          <input type="date" class="form-control" id="dateTo" v-model="search.dateTo" :min="search.dateFrom">
        </div>
        <div class="col-12 col-md-4 col-lg-3 mb-3">
          <label class="form-label">Cena (RSD):</label>
          <div class="input-group">
            <input type="number" class="form-control" placeholder="od" min="0" v-model="search.priceFrom"
              aria-label="Cena od">
            <input type="number" class="form-control" placeholder="do" min="0" v-model="search.priceTo"
              aria-label="Cena do">
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="rating" class="form-label">Ocena kupaca:</label>
          <select class="form-select" id="rating" v-model.number="search.rating">
            <option :value="0">Sve ocene</option>
            <option :value="4">4 zvezdice i više</option>
            <option :value="3">3 zvezdice i više</option>
            <option :value="2">2 zvezdice i više</option>
            <option :value="1">Samo sa recenzijama</option>
          </select>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3">
          <label for="reviewText" class="form-label">Tekst recenzije:</label>
          <input type="text" class="form-control" id="reviewText" placeholder="npr. miris"
            v-model="search.reviewText">
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="showAdvanced = !showAdvanced">
          <i :class="showAdvanced ? 'fa-solid fa-chevron-up' : 'fa-solid fa-sliders'"></i>
          {{ showAdvanced ? 'Sakrij dodatne filtere' : 'Više filtera' }}
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm" @click="resetFilters()"
          :disabled="activeFilters == 0">
          <i class="fa-solid fa-rotate-left"></i> Poništi filtere
          <span class="badge text-bg-danger" v-if="activeFilters > 0">{{ activeFilters }}</span>
        </button>
        <span class="ms-auto text-body-secondary small" v-if="!isLoading">
          Pronađeno: <strong>{{ filtered.length }}</strong> od {{ plants.length }} biljaka
        </span>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3" v-for="p in visiblePlants" :key="p.id">
      <PlantCard :plant="p" :rating="getRating(p.id)" :review-count="getReviews(p.id).length" />
    </div>
  </div>

  <div class="text-center mb-3" v-if="visibleCount < filtered.length">
    <button type="button" class="btn btn-success" @click="visibleCount += PAGE_SIZE">
      <i class="fa-solid fa-angles-down"></i> Prikaži još ({{ filtered.length - visibleCount }})
    </button>
  </div>

  <InfoCard title="Nema rezultata" icon="fa-solid fa-magnifying-glass"
    v-if="!isLoading && filtered.length == 0 && plants.length > 0">
    <p>Nijedna biljka ne odgovara zadatim kriterijumima. Probajte sa manje filtera.</p>
    <button type="button" class="btn btn-success" @click="resetFilters()">
      Poništi filtere
    </button>
  </InfoCard>

  <InfoCard title="Učitavanje" icon="fa-solid fa-spinner fa-spin" v-if="isLoading">
    🌱 Učitavamo ponudu biljaka, sačekajte trenutak...
  </InfoCard>
</template>
