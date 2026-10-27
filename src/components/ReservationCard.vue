<script lang="ts" setup>
import type { ReservationModel } from '@/models/reservation.model';
import { formatDate, formatPrice, getPriceForReservation, getStatusClass } from '@/utils';

export interface ReservationCardProps {
    title: string
    icon: string
    reservations: ReservationModel[]
}

const { title, icon, reservations } = defineProps<ReservationCardProps>()
</script>

<template>
    <div class="card mb-3 shadow-sm">
        <div class="card-header fw-bold">
            <i :class="icon"></i> {{ title }}
            <span class="badge rounded-pill text-bg-secondary ms-1">{{ reservations.length }}</span>
        </div>
        <div class="card-body table-responsive">
            <table class="table table-striped align-middle mb-0">
                <thead>
                    <tr>
                        <th scope="col">Biljka</th>
                        <th scope="col">Kategorija</th>
                        <th scope="col">Količina</th>
                        <th scope="col">Preuzimanje</th>
                        <th scope="col">Datum</th>
                        <th scope="col">Status</th>
                        <th scope="col">Cena</th>
                        <th scope="col">Opcije</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in reservations" :key="r.id">
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <img :src="r.imageUrl" class="plant-thumb" :alt="r.name">
                                <div>
                                    <RouterLink :to="`/details/${r.plantId}`" class="fw-semibold text-decoration-none">
                                        {{ r.name ?? `Biljka #${r.plantId}` }}
                                    </RouterLink>
                                    <small class="d-block text-body-secondary" v-if="r.note">
                                        <i class="fa-regular fa-note-sticky"></i> {{ r.note }}
                                    </small>
                                </div>
                            </div>
                        </td>
                        <td>{{ r.category }}</td>
                        <td>{{ r.quantity }} kom.</td>
                        <td>
                            <span v-if="r.delivery == 'store'">
                                <i class="fa-solid fa-store"></i> U radnji
                            </span>
                            <span v-else>
                                <i class="fa-solid fa-truck"></i> Dostava
                            </span>
                        </td>
                        <td>{{ formatDate(r.pickupDate) }}</td>
                        <td>
                            <span :class="getStatusClass(r.status)">{{ r.status }}</span>
                        </td>
                        <td class="text-nowrap">{{ formatPrice(getPriceForReservation(r)) }}</td>
                        <td>
                            <slot name="options" :reservation="r"></slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <slot name="footer"></slot>
    </div>
</template>
