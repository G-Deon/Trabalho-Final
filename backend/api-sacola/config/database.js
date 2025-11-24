const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "ecommerce_sacola",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("✅ Conectado ao banco de dados PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool de conexões:", err);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `[DB] Query executada em ${duration}ms:`,
      text.substring(0, 50)
    );
    return res;
  } catch (error) {
    console.error("[DB] Erro ao executar query:", error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
};


