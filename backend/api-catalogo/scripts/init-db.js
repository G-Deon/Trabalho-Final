const { pool } = require("../config/database");

async function initDatabase() {
  console.log("🚀 Iniciando configuração do banco de dados...\n");

  try {
    console.log("📦 Criando tabela de produtos...");
    await pool.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                estoque INTEGER DEFAULT 0,
                imagem VARCHAR(500),
                ativo BOOLEAN DEFAULT true,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log("✅ Tabela produtos criada com sucesso!\n");

    const result = await pool.query("SELECT COUNT(*) FROM produtos");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log("📝 Inserindo produtos de exemplo...");

      const produtosExemplo = [
        [
          "Notebook Dell Inspiron 15",
          "Notebook com processador Intel Core i5, 8GB RAM, SSD 256GB",
          2999.99,
          "eletronicos",
          10,
          null,
        ],
        [
          "Mouse Logitech MX Master 3",
          "Mouse sem fio ergonômico com precisão de 4000 DPI",
          449.99,
          "eletronicos",
          25,
          null,
        ],
        [
          "Teclado Mecânico Keychron K2",
          "Teclado mecânico compacto com switches Blue",
          599.9,
          "eletronicos",
          15,
          null,
        ],
        [
          "Monitor LG 27 4K",
          "Monitor IPS 4K 27 polegadas com HDR",
          1899.9,
          "eletronicos",
          8,
          null,
        ],
        [
          "Camiseta Básica Branca",
          "Camiseta 100% algodão, modelagem regular",
          79.9,
          "roupas",
          50,
          null,
        ],
        [
          "Calça Jeans Slim Fit",
          "Calça jeans masculina slim fit, cor azul escuro",
          159.9,
          "roupas",
          30,
          null,
        ],
        [
          "Tênis Nike Air Max",
          "Tênis esportivo com tecnologia Air Max",
          599.9,
          "roupas",
          20,
          null,
        ],
        [
          "Jaqueta Jeans",
          "Jaqueta jeans clássica, 100% algodão",
          189.9,
          "roupas",
          15,
          null,
        ],
        [
          "JavaScript: The Good Parts",
          "Livro sobre as melhores práticas de JavaScript",
          89.9,
          "livros",
          40,
          null,
        ],
        [
          "Python para Análise de Dados",
          "Guia completo de Python para data science",
          129.9,
          "livros",
          35,
          null,
        ],
        [
          "Clean Code",
          "Manual de boas práticas de programação",
          99.9,
          "livros",
          45,
          null,
        ],
        [
          "O Programador Pragmático",
          "De aprendiz a mestre",
          109.9,
          "livros",
          30,
          null,
        ],
        [
          "Luminária de Mesa LED",
          "Luminária articulada com controle de intensidade",
          129.9,
          "casa",
          25,
          null,
        ],
        [
          "Quadro Decorativo Abstrato",
          "Quadro decorativo moderno 60x80cm",
          199.9,
          "casa",
          12,
          null,
        ],
        [
          "Kit Tapetes Felpudos",
          "Kit com 3 tapetes felpudos para banheiro",
          89.9,
          "casa",
          20,
          null,
        ],
        [
          "Jogo de Cama Casal",
          "Jogo de cama 4 peças em algodão 300 fios",
          249.9,
          "casa",
          18,
          null,
        ],
      ];

      for (const produto of produtosExemplo) {
        await pool.query(
          `INSERT INTO produtos (nome, descricao, preco, categoria, estoque, imagem)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
          produto
        );
      }

      console.log(
        `✅ ${produtosExemplo.length} produtos inseridos com sucesso!\n`
      );
    } else {
      console.log(
        `ℹ️  Banco já contém ${count} produtos. Pulando inserção de exemplos.\n`
      );
    }

    console.log("📊 Resumo do banco de dados:");
    const stats = await pool.query(`
            SELECT categoria, COUNT(*) as total
            FROM produtos
            WHERE ativo = true
            GROUP BY categoria
            ORDER BY categoria
        `);

    console.table(stats.rows);

    console.log("\n✨ Banco de dados configurado com sucesso!");
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


