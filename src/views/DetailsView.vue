<script setup lang="ts">
import StarRating from '@/components/StarRating.vue';
import type { PlantModel } from '@/models/plant.model';
import { PlantService } from '@/services/plant.service';
import { ReviewService } from '@/services/review.service';
import { UserService } from '@/services/user.service';
import { formatDate, formatPrice, showError, showLoading } from '@/utils';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const plant = ref<PlantModel>()
const similar = ref<PlantModel[]>([])
const reviews = ReviewService.getForPlant(id)
const average = ReviewService.getAverage(reviews)

PlantService.getPlantById(id)
   .then(data => {
      plant.value = data
      Swal.close()

      // slicne biljke iz iste kategorije
      PlantService.getPlantsByCategory(data.categoryId)
         .then(list => similar.value = list.filter(p => p.id != id).slice(0, 6))
   })
   .catch(() => {
      showError('Tražena biljka ne postoji.')
      router.push('/')
   })

// ako je korisnik vec kupio biljku, a nije je ocenio, podsecamo ga
const canRate = computed(() => {
   const user = UserService.getActiveUser()
   if (!user)
      return false

   return user.reservations.some(r => r.plantId == id && r.status == 'pristiglo' && r.rating == null)
})

// koliko je kupaca dalo koju ocenu, za mali grafikon
function countFor(stars: number) {
   return reviews.filter(r => r.rating == stars).length
}

onMounted(() => showLoading())
</script>

