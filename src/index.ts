import express from 'express'
import axios from 'axios';


const app = express()
app.use(express.json())




//portar que a api vai rodar 
app.listen(3000, () =>{
    console.log('Server is listening');
});