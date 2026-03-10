# API de Pedidos

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

API em **Node.js** para criar, consultar, atualizar e deletar pedidos com **PostgreSQL**, **JWT** e **Swagger**.

---

## Índice

- [Requisitos](#requisitos)
- [Clonar repositório](#clonar-repositório)
- [Instalar dependências](#instalar-dependências)
- [Comandos úteis](#comandos-úteis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Subir o banco](#subir-o-banco)
- [Rodar a API](#rodar-a-api)
- [Swagger](#swagger)
- [Login de exemplo](#login-de-exemplo)
- [Exemplo de request](#exemplo-de-request)

---

## Requisitos

- Node.js (>= 18.x recomendado)  
- npm (ou yarn)  
- Docker e Docker Compose  

---

## Clonar repositório

```bash
git clone <https://github.com/tisiqueiradev/api.git>
cd <api>
Instalar dependências
npm install
# ou, se usar yarn:
yarn install
Comandos úteis
npm install        # Instala dependências
npm run dev         # Rodar em modo desenvolvimento
npm start           # Rodar em modo produção
docker-compose up   # Iniciar containers
docker-compose down # Parar containers
Variáveis de ambiente

Use o arquivo .env.example como base:

DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_NAME=api
JWT_SECRET=minha_chave_secreta

Crie um .env na raiz do projeto com esses valores.

Subir o banco
docker-compose up -d

Os scripts dentro da pasta scripts/ criam as tabelas e inserem dados iniciais no primeiro bootstrap do container/volume.

Rodar a API
node src/index.js

Servidor disponível em:

http://localhost:3000
Swagger

Documentação:

http://localhost:3000/docs/
Login de exemplo
{
  "username": "admin",
  "password": "123456"
}

Depois do login, use o token JWT nas rotas protegidas.

Exemplo de request
Criar pedido (POST /order)
curl -X POST http://localhost:3000/order \
  -H "Authorization: Bearer <SEU_TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 5000,
    "dataCriacao": "2026-03-10T01:17:40.885Z",
    "items": [
      {
        "idItem": 1,
        "quantidadeItem": 2,
        "valorItem": 2500
      }
    ]
  }'
Consultar pedidos (GET /order/list)
curl -X GET http://localhost:3000/order/list \
  -H "Authorization: Bearer <SEU_TOKEN_JWT>"