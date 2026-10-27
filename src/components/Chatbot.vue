<script setup lang="ts">
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { UserService } from '@/services/user.service'
import { formatPrice } from '@/utils'
import { nextTick, ref } from 'vue'

interface ChatMessage {
    id: number
    text: string
    sender: 'user' | 'bot'
    links?: { to: string, label: string }[]
}

interface DialogOption {
    label: string
    next: string
}

interface DialogNode {
    text: string
    options: DialogOption[]
}

// Unapred definisano stablo dijaloga. Svaki cvor ima poruku i ponudjene odgovore.
const tree: Record<string, DialogNode> = {
    start: {
        text: 'Zdravo! Ja sam Zelenko 🌱, virtuelni pomoćnik. Kako mogu da Vam pomognem?',
        options: [
            { label: 'Preporuči mi biljku', next: 'recommend' },
            { label: 'Kako da rezervišem?', next: 'reserve' },
            { label: 'Šta znače statusi?', next: 'statuses' },
            { label: 'Saveti za negu', next: 'care' },
            { label: 'Dostava i preuzimanje', next: 'delivery' }
        ]
    },
    recommend: {
        text: 'Rado! Za koga tražite biljku?',
        options: [
            { label: 'Za početnike', next: 'rec:Početnici' },
            { label: 'Za porodicu', next: 'rec:Porodice' },
            { label: 'Za iskusne uzgajivače', next: 'rec:Iskusni uzgajivači' },
            { label: 'Za ljubitelje dekorativnog bilja', next: 'rec:Ljubitelji dekorativnih biljaka' }
        ]
    },
    reserve: {
        text: 'Rezervacija ide u nekoliko koraka:\n1. Pronađite biljku u katalogu\n2. Kliknite na "Rezerviši"\n3. Izaberite količinu, način i datum preuzimanja\n4. Potvrdite rezervaciju\n\nZa rezervaciju morate biti prijavljeni.',
        options: [
            { label: 'Kako da izmenim rezervaciju?', next: 'edit' },
            { label: 'Kako da otkažem?', next: 'cancel' }
        ]
    },
    edit: {
        text: 'U korpi, kod biljke u statusu "rezervisano", kliknite na plavo dugme sa olovkom. Možete promeniti količinu, način preuzimanja, datum i napomenu.',
        options: [
            { label: 'Kako da otkažem?', next: 'cancel' }
        ]
    },
    cancel: {
        text: 'U korpi kliknite na crveno dugme "Otkaži" pored rezervisane biljke. Otkazane rezervacije se ne računaju u ukupnu cenu, a biljku možete ponovo rezervisati.',
        options: []
    },
    statuses: {
        text: 'Svaka biljka u korpi ima status:\n• rezervisano - čeka preuzimanje, može se menjati\n• pristiglo - stigla je, možete je oceniti ili obrisati\n• otkazano - rezervacija je otkazana',
        options: [
            { label: 'Kako da ocenim biljku?', next: 'rate' }
        ]
    },
    rate: {
        text: 'Kada biljka dobije status "pristiglo", u korpi kliknite na zvezdice (1-5) i po želji ostavite komentar. Ocena će se videti na stranici biljke.',
        options: []
    },
    care: {
        text: 'Za koju grupu biljaka Vam trebaju saveti?',
        options: [
            { label: 'Sobne biljke', next: 'care-indoor' },
            { label: 'Sukulenti i kaktusi', next: 'care-succulents' },
            { label: 'Začinsko bilje', next: 'care-herbs' }
        ]
    },
    'care-indoor': {
        text: 'Sobne biljke vole jako, ali indirektno svetlo. Zalivajte kada se gornji sloj zemlje prosuši, a zimi ređe. Izbegavajte promaju i radijatore.',
        options: [
            { label: 'Preporuči mi biljku', next: 'recommend' }
        ]
    },
    'care-succulents': {
        text: 'Sukulentima treba što više sunca i propusna zemlja. Zalivajte retko, tek kada se zemlja potpuno osuši. Najčešća greška je preterano zalivanje!',
        options: [
            { label: 'Preporuči mi biljku', next: 'recommend' }
        ]
    },
    'care-herbs': {
        text: 'Začinsko bilje voli sunčano mesto i redovno zalivanje. Redovno ga berite, tako se bolje grana.',
        options: [
            { label: 'Preporuči mi biljku', next: 'recommend' }
        ]
    },
    delivery: {
        text: 'Biljku možete preuzeti lično u radnji (besplatno) ili naručiti dostavu na adresu iz profila (350 RSD). Datum biramo prilikom rezervacije.',
        options: [
            { label: 'Kako da rezervišem?', next: 'reserve' }
        ]
    }
}

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const currentOptions = ref<DialogOption[]>(tree.start!.options)

