const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Catálogo - E-commerce",
      version: "1.0.0",
      description: "API REST para gerenciamento de catálogo de produtos",
      contact: {
        name: "Suporte",
        email: "suporte@ecommerce.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login",
        },
      },
      schemas: {
        Produto: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único do produto",
            },
            nome: {
              type: "string",
              description: "Nome do produto",
            },
            descricao: {
              type: "string",
              description: "Descrição detalhada do produto",
            },
            preco: {
              type: "number",
              format: "decimal",
              description: "Preço do produto em reais",
            },
            categoria: {
              type: "string",
              description: "Categoria do produto",
            },
            estoque: {
              type: "integer",
              description: "Quantidade em estoque",
            },
            imagem: {
              type: "string",
              description: "URL da imagem do produto",
            },
            ativo: {
              type: "boolean",
              description: "Se o produto está ativo",
            },
            criado_em: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
            atualizado_em: {
              type: "string",
              format: "date-time",
              description: "Data da última atualização",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Tipo do erro",
            },
            message: {
              type: "string",
              description: "Mensagem descritiva do erro",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Verificação de saúde da API",
      },
      {
        name: "Produtos",
        description: "Operações relacionadas a produtos",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


