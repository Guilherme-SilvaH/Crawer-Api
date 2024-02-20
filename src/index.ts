import express from 'express'
import axios from 'axios';
import * as dotenv from "dotenv";
import { MongoClient } from 'mongodb';



dotenv.config()


//key
const keyConexao = process.env.DB_CONEXAO
const apiKey = '25647f34103e4cdea63191638241602'


//config express
const app = express()
app.use(express.json())





//nova innstancia
const client = new MongoClient(keyConexao!)


app.get('/', async(req, res) => {
    const {city} = req.query
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
        const resMod = {
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
        const result = await collection.insertOne(resMod);
        console.log(`Insert city in the database, ID: ${result.insertedId}`);

        
    }catch(error){
        // Tratamento de erros
        console.error("Error fetching weather data");
        res.status(500).send("Internal Server Error");
    }finally{
        await client.close();
    }


})




//portar que a api vai rodar 
app.listen(3000, () =>{
    console.log('Server is listening ');
});