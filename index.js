"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const mongodb_1 = require("mongodb");
const node_cron_1 = __importDefault(require("node-cron"));
dotenv.config();
//key
const keyConexao = "mongodb+srv://guihenriquesilva10:t1BIyTysOqNb5UJC@crawler.xmoo5ir.mongodb.net/?retryWrites=true&w=majority&appName=crawler";
const apiKey = process.env.Weather_Api_Key;
//config express
const app = (0, express_1.default)();
app.use(express_1.default.json());
//defalt
const defcity = "Paulinia";
const client = new mongodb_1.MongoClient(keyConexao);
//portar que a api vai rodar 
app.listen(3000, () => {
    console.log('Server is listening ');
});
// get para pegar inf da api Weather
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { city = defcity } = req.query;
    try {
        const apiRes = yield axios_1.default.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
        const weatherData = apiRes.data;
        const locationName = weatherData.location.name;
        const locationRegion = weatherData.location.region;
        const currentTempC = weatherData.current.temp_c;
        const forecastDate = weatherData.forecast.forecastday[0].date;
        const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
        const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
        //Objeto com os dados da resposta modificados
        const resObj = {
            cidade: city || weatherData.name,
            Location: locationName,
            Region: locationRegion,
            Temp_c: currentTempC,
            Date: forecastDate,
            Min_Temp: forecastDay_MinTemp,
            Max_Temp: forecastDay_MaxTemp,
        };
        // Conexão com o banco de dados MongoDB
        yield client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS);
        //Inserção dos dados modificados no banco de dados
        const result = yield collection.insertOne(resObj);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);
    }
    catch (error) {
        // Tratamento de erros
        console.error("Error fetching weather data");
        res.status(500).send("Internal Server Error");
    }
    finally {
        yield client.close();
    }
}));
//app para filtrar as inf
app.get('/date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    try {
        // Conexão com o banco de dados MongoDB
        yield client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS);
        // Função para converter a data para o formato adequado no MongoDB
        function filter(date) {
            return new Date(date).toISOString();
        }
        ;
        //dateFilter é construído com uma condição para o campo timestamp no formato de uma consulta para MongoDB
        const dateFilter = startDate && endDate ? {
            timestamp: {
                // é maior ou igual ($gte - greater than or equal) ao resultado de formatToISO(startDate.toString())
                $gte: filter(startDate.toString()),
                //é menor ou igual ($lte - less than or equal) ao resultado de formatToISO(endDate.toString()).
                $lte: filter(endDate.toString())
            }
        }
            //Se startDate ou endDate não estiverem definidos (ou seja, algum deles é false), o objeto dateFilter é definido como um objeto vazio {}.
            : {};
        // Consulta no banco de dados utilizando o filtro de datas
        const resultDate = yield collection.find(dateFilter).toArray();
        console.log(`Result filtered from the date in the database: ${resultDate}`);
        res.json(resultDate);
    }
    catch (error) {
        // Tratamento de erros
        console.error("Error fetching dates");
        res.status(500).send("Internal Server Error");
    }
    finally {
        yield client.close();
    }
}));
// app Post
app.post('/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { city } = req.query;
    try {
        const apiRes = yield axios_1.default.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
        const weatherData = apiRes.data;
        const locationName = weatherData.location.name;
        const locationRegion = weatherData.location.region;
        const currentTempC = weatherData.current.temp_c;
        const forecastDate = weatherData.forecast.forecastday[0].date;
        const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
        const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
        //Objeto com os dados da resposta modificados
        const resObj = {
            cidade: city || weatherData.name,
            Location: locationName,
            Region: locationRegion,
            Temp_c: currentTempC,
            Date: forecastDate,
            Min_Temp: forecastDay_MinTemp,
            Max_Temp: forecastDay_MaxTemp,
        };
        // Conexão com o banco de dados MongoDB
        yield client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS);
        //Inserção dos dados modificados no banco de dados
        const result = yield collection.insertOne(resObj);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);
    }
    catch (error) {
        // Tratamento de erros
        console.error("Error fetching weather data");
        res.status(500).send("Internal Server Error");
    }
    finally {
        yield client.close();
    }
}));
function scheduleData(city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiRes = yield axios_1.default.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
            const weatherData = apiRes.data;
            const locationName = weatherData.location.name;
            const locationRegion = weatherData.location.region;
            const currentTempC = weatherData.current.temp_c;
            const forecastDate = weatherData.forecast.forecastday[0].date;
            const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
            const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
            //Objeto com os dados da resposta modificados
            const resObj = {
                ccidade: city || weatherData.name,
                Location: locationName,
                Region: locationRegion,
                Temp_c: currentTempC,
                Date: forecastDate,
                Min_Temp: forecastDay_MinTemp,
                Max_Temp: forecastDay_MaxTemp,
            };
            // Conexão com o banco de dados MongoDB
            yield client.connect();
            const db = client.db(process.env.DB_NAME);
            const collection = db.collection(process.env.CITYS);
            //Inserção dos dados modificados no banco de dados
            const result = yield collection.insertOne(resObj);
            console.log(`Insert city in the database, ID: ${result.insertedId}`);
        }
        catch (error) {
            // Tratamento de erros
            console.error("Error fetching weather data", error);
            const response = {
                statusCode: 500,
                body: JSON.stringify('Erro interno no servidor'),
            };
            return response;
        }
        finally {
            yield client.close();
        }
        ;
    });
}
;
node_cron_1.default.schedule('0 6 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const city = "Paulinia";
    yield scheduleData(city);
    console.log('Tarefa agendada executada com sucesso!');
}));
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = "Paulinia";
        yield scheduleData(city);
        // ...
        const response = {
            statusCode: 200,
            body: JSON.stringify('Hello from Lambda!'),
        };
        return response;
    }
    catch (error) {
        console.error('Erro:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify('Erro interno no servidor'),
        };
        return response;
    }
});
exports.handler = handler;
