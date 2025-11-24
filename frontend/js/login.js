console.log("[Login] Página carregada");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const errorEl = document.getElementById("error");
const successEl = document.getElementById("success");
const loginButton = document.getElementById("loginButton");


loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const email = emailInput.value.trim();

    if (!email) {
      throw new Error("Por favor, informe seu e-mail");
    }

    if (!Auth.isValidEmail(email)) {
      throw new Error("Por favor, informe um e-mail válido");
    }

    console.log("[Login] Tentando fazer login com:", email);

    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";
    errorEl.style.display = "none";
    successEl.style.display = "none";

    await Auth.login(email);

    successEl.textContent = "Login realizado com sucesso! Redirecionando...";
    successEl.style.display = "block";

    console.log("[Login] Login realizado com sucesso");

    setTimeout(() => {
      window.location.href = "sacola.html";
    }, 1000);
  } catch (error) {
    console.error("[Login] Erro no login:", error);
    errorEl.textContent = error.message;
    errorEl.style.display = "block";
    successEl.style.display = "none";

    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isAuthenticated()) {
    console.log("[Login] Usuário já autenticado, redirecionando...");
    window.location.href = "sacola.html";
  }
});

