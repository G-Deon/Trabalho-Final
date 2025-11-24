const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");


router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API de Catálogo funcionando",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


router.get("/produtos", async (req, res, next) => {
  try {
    const { busca, categoria, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: "Parâmetro inválido",
        message: 'O parâmetro "page" deve ser um número maior que 0',
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Parâmetro inválido",
        message: 'O parâmetro "limit" deve ser um número entre 1 e 100',
      });
    }

    const offset = (pageNum - 1) * limitNum;

    let queryText = `
            SELECT id, nome, descricao, preco, categoria, estoque, imagem, ativo
            FROM produtos
            WHERE ativo = true
        `;
    const queryParams = [];
    let paramCount = 1;

    if (busca) {
      queryText += ` AND (nome ILIKE $${paramCount} OR descricao ILIKE $${paramCount})`;
      queryParams.push(`%${busca}%`);
      paramCount++;
    }

    if (categoria) {
      queryText += ` AND categoria = $${paramCount}`;
      queryParams.push(categoria);
      paramCount++;
    }

    queryText += ` ORDER BY id ASC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    queryParams.push(limitNum, offset);

    const result = await query(queryText, queryParams);

    let countQuery = "SELECT COUNT(*) FROM produtos WHERE ativo = true";
    const countParams = [];
    let countParamIndex = 1;

    if (busca) {
      countQuery += ` AND (nome ILIKE $${countParamIndex} OR descricao ILIKE $${countParamIndex})`;
      countParams.push(`%${busca}%`);
      countParamIndex++;
    }

    if (categoria) {
      countQuery += ` AND categoria = $${countParamIndex}`;
      countParams.push(categoria);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      produtos: result.rows,
      paginacao: {
        pagina_atual: pageNum,
        itens_por_pagina: limitNum,
        total_itens: total,
        total_paginas: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});


router.get("/produtos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        error: "ID inválido",
        message: "O ID do produto deve ser um número válido",
      });
    }

    const result = await query(
      "SELECT * FROM produtos WHERE id = $1 AND ativo = true",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produto não encontrado",
        message: `Produto com ID ${id} não existe`,
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});


router.post("/produtos", authenticateToken, async (req, res, next) => {
  try {
    const { nome, descricao, preco, categoria, estoque = 0, imagem } = req.body;

    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: 'O campo "nome" é obrigatório',
      });
    }

    if (!preco || isNaN(preco) || preco < 0) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: 'O campo "preco" deve ser um número válido maior ou igual a 0',
      });
    }

    if (!categoria || categoria.trim().length === 0) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: 'O campo "categoria" é obrigatório',
      });
    }

    if (estoque < 0) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: 'O campo "estoque" deve ser maior ou igual a 0',
      });
    }

    const result = await query(
      `INSERT INTO produtos (nome, descricao, preco, categoria, estoque, imagem)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [nome.trim(), descricao, preco, categoria.trim(), estoque, imagem]
    );

    console.log("[Produtos] Novo produto criado:", result.rows[0].id);

    res.status(201).json({
      message: "Produto criado com sucesso",
      produto: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});



router.put("/produtos/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, categoria, estoque, imagem } = req.body;

    if (isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        error: "ID inválido",
        message: "O ID do produto deve ser um número válido",
      });
    }

    const checkResult = await query("SELECT id FROM produtos WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: "Produto não encontrado",
        message: `Produto com ID ${id} não existe`,
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramCount++}`);
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push(`descricao = $${paramCount++}`);
      values.push(descricao);
    }
    if (preco !== undefined) {
      updates.push(`preco = $${paramCount++}`);
      values.push(preco);
    }
    if (categoria !== undefined) {
      updates.push(`categoria = $${paramCount++}`);
      values.push(categoria);
    }
    if (estoque !== undefined) {
      updates.push(`estoque = $${paramCount++}`);
      values.push(estoque);
    }
    if (imagem !== undefined) {
      updates.push(`imagem = $${paramCount++}`);
      values.push(imagem);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "Nenhum campo para atualizar",
        message: "Envie pelo menos um campo para atualizar",
      });
    }

    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE produtos 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    console.log("[Produtos] Produto atualizado:", id);

    res.status(200).json({
      message: "Produto atualizado com sucesso",
      produto: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/produtos/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        error: "ID inválido",
        message: "O ID do produto deve ser um número válido",
      });
    }

    const checkResult = await query("SELECT id FROM produtos WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: "Produto não encontrado",
        message: `Produto com ID ${id} não existe`,
      });
    }

    await query(
      "UPDATE produtos SET ativo = false, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    console.log("[Produtos] Produto removido (soft delete):", id);

    res.status(200).json({
      message: "Produto removido com sucesso",
      id: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


