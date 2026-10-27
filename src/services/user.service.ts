import type { ReservationModel } from "@/models/reservation.model"
import type { UserModel } from "@/models/user.model"
import { ref } from "vue"

const USERS_KEY = 'zeleni_kutak_users'
const ACTIVE_USER_KEY = 'zeleni_kutak_active'

// localStorage nije reaktivan, pa ovim brojacem javljamo meniju da se korpa promenila
export const storageVersion = ref(0)

export class UserService {

    static getUsers(): UserModel[] {
        if (localStorage.getItem(USERS_KEY) == null) {
            // pocetni korisnik da bi prototip odmah imao nesto u korpi
            localStorage.setItem(USERS_KEY, JSON.stringify([
                {
                    firstName: 'Jovana',
                    lastName: 'Živić',
                    email: 'kupac@example.com',
                    phone: '0641234567',
                    address: 'Danijelova 32, Beograd',
                    password: 'kupac123',
                    favouriteCategories: ['Sobne biljke', 'Začinsko i aromatično bilje'],
                    reservations: [
                        {
                            id: 1761300000000,
                            plantId: 1,
                            quantity: 1,
                            pricePerItem: 330,
                            delivery: 'store',
                            pickupDate: '2026-11-05',
                            note: '',
                            status: 'rezervisano',
                            rating: null,
                            comment: null,
                            createdAt: '2026-10-20T10:15:00.000Z'
                        },
                        {
                            id: 1761200000000,
                            plantId: 31,
                            quantity: 2,
                            pricePerItem: 2240,
                            delivery: 'home',
                            pickupDate: '2026-10-10',
                            note: 'Pozvati pre isporuke',
                            status: 'pristiglo',
                            rating: null,
                            comment: null,
                            createdAt: '2026-10-02T08:40:00.000Z'
                        },
                        {
                            id: 1761100000000,
                            plantId: 41,
                            quantity: 3,
                            pricePerItem: 1410,
                            delivery: 'store',
                            pickupDate: '2026-09-18',
                            note: '',
                            status: 'pristiglo',
                            rating: 5,
                            comment: 'Sve tri sadnice su se lepo primile, miris je fantastičan.',
                            createdAt: '2026-09-10T16:05:00.000Z'
                        },
                        {
                            id: 1761000000000,
                            plantId: 58,
                            quantity: 10,
                            pricePerItem: 1540,
                            delivery: 'store',
                            pickupDate: '2026-09-01',
                            note: '',
                            status: 'otkazano',
                            rating: null,
                            comment: null,
                            createdAt: '2026-08-25T12:30:00.000Z'
                        }
                    ]
                }
            ]))
        }

        return JSON.parse(localStorage.getItem(USERS_KEY)!)
    }

    static saveUsers(users: UserModel[]) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        storageVersion.value++
    }

    static login(email: string, password: string): boolean {
        const users = this.getUsers()

        for (let user of users) {
            if (user.email == email && user.password == password) {
                localStorage.setItem(ACTIVE_USER_KEY, email)
                storageVersion.value++
                return true
            }
        }

        return false
    }

    static getActiveUser(): UserModel | null {
        for (let user of this.getUsers()) {
            if (user.email == localStorage.getItem(ACTIVE_USER_KEY)) {
                return user
            }
        }

        return null
    }

    static logout() {
        localStorage.removeItem(ACTIVE_USER_KEY)
        storageVersion.value++
    }

    // Sve izmene nad ulogovanim korisnikom idu kroz ovu funkciju,
    // da ne bi u svakoj metodi ponavljali istu petlju
    static updateActiveUser(change: (user: UserModel) => void) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (let user of users) {
                if (user.email === activeUser.email) {
                    change(user)
                }
            }

            this.saveUsers(users)
        }
    }

    static getReservation(id: number) {
        const user = this.getActiveUser()
        return user?.reservations.find(r => r.id == id)
    }

    static addReservation(reservation: ReservationModel) {
        this.updateActiveUser(user => {
            user.reservations.push(reservation)
        })
    }

    static updateReservation(reservation: ReservationModel) {
        this.updateActiveUser(user => {
            for (let obj of user.reservations) {
                // menjati se mogu samo biljke koje su jos u statusu rezervisano
                if (obj.id == reservation.id && obj.status == 'rezervisano') {
                    obj.quantity = reservation.quantity
                    obj.delivery = reservation.delivery
                    obj.pickupDate = reservation.pickupDate
                    obj.note = reservation.note
                }
            }
        })
    }

    static cancelReservation(id: number) {
        this.updateActiveUser(user => {
            for (let obj of user.reservations) {
                if (obj.id == id && obj.status == 'rezervisano') {
                    obj.status = 'otkazano'
                }
            }
        })
    }

    // Simulacija - kupac potvrdjuje da je biljka stigla / preuzeta
    static markAsArrived(id: number) {
        this.updateActiveUser(user => {
            for (let obj of user.reservations) {
                if (obj.id == id && obj.status == 'rezervisano') {
                    obj.status = 'pristiglo'
                }
            }
        })
    }

    static removeReservation(id: number) {
        this.updateActiveUser(user => {
            // brisu se samo pristigle biljke
            user.reservations = user.reservations.filter(r => !(r.id == id && r.status == 'pristiglo'))
        })
    }

    static rateReservation(id: number, rating: number, comment: string) {
        this.updateActiveUser(user => {
            for (let obj of user.reservations) {
                if (obj.id == id && obj.status == 'pristiglo') {
                    obj.rating = rating
                    obj.comment = comment
                }
            }
        })
    }

    static getReservedCount() {
        const user = this.getActiveUser()
        if (user == null)
            return 0

        return user.reservations.filter(r => r.status == 'rezervisano').length
    }

    static updateProfile(data: Partial<UserModel>) {
        const users = this.getUsers()
        const activeUser = this.getActiveUser()

        if (activeUser == null)
            return 'Niste prijavljeni!'

        // ako menja email, novi ne sme da bude zauzet
        if (data.email && data.email != activeUser.email) {
            for (let user of users) {
                if (user.email === data.email) {
                    return 'Email adresa je već zauzeta!'
                }
            }
        }

        for (let user of users) {
            if (user.email === activeUser.email) {
                user.firstName = data.firstName ?? user.firstName
                user.lastName = data.lastName ?? user.lastName
                user.phone = data.phone ?? user.phone
                user.address = data.address ?? user.address
                user.favouriteCategories = data.favouriteCategories ?? user.favouriteCategories
                user.email = data.email ?? user.email
            }
        }

        this.saveUsers(users)
        localStorage.setItem(ACTIVE_USER_KEY, data.email ?? activeUser.email)
        return null
    }

    static changePassword(newPassword: string) {
        this.updateActiveUser(user => {
            user.password = newPassword
        })
    }

    static createUser(newUser: Omit<UserModel, 'reservations'>) {
        const users = this.getUsers()

        for (let user of users) {
            if (user.email === newUser.email) {
                return 'Email adresa je već zauzeta!'
            }
        }

        if (newUser.password.length < 8) {
            return 'Lozinka mora imati najmanje 8 karaktera!'
        }

        users.push({
            ...newUser,
            reservations: []
        })

        this.saveUsers(users)
        return null
    }
}
