const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const swaggerSpec = require("./config/swagger");
const sacolaRoutes = require("./routes/sacola");
const requestLogger = require("./middleware/logger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3002;


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
    customSiteTitle: "API Sacola - Documentação",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "API de Sacola - E-commerce",
    version: "1.0.0",
    docs: "/api-docs",
    endpoints: {
      health: "GET /health",
      sacola: {
        buscar: "GET /sacola (autenticado)",
        addItem: "POST /sacola/items (autenticado)",
        updateItem: "PUT /sacola/items/:productId (autenticado)",
        removeItem: "DELETE /sacola/items/:productId (autenticado)",
        aplicarCupom: "POST /sacola/cupom (autenticado)",
      },
    },
  });
});

app.use("/", sacolaRoutes);


app.use(notFoundHandler);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   🛒 API de Sacola iniciada!             ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║   📡 Servidor rodando na porta ${PORT}       ║`);
  console.log(`║   📚 Documentação: http://localhost:${PORT}/api-docs ║`);
  console.log(`║   🌐 URL base: http://localhost:${PORT}          ║`);
  console.log("╚════════════════════════════════════════════╝\n");
  console.log("📋 Endpoints disponíveis:");
  console.log(`   • GET    /health - Status da API`);
  console.log(`   • GET    /sacola - Busca sacola (autenticado)`);
  console.log(`   • POST   /sacola/items - Adiciona item (autenticado)`);
  console.log(`   • PUT    /sacola/items/:id - Atualiza item (autenticado)`);
  console.log(`   • DELETE /sacola/items/:id - Remove item (autenticado)`);
  console.log(`   • POST   /sacola/cupom - Aplica cupom (autenticado)`);
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


