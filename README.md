Projeto Crawler API
Bem-vindo ao README do projeto Crawler API! Este projeto é uma API desenvolvida em TypeScript, Node, Axios e Express, projetada para coletar dados meteorológicos com base nos parâmetros da cidade fornecida. Além disso, oferece rotas que permitem filtrar dados meteorológicos com base em datas específicas. A API também inclui um endpoint para adicionar novas cidades ao banco de dados, caso a cidade desejada não seja encontrada.

Tecnologias Utilizadas
TypeScript: Linguagem de programação que adiciona tipagem estática ao JavaScript, fornecendo uma ferramenta mais robusta para o desenvolvimento.
Node: Ambiente de execução JavaScript do lado do servidor, permitindo a construção de aplicações escaláveis e eficientes.
Axios: Biblioteca para fazer requisições HTTP, utilizada para buscar dados meteorológicos em APIs externas.
Express: Framework web para Node.js, facilitando a criação de APIs RESTful.
MongoDB Atlas: Banco de dados utilizado para armazenar informações sobre as cidades.
Cloud
A aplicação foi implantada na AWS, usando o serviço EC2 para hospedagem da API e Lambda Function para executar diariamente a coleta da previsão meteorológica da cidade.

Como Usar
Instalação de Dependências:
Execute o seguinte comando para instalar as dependências do projeto:

bash
Copy code
npm install
Configuração:
Certifique-se de configurar corretamente as credenciais da AWS, o endereço do banco de dados MongoDB Atlas e outras configurações necessárias no arquivo de ambiente.

Execução Local:
Inicie o servidor localmente usando o seguinte comando:

bash
Copy code
npm start
Rotas Disponíveis:

GET /weather/:city?date=:date: Retorna os dados meteorológicos para a cidade fornecida na data especificada.
POST /add-city: Adiciona uma nova cidade ao banco de dados.
Conexão com a API
Para conectar à API, utilize o seguinte endereço:

bash
Copy code
http://18.234.229.115:8080
Desafios
O principal desafio enfrentado foi a integração com serviços de nuvem, especificamente a AWS. A necessidade de entender a documentação e o funcionamento dos serviços EC2 e Lambda Function demandou imersão profunda. Superar esse desafio envolveu pesquisas extensivas e experimentação para garantir a correta implantação da aplicação na nuvem.

Contribuições
Contribuições são bem-vindas! Se você identificar problemas, melhorias ou novos recursos, sinta-se à vontade para criar uma issue ou enviar um pull request. Juntos, podemos tornar este projeto ainda mais robusto e eficiente.
