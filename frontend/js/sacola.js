console.log("[Sacola] Página carregada");

const userInfoEl = document.getElementById("user-info");
const userEmailEl = document.getElementById("user-email");
const logoutButton = document.getElementById("logoutButton");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const sacolaContainer = document.getElementById("sacola-container");
const sacolaItensEl = document.getElementById("sacola-itens");
const sacolaVaziaEl = document.getElementById("sacola-vazia");
const subtotalEl = document.getElementById("subtotal");
const freteEl = document.getElementById("frete");
const descontoEl = document.getElementById("desconto");
const descontoLinhaEl = document.getElementById("desconto-linha");
const totalEl = document.getElementById("total");
const cupomInput = document.getElementById("cupom");
const aplicarCupomBtn = document.getElementById("aplicarCupom");
const cupomFeedback = document.getElementById("cupom-feedback");
const cepInput = document.getElementById("cep");
const calcularFreteBtn = document.getElementById("calcularFrete");
const freteInfo = document.getElementById("frete-info");

let sacolaAtual = null;


function obterRegiaoPorCep(cep) {
  const cepNumerico = cep.replace(/\D/g, "");

  if (cepNumerico.length !== 8) {
    throw new Error("CEP inválido");
  }

  const prefixo = parseInt(cepNumerico.substring(0, 2));

  if (
    (prefixo >= 69 && prefixo <= 69) ||
    (prefixo >= 68 && prefixo <= 68) ||
    (prefixo >= 76 && prefixo <= 76) ||
    (prefixo >= 77 && prefixo <= 77)
  ) {
    return "norte";
  }

  if (
    (prefixo >= 40 && prefixo <= 48) ||
    (prefixo >= 60 && prefixo <= 63) ||
    (prefixo >= 65 && prefixo <= 65) ||
    (prefixo >= 58 && prefixo <= 58) ||
    (prefixo >= 50 && prefixo <= 54) ||
    (prefixo >= 64 && prefixo <= 64) ||
    (prefixo >= 59 && prefixo <= 59) ||
    (prefixo >= 49 && prefixo <= 49) ||
    (prefixo >= 57 && prefixo <= 57)
  ) {
    return "nordeste";
  }

  if (
    (prefixo >= 70 && prefixo <= 73) ||
    (prefixo >= 74 && prefixo <= 76) ||
    (prefixo >= 78 && prefixo <= 78) ||
    (prefixo >= 79 && prefixo <= 79)
  ) {
    return "centro-oeste";
  }

  if (
    (prefixo >= 1 && prefixo <= 19) ||
    (prefixo >= 20 && prefixo <= 28) ||
    (prefixo >= 30 && prefixo <= 39) ||
    (prefixo >= 29 && prefixo <= 29)
  ) {
    return "sudeste";
  }

  if (
    (prefixo >= 80 && prefixo <= 87) ||
    (prefixo >= 88 && prefixo <= 89) ||
    (prefixo >= 90 && prefixo <= 99)
  ) {
    return "sul";
  }

  return "sudeste";
}


function formatarCep(valor) {
  valor = valor.replace(/\D/g, "");

  valor = valor.substring(0, 8);

  if (valor.length > 5) {
    valor = valor.substring(0, 5) + "-" + valor.substring(5);
  }

  return valor;
}


async function calcularFretePorCep() {
  try {
    const cep = cepInput.value.trim();

    if (!cep) {
      freteInfo.textContent = "Por favor, informe um CEP";
      freteInfo.style.color = "#dc3545";
      return;
    }

    const cepNumerico = cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      freteInfo.textContent = "CEP inválido. Use o formato 00000-000";
      freteInfo.style.color = "#dc3545";
      return;
    }

    calcularFreteBtn.disabled = true;
    calcularFreteBtn.textContent = "Calculando...";
    freteInfo.textContent = "Calculando frete...";
    freteInfo.style.color = "#666";

    const regiao = obterRegiaoPorCep(cep);

    localStorage.setItem("cep_entrega", cep);
    localStorage.setItem("frete_calculado", "true");

    await carregarSacola(regiao);

    const cupomSalvo = localStorage.getItem("cupom_aplicado");
    if (cupomSalvo) {
      await reaplicarCupom(cupomSalvo, regiao);
    }

    const valores = {
      norte: "R$ 35,00",
      nordeste: "R$ 30,00",
      "centro-oeste": "R$ 28,00",
      sudeste: "R$ 20,00",
      sul: "R$ 25,00",
    };

    const nomeRegiao = {
      norte: "Norte",
      nordeste: "Nordeste",
      "centro-oeste": "Centro-Oeste",
      sudeste: "Sudeste",
      sul: "Sul",
    };

    freteInfo.textContent = `Região ${nomeRegiao[regiao]} - Frete: ${valores[regiao]} | Frete grátis acima de R$ 200,00`;
    freteInfo.style.color = "#28a745";
  } catch (error) {
    console.error("[Sacola] Erro ao calcular frete:", error);
    freteInfo.textContent = error.message || "Erro ao calcular frete";
    freteInfo.style.color = "#dc3545";
  } finally {
    calcularFreteBtn.disabled = false;
    calcularFreteBtn.textContent = "Calcular Frete";
  }
}


