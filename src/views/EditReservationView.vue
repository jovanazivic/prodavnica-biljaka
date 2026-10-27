<script lang="ts" setup>
import { useLogin } from '@/hooks/login.hook';
import type { PlantModel } from '@/models/plant.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { DELIVERY_PRICE, formatDate, formatPrice, getDateInput, showConfirm, showError, showToast } from '@/utils';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const validateLogin = useLogin()
const user = UserService.getActiveUser()

const plant = ref<PlantModel>()
// radimo nad kopijom, da se izmene ne vide dok korisnik ne sacuva
const original = UserService.getReservation(id)
const reservation = ref(original ? { ...original } : undefined)

if (user && (!original || original.status != 'rezervisano')) {
    showError('Mogu se menjati samo biljke koje su u statusu rezervisano.')
    router.push('/cart')
}

if (original) {
    PlantService.getPlantById(original.plantId)
        .then(data => plant.value = data)
}

const total = computed(() => {
    if (!reservation.value)
        return 0

    const r = reservation.value
    return r.pricePerItem * (r.quantity || 0) + (r.delivery == 'home' ? DELIVERY_PRICE : 0)
})

// da li je korisnik nesto promenio, inace dugme za cuvanje nema smisla
const isChanged = computed(() => {
    const r = reservation.value
    if (!r || !original)
        return false

    return r.quantity != original.quantity
        || r.delivery != original.delivery
        || r.pickupDate != original.pickupDate
        || r.note != original.note
})

function save() {
    const r = reservation.value!

    if (!Number.isInteger(r.quantity) || r.quantity < 1) {
        showError('Količina mora biti ceo broj veći od nule!')
        return
    }

    if (plant.value && r.quantity > plant.value.stock) {
        showError(`Na stanju je samo ${plant.value.stock} kom.`)
        return
    }

    if (r.pickupDate == '' || r.pickupDate < getDateInput(1)) {
        showError('Izaberite datum preuzimanja, najranije od sutra.')
        return
    }

    showConfirm('Sačuvati izmene rezervacije?', () => {
        UserService.updateReservation({ ...r, note: r.note.trim() })
        showToast('Rezervacija je izmenjena')
        router.push('/cart')
    })
}

onMounted(() => validateLogin())
</script>

<template>
    <div class="row" v-if="user && reservation && reservation.status == 'rezervisano'">
        <div class="col-12 col-md-5 mb-3">
            <div class="card shadow-sm overflow-hidden" v-if="plant">
                <img class="plant-img" :src="plant.imageUrl" :alt="plant.imageAlt" />
                <div class="card-body">
                    <h4 class="fw-bold mb-0">{{ plant.name }}</h4>
                    <p class="fst-italic text-body-secondary">{{ plant.latinName }}</p>
                    <ul class="list-unstyled small mb-0">
                        <li><i class="fa-solid fa-calendar-plus fa-fw"></i> Rezervisano: {{
                            formatDate(reservation.createdAt) }}</li>
                        <li><i class="fa-solid fa-boxes-stacked fa-fw"></i> Na stanju: {{ plant.stock }} kom.</li>
                        <li><i class="fa-solid fa-coins fa-fw"></i> Cena: {{ formatPrice(reservation.pricePerItem) }} /
                            kom.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-7 mb-3">
            <div class="card shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-pen-to-square text-success"></i> Izmena rezervacije
                </div>
                <div class="card-body">
                    <form @submit.prevent="save" id="editForm">
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Količina:</label>
                            <div class="input-group">
                                <button type="button" class="btn btn-outline-secondary" title="Manje"
                                    :disabled="reservation.quantity <= 1" @click="reservation.quantity--">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center" id="quantity" min="1"
                                    v-model.number="reservation.quantity">
                                <button type="button" class="btn btn-outline-secondary" title="Više"
                                    :disabled="plant && reservation.quantity >= plant.stock"
                                    @click="reservation.quantity++">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
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
                                v-model="reservation.note"></textarea>
                        </div>
                    </form>
                </div>
                <div class="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <p class="fw-bold h5 mb-0">Ukupno: {{ formatPrice(total) }}</p>
                    <div class="d-flex gap-2">
                        <RouterLink to="/cart" class="btn btn-outline-secondary">Odustani</RouterLink>
                        <button type="submit" class="btn btn-success" form="editForm" :disabled="!isChanged">
                            <i class="fa-solid fa-floppy-disk"></i> Sačuvaj izmene
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
