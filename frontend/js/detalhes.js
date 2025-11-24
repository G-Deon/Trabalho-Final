console.log("[Detalhes] Página carregada");

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const detalhesEl = document.getElementById("produto-detalhes");

let produtoAtual = null;


async function carregarProduto() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      throw new Error("ID do produto não encontrado na URL");
    }

    console.log("[Detalhes] Carregando produto:", id);
    loadingEl.style.display = "block";
    errorEl.style.display = "none";
    detalhesEl.style.display = "none";

    const produto = await API.buscarProduto(id);

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    produtoAtual = produto;
    loadingEl.style.display = "none";
    detalhesEl.style.display = "grid";

    renderizarDetalhes(produto);
  } catch (error) {
    console.error("[Detalhes] Erro ao carregar produto:", error);
    loadingEl.style.display = "none";
    errorEl.textContent = error.message;
    errorEl.style.display = "block";
  }
}


function renderizarDetalhes(produto) {
  detalhesEl.innerHTML = `
        <div class="produto-imagem">
            ${
              produto.imagem
                ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='img/noimage.png'">`
                : '<img src="img/noimage.png" alt="Sem imagem">'
            }
        </div>
        <div class="produto-info">
            <h2>${produto.nome}</h2>
            <span class="categoria">${produto.categoria}</span>
            <p class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
            <p class="descricao">${produto.descricao}</p>
            
            <div class="quantidade-selector">
                <label for="quantidade">Quantidade:</label>
                <input 
                    type="number" 
                    id="quantidade" 
                    name="quantidade" 
                    min="1" 
                    value="1"
                    aria-label="Quantidade do produto"
                >
            </div>
            
            <button id="addToCart" class="btn">Adicionar à Sacola</button>
            
            <div id="add-feedback" class="success" style="display: none; margin-top: 1rem;">
                Produto adicionado à sacola!
            </div>
            </div>
        </div>
    `;

  document
    .getElementById("addToCart")
    .addEventListener("click", adicionarASacola);
}


async function adicionarASacola() {
  try {
    const quantidadeInput = document.getElementById("quantidade");
    const quantidade = parseInt(quantidadeInput.value) || 1;
    const button = document.getElementById("addToCart");
    const feedback = document.getElementById("add-feedback");

    if (!Auth.isAuthenticated()) {
      if (
        confirm(
          "Você precisa fazer login para adicionar produtos à sacola. Deseja fazer login agora?"
        )
      ) {
        window.location.href = "login.html";
      }
      return;
    }

    console.log(
      "[Detalhes] Adicionando produto à sacola:",
      produtoAtual.id,
      "quantidade:",
      quantidade
    );

    button.disabled = true;
    button.textContent = "Adicionando...";

    await API.adicionarItem(produtoAtual.id, quantidade);

    feedback.style.display = "block";
    button.textContent = "Adicionado!";

    setTimeout(() => {
      button.disabled = false;
      button.textContent = "Adicionar à Sacola";
      feedback.style.display = "none";
      quantidadeInput.value = 1;
    }, 2000);
  } catch (error) {
    console.error("[Detalhes] Erro ao adicionar à sacola:", error);
    alert(`Erro ao adicionar produto: ${error.message}`);

    const button = document.getElementById("addToCart");
    button.disabled = false;
    button.textContent = "Adicionar à Sacola";
  }
}

document.addEventListener("DOMContentLoaded", carregarProduto);

