"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var express_1 = require("express");
var axios_1 = require("axios");
var dotenv = require("dotenv");
var mongodb_1 = require("mongodb");
var aws_serverless_express_1 = require("aws-serverless-express");
dotenv.config();
//key
var keyConexao = "mongodb+srv://guihenriquesilva10:t1BIyTysOqNb5UJC@crawler.xmoo5ir.mongodb.net/?retryWrites=true&w=majority&appName=crawler";
var apiKey = process.env.Weather_Api_Key;
//config express
var app = (0, express_1.default)();
app.use(express_1.default.json());
//defalt
var defcity = "Paulinia";
var client = new mongodb_1.MongoClient(keyConexao);
//portar que a api vai rodar 
app.listen(3000, function () {
    console.log('Server is listening ');
});
// get para pegar inf da api Weather
app.get('/weather', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var city, apiRes, weatherData, locationName, locationRegion, currentTempC, forecastDate, forecastDay_MaxTemp, forecastDay_MinTemp, resObj, db, collection, resultDate, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                city = req.query.city;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 6, 8]);
                return [4 /*yield*/, axios_1.default.get("http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=".concat(city, "&days=1&aqi=no&alerts=no"))];
            case 2:
                apiRes = _a.sent();
                weatherData = apiRes.data;
                locationName = weatherData.location.name;
                locationRegion = weatherData.location.region;
                currentTempC = weatherData.current.temp_c;
                forecastDate = weatherData.forecast.forecastday[0].date;
                forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
                forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
                resObj = {
                    cidade: city || weatherData.name,
                    Location: locationName,
                    Region: locationRegion,
                    Temp_c: currentTempC,
                    Date: forecastDate,
                    Min_Temp: forecastDay_MinTemp,
                    Max_Temp: forecastDay_MaxTemp,
                };
                // Conexão com o banco de dados MongoDB
                return [4 /*yield*/, client.connect()];
            case 3:
                // Conexão com o banco de dados MongoDB
                _a.sent();
                db = client.db(process.env.DB_NAME);
                collection = db.collection(process.env.CITYS);
                return [4 /*yield*/, collection.find(resObj).toArray()];
            case 4:
                resultDate = _a.sent();
                console.log("Result filtered from the date in the database: ".concat(resultDate));
                res.json(resultDate);
                return [3 /*break*/, 8];
            case 5:
                error_1 = _a.sent();
                // Tratamento de erros
                console.error("Error fetching weather data");
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, client.close()];
            case 7:
                _a.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