let nextMessageId = 1
let plants: PlantModel[] = []

const messages = ref<ChatMessage[]>([
    {
        id: nextMessageId++,
        text: tree.start!.text,
        sender: 'bot'
    }
])

async function scrollToBottom() {
    await nextTick()

    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// preporuka se pravi od pravih podataka sa API-ja
async function getRecommendation(audience: string): Promise<ChatMessage> {
    if (plants.length == 0)
        plants = await PlantService.getPlants()

    const list = plants
        .filter(p => p.targetAudience == audience)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

    return {
        id: nextMessageId++,
        sender: 'bot',
        text: `Evo nekoliko biljaka za grupu "${audience}":`,
        links: list.map(p => ({
            to: `/details/${p.id}`,
            label: `${p.name} - ${formatPrice(p.price)}`
        }))
    }
}

async function goToNode(key: string) {
    if (key.startsWith('rec:')) {
        messages.value.push(await getRecommendation(key.substring(4)))
        currentOptions.value = [
            { label: 'Još preporuka', next: key },
            { label: 'Druga grupa', next: 'recommend' }
        ]
        return
    }

    const node = tree[key] ?? tree.start!
    messages.value.push({
        id: nextMessageId++,
        text: node.text,
        sender: 'bot'
    })
    currentOptions.value = node.options
}

// ako korisnik nesto otkuca, pokusavamo da prepoznamo temu po kljucnim recima
function findNode(message: string) {
    const text = message.toLowerCase()

    if (text.includes('zdravo') || text.includes('cao') || text.includes('ćao') || text.includes('pozdrav'))
        return 'start'

    if (text.includes('preporu') || text.includes('pokloni') || text.includes('predlo'))
        return 'recommend'

    if (text.includes('otka'))
        return 'cancel'

    if (text.includes('izmen') || text.includes('promen'))
        return 'edit'

    if (text.includes('ocen') || text.includes('recenz'))
        return 'rate'

    if (text.includes('status'))
        return 'statuses'

    if (text.includes('rezerv') || text.includes('korp') || text.includes('kupi'))
        return 'reserve'

    if (text.includes('dostav') || text.includes('preuzim') || text.includes('isporu'))
        return 'delivery'

    if (text.includes('kaktus') || text.includes('sukulent'))
        return 'care-succulents'

    if (text.includes('začin') || text.includes('zacin') || text.includes('bosilj'))
        return 'care-herbs'

    if (text.includes('neg') || text.includes('zaliv') || text.includes('sobn'))
        return 'care-indoor'

    return null
}

async function sendMessage(text?: string, next?: string) {
    const message = (text ?? inputMessage.value).trim()

    if (!message || isTyping.value) return

    messages.value.push({
        id: nextMessageId++,
        text: message,
        sender: 'user'
    })

    inputMessage.value = ''
    currentOptions.value = []
    isTyping.value = true
    await scrollToBottom()

    // mala pauza da izgleda kao da asistent kuca
    window.setTimeout(async () => {
        const key = next ?? findNode(message)

        if (key) {
            await goToNode(key)
        } else {
            messages.value.push({
                id: nextMessageId++,
                text: 'Nisam siguran da sam razumeo 🤔 Izaberite neku od ponuđenih tema:',
                sender: 'bot'
            })
            currentOptions.value = tree.start!.options
        }

        isTyping.value = false
        await scrollToBottom()
    }, 600)
}

function restart() {
    sendMessage('Početak', 'start')
}

function toggleChat() {
    isOpen.value = !isOpen.value

    if (isOpen.value) {
        scrollToBottom()
    }
}
</script>

<template>
    <div class="chatbot-widget">
        <button v-if="!isOpen" type="button" class="btn btn-success chatbot-toggle rounded-circle shadow-lg"
            aria-label="Otvori asistenta" title="Pitajte asistenta" @click="toggleChat">
            <i class="fa-solid fa-comments fa-lg"></i>
        </button>

        <section v-if="isOpen" class="card chatbot-window shadow-lg" role="dialog" aria-label="Asistent Zelenko">
            <div class="card-header text-bg-success d-flex align-items-center justify-content-between py-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="chatbot-avatar">
                        <i class="fa-solid fa-seedling"></i>
                    </div>
                    <div>
                        <div class="fw-bold">Zelenko</div>
                        <small class="opacity-75">
                            {{ UserService.getActiveUser() ? `Tu sam za Vas, ${UserService.getActiveUser()?.firstName}` :
                                'Virtuelni pomoćnik' }}
                        </small>
                    </div>
                </div>

                <div>
                    <button type="button" class="btn btn-sm btn-success border-0" title="Počni ispočetka"
                        @click="restart">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-success border-0" aria-label="Zatvori"
                        @click="toggleChat">
                        <i class="fa-solid fa-xmark fa-lg"></i>
                    </button>
                </div>
            </div>

            <div ref="messagesContainer" class="card-body chatbot-messages" aria-live="polite">
                <div v-for="message in messages" :key="message.id" class="d-flex mb-3"
                    :class="message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'">
                    <div class="chatbot-bubble"
                        :class="message.sender === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'">
                        <div class="chatbot-message-text">{{ message.text }}</div>
                        <ul class="mb-0 mt-1 ps-3" v-if="message.links">
                            <li v-for="link in message.links" :key="link.to">
                                <RouterLink :to="link.to" @click="isOpen = false">{{ link.label }}</RouterLink>
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-if="isTyping" class="d-flex justify-content-start mb-3">
                    <div class="chatbot-bubble chatbot-bubble-bot">
                        <span class="typing-indicator" aria-label="Asistent kuca">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </div>
                </div>

                <!-- ponudjeni odgovori za trenutni cvor -->
                <div v-if="!isTyping" class="chatbot-suggestions">
                    <button v-for="option in currentOptions" :key="option.next + option.label" type="button"
                        class="btn btn-sm btn-outline-success rounded-pill mb-2"
                        @click="sendMessage(option.label, option.next)">
                        {{ option.label }}
                    </button>
                    <button v-if="currentOptions.length == 0" type="button"
                        class="btn btn-sm btn-outline-secondary rounded-pill mb-2" @click="restart">
                        <i class="fa-solid fa-rotate-left"></i> Nazad na početak
                    </button>
                </div>
            </div>

            <div class="card-footer bg-body p-3">
                <form class="d-flex gap-2" @submit.prevent="sendMessage()">
                    <input v-model="inputMessage" type="text" class="form-control" placeholder="Napišite poruku..."
                        aria-label="Poruka" autocomplete="off" :disabled="isTyping" />

                    <button type="submit" class="btn btn-success" aria-label="Pošalji"
                        :disabled="!inputMessage.trim() || isTyping">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </section>
    </div>
</template>

<style scoped>
.chatbot-widget {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1055;
}

.chatbot-toggle {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.chatbot-toggle:hover {
    transform: scale(1.06);
}

.chatbot-window {
    width: 370px;
    height: min(540px, calc(100dvh - 100px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 16px;
    animation: chatbot-appear 0.2s ease-out;
}

.chatbot-avatar {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    font-size: 18px;
}

.chatbot-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 14px;
    scroll-behavior: smooth;
}

.chatbot-bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 0.925rem;
    line-height: 1.5;
}

.chatbot-bubble-user {
    color: #fff;
    background-color: var(--bs-success);
    border-bottom-right-radius: 4px;
}

.chatbot-bubble-bot {
    background-color: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-bottom-left-radius: 4px;
}

.chatbot-message-text {
    white-space: pre-wrap;
}

.chatbot-suggestions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.chatbot-suggestions .btn {
    text-align: left;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 4px 2px;
}

.typing-indicator span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--bs-secondary-color);
    animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.3s;
}

@keyframes typing {
    0%,
    60%,
    100% {
        opacity: 0.4;
        transform: translateY(0);
    }

    30% {
        opacity: 1;
        transform: translateY(-4px);
    }
}

@keyframes chatbot-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 576px) {
    .chatbot-widget {
        right: 12px;
        bottom: 12px;
    }

    .chatbot-window {
        width: calc(100vw - 24px);
    }
}
</style>
