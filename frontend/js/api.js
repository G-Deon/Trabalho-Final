
const API = {
  CATALOGO_URL: "http://localhost:3001",
  SACOLA_URL: "http://localhost:3002",

  
  async request(url, options = {}) {
    try {
      console.log(`[API] Requisição: ${options.method || "GET"} ${url}`);

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      const token = Auth.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Resposta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error("[API] Não autorizado");
          Auth.logout();
          throw new Error("Não autorizado. Faça login novamente.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro na requisição: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("[API] Erro na requisição:", error);

      if (error.message === "Failed to fetch") {
        throw new Error(
          "Erro de conexão. Verifique se o servidor está rodando."
        );
      }

      throw error;
    }
  },


  
  async listarProdutos(filtros = {}) {
    if (!filtros.limit) {
      filtros.limit = 50;
    }
    const params = new URLSearchParams(filtros);
    const url = `${this.CATALOGO_URL}/produtos?${params}`;

    try {
      const response = await this.request(url);
      return response.produtos || response;
    } catch (error) {
      console.warn("[API] Usando dados mockados para produtos");
      return this.getMockProdutos(filtros.categoria);
    }
  },

  
  async buscarProduto(id) {
    const url = `${this.CATALOGO_URL}/produtos/${id}`;

    try {
      return await this.request(url);
    } catch (error) {
      console.warn("[API] Usando dados mockados para produto");
      return this.getMockProduto(id);
    }
  },


  
  async buscarSacola(regiao = "sudeste") {
    const url = `${this.SACOLA_URL}/sacola?regiao=${regiao}`;

    try {
      return await this.request(url);
    } catch (error) {
      console.warn("[API] Usando localStorage para sacola");
      return this.getSacolaFromLocalStorage();
    }
  },

  
  async adicionarItem(produtoId, quantidade = 1) {
    const url = `${this.SACOLA_URL}/sacola/items`;

    try {
      const produto = await this.buscarProduto(produtoId);

      return await this.request(url, {
        method: "POST",
        body: JSON.stringify({
          productId: produtoId,
          qty: quantidade,
          name: produto.nome,
          price: produto.preco,
          image: produto.imagem,
        }),
      });
    } catch (error) {
      console.warn("[API] Usando localStorage para adicionar item");
      return this.addItemToLocalStorage(produtoId, quantidade);
    }
  },

  
  async removerItem(itemId) {
    const url = `${this.SACOLA_URL}/sacola/items/${itemId}`;

    try {
      return await this.request(url, {
        method: "DELETE",
      });
    } catch (error) {
      console.warn("[API] Usando localStorage para remover item");
      return this.removeItemFromLocalStorage(itemId);
    }
  },

  
  async atualizarQuantidade(itemId, quantidade) {
    const url = `${this.SACOLA_URL}/sacola/items/${itemId}`;

    try {
      return await this.request(url, {
        method: "PUT",
        body: JSON.stringify({ qty: quantidade }),
      });
    } catch (error) {
      console.warn("[API] Usando localStorage para atualizar quantidade");
      return this.updateItemInLocalStorage(itemId, quantidade);
    }
  },

  
  async aplicarCupom(codigo, regiao = "sudeste") {
    const url = `${this.SACOLA_URL}/sacola/cupom?regiao=${regiao}`;

    try {
      return await this.request(url, {
        method: "POST",
        body: JSON.stringify({ code: codigo }),
      });
    } catch (error) {
      console.warn("[API] Validando cupom localmente");
      return this.validateCupomLocally(codigo, regiao);
    }
  },


  getMockProdutos(categoria = "") {
    const produtos = [
      {
        id: 1,
        nome: "Notebook",
        preco: 2999.99,
        categoria: "eletronicos",
        descricao: "Notebook com 8GB RAM",
      },
      {
        id: 2,
        nome: "Mouse",
        preco: 49.99,
        categoria: "eletronicos",
        descricao: "Mouse sem fio",
      },
      {
        id: 3,
        nome: "Camiseta",
        preco: 79.9,
        categoria: "roupas",
        descricao: "Camiseta básica",
      },
      {
        id: 4,
        nome: "Calça Jeans",
        preco: 159.9,
        categoria: "roupas",
        descricao: "Calça jeans slim",
      },
      {
        id: 5,
        nome: "Livro de JavaScript",
        preco: 89.9,
        categoria: "livros",
        descricao: "Aprenda JavaScript",
      },
      {
        id: 6,
        nome: "Livro de Python",
        preco: 79.9,
        categoria: "livros",
        descricao: "Python para iniciantes",
      },
      {
        id: 7,
        nome: "Luminária",
        preco: 129.9,
        categoria: "casa",
        descricao: "Luminária de mesa",
      },
      {
        id: 8,
        nome: "Quadro Decorativo",
        preco: 199.9,
        categoria: "casa",
        descricao: "Quadro abstrato",
      },
    ];

    if (categoria) {
      return produtos.filter((p) => p.categoria === categoria);
    }
    return produtos;
  },

  getMockProduto(id) {
    const produtos = this.getMockProdutos();
    return produtos.find((p) => p.id === parseInt(id)) || null;
  },


  getSacolaFromLocalStorage() {
    const sacola = localStorage.getItem("sacola");
    if (sacola) {
      return JSON.parse(sacola);
    }
    return { itens: [], subtotal: 0, frete: 0, desconto: 0, total: 0 };
  },

  saveSacolaToLocalStorage(sacola) {
    localStorage.setItem("sacola", JSON.stringify(sacola));
  },

  async addItemToLocalStorage(produtoId, quantidade) {
    const sacola = this.getSacolaFromLocalStorage();
    const produto = await this.buscarProduto(produtoId);

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const itemExistente = sacola.itens.find(
      (item) => item.produtoId === produtoId
    );

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      sacola.itens.push({
        id: Date.now(),
        produtoId,
        nome: produto.nome,
        preco: produto.preco,
        quantidade,
      });
    }

    this.recalcularSacola(sacola);
    this.saveSacolaToLocalStorage(sacola);
    return sacola;
  },

  removeItemFromLocalStorage(itemId) {
    const sacola = this.getSacolaFromLocalStorage();
    sacola.itens = sacola.itens.filter((item) => item.id !== parseInt(itemId));
    this.recalcularSacola(sacola);
    this.saveSacolaToLocalStorage(sacola);
    return sacola;
  },

  updateItemInLocalStorage(itemId, quantidade) {
    const sacola = this.getSacolaFromLocalStorage();
    const item = sacola.itens.find((item) => item.id === parseInt(itemId));

    if (item) {
      item.quantidade = quantidade;
      this.recalcularSacola(sacola);
      this.saveSacolaToLocalStorage(sacola);
    }

    return sacola;
  },

  recalcularSacola(sacola) {
    sacola.subtotal = sacola.itens.reduce((total, item) => {
      return total + item.preco * item.quantidade;
    }, 0);

    sacola.frete = sacola.subtotal > 0 ? 15.0 : 0;

    sacola.total = sacola.subtotal + sacola.frete - (sacola.desconto || 0);
  },

  validateCupomLocally(codigo, regiao = "sudeste") {
    const cuponsValidos = {
      DESC10: { desconto: 10, tipo: "percentual" },
      DESC20: { desconto: 20, tipo: "percentual" },
      FRETE: { desconto: 15, tipo: "fixo" },
    };

    const cupom = cuponsValidos[codigo.toUpperCase()];

    if (!cupom) {
      throw new Error("Cupom inválido");
    }

    const sacola = this.getSacolaFromLocalStorage();
    const items = sacola.itens || sacola.items || [];

    const subtotal = items.reduce((total, item) => {
      return (
        total +
        parseFloat(item.price || item.preco || 0) *
          (item.qty || item.quantidade || 0)
      );
    }, 0);

    const FRETE_POR_REGIAO = {
      norte: 35,
      nordeste: 30,
      "centro-oeste": 28,
      sudeste: 20,
      sul: 25,
    };
    const FRETE_MINIMO = 200;
    const freight =
      subtotal >= FRETE_MINIMO
        ? 0
        : FRETE_POR_REGIAO[regiao] || FRETE_POR_REGIAO.sudeste;

    let discount = 0;
    if (cupom.tipo === "percentual") {
      discount = subtotal * (cupom.desconto / 100);
    } else {
      discount = cupom.desconto;
    }

    const total = subtotal + freight - discount;

    return {
      valido: true,
      cupom: {
        codigo: codigo.toUpperCase(),
        tipo: cupom.tipo,
        desconto: cupom.desconto,
      },
      totais: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        freight: parseFloat(freight.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    };
  },
};

if (typeof window !== "undefined") {
  window.API = API;
}

