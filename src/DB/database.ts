import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Objeto que armazenará as coleções do banco de dados
export const collections: { Cluster0?: mongoDB.Collection } = {}

// Função assíncrona para conectar ao banco de dados MongoDB Atlas
export async function connectDB() {

    // Configuração do dotenv para carregar variáveis de ambiente de um arquivo .env
    dotenv.config();

    // Exibindo informações de configuração do banco de dados a partir das variáveis de ambiente
    console.log("DB_CONEXAO", process.env.DB_CONEXAO);
    console.log("DB_NAME", process.env.DB_NAME);
    console.log("CITYS", process.env.CITYS);


    // Criando uma instância do MongoClient utilizando a string de conexão fornecida nas variáveis de ambiente
    console.log("Valor de DB_CONEXAO:", process.env.DB_CONEXAO);

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONEXAO!);

    try{

        // Conectando ao servidor MongoDB
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        
        // Executando um comando de ping para verificar a conexão
        const ping = await client.db().command({ ping: 1 });
        console.log(`MongoDB Ping Result: ${ping}`);


        // Selecionando o banco de dados e a coleção especificados nas variáveis de ambiente
        const db: mongoDB.Db = client.db(process.env.DB_NAME);
        const citysCollection: mongoDB.Collection = db.collection(process.env.CITYS!);

       
        // Exibindo mensagem de conexão bem-sucedida
        collections.Cluster0 = citysCollection;


        // Exibindo mensagem de conexão bem-sucedida
        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${citysCollection.collectionName}`);
    } catch (err) {
        console.error("Error connecting to MongoDB Atlas:", err);
    }
}

connectDB()


