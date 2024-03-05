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
const aws_serverless_express_1 = __importDefault(require("aws-serverless-express"));
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
app.get('/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const resultDate = yield collection.find(resObj).toArray();
        console.log(`Result filtered from the date in the database: ${resultDate}`);
        res.json(resultDate);
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
app.get('/weather/city', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, city } = req.query;
    try {
        yield client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS);
        function filter(date) {
            return new Date(date).toISOString();
        }
        const dateFilter = startDate && endDate ? {
            cidade: city, // Certifique-se de que o campo da cidade no MongoDB é "cidade"
            Date: {
                $gte: filter(startDate.toString()),
                $lte: filter(endDate.toString())
            }
        } : {
            cidade: city
        };
        const resultDate = yield collection.find(dateFilter).toArray();
        console.log(`Result filtered from the date in the database: ${resultDate}`);
        res.json(resultDate);
    }
    catch (error) {
        console.error("Error fetching dates", error);
        res.status(500).send("Internal Server Error");
    }
    finally {
        yield client.close();
    }
}));
app.post('/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { city = 'paulinia', startDate, endDate } = req.query;
    try {
        const apiRes = yield axios_1.default.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
        const weatherData = apiRes.data;
        const locationName = weatherData.location.name;
        const locationRegion = weatherData.location.region;
        const currentTempC = weatherData.current.temp_c;
        const forecastDate = weatherData.forecast.forecastday[0].date;
        const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
        const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
        // Função para converter a data para o formato adequado no MongoDB
        function filter(date) {
            return new Date(date).toISOString();
        }
        // Objeto com os dados da resposta modificados
        const resObj = {
            cidade: city || weatherData.name,
            Location: locationName,
            Region: locationRegion,
            Temp_c: currentTempC,
            Date: forecastDate,
            Min_Temp: forecastDay_MinTemp,
            Max_Temp: forecastDay_MaxTemp,
        };
        // dateFilter é construído com uma condição para o campo timestamp no formato de uma consulta para MongoDB
        const dateFilter = startDate && endDate ? {
            timestamp: {
                // é maior ou igual ($gte - greater than or equal) ao resultado de formatToISO(startDate.toString())
                $gte: filter(startDate.toString()),
                // é menor ou igual ($lte - less than or equal) ao resultado de formatToISO(endDate.toString()).
                $lte: filter(endDate.toString())
            }
        } : {};
        // Conectar ao MongoDB e inserir os dados
        yield client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS);
        const result = yield collection.insertOne(resObj);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);
        res.json(JSON.stringify('Insert city in the database'));
    }
    catch (error) {
        console.error("Erro ao buscar dados meteorológicos", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor' }),
        };
    }
    finally {
        yield client.close();
    }
}));
function programWeather(city) {
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
            // Função para converter a data para o formato adequado no MongoDB
            function filter(date) {
                return new Date(date).toISOString();
            }
            // Objeto com os dados da resposta modificados
            const resObj = {
                cidade: city || weatherData.name,
                Location: locationName,
                Region: locationRegion,
                Temp_c: currentTempC,
                Date: forecastDate,
                Min_Temp: forecastDay_MinTemp,
                Max_Temp: forecastDay_MaxTemp,
            };
            // Conectar ao MongoDB e inserir os dados
            yield client.connect();
            const db = client.db(process.env.DB_NAME);
            const collection = db.collection(process.env.CITYS);
            const result = yield collection.insertOne(resObj);
            console.log(`Insert city in the database, ID: ${result.insertedId}`);
        }
        catch (error) {
            console.error("Erro ao buscar dados meteorológicos", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro interno do servidor' }),
            };
        }
        finally {
            yield client.close();
        }
    });
}
// Exportando o app Express como uma função Lambda
const server = aws_serverless_express_1.default.createServer(app);
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const city = "paulinia";
        try {
            yield programWeather(city);
        }
        catch (error) {
            console.error("Erro ao buscar dados meteorológicos", error);
        }
    });
}
exports.handler = handler;
