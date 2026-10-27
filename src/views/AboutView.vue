<script lang="ts" setup>
import { DELIVERY_PRICE, formatPrice } from '@/utils';
</script>

<template>
  <div class="row mb-4">
    <div class="col-12 col-md-7">
      <h3 class="fw-bold text-success">Zeleni kutak</h3>
      <p>
        Prototip korisničkog interfejsa digitalne prodavnice biljaka. Aplikacija omogućava pretragu ponude, pregled
        detalja o biljkama (opis, sadnja, nega, tip, ciljna grupa, datum proizvodnje i cena), čitanje recenzija i
        rezervaciju biljaka koje se zatim nalaze u korpi rezervacija.
      </p>
      <p>Tehnologije:</p>
      <ul>
        <li>Vue 3 i Vue Router</li>
        <li>Bootstrap 5.3 i Font Awesome</li>
        <li>Axios HTTP (REST API sa biljkama)</li>
        <li>Sweet Alerts 2</li>
      </ul>
      <p class="fw-bold">Aplikacija je prototip. Korisnički nalozi i rezervacije se čuvaju samo u pregledaču!</p>
    </div>
    <div class="col-12 col-md-5 d-none d-md-block">
      <img src="@/assets/about.jpg" class="img-fluid rounded shadow-sm" alt="Biljka na prozoru">
    </div>
  </div>

  <h4 class="fw-bold mb-3"><i class="fa-solid fa-circle-question text-success"></i> Česta pitanja</h4>

  <div class="accordion mb-4" id="faq">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#q1">
          Kako da pronađem biljku?
        </button>
      </h2>
      <div id="q1" class="accordion-collapse collapse show" data-bs-parent="#faq">
        <div class="accordion-body">
          Na stranici <RouterLink to="/">Katalog</RouterLink> možete pretraživati po nazivu, opisu (uključujući sadnju
          i negu) i kategoriji. Klikom na <strong>Više filtera</strong> dobijate i podneblje, sezonu, tip, namenu,
          ciljnu grupu, datum proizvodnje, cenu i ocene kupaca. Svaki kriterijum se može koristiti odvojeno.
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2">
          Kako da rezervišem biljku?
        </button>
      </h2>
      <div id="q2" class="accordion-collapse collapse" data-bs-parent="#faq">
        <div class="accordion-body">
          Kliknite na <strong>Rezerviši</strong> kod željene biljke, izaberite količinu, način i datum preuzimanja.
          Za rezervaciju je potrebno da budete prijavljeni. Nakon potvrde dobijate obaveštenje, a biljka se dodaje u
          Vašu korpu.
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q3">
          Šta znače statusi u korpi?
        </button>
      </h2>
      <div id="q3" class="accordion-collapse collapse" data-bs-parent="#faq">
        <div class="accordion-body">
          <ul class="mb-0">
            <li><span class="badge text-bg-warning">rezervisano</span> - biljka čeka preuzimanje. Rezervaciju možete
              izmeniti ili otkazati.</li>
            <li><span class="badge text-bg-success">pristiglo</span> - biljka je stigla. Možete je oceniti ili
              obrisati iz korpe.</li>
            <li><span class="badge text-bg-secondary">otkazano</span> - rezervacija je otkazana i ne ulazi u ukupnu
              cenu.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q4">
          Kako da ocenim biljku?
        </button>
      </h2>
      <div id="q4" class="accordion-collapse collapse" data-bs-parent="#faq">
        <div class="accordion-body">
          Ocenjivati se mogu samo biljke koje ste rezervisali i koje su u statusu <em>pristiglo</em>. U korpi kliknite
          na broj zvezdica (1 do 5) i po želji napišite komentar. Vaša ocena se prikazuje među recenzijama na stranici
          biljke.
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q5">
          Koliko košta dostava?
        </button>
      </h2>
      <div id="q5" class="accordion-collapse collapse" data-bs-parent="#faq">
        <div class="accordion-body">
          Lično preuzimanje u radnji je besplatno, a dostava na adresu iz profila košta {{ formatPrice(DELIVERY_PRICE) }}
          po rezervaciji.
        </div>
      </div>
    </div>
  </div>

  <p class="text-body-secondary small">
    Imate još pitanja? Kliknite na zeleno dugme u donjem desnom uglu i pitajte našeg asistenta.
  </p>
</template>
