# API de Pedidos

API em Node.js para criar, consultar, atualizar e deletar pedidos com PostgreSQL, JWT e Swagger.

## Requisitos

- Node.js
- Docker e Docker Compose

## Variaveis de ambiente

Use o arquivo [.env.example] como base:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_NAME=api
JWT_SECRET=minha_chave_secreta
```

Crie um `.env` na raiz do projeto com esses valores.

## Subir o banco

```bash
docker-compose up -d
```

Os scripts da pasta `scripts/` criam as tabelas e inserem dados iniciais no primeiro bootstrap do container/volume.

## Rodar a API

```bash
node src/index.js
```

Servidor:

```text
http://localhost:3000
```

## Swagger

Documentacao:

```text
http://localhost:3000/docs/
```

## Login de exemplo

```json
{
  "username": "admin",
  "password": "123456"
}
```

Depois do login, use o token JWT nas rotas protegidas.
