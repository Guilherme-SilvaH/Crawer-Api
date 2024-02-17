import * as mongoDB from "mongodb";
import * as dotenv from "dotenv"

export const collections: { cluster0?: mongoDB.Collection } = {}

export async function connectDB() {
    dotenv.config();
    console.log("DB_CONEXAO", process.env.DB_CONEXAO);
    console.log("DB_NAME", process.env.DB_NAME);
    console.log("CITYS", process.env.CITYS);
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONEXAO!);

    try{
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const ping = await client.db().command({ ping: 1 });
        console.log(`MongoDB Ping Result: ${ping}`);

        const db: mongoDB.Db = client.db(process.env.DB_NAME);
        const citysCollection: mongoDB.Collection = db.collection(process.env.CITYS!);
        collections.cluster0 = citysCollection;

        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${citysCollection.collectionName}`);
    } catch (err) {
        console.error("Error connecting to MongoDB Atlas:", err);
    }
}


connectDB()


