
const Auth = {
  TOKEN_KEY: "ecommerce_token",
  USER_KEY: "ecommerce_user",

  
  generateToken(email) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        email: email,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    );
    const signature = btoa(email + Date.now());

    return `${header}.${payload}.${signature}`;
  },

  
  async login(email) {
    console.log("[Auth] Solicitando token para:", email);

    try {
      const response = await fetch("http://localhost:3002/sacola/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: email,
          senha: "senha123",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao obter token do servidor");
      }

      const data = await response.json();
      const token = data.token;

      console.log("[Auth] Token obtido com sucesso");
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, email);

      localStorage.removeItem("sacola");
      console.log("[Auth] localStorage da sacola limpo para novo usuário");

      return token;
    } catch (error) {
      console.error("[Auth] Erro ao fazer login:", error);
      throw error;
    }
  },

  
  logout() {
    console.log("[Auth] Logout realizado");
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem("sacola");
    window.location.href = "login.html";
  },

  
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  
  getUser() {
    return localStorage.getItem(this.USER_KEY);
  },

  
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const agora = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < agora) {
        console.log("[Auth] Token expirado");
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("[Auth] Erro ao validar token:", error);
      return false;
    }
  },

  
  requireAuth() {
    if (!this.isAuthenticated()) {
      console.log("[Auth] Usuário não autenticado, redirecionando para login");
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

if (typeof window !== "undefined") {
  window.Auth = Auth;
}

