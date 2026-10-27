<script lang="ts" setup>
import { useLogin } from '@/hooks/login.hook';
import type { CategoryModel } from '@/models/category.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { formatPrice, getPriceForReservation, showConfirm, showError, showToast } from '@/utils';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const validateLogin = useLogin()
const router = useRouter()
const user = ref(UserService.getActiveUser())
const categories = ref<CategoryModel[]>([])
const isEditing = ref(false)

const profile = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    favouriteCategories: [] as string[]
})

const passReset = ref({
    currentPass: '',
    newPass: '',
    repeatPass: ''
})

PlantService.getCategories()
    .then(data => categories.value = data)

function startEditing() {
    const u = user.value!
    profile.value = {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        address: u.address,
        favouriteCategories: [...u.favouriteCategories]
    }
    isEditing.value = true
}

const totalSpent = computed(() => {
    let sum = 0
    for (let r of user.value?.reservations ?? []) {
        if (r.status == 'pristiglo')
            sum += getPriceForReservation(r)
    }

    return sum
})

function countByStatus(status: string) {
    return user.value?.reservations.filter(r => r.status == status).length ?? 0
}

function saveProfile() {
    const p = profile.value

    if (p.firstName.trim() == '' || p.lastName.trim() == '' || p.address.trim() == '') {
        showError('Ime, prezime i adresa ne mogu biti prazni!')
        return
    }

    if (!/^\S+@\S+\.\S+$/.test(p.email)) {
        showError('Email adresa nije ispravna!')
        return
    }

    if (!/^\+?[0-9 /-]{6,20}$/.test(p.phone)) {
        showError('Broj telefona nije ispravan!')
        return
    }

    if (p.favouriteCategories.length == 0) {
        showError('Izaberite bar jednu omiljenu vrstu biljaka!')
        return
    }

    showConfirm('Sačuvati izmene profila?', () => {
        const err = UserService.updateProfile({
            ...p,
            firstName: p.firstName.trim(),
            lastName: p.lastName.trim(),
            address: p.address.trim()
        })

        if (err) {
            showError(err)
            return
        }

        user.value = UserService.getActiveUser()
        isEditing.value = false
        showToast('Profil je sačuvan')
    })
}

function changePassword() {
    const p = passReset.value

    if (p.currentPass != user.value?.password) {
        showError('Trenutna lozinka nije ispravna!')
        return
    }

    if (p.newPass.length < 8) {
        showError('Nova lozinka mora imati najmanje 8 karaktera!')
        return
    }

    if (p.newPass == user.value?.password) {
        showError('Nova lozinka mora biti različita od stare!')
        return
    }

    if (p.newPass != p.repeatPass) {
        showError('Nove lozinke se ne poklapaju!')
        return
    }

    showConfirm('Promeniti lozinku? Nakon toga je potrebno ponovo se prijaviti.', () => {
        UserService.changePassword(p.newPass)
        UserService.logout()
        router.push('/login')
    })
}

onMounted(() => validateLogin())
</script>

