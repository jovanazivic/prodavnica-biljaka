<script lang="ts" setup>
import type { PlantModel } from '@/models/plant.model';
import { formatPrice } from '@/utils';
import StarRating from './StarRating.vue';

export interface PlantCardProps {
    plant: PlantModel
    rating: number
    reviewCount: number
}

const { plant, rating, reviewCount } = defineProps<PlantCardProps>()
</script>

<template>
    <div class="card h-100 shadow-sm plant-card">
        <RouterLink :to="`/details/${plant.id}`">
            <img :src="plant.imageUrl" class="card-img-top plant-img" :alt="plant.imageAlt" loading="lazy">
        </RouterLink>
        <div class="card-body d-flex flex-column">
            <div class="mb-1">
                <span class="badge text-bg-success me-1">{{ plant.category }}</span>
                <span class="badge text-bg-light border">{{ plant.plantType }}</span>
            </div>
            <h5 class="card-title mb-0">{{ plant.name }}</h5>
            <small class="text-body-secondary fst-italic mb-2">{{ plant.latinName }}</small>

            <div class="small mb-2">
                <StarRating :value="rating" />
                <span class="text-body-secondary ms-1" v-if="reviewCount > 0">
                    {{ rating }} ({{ reviewCount }})
                </span>
                <span class="text-body-secondary ms-1" v-else>Bez recenzija</span>
            </div>

            <p class="small text-body-secondary mb-2">
                <i class="fa-solid fa-users"></i> {{ plant.targetAudience }}
            </p>

            <p class="fw-bold fs-5 mt-auto mb-2">{{ formatPrice(plant.price) }}</p>

            <div class="d-flex gap-2">
                <RouterLink :to="`/details/${plant.id}`" class="btn btn-outline-success btn-sm flex-fill">
                    <i class="fa-solid fa-circle-info"></i> Detalji
                </RouterLink>
                <RouterLink :to="`/reserve/${plant.id}`" class="btn btn-success btn-sm flex-fill">
                    <i class="fa-solid fa-basket-shopping"></i> Rezerviši
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.plant-card {
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.plant-card:hover {
    transform: translateY(-3px);
    border-color: var(--bs-success);
}
</style>
