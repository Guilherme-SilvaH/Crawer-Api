const axios = require('axios');

exports.handler = async (event) => {
    try {
        const defaultCity = "Paulinia"; 
        
        // Chamar a API de atualização de previsões usando o método POST
        const response = await axios.post('http://54.89.145.146:8080/weather?city=Paulinia', {
            city: defaultCity
        });

        // Verificar a resposta da API e retornar os resultados
        if (response.status === 200) {
            return {
                statusCode: 200,
                body: JSON.stringify(response.data)
            };
        } else {
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: 'Erro ao chamar a API de atualização de previsões' })
            };
        }
    } catch (error) {
        console.error("Erro ao chamar a API de atualização de previsões:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor' })
        };
    }
};