<template>
   <nav aria-label="breadcrumb" v-if="plant">
      <ol class="breadcrumb">
         <li class="breadcrumb-item">
            <RouterLink to="/">Katalog</RouterLink>
         </li>
         <li class="breadcrumb-item">{{ plant.category }}</li>
         <li class="breadcrumb-item active" aria-current="page">{{ plant.name }}</li>
      </ol>
   </nav>

   <div class="row g-4 mb-4" v-if="plant">
      <div class="col-12 col-md-5">
         <div class="card shadow-sm overflow-hidden">
            <img class="plant-img" :src="plant.imageUrl" :alt="plant.imageAlt" />
         </div>
      </div>

      <div class="col-12 col-md-7">
         <div class="card shadow-sm h-100">
            <div class="card-body">
               <span class="badge text-bg-success me-1">{{ plant.category }}</span>
               <span class="badge text-bg-light border me-1">{{ plant.plantType }}</span>
               <span class="badge text-bg-info">{{ plant.climate }} podneblje</span>

               <h2 class="fw-bold mt-2 mb-0">{{ plant.name }}</h2>
               <p class="fst-italic text-body-secondary">{{ plant.latinName }}</p>

               <div class="mb-3">
                  <StarRating :value="average" />
                  <a href="#reviews" class="ms-2 small" v-if="reviews.length > 0">
                     {{ average }} / 5 ({{ reviews.length }} recenzija)
                  </a>
                  <span class="ms-2 small text-body-secondary" v-else>Još uvek nema recenzija</span>
               </div>

               <p>{{ plant.description }}</p>

               <div class="d-flex align-items-center flex-wrap gap-3">
                  <span class="fs-3 fw-bold text-success">{{ formatPrice(plant.price) }}</span>
                  <span class="small text-body-secondary">
                     <i class="fa-solid fa-boxes-stacked"></i> Na stanju: {{ plant.stock }} kom.
                  </span>
               </div>

               <div class="d-flex flex-wrap gap-2 mt-3">
                  <RouterLink :to="`/reserve/${plant.id}`" class="btn btn-success">
                     <i class="fa-solid fa-basket-shopping"></i> Rezerviši biljku
                  </RouterLink>
                  <button type="button" class="btn btn-outline-secondary" @click="router.back()">
                     <i class="fa-solid fa-arrow-left"></i> Nazad
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>

   <div class="row g-4 mb-4" v-if="plant">
      <!-- Osnovni podaci -->
      <div class="col-12 col-lg-6">
         <div class="card shadow-sm h-100">
            <div class="card-header fw-bold">
               <i class="fa-solid fa-list text-success"></i> Osnovni podaci
            </div>
            <ul class="list-group list-group-flush">
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-tag fa-fw"></i> Tip</span>
                  <strong>{{ plant.plantType }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-earth-europe fa-fw"></i> Podneblje</span>
                  <strong>{{ plant.climate }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-calendar-days fa-fw"></i> Sezona</span>
                  <strong>{{ plant.season }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-house-chimney fa-fw"></i> Namena</span>
                  <strong>{{ plant.intendedUse }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-users fa-fw"></i> Ciljna grupa</span>
                  <strong>{{ plant.targetAudience }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-seedling fa-fw"></i> Datum proizvodnje</span>
                  <strong>{{ formatDate(plant.productionDate) }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-sun fa-fw"></i> Svetlo</span>
                  <strong>{{ plant.light }}</strong>
               </li>
               <li class="list-group-item d-flex justify-content-between">
                  <span class="text-body-secondary"><i class="fa-solid fa-droplet fa-fw"></i> Zalivanje</span>
                  <strong>{{ plant.watering }}</strong>
               </li>
            </ul>
         </div>
      </div>

      <!-- Sadnja i nega -->
      <div class="col-12 col-lg-6">
         <div class="card shadow-sm h-100">
            <div class="card-header fw-bold">
               <i class="fa-solid fa-hand-holding-droplet text-success"></i> Sadnja i nega
            </div>
            <div class="card-body">
               <h6 class="fw-bold"><i class="fa-solid fa-trowel"></i> Sadnja</h6>
               <p>{{ plant.planting }}</p>
               <h6 class="fw-bold"><i class="fa-solid fa-heart"></i> Nega</h6>
               <p class="mb-0">{{ plant.care }}</p>
            </div>
         </div>
      </div>
   </div>

   <!-- Recenzije -->
   <div class="card shadow-sm mb-4" id="reviews" v-if="plant">
      <div class="card-header fw-bold">
         <i class="fa-solid fa-comments text-success"></i> Recenzije kupaca
      </div>
      <div class="card-body">
         <div class="alert alert-success" v-if="canRate">
            <i class="fa-solid fa-circle-info"></i> Ovu biljku ste već preuzeli.
            <RouterLink to="/cart">Ocenite je u svojoj korpi</RouterLink> i pomozite drugim kupcima.
         </div>

         <div class="row" v-if="reviews.length > 0">
            <div class="col-12 col-md-4 mb-3 text-center">
               <div class="display-5 fw-bold">{{ average }}</div>
               <StarRating :value="average" />
               <p class="text-body-secondary small">na osnovu {{ reviews.length }} recenzija</p>

               <div v-for="stars in [5, 4, 3, 2, 1]" :key="stars" class="d-flex align-items-center gap-2 small">
                  <span class="text-nowrap">{{ stars }} <i class="fa-solid fa-star stars"></i></span>
                  <div class="progress flex-grow-1" style="height: 8px;">
                     <div class="progress-bar bg-warning" :style="{ width: `${countFor(stars) / reviews.length * 100}%` }">
                     </div>
                  </div>
                  <span>{{ countFor(stars) }}</span>
               </div>
            </div>

            <div class="col-12 col-md-8">
               <div v-for="(r, index) in reviews" :key="index" class="border-bottom pb-2 mb-3">
                  <div class="d-flex justify-content-between">
                     <strong><i class="fa-solid fa-circle-user text-body-secondary"></i> {{ r.author }}</strong>
                     <small class="text-body-secondary">{{ formatDate(r.createdAt) }}</small>
                  </div>
                  <StarRating :value="r.rating" />
                  <p class="mb-0 mt-1" v-if="r.comment">{{ r.comment }}</p>
               </div>
            </div>
         </div>

         <p class="text-body-secondary mb-0" v-else>
            Ovu biljku još niko nije ocenio. Recenzije mogu da ostave samo kupci kojima je biljka stigla.
         </p>
      </div>
   </div>

   <!-- Slicne biljke -->
   <div v-if="similar.length > 0">
      <h5 class="fw-bold">Iz iste kategorije:</h5>
      <div class="row">
         <div class="col-6 col-md-4 col-lg-2 mb-3" v-for="p in similar" :key="p.id">
            <div class="card h-100 text-center">
               <img :src="p.imageUrl" class="card-img-top plant-img" :alt="p.imageAlt" loading="lazy">
               <div class="card-body p-2">
                  <strong class="small d-block">{{ p.name }}</strong>
                  <small class="text-body-secondary">{{ formatPrice(p.price) }}</small>
               </div>
               <div class="card-footer p-2">
                  <RouterLink :to="`/details/${p.id}`" class="btn btn-sm btn-outline-success w-100">
                     Pogledaj
                  </RouterLink>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>
