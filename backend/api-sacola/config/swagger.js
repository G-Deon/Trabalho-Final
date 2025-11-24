const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Sacola - E-commerce",
      version: "1.0.0",
      description: "API REST para gerenciamento de sacola de compras",
      contact: {
        name: "Suporte",
        email: "suporte@ecommerce.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3002",
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
    },
    tags: [
      {
        name: "Health",
        description: "Verificação de saúde da API",
      },
      {
        name: "Sacola",
        description: "Operações relacionadas à sacola de compras",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


