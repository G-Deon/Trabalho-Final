console.log("[Produtos] Página carregada");

let produtosCache = [];
const SKELETON_COUNT = 8;

const filterForm = document.getElementById("filterForm");
const produtosLista = document.getElementById("produtos-lista");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

function toggleLoading(isVisible) {
  loadingEl.classList.toggle("is-visible", isVisible);
  loadingEl.setAttribute("aria-hidden", String(!isVisible));
}

function toggleError(message = "") {
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
    errorEl.setAttribute("aria-hidden", "false");
    return;
  }

  errorEl.textContent = "";
  errorEl.classList.remove("is-visible");
  errorEl.setAttribute("aria-hidden", "true");
}

function mostrarSkeletons(count = SKELETON_COUNT) {
  const skeletonCard = `
    <article class="produto-card skeleton" aria-hidden="true">
      <div class="skeleton-box"></div>
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
      <div class="skeleton-line skeleton-price"></div>
      <div class="skeleton-line skeleton-btn"></div>
    </article>
  `;

  produtosLista.innerHTML = new Array(count).fill(skeletonCard).join("");
}


async function carregarProdutos() {
  try {
    console.log("[Produtos] Carregando produtos...");
    toggleLoading(true);
    toggleError();
    mostrarSkeletons();

    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria") || "";

    const produtos = await API.listarProdutos({ categoria });
    produtosCache = produtos;

    toggleLoading(false);

    if (produtos.length === 0) {
      produtosLista.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    renderizarProdutos(produtos);
  } catch (error) {
    console.error("[Produtos] Erro ao carregar produtos:", error);
    toggleLoading(false);
    toggleError(error.message || "Não foi possível carregar os produtos.");
    produtosLista.innerHTML = "";
  }
}


function renderizarProdutos(produtos) {
  produtosLista.innerHTML = produtos
    .map(
      (produto) => `
        <article class="produto-card">
            <div class="produto-imagem">
                ${
                  produto.imagem
                    ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='img/noimage.png'">`
                    : '<img src="img/noimage.png" alt="Sem imagem">'
                }
            </div>
            <h3>${produto.nome}</h3>
            <p class="categoria">${produto.categoria}</p>
            <p>${produto.descricao}</p>
            <p class="preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
            <a href="detalhes.html?id=${
              produto.id
            }" class="btn">Ver Detalhes</a>
        </article>
    `
    )
    .join("");
}


filterForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(filterForm);
  const categoria = formData.get("categoria");

  const url = new URL(window.location);
  if (categoria) {
    url.searchParams.set("categoria", categoria);
  } else {
    url.searchParams.delete("categoria");
  }
  window.history.pushState({}, "", url);

  carregarProdutos();
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria");

  if (categoria) {
    document.getElementById("categoria").value = categoria;
  }

  carregarProdutos();
});

