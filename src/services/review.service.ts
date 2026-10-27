import type { ReviewModel } from "@/models/review.model"
import { UserService } from "./user.service"

// Recenzije drugih kupaca. API ih nema, pa su unete rucno za potrebe prototipa.
const REVIEWS: ReviewModel[] = [
    { plantId: 1, author: 'Jelena M.', rating: 5, comment: 'Monstera je stigla zdrava i dobro upakovana. Za mesec dana pustila dva nova lista.', createdAt: '2026-03-14' },
    { plantId: 1, author: 'Stefan R.', rating: 4, comment: 'Lepa biljka, malo manja nego što sam očekivao, ali raste brzo.', createdAt: '2026-04-02' },
    { plantId: 1, author: 'Ivana K.', rating: 5, comment: 'Preporuka! Uputstvo za negu je jasno.', createdAt: '2026-05-21' },
    { plantId: 3, author: 'Milica D.', rating: 5, comment: 'Zlatni puzavac je bukvalno neuništiv, idealan za kancelariju.', createdAt: '2026-02-11' },
    { plantId: 3, author: 'Nikola P.', rating: 4, comment: 'Dobra biljka za početnike.', createdAt: '2026-06-30' },
    { plantId: 6, author: 'Ana S.', rating: 3, comment: 'Odbacila je dva donja lista posle selidbe, sada je ok.', createdAt: '2026-04-18' },
    { plantId: 8, author: 'Marko J.', rating: 2, comment: 'Lirata je zahtevna, nije za svakoga. Kod mene ne voli promaju.', createdAt: '2026-03-03' },
    { plantId: 8, author: 'Teodora V.', rating: 4, comment: 'Uz dosta svetla napreduje odlično.', createdAt: '2026-07-09' },
    { plantId: 9, author: 'Dragan T.', rating: 5, comment: 'Sanseverija trpi i kad zaboravim da zalijem. Savršena.', createdAt: '2026-01-27' },
    { plantId: 9, author: 'Sanja L.', rating: 5, comment: 'Kupila sam tri komada za spavaću sobu, sve odlične.', createdAt: '2026-05-05' },
    { plantId: 11, author: 'Katarina B.', rating: 4, comment: 'Spatifilum cveta, samo treba paziti da se ne presuši.', createdAt: '2026-04-29' },
    { plantId: 14, author: 'Luka N.', rating: 2, comment: 'Kalatea mi je brzo dobila suve ivice, verovatno je vazduh previše suv.', createdAt: '2026-02-19' },
    { plantId: 22, author: 'Jovana Đ.', rating: 5, comment: 'Hlorofitum je napravio gomilu mladica, već sam ih podelila prijateljima.', createdAt: '2026-06-12' },
    { plantId: 24, author: 'Petar Ž.', rating: 4, comment: 'Simpatična pilea, lepo izgleda na stolu.', createdAt: '2026-05-30' },
    { plantId: 29, author: 'Gordana C.', rating: 5, comment: 'Orhideja je stigla u cvetu i cveta i dalje, posle dva meseca!', createdAt: '2026-01-15' },
    { plantId: 29, author: 'Ivan F.', rating: 3, comment: 'Lepa, ali je jedan cvetni pupoljak otpao u transportu.', createdAt: '2026-02-08' },
    { plantId: 31, author: 'Maja H.', rating: 5, comment: 'Aloja je velika i zdrava, koristim je i za kožu.', createdAt: '2026-07-22' },
    { plantId: 32, author: 'Vladimir A.', rating: 4, comment: 'Eševerija je prelepa, prava mala ruža.', createdAt: '2026-06-03' },
    { plantId: 33, author: 'Bojana G.', rating: 5, comment: 'Žad biljka za sreću, poklonila sam je mami.', createdAt: '2026-04-11' },
    { plantId: 38, author: 'Miloš I.', rating: 3, comment: 'Opuncija je ok, ali pazite na bodlje pri presađivanju :)', createdAt: '2026-08-01' },
    { plantId: 41, author: 'Tamara O.', rating: 5, comment: 'Lavanda je divno procvetala na terasi.', createdAt: '2026-07-14' },
    { plantId: 42, author: 'Đorđe Š.', rating: 4, comment: 'Ruzmarin mirisan, koristim ga u kuhinji svaki dan.', createdAt: '2026-05-17' },
    { plantId: 43, author: 'Nataša E.', rating: 5, comment: 'Bosiljak je bujan, pesto je bio odličan.', createdAt: '2026-06-26' },
    { plantId: 43, author: 'Aleksandar U.', rating: 3, comment: 'Na prozoru je počeo da se izdužuje, treba mu više sunca.', createdAt: '2026-07-02' },
    { plantId: 44, author: 'Ivana K.', rating: 5, comment: 'Nana raste kao luda, za limunadu idealno.', createdAt: '2026-06-08' },
    { plantId: 56, author: 'Zorica P.', rating: 4, comment: 'Ruža se primila iz prve, crveni cvetovi su prelepi.', createdAt: '2026-05-25' },
    { plantId: 58, author: 'Dejan M.', rating: 1, comment: 'Od deset lukovica nikle su samo četiri. Razočaran sam.', createdAt: '2026-04-20' },
    { plantId: 58, author: 'Mirjana T.', rating: 4, comment: 'Kod mene su sve nikle, verovatno zavisi od zemlje.', createdAt: '2026-04-27' },
    { plantId: 62, author: 'Snežana R.', rating: 5, comment: 'Hortenzija je ogromna i puna cvetova.', createdAt: '2026-07-19' },
    { plantId: 66, author: 'Biljana N.', rating: 5, comment: 'Muškatle na prozoru, kao kod bake. Cvetaju celo leto.', createdAt: '2026-08-10' },
    { plantId: 76, author: 'Milan K.', rating: 4, comment: 'Jagode su rodile već prve godine, slatke su.', createdAt: '2026-06-15' },
    { plantId: 79, author: 'Lena V.', rating: 3, comment: 'Borovnica traži kiselu zemlju, to nisam znala pa je kasno krenula.', createdAt: '2026-08-21' },
    { plantId: 83, author: 'Goran S.', rating: 5, comment: 'Limun u saksiji već ima plodove, deca su oduševljena.', createdAt: '2026-09-02' },
    { plantId: 91, author: 'Radmila J.', rating: 4, comment: 'Rasad paradajza je bio jak i zdrav.', createdAt: '2026-05-09' },
    { plantId: 92, author: 'Uroš D.', rating: 5, comment: 'Čeri paradajz na balkonu, preko 100 plodova sa dve biljke!', createdAt: '2026-08-28' },
    { plantId: 109, author: 'Nenad B.', rating: 4, comment: 'Tuje su lepo uniformne, živa ograda se već oblikuje.', createdAt: '2026-04-06' },
    { plantId: 111, author: 'Sara L.', rating: 5, comment: 'Japanski javor ima prelepu crvenu boju lišća na jesen.', createdAt: '2026-10-12' },
    { plantId: 116, author: 'Vesna P.', rating: 4, comment: 'Hibiskus cveta skoro svaki dan tokom leta.', createdAt: '2026-07-30' }
]

export class ReviewService {

    // spajamo unapred unete recenzije i ocene koje su dali korisnici iz korpe
    static getAll(): ReviewModel[] {
        let all = [...REVIEWS]

        for (let user of UserService.getUsers()) {
            for (let r of user.reservations) {
                if (r.status == 'pristiglo' && r.rating != null) {
                    all.push({
                        plantId: r.plantId,
                        author: `${user.firstName} ${user.lastName.charAt(0)}.`,
                        rating: r.rating,
                        comment: r.comment ?? '',
                        createdAt: r.createdAt
                    })
                }
            }
        }

        return all
    }

    static getForPlant(plantId: number) {
        return this.getAll()
            .filter(r => r.plantId == plantId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    static getAverage(reviews: ReviewModel[]) {
        if (reviews.length == 0)
            return 0

        let sum = 0
        for (let r of reviews) {
            sum += r.rating
        }

        return Math.round(sum / reviews.length * 10) / 10
    }
}