async function inicializarSacola() {
  try {
    if (!Auth.requireAuth()) {
      return;
    }

    const userEmail = Auth.getUser();
    userEmailEl.textContent = userEmail;
    userInfoEl.style.display = "flex";

    console.log("[Sacola] Carregando sacola para:", userEmail);

    loadingEl.style.display = "block";
    errorEl.style.display = "none";
    sacolaContainer.style.display = "none";
    sacolaVaziaEl.style.display = "none";

    await carregarSacola();
  } catch (error) {
    console.error("[Sacola] Erro ao inicializar:", error);
    loadingEl.style.display = "none";
    errorEl.textContent = error.message;
    errorEl.style.display = "block";
  }
}


async function carregarSacola(regiao = null) {
  try {
    if (!regiao) {
      regiao = "sudeste";
    }

    const cepSalvo = localStorage.getItem("cep_entrega");
    if (cepSalvo) {
      cepInput.value = cepSalvo;
    }

    const sacola = await API.buscarSacola(regiao);
    sacolaAtual = sacola;

    loadingEl.style.display = "none";

    const items = sacola.items || sacola.itens || [];

    if (items.length === 0) {
      sacolaVaziaEl.style.display = "block";
      sacolaContainer.style.display = "none";
      return;
    }

    sacolaVaziaEl.style.display = "none";
    sacolaContainer.style.display = "block";
    renderizarSacola(sacola);
  } catch (error) {
    throw error;
  }
}


function renderizarSacola(sacola) {
  const items = sacola.items || sacola.itens || [];

  sacolaItensEl.innerHTML = items
    .map((item) => {
      const itemId = item.productId || item.produto_id || item.id;
      const itemName = item.name || item.nome;
      const itemPrice = item.price || item.preco;
      const itemQty = item.qty || item.quantidade;
      const itemImagem = item.image || item.imagem;

      return `
        <div class="sacola-item" data-item-id="${itemId}">
           <div class="produto-imagem">
                ${
                  itemImagem
                    ? `<img src="${itemImagem}" alt="${itemName}" onerror="this.src='img/noimage.png'">`
                    : '<img src="img/noimage.png" alt="Sem imagem">'
                }
            </div>
            <div class="sacola-item-info">
                <h3>${itemName}</h3>
                <p>Preço unitário: R$ ${parseFloat(itemPrice).toFixed(2)}</p>
                <p>Quantidade: ${itemQty}</p>
            </div>
            <div class="sacola-item-acoes">
                <p class="preco">R$ ${(parseFloat(itemPrice) * itemQty).toFixed(
                  2
                )}</p>
                <div class="quantidade">
                    <label for="qtd-${itemId}">Qtd:</label>
                    <input 
                        type="number" 
                        id="qtd-${itemId}" 
                        value="${itemQty}" 
                        min="1" 
                        style="width: 60px; padding: 0.25rem; border: 1px solid #000;"
                        onchange="atualizarQuantidade(${itemId}, this.value)"
                    >
                </div>
                <button class="btn btn-secondary" onclick="removerItem(${itemId})">Remover</button>
            </div>
        </div>
    `;
    })
    .join("");

  atualizarResumo(sacola);
}


function atualizarResumo(sacola) {
  const subtotal = sacola.subtotal || 0;
  const freight =
    sacola.freight !== undefined ? sacola.freight : sacola.frete || 0;
  const discount =
    sacola.discount !== undefined ? sacola.discount : sacola.desconto || 0;
  const total = sacola.total || 0;

  subtotalEl.textContent = `R$ ${parseFloat(subtotal).toFixed(2)}`;
  totalEl.textContent = `R$ ${parseFloat(total).toFixed(2)}`;

  const freteCalculado = localStorage.getItem("frete_calculado");
  const freteLinhaEl = document.getElementById("frete-linha");

  if (freteCalculado === "true") {
    if (freight > 0) {
      freteEl.textContent = `R$ ${parseFloat(freight).toFixed(2)}`;
      freteEl.style.color = "#333";
    } else {
      freteEl.textContent = "Grátis";
      freteEl.style.color = "#008000";
    }
    freteLinhaEl.style.display = "flex";
  } else {
    freteLinhaEl.style.display = "none";
  }

  if (discount && discount > 0) {
    descontoEl.textContent = `- R$ ${parseFloat(discount).toFixed(2)}`;
    descontoLinhaEl.style.display = "flex";
  } else {
    descontoLinhaEl.style.display = "none";
  }
}


