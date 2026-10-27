import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import DetailsView from '@/views/DetailsView.vue'
import ReserveView from '@/views/ReserveView.vue'
import CartView from '@/views/CartView.vue'
import EditReservationView from '@/views/EditReservationView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import UserView from '@/views/UserView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: {
        title: 'Katalog biljaka'
      }
    },
    {
      path: '/about',
      component: AboutView,
      meta: {
        title: 'O nama i pomoć'
      }
    },
    {
      path: '/details/:id',
      component: DetailsView,
      meta: {
        title: 'Detalji biljke'
      }
    },
    {
      path: '/reserve/:id',
      component: ReserveView,
      meta: {
        title: 'Rezervacija'
      }
    },
    {
      path: '/cart',
      component: CartView,
      meta: {
        title: 'Korpa rezervacija'
      }
    },
    {
      path: '/cart/edit/:id',
      component: EditReservationView,
      meta: {
        title: 'Izmena rezervacije'
      }
    },
    {
      path: '/login',
      component: LoginView,
      meta: {
        title: 'Prijava'
      }
    },
    {
      path: '/signup',
      component: SignupView,
      meta: {
        title: 'Registracija'
      }
    },
    {
      path: '/user',
      component: UserView,
      meta: {
        title: 'Moj profil'
      }
    },
    {
      // nepostojece stranice vracaju na pocetnu
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} :: Zeleni kutak`
  }
})

export default router