//app para filtrar as inf
app.get('/weather/city', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function filter(date) {
        return new Date(date).toISOString();
    }
    var _a, startDate, endDate, city, db, collection, dateFilter, resultDate, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate, city = _a.city;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, 5, 7]);
                return [4 /*yield*/, client.connect()];
            case 2:
                _b.sent();
                db = client.db(process.env.DB_NAME);
                collection = db.collection(process.env.CITYS);
                dateFilter = startDate && endDate ? {
                    cidade: city, // Certifique-se de que o campo da cidade no MongoDB é "cidade"
                    Date: {
                        $gte: filter(startDate.toString()),
                        $lte: filter(endDate.toString())
                    }
                } : {
                    cidade: city
                };
                return [4 /*yield*/, collection.find(dateFilter).toArray()];
            case 3:
                resultDate = _b.sent();
                console.log("Result filtered from the date in the database: ".concat(resultDate));
                res.json(resultDate);
                return [3 /*break*/, 7];
            case 4:
                error_2 = _b.sent();
                console.error("Error fetching dates", error_2);
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, client.close()];
            case 6:
                _b.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/weather', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    // Função para converter a data para o formato adequado no MongoDB
    function filter(date) {
        return new Date(date).toISOString();
    }
    var _a, city, startDate, endDate, apiRes, weatherData, locationName, locationRegion, currentTempC, forecastDate, forecastDay_MaxTemp, forecastDay_MinTemp, resObj, dateFilter, db, collection, result, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, city = _a.city, startDate = _a.startDate, endDate = _a.endDate;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, 6, 8]);
                return [4 /*yield*/, axios_1.default.get("http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=".concat(city, "&days=1&aqi=no&alerts=no"))];
            case 2:
                apiRes = _b.sent();
                weatherData = apiRes.data;
                locationName = weatherData.location.name;
                locationRegion = weatherData.location.region;
                currentTempC = weatherData.current.temp_c;
                forecastDate = weatherData.forecast.forecastday[0].date;
                forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
                forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
                resObj = {
                    cidade: city || weatherData.name,
                    Location: locationName,
                    Region: locationRegion,
                    Temp_c: currentTempC,
                    Date: forecastDate,
                    Min_Temp: forecastDay_MinTemp,
                    Max_Temp: forecastDay_MaxTemp,
                };
                dateFilter = startDate && endDate ? {
                    timestamp: {
                        // é maior ou igual ($gte - greater than or equal) ao resultado de formatToISO(startDate.toString())
                        $gte: filter(startDate.toString()),
                        // é menor ou igual ($lte - less than or equal) ao resultado de formatToISO(endDate.toString()).
                        $lte: filter(endDate.toString())
                    }
                } : {};
                // Conectar ao MongoDB e inserir os dados
                return [4 /*yield*/, client.connect()];
            case 3:
                // Conectar ao MongoDB e inserir os dados
                _b.sent();
                db = client.db(process.env.DB_NAME);
                collection = db.collection(process.env.CITYS);
                return [4 /*yield*/, collection.insertOne(resObj)];
            case 4:
                result = _b.sent();
                console.log("Insert city in the database, ID: ".concat(result.insertedId));
                res.json(JSON.stringify('Insert city in the database'));
                return [3 /*break*/, 8];
            case 5:
                error_3 = _b.sent();
                console.error("Erro ao buscar dados meteorológicos", error_3);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({ message: 'Erro interno do servidor' }),
                    }];
            case 6: return [4 /*yield*/, client.close()];
            case 7:
                _b.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
function programWeather(city) {
    return __awaiter(this, void 0, void 0, function () {
        // Função para converter a data para o formato adequado no MongoDB
        function filter(date) {
            return new Date(date).toISOString();
        }
        var apiRes, weatherData, locationName, locationRegion, currentTempC, forecastDate, forecastDay_MaxTemp, forecastDay_MinTemp, resObj, db, collection, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 7]);
                    return [4 /*yield*/, axios_1.default.get("http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=".concat(city, "&days=1&aqi=no&alerts=no"))];
                case 1:
                    apiRes = _a.sent();
                    weatherData = apiRes.data;
                    locationName = weatherData.location.name;
                    locationRegion = weatherData.location.region;
                    currentTempC = weatherData.current.temp_c;
                    forecastDate = weatherData.forecast.forecastday[0].date;
                    forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
                    forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;
                    resObj = {
                        cidade: city || weatherData.name,
                        Location: locationName,
                        Region: locationRegion,
                        Temp_c: currentTempC,
                        Date: forecastDate,
                        Min_Temp: forecastDay_MinTemp,
                        Max_Temp: forecastDay_MaxTemp,
                    };
                    // Conectar ao MongoDB e inserir os dados
                    return [4 /*yield*/, client.connect()];
                case 2:
                    // Conectar ao MongoDB e inserir os dados
                    _a.sent();
                    db = client.db(process.env.DB_NAME);
                    collection = db.collection(process.env.CITYS);
                    return [4 /*yield*/, collection.insertOne(resObj)];
                case 3:
                    result = _a.sent();
                    console.log("Insert city in the database, ID: ".concat(result.insertedId));
                    return [3 /*break*/, 7];
                case 4:
                    error_4 = _a.sent();
                    console.error("Erro ao buscar dados meteorológicos", error_4);
                    return [2 /*return*/, {
                            statusCode: 500,
                            body: JSON.stringify({ message: 'Erro interno do servidor' }),
                        }];
                case 5: return [4 /*yield*/, client.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
;
// Exportando o app Express como uma função Lambda
var server = aws_serverless_express_1.default.createServer(app);
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function () {
        var city, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    city = "paulinia";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, programWeather(city)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error("ERRO AO PROGRAMAR PREVISAO", error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
