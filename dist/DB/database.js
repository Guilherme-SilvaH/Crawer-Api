var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
// Objeto que armazenará as coleções do banco de dados
export const collections = {};
// Função assíncrona para conectar ao banco de dados MongoDB Atlas
export function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        // Configuração do dotenv para carregar variáveis de ambiente de um arquivo .env
        dotenv.config();
        // Exibindo informações de configuração do banco de dados a partir das variáveis de ambiente
        console.log("DB_CONEXAO", process.env.DB_CONEXAO);
        console.log("DB_NAME", process.env.DB_NAME);
        console.log("CITYS", process.env.CITYS);
        // Criando uma instância do MongoClient utilizando a string de conexão fornecida nas variáveis de ambiente
        console.log("Valor de DB_CONEXAO:", process.env.DB_CONEXAO);
        const client = new mongoDB.MongoClient(process.env.DB_CONEXAO);
        try {
            // Conectando ao servidor MongoDB
            yield client.connect();
            console.log("Connected to MongoDB Atlas");
            // Executando um comando de ping para verificar a conexão
            const ping = yield client.db().command({ ping: 1 });
            console.log(`MongoDB Ping Result: ${ping}`);
            // Selecionando o banco de dados e a coleção especificados nas variáveis de ambiente
            const db = client.db(process.env.DB_NAME);
            const citysCollection = db.collection(process.env.CITYS);
            // Exibindo mensagem de conexão bem-sucedida
            collections.crawler = citysCollection;
            // Exibindo mensagem de conexão bem-sucedida
            console.log(`Successfully connected to database: ${db.databaseName} and collection: ${citysCollection.collectionName}`);
        }
        catch (err) {
            console.error("Error connecting to MongoDB Atlas:", err);
        }
    });
}
connectDB();