<template>
    <div class="row" v-if="user">
        <div class="col-12 col-lg-5 mb-3">
            <div class="card h-100 shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-user-circle text-success"></i> Moj profil
                </div>
                <div class="card-body">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=198754&color=ffffff&size=128`"
                            :alt="`${user.firstName} avatar`" class="rounded-circle border" width="80" height="80" />
                        <div class="overflow-hidden">
                            <h5 class="fw-bold mb-1">{{ user.firstName }} {{ user.lastName }}</h5>
                            <span class="badge text-bg-success">
                                <i class="fa-solid fa-leaf"></i> Kupac
                            </span>
                        </div>
                    </div>

                    <ul class="list-group list-group-flush">
                        <li class="list-group-item px-0">
                            <small class="text-body-secondary d-block"><i class="fa-solid fa-envelope fa-fw"></i>
                                Email</small>
                            <strong class="text-break">{{ user.email }}</strong>
                        </li>
                        <li class="list-group-item px-0">
                            <small class="text-body-secondary d-block"><i class="fa-solid fa-phone fa-fw"></i>
                                Telefon</small>
                            <strong>{{ user.phone }}</strong>
                        </li>
                        <li class="list-group-item px-0">
                            <small class="text-body-secondary d-block"><i class="fa-solid fa-location-dot fa-fw"></i>
                                Adresa</small>
                            <strong>{{ user.address }}</strong>
                        </li>
                        <li class="list-group-item px-0">
                            <small class="text-body-secondary d-block"><i class="fa-solid fa-heart fa-fw"></i>
                                Omiljene vrste biljaka</small>
                            <span v-for="c in user.favouriteCategories" :key="c"
                                class="badge text-bg-light border me-1">{{ c }}</span>
                        </li>
                    </ul>

                    <div class="row text-center mt-3">
                        <div class="col-4">
                            <h5 class="fw-bold mb-0">{{ countByStatus('rezervisano') }}</h5>
                            <small class="text-body-secondary">Rezervisano</small>
                        </div>
                        <div class="col-4">
                            <h5 class="fw-bold mb-0">{{ countByStatus('pristiglo') }}</h5>
                            <small class="text-body-secondary">Pristiglo</small>
                        </div>
                        <div class="col-4">
                            <h5 class="fw-bold mb-0">{{ countByStatus('otkazano') }}</h5>
                            <small class="text-body-secondary">Otkazano</small>
                        </div>
                    </div>
                    <p class="text-center small text-body-secondary mt-2 mb-0">
                        Ukupno potrošeno: <strong>{{ formatPrice(totalSpent) }}</strong>
                    </p>
                </div>
                <div class="card-footer d-flex gap-2">
                    <button type="button" class="btn btn-success" @click="startEditing()" :disabled="isEditing">
                        <i class="fa-solid fa-pen"></i> Izmeni podatke
                    </button>
                    <RouterLink to="/cart" class="btn btn-outline-success">
                        <i class="fa-solid fa-basket-shopping"></i> Moja korpa
                    </RouterLink>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-7 mb-3">
            <!-- Izmena podataka profila -->
            <div class="card shadow-sm mb-3" v-if="isEditing">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-pen text-success"></i> Izmena podataka
                </div>
                <div class="card-body">
                    <form @submit.prevent="saveProfile">
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label for="firstName" class="form-label">Ime</label>
                                <input type="text" class="form-control" id="firstName" v-model="profile.firstName">
                            </div>
                            <div class="col-6 mb-3">
                                <label for="lastName" class="form-label">Prezime</label>
                                <input type="text" class="form-control" id="lastName" v-model="profile.lastName">
                            </div>
                            <div class="col-12 col-md-6 mb-3">
                                <label for="email" class="form-label">Email (koristi se za prijavu)</label>
                                <input type="email" class="form-control" id="email" v-model="profile.email">
                            </div>
                            <div class="col-12 col-md-6 mb-3">
                                <label for="phone" class="form-label">Telefon</label>
                                <input type="tel" class="form-control" id="phone" v-model="profile.phone">
                            </div>
                            <div class="col-12 mb-3">
                                <label for="address" class="form-label">Adresa</label>
                                <input type="text" class="form-control" id="address" v-model="profile.address">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label d-block">Omiljene vrste biljaka</label>
                            <div class="form-check form-check-inline" v-for="c in categories" :key="c.id">
                                <input class="form-check-input" type="checkbox" :id="`cat${c.id}`" :value="c.name"
                                    v-model="profile.favouriteCategories">
                                <label class="form-check-label" :for="`cat${c.id}`">{{ c.name }}</label>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-outline-secondary" @click="isEditing = false">
                                Odustani
                            </button>
                            <button type="submit" class="btn btn-success">
                                <i class="fa-solid fa-floppy-disk"></i> Sačuvaj
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Promena lozinke -->
            <div class="card shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-lock text-success"></i> Promena lozinke
                </div>
                <div class="card-body">
                    <form @submit.prevent="changePassword">
                        <div class="mb-3">
                            <label for="password1" class="form-label">Trenutna lozinka</label>
                            <input type="password" class="form-control" id="password1" autocomplete="current-password"
                                v-model="passReset.currentPass" required>
                        </div>
                        <div class="row">
                            <div class="col-12 col-md-6 mb-3">
                                <label for="password2" class="form-label">Nova lozinka</label>
                                <input type="password" class="form-control" id="password2" autocomplete="new-password"
                                    v-model="passReset.newPass" required>
                                <div class="form-text">Najmanje 8 karaktera.</div>
                            </div>
                            <div class="col-12 col-md-6 mb-3">
                                <label for="password3" class="form-label">Ponovite novu lozinku</label>
                                <input type="password" class="form-control" id="password3" autocomplete="new-password"
                                    v-model="passReset.repeatPass" required>
                                <small v-if="passReset.repeatPass.length > 0"
                                    :class="passReset.newPass === passReset.repeatPass ? 'text-success' : 'text-danger'">
                                    {{ passReset.newPass === passReset.repeatPass ? 'Lozinke se poklapaju' :
                                        'Lozinke se ne poklapaju' }}
                                </small>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end">
                            <button type="submit" class="btn btn-success">
                                <i class="fa-solid fa-shield-halved"></i> Promeni lozinku
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
