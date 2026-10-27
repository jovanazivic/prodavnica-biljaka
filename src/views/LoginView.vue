<script lang="ts" setup>
import { UserService } from '@/services/user.service';
import { showError } from '@/utils';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref(false)
const router = useRouter()

function login() {
    if (email.value == '' || password.value == '') {
        showError('Unesite email adresu i lozinku!')
        return
    }

    if (UserService.login(email.value.trim(), password.value)) {
        const to = sessionStorage.getItem('to')
        sessionStorage.removeItem('to')
        router.push(to ?? '/')
        return
    }

    showError('Pogrešna email adresa ili lozinka!')
}
</script>

<template>
    <div class="row auth-row">
        <div class="col-12 col-md-6 d-none d-md-block">
            <img src="@/assets/login.jpg" class="img-fluid" alt="Sukulenti na prozoru">
        </div>
        <div class="col-12 col-md-6">
            <div class="card h-100 shadow-sm">
                <div class="card-header fw-bold">
                    <i class="fa-solid fa-right-to-bracket text-success"></i> Prijava
                </div>
                <div class="card-body">
                    <p class="small text-body-secondary">
                        Prijavite se da biste rezervisali biljke i pristupili svojoj korpi.
                    </p>
                    <form @submit.prevent="login">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email adresa</label>
                            <input type="email" class="form-control" id="email" autocomplete="email"
                                v-model="email">
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Lozinka</label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password"
                                    autocomplete="current-password" v-model="password">
                                <button type="button" class="btn btn-outline-secondary"
                                    :title="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
                                    @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Prijavi se</button>
                    </form>
                    <hr>
                    <p class="small mb-2">
                        Nemate nalog? <RouterLink to="/signup">Registrujte se</RouterLink>
                    </p>
                    <div class="alert alert-light border small mb-0">
                        <i class="fa-solid fa-circle-info"></i> Probni nalog:<br>
                        <strong>kupac@example.com</strong> / <strong>kupac123</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
