<script lang="ts" setup>
import { useLogin } from '@/hooks/login.hook';
import type { PlantModel } from '@/models/plant.model';
import type { ReservationModel } from '@/models/reservation.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { bootstrapClasses, DELIVERY_PRICE, formatDate, formatPrice, getDateInput, getPriceForReservation, showConfirm, showError } from '@/utils';
import Swal from 'sweetalert2';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const validateLogin = useLogin()
const user = UserService.getActiveUser()

const plant = ref<PlantModel>()
const reservation = reactive({
    quantity: 1,
    delivery: 'store' as 'store' | 'home',
    pickupDate: getDateInput(3),
    note: ''
})

PlantService.getPlantById(id)
    .then(data => plant.value = data)
    .catch(() => {
        showError('Tražena biljka ne postoji.')
        router.push('/')
    })

const total = computed(() => {
    if (!plant.value)
        return 0

    return plant.value.price * (reservation.quantity || 0) + (reservation.delivery == 'home' ? DELIVERY_PRICE : 0)
})

function validate() {
    if (!Number.isInteger(reservation.quantity) || reservation.quantity < 1) {
        showError('Količina mora biti ceo broj veći od nule!')
        return false
    }

    if (reservation.quantity > plant.value!.stock) {
        showError(`Na stanju je samo ${plant.value!.stock} kom.`)
        return false
    }

    if (reservation.pickupDate == '' || reservation.pickupDate < getDateInput(1)) {
        showError('Izaberite datum preuzimanja, najranije od sutra.')
        return false
    }

    return true
}

function createReservation() {
    if (!validate())
        return

    showConfirm(`Rezervisati ${reservation.quantity} kom. biljke ${plant.value!.name}?`, () => {
        const newReservation: ReservationModel = {
            id: Date.now(),
            plantId: id,
            quantity: reservation.quantity,
            pricePerItem: plant.value!.price,
            delivery: reservation.delivery,
            pickupDate: reservation.pickupDate,
            note: reservation.note.trim(),
            status: 'rezervisano',
            rating: null,
            comment: null,
            createdAt: new Date().toISOString()
        }

        UserService.addReservation(newReservation)

        // obavestenje o uspesnoj rezervaciji, korisnik bira gde dalje
        Swal.fire({
            icon: 'success',
            title: 'Biljka je rezervisana!',
            html: `<b>${plant.value!.name}</b> je dodata u Vašu korpu rezervacija.<br>
                Ukupno: <b>${formatPrice(getPriceForReservation(newReservation))}</b>`,
            showDenyButton: true,
            confirmButtonText: '<i class="fa-solid fa-basket-shopping"></i> Idi u korpu',
            denyButtonText: 'Nastavi pretragu',
            customClass: bootstrapClasses
        }).then(result => {
            router.push(result.isConfirmed ? '/cart' : '/')
        })
    })
}

onMounted(() => validateLogin())
</script>

<template>
    <div class="row" v-if="plant && user">
        <div class="col-12 col-md-5 mb-3">
            <div class="card shadow-sm overflow-hidden">
                <img class="plant-img" :src="plant.imageUrl" :alt="plant.imageAlt" />
                <div class="card-body">
                    <h4 class="fw-bold mb-0">{{ plant.name }}</h4>
                    <p class="fst-italic text-body-secondary">{{ plant.latinName }}</p>
                    <ul class="list-unstyled small mb-0">
                        <li><i class="fa-solid fa-tag fa-fw"></i> {{ plant.category }}, {{ plant.plantType }}</li>
                        <li><i class="fa-solid fa-seedling fa-fw"></i> Proizvedeno: {{ formatDate(plant.productionDate) }}
                        </li>
                        <li><i class="fa-solid fa-boxes-stacked fa-fw"></i> Na stanju: {{ plant.stock }} kom.</li>
                        <li><i class="fa-solid fa-coins fa-fw"></i> Cena: {{ formatPrice(plant.price) }} / kom.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-7 mb-3">
            <div class="card shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-basket-shopping text-success"></i> Nova rezervacija
                </div>
                <div class="card-body">
                    <form @submit.prevent="createReservation" id="reserveForm">
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Količina:</label>
                            <div class="input-group">
                                <button type="button" class="btn btn-outline-secondary" title="Manje"
                                    :disabled="reservation.quantity <= 1" @click="reservation.quantity--">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center" id="quantity" min="1"
                                    :max="plant.stock" v-model.number="reservation.quantity">
                                <button type="button" class="btn btn-outline-secondary" title="Više"
                                    :disabled="reservation.quantity >= plant.stock" @click="reservation.quantity++">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <div class="form-text">Maksimalno {{ plant.stock }} kom.</div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label d-block">Način preuzimanja:</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" id="store" value="store"
                                    v-model="reservation.delivery">
                                <label class="form-check-label" for="store">
                                    <i class="fa-solid fa-store"></i> Lično u radnji (besplatno)
                                </label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" id="home" value="home"
                                    v-model="reservation.delivery">
                                <label class="form-check-label" for="home">
                                    <i class="fa-solid fa-truck"></i> Dostava na adresu (+{{ formatPrice(DELIVERY_PRICE) }})
                                </label>
                            </div>
                            <div class="form-text" v-if="reservation.delivery == 'home'">
                                Dostava na adresu iz profila: <strong>{{ user.address }}</strong>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="date" class="form-label">
                                {{ reservation.delivery == 'home' ? 'Željeni datum dostave:' : 'Datum preuzimanja:' }}
                            </label>
                            <input type="date" class="form-control" id="date" :min="getDateInput(1)"
                                v-model="reservation.pickupDate">
                        </div>

                        <div class="mb-3">
                            <label for="note" class="form-label">Napomena (nije obavezno):</label>
                            <textarea class="form-control" id="note" rows="2" maxlength="200"
                                placeholder="npr. upakovati kao poklon" v-model="reservation.note"></textarea>
                        </div>
                    </form>
                </div>
                <div class="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <p class="fw-bold h5 mb-0">Ukupno: {{ formatPrice(total) }}</p>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="router.back()">
                            Odustani
                        </button>
                        <button type="submit" class="btn btn-success" form="reserveForm">
                            <i class="fa-solid fa-check"></i> Potvrdi rezervaciju
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
