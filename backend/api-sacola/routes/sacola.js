const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const FRETE_MINIMO = parseFloat(process.env.FRETE_MINIMO) || 200;
const FRETE_POR_REGIAO = {
  norte: 35,
  nordeste: 30,
  "centro-oeste": 28,
  sudeste: 20,
  sul: 25,
};


router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API de Sacola funcionando",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


router.post("/sacola/auth", (req, res) => {
  const { usuario, senha } = req.body;

  console.log("[Auth] Tentativa de login:", {
    usuario,
    senha: senha ? "***" : "vazio",
  });

  if (usuario && senha) {
    const email = usuario.includes("@") ? usuario : `${usuario}@local.com`;

    const token = jwt.sign(
      { usuario, email: email, tipo: "usuario" },
      process.env.JWT_SECRET || "seu_secret_super_secreto_aqui_12345",
      { expiresIn: "24h" }
    );

    console.log("[Auth] Token gerado com sucesso para:", usuario);

    return res.json({
      token,
      usuario,
      mensagem: "Autenticação realizada com sucesso",
    });
  }

  console.log("[Auth] Login rejeitado - credenciais inválidas");
  res.status(401).json({ error: "Credenciais inválidas" });
});


async function calcularTotais(
  sacolaId,
  cupomCodigo = null,
  regiao = "sudeste"
) {
  const itensResult = await query(
    "SELECT * FROM sacola_itens WHERE sacola_id = $1",
    [sacolaId]
  );

  const itens = itensResult.rows;

  const subtotal = itens.reduce((total, item) => {
    return total + parseFloat(item.preco) * item.quantidade;
  }, 0);

  const valorFretePorRegiao =
    FRETE_POR_REGIAO[regiao] || FRETE_POR_REGIAO.sudeste;
  const freight = subtotal >= FRETE_MINIMO ? 0 : valorFretePorRegiao;

  let discount = 0;
  if (cupomCodigo) {
    const cupomResult = await query(
      "SELECT * FROM cupons WHERE codigo = $1 AND ativo = true",
      [cupomCodigo]
    );

    if (cupomResult.rows.length > 0) {
      const cupom = cupomResult.rows[0];
      if (cupom.tipo === "percentual") {
        discount = subtotal * (parseFloat(cupom.desconto) / 100);
      } else {
        discount = parseFloat(cupom.desconto);
      }
    }
  }

  const total = subtotal + freight - discount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    freight: parseFloat(freight.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}


async function getOrCreateSacola(userEmail) {
  let result = await query("SELECT id FROM sacolas WHERE usuario_email = $1", [
    userEmail,
  ]);

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  result = await query(
    "INSERT INTO sacolas (usuario_email) VALUES ($1) RETURNING id",
    [userEmail]
  );

  console.log("[Sacola] Nova sacola criada para:", userEmail);
  return result.rows[0].id;
}


router.get("/sacola", authenticateToken, async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const regiao = req.query.regiao || "sudeste";
    console.log("[Sacola] Buscando sacola para:", userEmail, "região:", regiao);

    const sacolaId = await getOrCreateSacola(userEmail);

    const itensResult = await query(
      `SELECT id, produto_id as "productId", nome as name, preco as price, 
                    quantidade as qty, imagem as image
             FROM sacola_itens 
             WHERE sacola_id = $1
             ORDER BY criado_em DESC`,
      [sacolaId]
    );

    const items = itensResult.rows.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    }));

    const totais = await calcularTotais(sacolaId, null, regiao);

    res.status(200).json({
      items,
      regiao,
      ...totais,
    });
  } catch (error) {
    next(error);
  }
});


