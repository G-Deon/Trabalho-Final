const { pool } = require("../config/database");

async function initDatabase() {
  console.log("🚀 Iniciando configuração do banco de dados da Sacola...\n");

  try {
    console.log("🛒 Criando tabela de sacolas...");
    await pool.query(`
            CREATE TABLE IF NOT EXISTS sacolas (
                id SERIAL PRIMARY KEY,
                usuario_email VARCHAR(255) NOT NULL UNIQUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log("✅ Tabela sacolas criada!\n");

    console.log("📦 Criando tabela de itens da sacola...");
    await pool.query(`
            CREATE TABLE IF NOT EXISTS sacola_itens (
                id SERIAL PRIMARY KEY,
                sacola_id INTEGER NOT NULL REFERENCES sacolas(id) ON DELETE CASCADE,
                produto_id INTEGER NOT NULL,
                nome VARCHAR(255) NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                quantidade INTEGER NOT NULL DEFAULT 1,
                imagem VARCHAR(500),
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(sacola_id, produto_id)
            )
        `);
    console.log("✅ Tabela sacola_itens criada!\n");

    console.log("🎫 Criando tabela de cupons...");
    await pool.query(`
            CREATE TABLE IF NOT EXISTS cupons (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(50) NOT NULL UNIQUE,
                tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
                desconto DECIMAL(10, 2) NOT NULL,
                ativo BOOLEAN DEFAULT true,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log("✅ Tabela cupons criada!\n");

    const result = await pool.query("SELECT COUNT(*) FROM cupons");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log("🎁 Inserindo cupons de exemplo...");

      const cuponsExemplo = [
        ["DESC10", "percentual", 10],
        ["DESC20", "percentual", 20],
        ["DESC50", "fixo", 50],
        ["FRETE", "fixo", 25],
        ["BLACK30", "percentual", 30],
      ];

      for (const cupom of cuponsExemplo) {
        await pool.query(
          "INSERT INTO cupons (codigo, tipo, desconto) VALUES ($1, $2, $3)",
          cupom
        );
      }

      console.log(`✅ ${cuponsExemplo.length} cupons inseridos!\n`);
    } else {
      console.log(`ℹ️  Banco já contém ${count} cupons.\n`);
    }

    console.log("🎫 Cupons disponíveis:");
    const cupons = await pool.query(
      "SELECT codigo, tipo, desconto FROM cupons WHERE ativo = true ORDER BY codigo"
    );
    console.table(cupons.rows);

    console.log("\n✨ Banco de dados da Sacola configurado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao configurar banco de dados:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase()
  .then(() => {
    console.log("\n🎉 Processo concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha na inicialização:", error);
    process.exit(1);
  });


