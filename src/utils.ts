import Swal from "sweetalert2"
import type { ReservationModel, ReservationStatus } from "./models/reservation.model"

export const DELIVERY_PRICE = 350

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatPrice(price: number) {
    return `${price.toLocaleString('sr-RS')} RSD`
}

export function getPriceForReservation(r: ReservationModel) {
    return r.pricePerItem * r.quantity + (r.delivery == 'home' ? DELIVERY_PRICE : 0)
}

// datum u formatu koji trazi input type="date"
export function getDateInput(daysFromToday: number) {
    const d = new Date()
    d.setDate(d.getDate() + daysFromToday)
    return d.toISOString().split('T')[0]!
}

export function getStatusClass(status: ReservationStatus) {
    if (status == 'rezervisano')
        return 'badge text-bg-warning'

    if (status == 'pristiglo')
        return 'badge text-bg-success'

    return 'badge text-bg-secondary'
}

export const bootstrapClasses = {
    popup: 'card',
    cancelButton: 'btn btn-danger',
    denyButton: 'btn btn-secondary',
    confirmButton: 'btn btn-success'
}

export function showLoading() {
    Swal.fire({
        title: 'Učitavanje',
        text: 'Sačekajte trenutak dok preuzmemo podatke...',
        customClass: bootstrapClasses,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
}

export function showConfirm(message: string, callback: Function) {
    Swal.fire({
        title: message,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Da, potvrdi',
        cancelButtonText: 'Ne, odustani',
        icon: 'question',
        customClass: bootstrapClasses
    }).then(result => {
        if (result.isConfirmed) {
            callback()
        }
    })
}

export function showSuccess(title?: string, text?: string) {
    Swal.fire({
        icon: 'success',
        confirmButtonText: 'U redu',
        title: title ?? 'Uspešno',
        text: text,
        customClass: bootstrapClasses
    })
}

export function showError(message: string) {
    Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: message,
        customClass: bootstrapClasses
    })
}

// mala poruka u uglu, za akcije koje ne traze potvrdu
export function showToast(message: string) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    })
}
