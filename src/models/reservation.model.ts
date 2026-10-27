export type ReservationStatus = 'rezervisano' | 'pristiglo' | 'otkazano'

export interface ReservationModel {
    id: number
    plantId: number
    quantity: number
    pricePerItem: number
    delivery: 'store' | 'home'
    pickupDate: string
    note: string
    status: ReservationStatus
    rating: number | null
    comment: string | null
    createdAt: string
    // popunjava se iz API-ja kada se otvori korpa
    name?: string
    imageUrl?: string
    category?: string
}
