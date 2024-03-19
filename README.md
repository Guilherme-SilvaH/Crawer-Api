
# Projeto Crawler API

Bem-vindo ao README do projeto Crawler API! Este projeto é uma API desenvolvida em TypeScript, Node, Axios e Express, projetada para coletar dados meteorológicos com base nos parâmetros da cidade fornecida. Além disso, oferece rotas que permitem filtrar dados meteorológicos com base em datas específicas. A API também inclui um endpoint para adicionar novas cidades ao banco de dados, caso a cidade desejada não seja encontrada.

## O que é: 

Um crawler é um programa que explora a internet em busca de informações. Ele é usado para coletar dados para análise ou armazenamento em um banco de dados

## Tecnologias Utilizadas

- TypeScript: Linguagem de programação que adiciona tipagem estática ao JavaScript, fornecendo uma ferramenta mais robusta para o desenvolvimento.
- Node: Ambiente de execução JavaScript do lado do servidor, permitindo a construção de aplicações escaláveis e eficientes.
- Axios: Biblioteca para fazer requisições HTTP, utilizada para buscar dados meteorológicos em APIs externas.
- Express: Framework web para Node.js, facilitando a criação de APIs RESTful.
- MongoDB Atlas: Banco de dados utilizado para armazenar informações sobre as cidades.

## Cloud

A aplicação foi implantada na AWS, usando o serviço EC2 para hospedagem da API e Lambda Function para executar diariamente a coleta da previsão meteorológica da cidade.

## Como Usar - End Points

- GET: /weather
http://54.89.145.146:8080/weather?city="cidade que deseja Buscar"

- Get com filtro para data min e data max: /filter
http://54.89.145.146:8080/filter?startDate="dataMin"&endDate="dataMax"&city="cidade que deseja Buscar"

- POST: /weather
http://54.89.145.146:8080/weather?city="cidade que deseja inserir"

## Conexão com a API
- [http://18.234.229.115:8080](http://54.89.145.146:8080)

## CrowJob 
CrowJob (cidade padrao Definida pormim) utilizei o gatilho (cloundWatch Events) para fazer a chamada da api todos os dias, assim alimentando o meu banco de dados
https://4fbsdgr6bkxj2xh2ahgslyzpry0lxukq.lambda-url.us-east-1.on.aws/

## Desafios

O principal desafio enfrentado foi a integração com serviços de nuvem, especificamente a AWS. A necessidade de entender a documentação e o funcionamento dos serviços EC2 e Lambda Function demandou imersão profunda. Superar esse desafio envolveu pesquisas extensivas e experimentação para garantir a correta implantação da aplicação na nuvem.
