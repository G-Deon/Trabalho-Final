const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const swaggerSpec = require("./config/swagger");
const produtosRoutes = require("./routes/produtos");
const requestLogger = require("./middleware/logger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(requestLogger);


app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Catálogo - Documentação",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "API de Catálogo - E-commerce",
    version: "1.0.0",
    docs: "/api-docs",
    endpoints: {
      health: "GET /health",
      produtos: {
        listar: "GET /produtos",
        buscar: "GET /produtos/:id",
        criar: "POST /produtos (autenticado)",
        deletar: "DELETE /produtos/:id (autenticado)",
      },
    },
  });
});

app.use("/", produtosRoutes);


app.use(notFoundHandler);

app.use(errorHandler);


app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   🚀 API de Catálogo iniciada!           ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║   📡 Servidor rodando na porta ${PORT}       ║`);
  console.log(`║   📚 Documentação: http://localhost:${PORT}/api-docs ║`);
  console.log(`║   🌐 URL base: http://localhost:${PORT}          ║`);
  console.log("╚════════════════════════════════════════════╝\n");
  console.log("📋 Endpoints disponíveis:");
  console.log(`   • GET    /health - Status da API`);
  console.log(`   • GET    /produtos - Lista produtos`);
  console.log(`   • GET    /produtos/:id - Busca produto`);
  console.log(`   • POST   /produtos - Cria produto (autenticado)`);
  console.log(`   • DELETE /produtos/:id - Remove produto (autenticado)`);
  console.log(
    "\n💡 Dica: Acesse /api-docs para ver a documentação completa!\n"
  );
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;


