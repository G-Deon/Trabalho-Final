const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token não fornecido",
      message: "Acesso negado. Por favor, faça login.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("[Auth] Usuário autenticado:", decoded.email);
    next();
  } catch (error) {
    console.error("[Auth] Token inválido:", error.message);
    return res.status(403).json({
      error: "Token inválido",
      message: "Token expirado ou inválido. Faça login novamente.",
    });
  }
}

module.exports = {
  authenticateToken,
};


