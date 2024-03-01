import express from 'express'
import axios from 'axios';
import * as dotenv from "dotenv";
import { MongoClient } from 'mongodb';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';

dotenv.config()


//key
const keyConexao = "mongodb+srv://guihenriquesilva10:t1BIyTysOqNb5UJC@crawler.xmoo5ir.mongodb.net/?retryWrites=true&w=majority&appName=crawler"
const apiKey = process.env.Weather_Api_Key

//config express
const app = express()
app.use(express.json())

//defalt
const defcity = "Paulinia"
const client = new MongoClient (keyConexao!)

  //portar que a api vai rodar 
app.listen(3000, () =>{
    console.log('Server is listening ');
});


// get para pegar inf da api Weather
app.get('/weather', async(req, res) => {
    const {city} = req.query;
    try{
        const apiRes = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`)
        const weatherData = apiRes.data
        

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
        }


        // Conexão com o banco de dados MongoDB
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS!);

        //Inserção dos dados modificados no banco de dados
        const resultDate = await collection.find(resObj).toArray();
        console.log(`Result filtered from the date in the database: ${resultDate}`);
        res.json(resultDate);

        
    }catch(error){
        // Tratamento de erros
        console.error("Error fetching weather data");
        res.status(500).send("Internal Server Error");
    }finally{
        await client.close();
    }

});


//app para filtrar as inf
app.get('/weather/city', async (req, res) => {
    const { startDate, endDate, city } = req.query;

    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS!);

        function filter(date: string) {
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

        const resultDate = await collection.find(dateFilter).toArray();
        console.log(`Result filtered from the date in the database: ${resultDate}`);
        res.json(resultDate);

    } catch (error) {
        console.error("Error fetching dates", error);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.close();
    }
});



export async function handler(event: APIGatewayProxyEvent, context: any) {
    const queryStringParameters = event.queryStringParameters;

    if (!queryStringParameters || !queryStringParameters.city) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Parâmetro "city" ausente na solicitação.' }),
        };
    }

    const { city = 'cidadePadrao', startDate, endDate } = queryStringParameters;

    try {
    const apiRes = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=25647f34103e4cdea63191638241602&q=${city}&days=1&aqi=no&alerts=no`);
    const weatherData = apiRes.data;

    const locationName = weatherData.location.name;
    const locationRegion = weatherData.location.region;
    const currentTempC = weatherData.current.temp_c;
    const forecastDate = weatherData.forecast.forecastday[0].date;
    const forecastDay_MaxTemp = weatherData.forecast.forecastday[0].day.maxtemp_c;
    const forecastDay_MinTemp = weatherData.forecast.forecastday[0].day.mintemp_c;

    // Função para converter a data para o formato adequado no MongoDB
    function filter(date: string) {
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
    // (certifique-se de que a configuração do MongoDB e o cliente estejam corretos)
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(process.env.CITYS!);

        const result = await collection.insertOne(resObj);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);

    } catch (error) {
        console.error("Erro ao buscar dados meteorológicos", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor' }),
        };
    }
}


