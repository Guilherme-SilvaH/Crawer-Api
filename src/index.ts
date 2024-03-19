import express from 'express';
import axios from 'axios';
import * as dotenv from "dotenv";
import { MongoClient } from 'mongodb';
dotenv.config();


//key
const keyConexao = "mongodb+srv://guihenriquesilva10:t1BIyTysOqNb5UJC@crawler.xmoo5ir.mongodb.net/?retryWrites=true&w=majority&appName=crawler"
const apiKey = process.env.Weather_Api_Key

//config express
const app = express();
app.use(express.json());

//defalt
const defcity = "Paulinia"
const client = new MongoClient (keyConexao!);


const PORT = 8080
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
});

// get para pegar inf da api Weather
app.get('/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
      await client.connect();
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection(process.env.CITYS!);

      const result = await collection.findOne({ cidade: city });
      if (result) {
          // Se os dados da cidade existirem no banco de dados, retorne-os
          return res.json(result);
      } else {
          // Se os dados da cidade não existirem no banco de dados, faça a chamada para a API do Weather
          const apiRes = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
          const weatherData = apiRes.data;

          const locationName = weatherData.location.name;
          const locationRegion = weatherData.location.region;
          const currentTempC = weatherData.current.temp_c;
          const forecastDate = weatherData.forecast.forecastday[0].date;
          const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
          const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;

          const resObj = {
              cidade: city,
              Location: locationName,
              Region: locationRegion,
              Temp_c: currentTempC,
              Date: forecastDate,
              Min_Temp: forecastDay_MinTemp,
              Max_Temp: forecastDay_MaxTemp,
          }

          // Insira os dados da cidade no banco de dados
          await collection.insertOne(resObj);
          return res.json(resObj);
      }
  } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).send("Internal Server Error");
  } finally {
      await client.close();
  }
});


app.get('/filter', async (req, res) => {
  const { startDate, endDate, city } = req.query;

  try {
      // Validar se todos os parâmetros obrigatórios estão presentes
      if (!startDate || !endDate || !city) {
          return res.status(400).json({ error: 'Parâmetros startDate, endDate e city são obrigatórios' });
      }

      // Validar se as datas estão no formato correto
      const isValidDate = (dateString: string) => {
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          return regex.test(dateString);
      };

      if (!isValidDate(startDate as string) || !isValidDate(endDate as string)) {
        return res.status(400).json({ error: 'As datas devem estar no formato yyyy-mm-dd' });
    }

      // Conectar ao banco de dados
      await client.connect();
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection(process.env.CITYS!);

      // Filtrar as datas no formato ISO e a cidade
      const dateFilter = {
          cidade: city, 
          Date: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
          }
      };

      // Consultar o banco de dados
      const resultData = await collection.find(dateFilter).toArray();
      
      // Verificar se há dados encontrados
      if (resultData.length === 0) {
          return res.status(404).json({ message: 'Não foram encontrados dados para os filtros fornecidos' });
      }

      // Retornar os dados filtrados
      res.json(resultData);

  } catch (error) {
      console.error("Erro ao filtrar os dados meteorológicos", error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
      // Fechar a conexão com o banco de dados
      await client.close();
  }
});

app.post('/weather', async (req, res) => {
 
    const { city } = req.query;

    try {
    const apiRes = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
    const weatherData = apiRes.data;

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
        const collection = db.collection(process.env.CITYS!);

        const result = await collection.insertOne(resObj);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);
        res.json(resObj);
    

    } catch (error) {
        console.error("Erro ao buscar dados meteorológicos", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor' }),
        };
    } finally {
        await client.close();
      }
});

