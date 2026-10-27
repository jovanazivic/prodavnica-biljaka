<script lang="ts" setup>
import type { CategoryModel } from '@/models/category.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { showError, showSuccess } from '@/utils';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const categories = ref<CategoryModel[]>()
const confirm = ref<string>('')
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    favouriteCategories: [] as string[]
})

PlantService.getCategories()
    .then(data => categories.value = data)
    .catch(() => categories.value = [])

function signup() {
    const f = form.value

    if (f.firstName.trim() == '' || f.lastName.trim() == '') {
        showError('Unesite ime i prezime!')
        return
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
        showError('Email adresa nije ispravna!')
        return
    }

    // dozvoljavamo razmake i crtice, npr. 064 123-4567
    if (!/^\+?[0-9 /-]{6,20}$/.test(f.phone)) {
        showError('Broj telefona nije ispravan!')
        return
    }

    if (f.address.trim() == '') {
        showError('Unesite adresu za dostavu!')
        return
    }

    if (f.favouriteCategories.length == 0) {
        showError('Izaberite bar jednu omiljenu vrstu biljaka!')
        return
    }

    if (f.password != confirm.value) {
        showError('Lozinke se ne poklapaju!')
        return
    }

    const err = UserService.createUser({
        ...f,
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        address: f.address.trim()
    })

    if (err == null) {
        showSuccess('Nalog je kreiran', 'Sada se možete prijaviti.')
        router.push('/login')
        return
    }

    showError(err)
}
</script>

<template>
    <div class="row auth-row" v-if="categories">
        <div class="col-12 col-md-5 d-none d-md-block">
            <img src="@/assets/signup.jpg" class="img-fluid" alt="Sukulenti u saksijama">
        </div>
        <div class="col-12 col-md-7">
            <div class="card h-100 shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-user-plus text-success"></i> Registracija
                </div>
                <div class="card-body">
                    <p class="small text-body-secondary">Sva polja su obavezna.</p>
                    <form @submit.prevent="signup">
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label for="firstName" class="form-label">Ime</label>
                                <input type="text" class="form-control" id="firstName" autocomplete="given-name"
                                    v-model="form.firstName">
                            </div>
                            <div class="col-6 mb-3">
                                <label for="lastName" class="form-label">Prezime</label>
                                <input type="text" class="form-control" id="lastName" autocomplete="family-name"
                                    v-model="form.lastName">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email adresa</label>
                            <input type="email" class="form-control" id="email" autocomplete="email"
                                v-model="form.email">
                        </div>
                        <div class="mb-3">
                            <label for="phone" class="form-label">Telefon</label>
                            <input type="tel" class="form-control" id="phone" placeholder="npr. 064 123 4567"
                                autocomplete="tel" v-model="form.phone">
                        </div>
                        <div class="mb-3">
                            <label for="address" class="form-label">Adresa</label>
                            <input type="text" class="form-control" id="address" placeholder="Ulica i broj, grad"
                                autocomplete="street-address" v-model="form.address">
                        </div>
                        <div class="mb-3">
                            <label class="form-label d-block">Omiljene vrste biljaka</label>
                            <div class="form-check form-check-inline" v-for="c in categories" :key="c.id">
                                <input class="form-check-input" type="checkbox" :id="`cat${c.id}`" :value="c.name"
                                    v-model="form.favouriteCategories">
                                <label class="form-check-label" :for="`cat${c.id}`">{{ c.name }}</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 col-lg-6 mb-3">
                                <label for="password" class="form-label">Lozinka</label>
                                <input type="password" class="form-control" id="password" autocomplete="new-password"
                                    v-model="form.password">
                                <div class="form-text">Najmanje 8 karaktera.</div>
                            </div>
                            <div class="col-12 col-lg-6 mb-3">
                                <label for="confirm" class="form-label">Ponovite lozinku</label>
                                <input type="password" class="form-control" id="confirm" autocomplete="new-password"
                                    v-model="confirm">
                                <small v-if="confirm.length > 0"
                                    :class="form.password === confirm ? 'text-success' : 'text-danger'">
                                    {{ form.password === confirm ? 'Lozinke se poklapaju' : 'Lozinke se ne poklapaju' }}
                                </small>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Kreiraj nalog</button>
                    </form>
                    <p class="small mt-3 mb-0">
                        Već imate nalog? <RouterLink to="/login">Prijavite se</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
