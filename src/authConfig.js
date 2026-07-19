// ─────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO LOGIN COM GOOGLE
// ─────────────────────────────────────────────────────────────────────────
// Este app usa o Google Identity Services (GIS), a forma oficial e atual
// do Google para login web — sem precisar instalar nenhuma biblioteca,
// ele carrega https://accounts.google.com/gsi/client diretamente.
//
// O Client ID abaixo já é o seu, copiado do Google Cloud Console:
export const GOOGLE_CLIENT_ID =
  "90419304365-eqtlgu03c3vp8vbjrtgffdme2v2ap5t2.apps.googleusercontent.com";

// ─────────────────────────────────────────────────────────────────────────
// IMPORTANTE — domínios autorizados
// ─────────────────────────────────────────────────────────────────────────
// O Google só permite o login a partir de domínios que você cadastrou
// nesse Client ID. Para o botão real funcionar em produção:
//
// 1. Acesse https://console.cloud.google.com/apis/credentials
// 2. Abra o seu ID do cliente OAuth (o mesmo do GOOGLE_CLIENT_ID acima)
// 3. Em "Origens JavaScript autorizadas", adicione o domínio onde o
//    app vai rodar de verdade, por exemplo:
//      http://localhost:5173 (para testar no seu computador)
//      https://feward.feward295.workers.dev 
// 4. Salve. Pode levar alguns minutos para propagar.
//
// Enquanto o app estiver rodando num domínio de pré-visualização (como
// aqui no Claude), o Google vai recusar o login com erro
// "origin_mismatch" — isso é esperado e não é um bug do código. Quando
// publicar no seu domínio cadastrado, o botão funciona normalmente e
// devolve o nome, e-mail e foto reais da conta Google do usuário.
// ─────────────────────────────────────────────────────────────────────────

export const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Decodifica o JWT (credential) que o Google devolve após o login.
// Não precisa de nenhuma lib extra — é só um base64url padrão.
export function decodeGoogleCredential(credential) {
  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    const payload = JSON.parse(json);
    return {
      name: payload.name,
      email: payload.email,
      avatarUrl: payload.picture,
      googleId: payload.sub,
    };
  } catch (err) {
    console.error("Não foi possível ler os dados da conta Google:", err);
    return null;
  }
}
