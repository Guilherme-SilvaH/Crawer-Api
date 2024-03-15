const axios = require('axios');
const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.DB_CONEXAO, { useNewUrlParser: true, useUnifiedTopology: true });

async function programWeather(city) {
  try {
    const apiRes = await axios.get(`http://18.234.229.115:8080/weather/city${city}`);
    const weatherData = apiRes.data;

    if (!weatherData) {
      await axios.post('http://18.234.229.115:8080/weather', { city });
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Dados de previsão não encontrados, mas a API de post foi chamada.' }),
      };
    }

    const locationName = weatherData.location.name;
    const locationRegion = weatherData.location.region;
    const currentTempC = weatherData.current.temp_c;
    const forecastDate = weatherData.forecast.forecastday[0].date;
    const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
    const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;

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
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.CITYS);

    const result = await collection.insertOne(resObj);
    console.log(`Insert city in the database, ID: ${result.insertedId}`);

    return {
      statusCode: 200,
      body: JSON.stringify(resObj),
    };

  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno do servidor' }),
    };
  } finally {
    await client.close();
  }
}

// Exportando o app Express como uma função Lambda
const server = awsServerlessExpress.createServer(app);
exports.handler = async function(event, context) {
  const city = "paulinia";
  try {
    const response = await programWeather(city);
    return response;
  } catch (error) {
    console.error("ERRO AO PROGRAMAR PREVISAO", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno do servidor' }),
    };
  }
};
