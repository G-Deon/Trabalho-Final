console.log("[App] E-commerce carregado");

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined" && Auth.isAuthenticated()) {
    const user = Auth.getUser();
    console.log("[App] Usuário logado:", user);

    const nav = document.querySelector("header nav ul");
    if (nav) {
      const loginLink = nav.querySelector('a[href="login.html"]');

      if (loginLink) {
        const loginLi = loginLink.parentElement;
        loginLi.innerHTML = `<a href="#" id="logout-link" style="cursor: pointer;">Sair</a>`;

        const logoutLink = document.getElementById("logout-link");
        if (logoutLink) {
          logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Deseja realmente sair?")) {
              Auth.logout();
            }
          });
        }
      }

      if (!document.getElementById("user-status")) {
        const userInfo = document.createElement("li");
        userInfo.id = "user-status";
        userInfo.innerHTML = `<span style="color: #fff;">Olá, ${user}</span>`;
        nav.insertBefore(userInfo, nav.lastElementChild);
      }
    }
  }
});

