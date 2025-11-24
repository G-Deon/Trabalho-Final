# 🛍️ E-commerce Completo - Frontend + Backend

Projeto completo de e-commerce com frontend (HTML/CSS/JS) e backend (Node.js + PostgreSQL), implementando uma arquitetura cliente-servidor com duas APIs REST independentes.

---

## 📚 Tecnologias e Bibliotecas Utilizadas

### Frontend

- **HTML5** - Estrutura semântica das páginas
- **CSS3** - Estilização e layout responsivo
- **JavaScript (Vanilla)** - Lógica do cliente sem frameworks
- **LocalStorage** - Armazenamento de token JWT e dados de sessão

### Backend

#### API de Catálogo (Porta 3001)

- **Node.js 18+** - Runtime JavaScript
- **Express 4.18.2** - Framework web
- **PostgreSQL 15** - Banco de dados relacional
- **pg 8.11.3** - Cliente PostgreSQL para Node.js
- **dotenv 16.3.1** - Gerenciamento de variáveis de ambiente
- **cors 2.8.5** - Controle de CORS
- **jsonwebtoken 9.0.2** - Autenticação JWT
- **swagger-ui-express 5.0.0** - Documentação interativa da API
- **swagger-jsdoc 6.2.8** - Geração de documentação OpenAPI

#### API de Sacola (Porta 3002)

- **Node.js 18+** - Runtime JavaScript
- **Express 4.18.2** - Framework web
- **PostgreSQL 15** - Banco de dados relacional
- **pg 8.11.3** - Cliente PostgreSQL para Node.js
- **dotenv 16.3.1** - Gerenciamento de variáveis de ambiente
- **cors 2.8.5** - Controle de CORS
- **jsonwebtoken 9.0.2** - Autenticação JWT
- **swagger-ui-express 5.0.0** - Documentação interativa da API
- **swagger-jsdoc 6.2.8** - Geração de documentação OpenAPI

### DevOps

- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **nodemon 3.0.1** - Hot reload em desenvolvimento

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Docker Desktop** instalado ([Download](https://www.docker.com/products/docker-desktop))
- **Navegador web** moderno (Chrome, Firefox, Edge)

### Opção 1: Com Docker (Recomendado)

```bash
# 1. Clone o repositório ou navegue até a pasta do projeto
cd "c:\Users\guilh\OneDrive\Documentos\Programação Web\Trabalho Final"

# 2. Suba os containers
docker-compose up -d

# 3. Aguarde ~30 segundos para inicialização completa

# 4. Verifique se os serviços estão rodando
docker-compose ps

# 5. Abra o frontend
# Navegue até a pasta frontend e abra index.html no navegador
```

**Parar os containers:**

```bash
docker-compose down
```

**Ver logs:**

```bash
docker-compose logs -f
```

### Opção 2: Instalação Manual

#### Passo 1: Instalar PostgreSQL

1. Baixe e instale: https://www.postgresql.org/download/
2. Crie os bancos de dados:

```sql
CREATE DATABASE ecommerce_catalogo;
CREATE DATABASE ecommerce_sacola;
```

#### Passo 2: Configurar API de Catálogo

```bash
cd backend/api-catalogo

# Instalar dependências
npm install

# Configurar variáveis de ambiente (edite .env)
# DB_PASSWORD=sua_senha_postgres

# Inicializar banco de dados
npm run init-db

# Iniciar servidor
npm start
```

#### Passo 3: Configurar API de Sacola

```bash
cd backend/api-sacola

# Instalar dependências
npm install

# Configurar variáveis de ambiente (edite .env)
# DB_PASSWORD=sua_senha_postgres

# Inicializar banco de dados
npm run init-db

# Iniciar servidor
npm start
```

#### Passo 4: Abrir Frontend

Abra o arquivo `frontend/index.html` no navegador.

---

## 🔌 Portas Utilizadas

| Serviço          | Porta | URL                            |
| ---------------- | ----- | ------------------------------ |
| API de Catálogo  | 3001  | http://localhost:3001          |
| API de Sacola    | 3002  | http://localhost:3002          |
| PostgreSQL       | 5432  | localhost:5432                 |
| Swagger Catálogo | 3001  | http://localhost:3001/api-docs |
| Swagger Sacola   | 3002  | http://localhost:3002/api-docs |

---

## 📋 Rotas Principais

### API de Catálogo (http://localhost:3001)

| Método | Rota            | Autenticação  | Descrição                    |
| ------ | --------------- | ------------- | ---------------------------- |
| GET    | `/health`       | Não           | Status da API                |
| GET    | `/produtos`     | Não           | Lista produtos com filtros   |
| GET    | `/produtos/:id` | Não           | Busca produto específico     |
| POST   | `/produtos`     | **Sim (JWT)** | Cria novo produto            |
| PUT    | `/produtos/:id` | **Sim (JWT)** | Atualiza produto             |
| DELETE | `/produtos/:id` | **Sim (JWT)** | Remove produto (soft delete) |

**Parâmetros de consulta em `/produtos`:**

- `busca` - Termo de busca no nome ou descrição
- `categoria` - Filtro por categoria (eletronicos, roupas, livros, casa)
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10, máx: 100)

### API de Sacola (http://localhost:3002)

| Método | Rota                       | Autenticação  | Descrição                 |
| ------ | -------------------------- | ------------- | ------------------------- |
| GET    | `/health`                  | Não           | Status da API             |
| POST   | `/sacola/auth`             | Não           | Login e obtenção de token |
| GET    | `/sacola`                  | **Sim (JWT)** | Busca sacola do usuário   |
| POST   | `/sacola/items`            | **Sim (JWT)** | Adiciona item à sacola    |
| PUT    | `/sacola/items/:productId` | **Sim (JWT)** | Atualiza quantidade       |
| DELETE | `/sacola/items/:productId` | **Sim (JWT)** | Remove item da sacola     |
| POST   | `/sacola/cupom`            | **Sim (JWT)** | Aplica cupom de desconto  |

**Parâmetros de consulta em `/sacola`:**

- `regiao` - Região para cálculo de frete (norte, nordeste, centro-oeste, sudeste, sul)

---

## 📝 Exemplos de Requisição

### 1. Verificar Status das APIs

**API de Catálogo:**

```bash
curl http://localhost:3001/health
```

**Resposta:**

```json
{
  "status": "OK",
  "message": "API de Catálogo funcionando",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "uptime": 123.456
}
```

**API de Sacola:**

```bash
curl http://localhost:3002/health
```

**Resposta:**

```json
{
  "status": "OK",
  "message": "API de Sacola funcionando",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Listar Produtos

**Requisição:**

```bash
curl "http://localhost:3001/produtos?page=1&limit=10"
```

**Com filtros:**

```bash
curl "http://localhost:3001/produtos?categoria=eletronicos&busca=notebook&page=1&limit=5"
```

**Resposta:**

```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Notebook Dell Inspiron",
      "descricao": "Notebook com processador Intel Core i5...",
      "preco": 2999.99,
      "categoria": "eletronicos",
      "estoque": 15,
      "imagem": "https://via.placeholder.com/300x200",
      "ativo": true
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "itens_por_pagina": 10,
    "total_itens": 16,
    "total_paginas": 2
  }
}
```

### 3. Buscar Produto por ID

**Requisição:**

```bash
curl http://localhost:3001/produtos/1
```

**Resposta:**

```json
{
  "id": 1,
  "nome": "Notebook Dell Inspiron",
  "descricao": "Notebook com processador Intel Core i5, 8GB RAM, 256GB SSD",
  "preco": 2999.99,
  "categoria": "eletronicos",
  "estoque": 15,
  "imagem": "https://via.placeholder.com/300x200",
  "ativo": true,
  "criado_em": "2025-11-24T10:00:00.000Z",
  "atualizado_em": "2025-11-24T10:00:00.000Z"
}
```

### 4. Fazer Login (Obter Token JWT)

**Requisição:**

```bash
curl -X POST http://localhost:3002/sacola/auth \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "usuario@email.com",
    "senha": "senha123"
  }'
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": "usuario@email.com",
  "mensagem": "Autenticação realizada com sucesso"
}
```

**Nota:** O token deve ser usado no header `Authorization: Bearer {token}` nas rotas autenticadas.

### 5. Criar Produto (Autenticado)

**Requisição:**

```bash
curl -X POST http://localhost:3001/produtos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -d '{
    "nome": "Mouse Gamer RGB",
    "descricao": "Mouse gamer com iluminação RGB e 7 botões",
    "preco": 149.90,
    "categoria": "eletronicos",
    "estoque": 50,
    "imagem": "https://via.placeholder.com/300x200"
  }'
