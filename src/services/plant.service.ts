import type { CategoryModel } from "@/models/category.model"
import type { PlantModel } from "@/models/plant.model"
import axios from "axios"

const client = axios.create({
    baseURL: 'https://plants.pequla.com/api',
    headers: {
        'Accept': 'application/json',
        'X-Name': 'PKI-2026'
    }
})

export class PlantService {
    static async getPlants(): Promise<PlantModel[]> {
        const rsp = await client.get('/plants')
        return this.mapResponseToObject(rsp.data)
    }

    static async getPlantById(id: number): Promise<PlantModel> {
        const rsp = await client.get(`/plants/${id}`)
        return this.mapPlant(rsp.data)
    }

    static async getPlantsByIds(ids: number[]): Promise<PlantModel[]> {
        // nema potrebe da zovemo server ako je korpa prazna
        if (ids.length == 0)
            return []

        const rsp = await client.request({
            url: '/plants/by-ids',
            method: 'POST',
            data: {
                ids: ids
            }
        })

        return this.mapResponseToObject(rsp.data)
    }

    static async getPlantsByCategory(categoryId: number): Promise<PlantModel[]> {
        const rsp = await client.get(`/categories/${categoryId}/plants`)
        return this.mapResponseToObject(rsp.data)
    }

    static async getCategories(): Promise<CategoryModel[]> {
        const rsp = await client.get('/categories')
        return rsp.data
    }

    static async getClimates(): Promise<CategoryModel[]> {
        const rsp = await client.get('/climates')
        return rsp.data
    }

    static async getSeasons(): Promise<CategoryModel[]> {
        const rsp = await client.get('/seasons')
        return rsp.data
    }

    static mapResponseToObject(data: any[]) {
        let plants: PlantModel[] = []

        for (let obj of data) {
            plants.push(this.mapPlant(obj))
        }

        return plants
    }

    // API vraca snake_case, pa ga prebacujemo u nas model
    static mapPlant(obj: any): PlantModel {
        return {
            id: obj.id,
            name: obj.name,
            latinName: obj.latin_name,
            description: obj.description,
            planting: obj.planting_instructions,
            care: obj.care_instructions,
            plantType: obj.plant_type,
            targetAudience: obj.target_audience,
            light: obj.light_requirement,
            watering: obj.watering,
            intendedUse: obj.intended_use,
            productionDate: obj.production_date,
            price: Number(obj.price),
            imageUrl: this.getImageUrl(obj),
            imageAlt: obj.image_alt,
            stock: obj.stock_quantity,
            categoryId: obj.category_id,
            category: obj.category,
            climate: obj.climate,
            season: obj.season
        }
    }

    static getImageUrl(obj: any) {
        // slike dolaze preko http, a sajt moze da radi na https
        return String(obj.image_url).replace('http://', 'https://')
    }
}