async function atualizarQuantidade(itemId, novaQuantidade) {
  try {
    novaQuantidade = parseInt(novaQuantidade);

    if (novaQuantidade < 1) {
      alert("Quantidade mínima é 1");
      await carregarSacola();
      return;
    }

    console.log("[Sacola] Atualizando quantidade:", itemId, novaQuantidade);

    localStorage.removeItem("frete_calculado");
    localStorage.removeItem("cupom_aplicado");

    const response = await API.atualizarQuantidade(itemId, novaQuantidade);
    const sacola = response.sacola || response;
    sacolaAtual = sacola;
    renderizarSacola(sacola);
  } catch (error) {
    console.error("[Sacola] Erro ao atualizar quantidade:", error);
    alert(`Erro ao atualizar quantidade: ${error.message}`);
    await carregarSacola();
  }
}


async function removerItem(itemId) {
  try {
    if (!confirm("Deseja realmente remover este item?")) {
      return;
    }

    console.log("[Sacola] Removendo item:", itemId);

    await API.removerItem(itemId);

    localStorage.removeItem("frete_calculado");
    localStorage.removeItem("cupom_aplicado");

    await carregarSacola();
  } catch (error) {
    console.error("[Sacola] Erro ao remover item:", error);
    alert(`Erro ao remover item: ${error.message}`);
  }
}


async function aplicarCupom() {
  try {
    const codigo = cupomInput.value.trim().toUpperCase();

    if (!codigo) {
      throw new Error("Digite um código de cupom");
    }

    let regiao = "sudeste";
    const cepSalvo = localStorage.getItem("cep_entrega");
    if (cepSalvo) {
      try {
        regiao = obterRegiaoPorCep(cepSalvo);
      } catch (e) {
        console.warn("[Sacola] Erro ao obter região do CEP, usando padrão");
      }
    }

    console.log("[Sacola] Aplicando cupom:", codigo, "região:", regiao);

    aplicarCupomBtn.disabled = true;
    aplicarCupomBtn.textContent = "Aplicando...";
    cupomFeedback.style.display = "none";

    const resultado = await API.aplicarCupom(codigo, regiao);

    if (resultado.valido || resultado.cupom) {
      const cupomInfo = resultado.cupom || resultado;
      const totais = resultado.totais || resultado;

      localStorage.setItem("cupom_aplicado", codigo);

      sacolaAtual.subtotal = totais.subtotal;
      sacolaAtual.freight = totais.freight;
      sacolaAtual.frete = totais.freight;
      sacolaAtual.discount = totais.discount;
      sacolaAtual.desconto = totais.discount;
      sacolaAtual.total = totais.total;

      atualizarResumo(sacolaAtual);

      cupomFeedback.textContent = `Cupom aplicado! Desconto de ${
        cupomInfo.tipo === "percentual"
          ? cupomInfo.desconto + "%"
          : "R$ " + parseFloat(cupomInfo.desconto).toFixed(2)
      }`;
      cupomFeedback.className = "success";
      cupomFeedback.style.display = "block";

      cupomInput.value = "";
    }
  } catch (error) {
    console.error("[Sacola] Erro ao aplicar cupom:", error);
    cupomFeedback.textContent = error.message;
    cupomFeedback.className = "error";
    cupomFeedback.style.display = "block";
  } finally {
    aplicarCupomBtn.disabled = false;
    aplicarCupomBtn.textContent = "Aplicar";
  }
}


async function reaplicarCupom(codigo, regiao) {
  try {
    console.log("[Sacola] Reaplicando cupom:", codigo, "região:", regiao);

    const resultado = await API.aplicarCupom(codigo, regiao);

    if (resultado.valido || resultado.cupom) {
      const totais = resultado.totais || resultado;

      sacolaAtual.subtotal = totais.subtotal;
      sacolaAtual.freight = totais.freight;
      sacolaAtual.frete = totais.freight;
      sacolaAtual.discount = totais.discount;
      sacolaAtual.desconto = totais.discount;
      sacolaAtual.total = totais.total;

      atualizarResumo(sacolaAtual);
    }
  } catch (error) {
    console.error("[Sacola] Erro ao reaplicar cupom:", error);
    localStorage.removeItem("cupom_aplicado");
  }
}

logoutButton.addEventListener("click", () => {
  if (confirm("Deseja realmente sair?")) {
    Auth.logout();
  }
});

aplicarCupomBtn.addEventListener("click", aplicarCupom);
calcularFreteBtn.addEventListener("click", calcularFretePorCep);

cepInput.addEventListener("input", (e) => {
  e.target.value = formatarCep(e.target.value);
});

cepInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    calcularFretePorCep();
  }
});

window.atualizarQuantidade = atualizarQuantidade;
window.removerItem = removerItem;

document.addEventListener("DOMContentLoaded", inicializarSacola);

