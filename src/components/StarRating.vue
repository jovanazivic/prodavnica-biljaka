<script lang="ts" setup>
import { ref } from 'vue';

export interface StarRatingProps {
    value: number
    editable?: boolean
}

const { value, editable } = defineProps<StarRatingProps>()
const emit = defineEmits<{
    rate: [rating: number]
}>()

// zvezdica preko koje je trenutno mis, da korisnik vidi koju ocenu daje
const hover = ref(0)

function getIcon(star: number) {
    const current = hover.value > 0 ? hover.value : value

    if (current >= star)
        return 'fa-solid fa-star'

    if (current >= star - 0.5)
        return 'fa-solid fa-star-half-stroke'

    return 'fa-regular fa-star'
}

function rate(star: number) {
    if (editable)
        emit('rate', star)
}
</script>

<template>
    <span class="stars" :class="{ 'editable': editable }" :title="`Ocena: ${value} od 5`"
        @mouseleave="hover = 0">
        <i v-for="star in 5" :key="star" :class="getIcon(star)" @mouseenter="editable && (hover = star)"
            @click="rate(star)"></i>
    </span>
</template>

<style scoped>
.editable i {
    cursor: pointer;
    font-size: 1.15rem;
    padding: 0 1px;
}
</style>
