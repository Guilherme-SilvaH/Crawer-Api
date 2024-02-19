import { ObjectId } from "mongodb"

export default class city {
    constructor(public name: string, public temp: number, public id?: ObjectId) {}
}