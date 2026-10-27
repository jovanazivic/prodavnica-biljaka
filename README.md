# Zeleni kutak - digitalna prodavnica biljaka

Prototip korisničkog interfejsa digitalne prodavnice biljaka, semestralni projekat iz predmeta
Programiranje i dizajn korisničkih interfejsa.

Aplikacija omogućava pretragu i pregled biljaka, rezervaciju, korpu rezervacija sa statusima
(rezervisano, pristiglo, otkazano), ocenjivanje pristiglih biljaka, korisnički profil i asistenta
sa unapred definisanim stablom dijaloga.

## Tehnologije

- Vue 3 + Vue Router (Vite, TypeScript)
- Bootstrap 5.3 i Font Awesome
- Axios - podaci o biljkama sa [plants.pequla.com](https://plants.pequla.com/)
- SweetAlert2 - obaveštenja i potvrde

Korisnici, rezervacije i ocene se čuvaju u `localStorage` pregledača.

Probni nalog: `kupac@example.com` / `kupac123`

## Pokretanje

```sh
npm install
```

### Razvojni server

```sh
npm run dev
```

### Build za produkciju

```sh
npm run build
```

Slike na stranicama za prijavu, registraciju i pomoć su sa Wikimedia Commons (CC0 licenca).
