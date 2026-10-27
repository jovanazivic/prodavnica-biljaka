<script lang="ts" setup>
import InfoCard from '@/components/InfoCard.vue';
import ReservationCard from '@/components/ReservationCard.vue';
import StarRating from '@/components/StarRating.vue';
import { useLogin } from '@/hooks/login.hook';
import type { ReservationModel } from '@/models/reservation.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { bootstrapClasses, formatPrice, getPriceForReservation, showConfirm, showError, showToast } from '@/utils';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';

const validateLogin = useLogin()
const user = UserService.getActiveUser()
const reservations = ref<ReservationModel[]>([])
const isLoading = ref(true)

// rezervacije cuvamo samo sa ID-jem biljke, ostale podatke vucemo sa API-ja
function loadReservations() {
    const current = UserService.getActiveUser()
    if (!current)
        return

    const ids = Array.from(new Set(current.reservations.map(r => r.plantId)))

    PlantService.getPlantsByIds(ids)
        .then(plants => {
            for (let r of current.reservations) {
                for (let plant of plants) {
                    if (r.plantId === plant.id) {
                        r.name = plant.name
                        r.imageUrl = plant.imageUrl
                        r.category = plant.category
                    }
                }
            }

            // najnovije rezervacije na vrhu
            reservations.value = current.reservations.sort((a, b) => b.id - a.id)
        })
        .catch(() => showError('Podaci o biljkama trenutno nisu dostupni.'))
        .finally(() => isLoading.value = false)
}

const reserved = computed(() => reservations.value.filter(r => r.status == 'rezervisano'))
const arrived = computed(() => reservations.value.filter(r => r.status == 'pristiglo'))
const cancelled = computed(() => reservations.value.filter(r => r.status == 'otkazano'))

function sumOf(list: ReservationModel[]) {
    let sum = 0
    for (let r of list) {
        sum += getPriceForReservation(r)
    }

    return sum
}

// ukupna cena svega sto nije otkazano
const total = computed(() => sumOf(reserved.value) + sumOf(arrived.value))

function cancelReservation(r: ReservationModel) {
    showConfirm(`Otkazati rezervaciju za biljku ${r.name}?`, () => {
        UserService.cancelReservation(r.id)
        showToast('Rezervacija je otkazana')
        loadReservations()
    })
}

function markAsArrived(r: ReservationModel) {
    showConfirm(`Potvrđujete da je biljka ${r.name} stigla?`, () => {
        UserService.markAsArrived(r.id)
        showToast('Biljka je označena kao pristigla. Sada je možete oceniti!')
        loadReservations()
    })
}

function removeReservation(r: ReservationModel) {
    showConfirm(`Obrisati biljku ${r.name} iz korpe?`, () => {
        UserService.removeReservation(r.id)
        showToast('Biljka je obrisana iz korpe')
        loadReservations()
    })
}

// ocena se bira klikom na zvezdicu, a komentar se unosi u popup-u
function rate(r: ReservationModel, rating: number) {
    Swal.fire({
        title: `Ocena ${rating}/5 za ${r.name}`,
        input: 'textarea',
        inputLabel: 'Komentar (nije obavezno)',
        inputPlaceholder: 'Kako ste zadovoljni biljkom?',
        inputValue: r.comment ?? '',
        inputAttributes: {
            maxlength: '300'
        },
        showCancelButton: true,
        confirmButtonText: 'Sačuvaj ocenu',
        cancelButtonText: 'Odustani',
        customClass: bootstrapClasses
    }).then(result => {
        if (result.isConfirmed) {
            UserService.rateReservation(r.id, rating, String(result.value).trim())
            showToast('Hvala na oceni!')
            loadReservations()
        }
    })
}

onMounted(() => {
    if (validateLogin())
        loadReservations()
})
</script>