```

**Resposta:**

```json
{
  "message": "Produto criado com sucesso",
  "produto": {
    "id": 17,
    "nome": "Mouse Gamer RGB",
    "descricao": "Mouse gamer com iluminação RGB e 7 botões",
    "preco": 149.9,
    "categoria": "eletronicos",
    "estoque": 50,
    "imagem": "https://via.placeholder.com/300x200",
    "ativo": true,
    "criado_em": "2025-11-24T12:30:00.000Z"
  }
}
```

### 6. Buscar Sacola do Usuário

**Requisição:**

```bash
curl http://localhost:3002/sacola \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

**Com região específica:**

```bash
curl "http://localhost:3002/sacola?regiao=sudeste" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

**Resposta:**

```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "name": "Notebook Dell Inspiron",
      "price": 2999.99,
      "qty": 1,
      "image": "https://via.placeholder.com/300x200"
    },
    {
      "id": 2,
      "productId": 5,
      "name": "Mouse Logitech",
      "price": 89.9,
      "qty": 2,
      "image": "https://via.placeholder.com/300x200"
    }
  ],
  "regiao": "sudeste",
  "subtotal": 3179.79,
  "freight": 0,
  "discount": 0,
  "total": 3179.79
}
```

### 7. Adicionar Item à Sacola

**Requisição:**

```bash
curl -X POST http://localhost:3002/sacola/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -d '{
    "productId": 1,
    "qty": 2,
    "name": "Notebook Dell Inspiron",
    "price": 2999.99,
    "image": "https://via.placeholder.com/300x200"
  }'
```

**Resposta:**

```json
{
  "message": "Item adicionado/atualizado com sucesso",
  "sacola": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "name": "Notebook Dell Inspiron",
        "price": 2999.99,
        "qty": 2,
        "image": "https://via.placeholder.com/300x200"
      }
    ],
    "subtotal": 5999.98,
    "freight": 0,
    "discount": 0,
    "total": 5999.98
  }
}
```

### 8. Atualizar Quantidade de Item

**Requisição:**

```bash
curl -X PUT http://localhost:3002/sacola/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -d '{
    "qty": 3
  }'
```

**Resposta:**

```json
{
  "message": "Quantidade atualizada com sucesso",
  "sacola": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "name": "Notebook Dell Inspiron",
        "price": 2999.99,
        "qty": 3,
        "image": "https://via.placeholder.com/300x200"
      }
    ],
    "subtotal": 8999.97,
    "freight": 0,
    "discount": 0,
    "total": 8999.97
  }
}
```

### 9. Remover Item da Sacola

**Requisição:**

```bash
curl -X DELETE http://localhost:3002/sacola/items/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

**Resposta:**

```
204 No Content
```

### 10. Aplicar Cupom de Desconto

**Requisição:**

```bash
curl -X POST http://localhost:3002/sacola/cupom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -d '{
    "code": "DESC10"
  }'
```

**Com região específica:**

```bash
curl -X POST "http://localhost:3002/sacola/cupom?regiao=nordeste" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -d '{
    "code": "DESC10"
  }'
```

**Resposta:**

```json
{
  "message": "Cupom aplicado com sucesso",
  "cupom": {
    "codigo": "DESC10",
    "tipo": "percentual",
    "desconto": 10
  },
  "totais": {
    "subtotal": 3179.79,
    "freight": 0,
    "discount": 317.98,
    "total": 2861.81
  }
}
```

