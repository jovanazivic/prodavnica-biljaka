import type { ReservationModel } from "./reservation.model"

export interface UserModel {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    password: string
    favouriteCategories: string[]
    reservations: ReservationModel[]
}