<template>
    <template v-if="user && !isLoading">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h3 class="fw-bold mb-0"><i class="fa-solid fa-basket-shopping text-success"></i> Korpa rezervacija</h3>
            <RouterLink to="/" class="btn btn-outline-success">
                <i class="fa-solid fa-plus"></i> Rezerviši još biljaka
            </RouterLink>
        </div>

        <!-- Kratak pregled korpe -->
        <div class="row mb-2" v-if="reservations.length > 0">
            <div class="col-6 col-lg-3 mb-3">
                <div class="card border-warning h-100">
                    <div class="card-body">
                        <small class="text-body-secondary">Rezervisano</small>
                        <h4 class="fw-bold mb-0">{{ reserved.length }}</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="card border-success h-100">
                    <div class="card-body">
                        <small class="text-body-secondary">Pristiglo</small>
                        <h4 class="fw-bold mb-0">{{ arrived.length }}</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="card border-secondary h-100">
                    <div class="card-body">
                        <small class="text-body-secondary">Otkazano</small>
                        <h4 class="fw-bold mb-0">{{ cancelled.length }}</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="card text-bg-success h-100">
                    <div class="card-body">
                        <small>Ukupna cena (bez otkazanih)</small>
                        <h4 class="fw-bold mb-0">{{ formatPrice(total) }}</h4>
                    </div>
                </div>
            </div>
        </div>

        <ReservationCard v-if="reserved.length > 0" :reservations="reserved" title="Rezervisane biljke"
            icon="fa-solid fa-clock text-warning">
            <template #options="{ reservation }">
                <div class="btn-group">
                    <RouterLink :to="`/cart/edit/${reservation.id}`" class="btn btn-sm btn-primary"
                        title="Izmeni rezervaciju">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </RouterLink>
                    <button type="button" class="btn btn-sm btn-success" title="Potvrdi da je biljka stigla"
                        @click="markAsArrived(reservation)">
                        <i class="fa-solid fa-box-open"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" title="Otkaži rezervaciju"
                        @click="cancelReservation(reservation)">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                </div>
            </template>
            <template #footer>
                <div class="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <small class="text-body-secondary">
                        <i class="fa-solid fa-circle-info"></i>
                        Rezervisane biljke možete menjati ili otkazati dok ne stignu.
                    </small>
                    <p class="fw-bold h5 mb-0">Za plaćanje: {{ formatPrice(sumOf(reserved)) }}</p>
                </div>
            </template>
        </ReservationCard>

        <ReservationCard v-if="arrived.length > 0" :reservations="arrived" title="Pristigle biljke"
            icon="fa-solid fa-circle-check text-success">
            <template #options="{ reservation }">
                <div class="d-flex align-items-center gap-2">
                    <div class="text-nowrap">
                        <StarRating :value="reservation.rating ?? 0" editable @rate="rate(reservation, $event)" />
                        <small class="d-block text-body-secondary">
                            {{ reservation.rating ? 'Vaša ocena' : 'Kliknite da ocenite' }}
                        </small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" title="Obriši iz korpe"
                        @click="removeReservation(reservation)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </template>
            <template #footer>
                <div class="card-footer d-flex justify-content-end">
                    <p class="fw-bold h5 mb-0">Ukupno: {{ formatPrice(sumOf(arrived)) }}</p>
                </div>
            </template>
        </ReservationCard>

        <ReservationCard v-if="cancelled.length > 0" :reservations="cancelled" title="Otkazane rezervacije"
            icon="fa-solid fa-ban text-secondary">
            <template #options="{ reservation }">
                <RouterLink :to="`/reserve/${reservation.plantId}`" class="btn btn-sm btn-outline-success"
                    title="Rezerviši ponovo">
                    <i class="fa-solid fa-rotate-right"></i>
                </RouterLink>
            </template>
        </ReservationCard>

        <InfoCard title="Korpa je prazna" icon="fa-solid fa-basket-shopping" v-if="reservations.length == 0">
            <p>Još uvek niste rezervisali nijednu biljku.</p>
            <RouterLink to="/" class="btn btn-success">
                <i class="fa-solid fa-leaf"></i> Pogledaj katalog
            </RouterLink>
        </InfoCard>
    </template>

    <InfoCard title="Učitavanje" icon="fa-solid fa-spinner fa-spin" v-if="user && isLoading">
        Učitavamo Vaše rezervacije...
    </InfoCard>
</template>