### 11. Remover Produto (Autenticado)

**Requisição:**

```bash
curl -X DELETE http://localhost:3001/produtos/17 \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

**Resposta:**

```json
{
  "message": "Produto removido com sucesso",
  "id": 17
}
```

---

## 🎫 Cupons Disponíveis

Os seguintes cupons estão pré-cadastrados no sistema:

| Código  | Tipo       | Desconto |
| ------- | ---------- | -------- |
| DESC10  | Percentual | 10%      |
| DESC20  | Percentual | 20%      |
| DESC50  | Fixo       | R$ 50,00 |
| FRETE   | Fixo       | R$ 25,00 |
| BLACK30 | Percentual | 30%      |

---

## 💰 Cálculo de Frete

O frete é calculado com base no subtotal e na região de entrega:

### Regras

- **Frete grátis:** Compras acima de R$ 200,00
- **Frete pago:** Compras abaixo de R$ 200,00

### Valores por Região

| Região       | Valor do Frete |
| ------------ | -------------- |
| Norte        | R$ 35,00       |
| Nordeste     | R$ 30,00       |
| Centro-Oeste | R$ 28,00       |
| Sudeste      | R$ 20,00       |
| Sul          | R$ 25,00       |

**Padrão:** Se nenhuma região for especificada, usa-se Sudeste (R$ 20,00).

---

## 🗄️ Estrutura do Banco de Dados

### Banco: ecommerce_catalogo

**Tabela: produtos**

```sql
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    estoque INTEGER DEFAULT 0,
    imagem VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Banco: ecommerce_sacola

**Tabela: sacolas**

