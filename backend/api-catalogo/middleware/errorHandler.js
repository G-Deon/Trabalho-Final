function errorHandler(err, req, res, next) {
  console.error("[Error Handler] Erro capturado:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Erro de validação",
      message: err.message,
      details: err.details,
    });
  }

  if (err.code) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Conflito",
        message: "Registro duplicado",
      });
    }

    if (err.code === "23503") {
      return res.status(400).json({
        error: "Erro de referência",
        message: "Registro referenciado não existe",
      });
    }
  }

  res.status(err.statusCode || 500).json({
    error: err.name || "Erro interno do servidor",
    message: err.message || "Ocorreu um erro inesperado",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Rota não encontrada",
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: [
      "GET /health",
      "GET /produtos",
      "GET /produtos/:id",
      "POST /produtos (autenticado)",
      "DELETE /produtos/:id (autenticado)",
      "GET /api-docs (documentação)",
    ],
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};