router.post("/sacola/items", authenticateToken, async (req, res, next) => {
  try {
    const { productId, qty, name, price, image } = req.body;
    const userEmail = req.user.email;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "productId é obrigatório e deve ser um número",
      });
    }

    if (!qty || isNaN(qty) || qty < 1) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "qty deve ser um número maior que 0",
      });
    }

    let itemName = name;
    let itemPrice = price;
    let itemImage = image;

    if (!itemName || !itemPrice) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "name e price são obrigatórios",
      });
    }

    const sacolaId = await getOrCreateSacola(userEmail);

    const existingItem = await query(
      "SELECT id, quantidade FROM sacola_itens WHERE sacola_id = $1 AND produto_id = $2",
      [sacolaId, productId]
    );

    if (existingItem.rows.length > 0) {
      const novaQuantidade = existingItem.rows[0].quantidade + qty;
      await query(
        `UPDATE sacola_itens 
                 SET quantidade = $1, atualizado_em = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
        [novaQuantidade, existingItem.rows[0].id]
      );
      console.log("[Sacola] Quantidade atualizada:", productId);
    } else {
      await query(
        `INSERT INTO sacola_itens (sacola_id, produto_id, nome, preco, quantidade, imagem)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [sacolaId, productId, itemName, itemPrice, qty, itemImage]
      );
      console.log("[Sacola] Novo item adicionado:", productId);
    }

    await query(
      "UPDATE sacolas SET atualizado_em = CURRENT_TIMESTAMP WHERE id = $1",
      [sacolaId]
    );

    const itensResult = await query(
      `SELECT id, produto_id as "productId", nome as name, preco as price, 
                    quantidade as qty, imagem as image
             FROM sacola_itens 
             WHERE sacola_id = $1`,
      [sacolaId]
    );

    const items = itensResult.rows.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    }));

    const totais = await calcularTotais(sacolaId);

    res.status(201).json({
      message: "Item adicionado/atualizado com sucesso",
      sacola: {
        items,
        ...totais,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.put(
  "/sacola/items/:productId",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { qty } = req.body;
      const userEmail = req.user.email;

      if (!qty || isNaN(qty) || qty < 1) {
        return res.status(400).json({
          error: "Dados inválidos",
          message: "qty deve ser um número maior que 0",
        });
      }

      const sacolaId = await getOrCreateSacola(userEmail);

      const result = await query(
        `UPDATE sacola_itens 
             SET quantidade = $1, atualizado_em = CURRENT_TIMESTAMP 
             WHERE sacola_id = $2 AND produto_id = $3
             RETURNING *`,
        [qty, sacolaId, productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Item não encontrado",
          message: "Item não existe na sacola",
        });
      }

      console.log("[Sacola] Quantidade atualizada para:", productId, qty);

      const itensResult = await query(
        `SELECT id, produto_id as "productId", nome as name, preco as price, 
                    quantidade as qty, imagem as image
             FROM sacola_itens 
             WHERE sacola_id = $1`,
        [sacolaId]
      );

      const items = itensResult.rows.map((item) => ({
        ...item,
        price: parseFloat(item.price),
      }));

      const totais = await calcularTotais(sacolaId);

      res.status(200).json({
        message: "Quantidade atualizada com sucesso",
        sacola: {
          items,
          ...totais,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);


router.delete(
  "/sacola/items/:productId",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const userEmail = req.user.email;

      const sacolaId = await getOrCreateSacola(userEmail);

      const result = await query(
        "DELETE FROM sacola_itens WHERE sacola_id = $1 AND produto_id = $2 RETURNING *",
        [sacolaId, productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Item não encontrado",
          message: "Item não existe na sacola",
        });
      }

      console.log("[Sacola] Item removido:", productId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);


router.post("/sacola/cupom", authenticateToken, async (req, res, next) => {
  try {
    const { code } = req.body;
    const userEmail = req.user.email;
    const regiao = req.query.regiao || "sudeste";

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "Código do cupom é obrigatório",
      });
    }

    const cupomResult = await query(
      "SELECT * FROM cupons WHERE codigo = $1 AND ativo = true",
      [code.toUpperCase()]
    );

    if (cupomResult.rows.length === 0) {
      return res.status(400).json({
        error: "Cupom inválido",
        message: "Cupom não encontrado ou inativo",
      });
    }

    const cupom = cupomResult.rows[0];

    const sacolaId = await getOrCreateSacola(userEmail);

    const totais = await calcularTotais(sacolaId, cupom.codigo, regiao);

    console.log("[Sacola] Cupom aplicado:", cupom.codigo, "região:", regiao);

    res.status(200).json({
      message: "Cupom aplicado com sucesso",
      cupom: {
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        desconto: parseFloat(cupom.desconto),
      },
      totais,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