```sql
CREATE TABLE sacolas (
    id SERIAL PRIMARY KEY,
    usuario_email VARCHAR(255) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela: sacola_itens**

```sql
CREATE TABLE sacola_itens (
    id SERIAL PRIMARY KEY,
    sacola_id INTEGER REFERENCES sacolas(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL,
    nome VARCHAR(200) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    imagem VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela: cupons**

```sql
CREATE TABLE cupons (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL, -- 'percentual' ou 'fixo'
    desconto DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** para autenticação.

### Como Autenticar

1. **Obter Token:**

   - Endpoint: `POST /sacola/auth`
   - Body: `{ "usuario": "email@example.com", "senha": "senha123" }`
   - Resposta: `{ "token": "eyJhbG..." }`

2. **Usar Token:**

   - Incluir no header de requisições autenticadas:

   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Token no Frontend:**
   - Armazenado no `localStorage` com chave `ecommerce_token`
   - Válido por 24 horas
   - Renovado automaticamente no login

---

## 📚 Documentação Swagger

Acesse a documentação interativa das APIs:

- **API de Catálogo:** http://localhost:3001/api-docs
- **API de Sacola:** http://localhost:3002/api-docs

A documentação Swagger permite:

- Visualizar todos os endpoints
- Ver exemplos de requisição/resposta
- Testar as APIs diretamente no navegador
- Obter schemas JSON completos

---

## 🎨 Status Codes Utilizados

| Código | Significado           | Quando é usado                      |
| ------ | --------------------- | ----------------------------------- |
| 200    | OK                    | Requisição bem-sucedida             |
| 201    | Created               | Recurso criado com sucesso          |
| 204    | No Content            | Recurso deletado com sucesso        |
| 400    | Bad Request           | Dados inválidos ou faltando         |
| 401    | Unauthorized          | Token não fornecido                 |
| 403    | Forbidden             | Token inválido ou expirado          |
| 404    | Not Found             | Recurso não encontrado              |
| 409    | Conflict              | Conflito (ex: estoque insuficiente) |
| 500    | Internal Server Error | Erro interno do servidor            |

---

## 🧪 Testando o Sistema

### Teste Completo do Fluxo

1. **Inicie os serviços:**

   ```bash
   docker-compose up -d
   ```

2. **Verifique a saúde das APIs:**

   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

3. **Liste os produtos:**

   ```bash
   curl http://localhost:3001/produtos
   ```

4. **Faça login e obtenha um token:**

   ```bash
   curl -X POST http://localhost:3002/sacola/auth \
     -H "Content-Type: application/json" \
     -d '{"usuario":"teste@email.com","senha":"123"}'
   ```

5. **Use o token para acessar a sacola:**

   ```bash
   curl http://localhost:3002/sacola \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

6. **Abra o frontend:**
   - Navegue até `frontend/index.html`
   - Navegue pelo sistema completo

---

## 🐛 Solução de Problemas

### Containers não iniciam

```bash
# Verificar logs
docker-compose logs

# Recriar containers
docker-compose down
docker-compose up -d --build
```

### Banco de dados não conecta

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres
```

### Porta já em uso

```bash
# Windows - encontrar processo
netstat -ano | findstr :3001

# Matar processo
taskkill /PID <numero_do_pid> /F
```

### Frontend não conecta com backend

1. Verifique se as APIs estão rodando:

   - http://localhost:3001/health
   - http://localhost:3002/health

2. Verifique o console do navegador (F12) para erros de CORS

3. Certifique-se de que as URLs em `frontend/js/api.js` estão corretas

---

## 📂 Estrutura do Projeto

```
Trabalho Final/
├── docker-compose.yml          # Orquestração de containers
├── README.md                   # Este arquivo
│
├── frontend/                   # Aplicação cliente
│   ├── index.html             # Página inicial
│   ├── produtos.html          # Lista de produtos
│   ├── detalhes.html          # Detalhes do produto
│   ├── login.html             # Login
│   ├── sacola.html            # Sacola de compras
│   ├── css/
│   │   └── style.css          # Estilos globais
│   └── js/
│       ├── api.js             # Configuração de APIs
│       ├── app.js             # Funções globais
│       ├── auth.js            # Autenticação JWT
│       ├── produtos.js        # Listagem de produtos
│       ├── detalhes.js        # Detalhes do produto
│       ├── login.js           # Lógica de login
│       └── sacola.js          # Lógica da sacola
│
└── backend/                    # APIs do servidor
    ├── init-databases.sql     # Script de criação dos bancos
    │
    ├── api-catalogo/          # API de Catálogo (porta 3001)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js          # Servidor Express
    │   ├── config/
    │   │   ├── database.js    # Configuração PostgreSQL
    │   │   └── swagger.js     # Configuração Swagger
    │   ├── middleware/
    │   │   ├── auth.js        # Middleware JWT
    │   │   ├── logger.js      # Logger de requisições
    │   │   └── errorHandler.js# Tratamento de erros
    │   ├── routes/
    │   │   └── produtos.js    # Rotas de produtos
    │   └── scripts/
    │       └── init-db.js     # Inicialização do banco
    │
    └── api-sacola/            # API de Sacola (porta 3002)
        ├── Dockerfile
        ├── package.json
        ├── server.js          # Servidor Express
        ├── config/
        │   ├── database.js    # Configuração PostgreSQL
        │   └── swagger.js     # Configuração Swagger
        ├── middleware/
        │   ├── auth.js        # Middleware JWT
        │   ├── logger.js      # Logger de requisições
        │   └── errorHandler.js# Tratamento de erros
        ├── routes/
        │   └── sacola.js      # Rotas da sacola
        └── scripts/
            └── init-db.js     # Inicialização do banco
```

---

## 🎓 Conceitos Implementados

- ✅ Arquitetura Cliente-Servidor
- ✅ APIs REST independentes
- ✅ HTTP Methods (GET, POST, PUT, DELETE)
- ✅ Status Codes apropriados
- ✅ Autenticação JWT
- ✅ Middleware de autenticação
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Persistência em PostgreSQL
- ✅ Documentação OpenAPI/Swagger
- ✅ HTML Semântico
- ✅ Acessibilidade (ARIA)
- ✅ CORS
- ✅ Docker e Docker Compose
- ✅ Variáveis de ambiente

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos.

---

## 👨‍💻 Autor

Desenvolvido como trabalho final da disciplina de Programação Web.

---

**🎉 Boa sorte na apresentação!**
