import { useState, useEffect, useRef, useCallback } from "react";
import { User, Lock, Eye, EyeOff, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { GOOGLE_CLIENT_ID, GOOGLE_SCRIPT_SRC, decodeGoogleCredential } from "./authConfig.js";

function FewardMark({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="fmark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#5e3fe0" />
        </linearGradient>
      </defs>
      <path
        d="M40 8h32c3 0 4.6 3.6 2.6 5.9L58 33c-1.1 1.3-2.7 2-4.4 2H40V8z"
        fill="url(#fmark)"
      />
      <path
        d="M30 33h26v22H42c-1.7 0-3.3.7-4.4 2L20.6 78.9C18.6 81.2 20.2 84.8 23.2 84.8H30V33z"
        fill="url(#fmark)"
        opacity="0.92"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7a5.4 5.4 0 010-3.4V4.97H.96a9 9 0 000 8.06l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 00.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="#fff">
      <path d="M13.9 9.04c.02 2.18 1.9 2.9 1.92 2.91-.02.06-.3 1.03-1 2.03-.6.87-1.22 1.73-2.2 1.75-.96.02-1.27-.57-2.37-.57s-1.45.55-2.36.59c-.95.04-1.67-.94-2.27-1.8-1.24-1.78-2.18-5.04-.91-7.24a3.53 3.53 0 012.97-1.8c.93-.02 1.8.62 2.37.62.56 0 1.62-.77 2.74-.66.47.02 1.78.19 2.62 1.44-.07.04-1.56.92-1.54 2.73zM11.94 2.5c.5-.6.84-1.45.75-2.3-.72.03-1.6.48-2.12 1.08-.46.53-.87 1.4-.76 2.21.79.06 1.6-.4 2.13-.99z" />
    </svg>
  );
}

const FIELD_BG = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "var(--bg-elev)",
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: "16px 18px",
};

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [googleStatus, setGoogleStatus] = useState("loading"); // loading | ready | unavailable
  const googleBtnRef = useRef(null);

  const handleGoogleCredential = useCallback(
    (response) => {
      const account = decodeGoogleCredential(response.credential);
      if (!account) {
        setError("Não foi possível ler os dados da sua conta Google. Tente novamente.");
        return;
      }
      onAuthenticated({
        name: account.name,
        email: account.email,
        avatarUrl: account.avatarUrl,
        provider: "google",
      });
    },
    [onAuthenticated]
  );

  useEffect(() => {
    let cancelled = false;

    function renderRealButton() {
      if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: 360,
          text: "continue_with",
          locale: "pt-BR",
        });
        setGoogleStatus("ready");
      } catch (err) {
        // Domínio não autorizado para este Client ID, ou outro erro do GIS.
        console.warn("Login com Google indisponível neste domínio:", err);
        setGoogleStatus("unavailable");
      }
    }

    if (window.google?.accounts?.id) {
      renderRealButton();
      return;
    }

    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", renderRealButton);
      return () => existing.removeEventListener("load", renderRealButton);
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderRealButton;
    script.onerror = () => setGoogleStatus("unavailable");
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [handleGoogleCredential]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      if (!form.identifier.trim() || !form.password) {
        setError("Preencha usuário/e-mail e senha.");
        return;
      }
      onAuthenticated({ name: form.identifier.trim() });
    } else {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Preencha nome, e-mail e senha.");
        return;
      }
      if (form.password.length < 6) {
        setError("A senha precisa ter pelo menos 6 caracteres.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("As senhas não coincidem.");
        return;
      }
      onAuthenticated({ name: form.name.trim(), email: form.email.trim() });
    }
  }

  function handleAppleSocial() {
    onAuthenticated({ name: "Conta Apple", provider: "apple" });
  }

  function handleDemoGoogle() {
    onAuthenticated({
      name: "Conta Google (demo)",
      email: "demo@gmail.com",
      provider: "google-demo",
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      <div style={styles.card}>
        <div style={styles.brand}>
          <FewardMark size={80} />
          <h1 style={styles.wordmark}>feward</h1>
          <p style={styles.tagline}>
            <span style={{ color: "var(--purple-light)" }}>conexões reais.</span>
            <br />
            vida real.
          </p>
        </div>

        <div style={styles.headingBlock}>
          <h2 style={styles.heading}>
            {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h2>
          <p style={styles.subheading}>
            {mode === "login"
              ? "Faça login para continuar conectando com pessoas reais."
              : "Leva menos de um minuto pra começar a se conectar de verdade."}
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label style={FIELD_BG}>
              <User size={18} color="var(--purple-light)" />
              <input
                style={styles.input}
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          {mode === "login" ? (
            <label style={FIELD_BG}>
              <User size={18} color="var(--purple-light)" />
              <input
                style={styles.input}
                placeholder="Usuário, e-mail ou telefone"
                value={form.identifier}
                onChange={(e) => update("identifier", e.target.value)}
                autoComplete="username"
              />
            </label>
          ) : (
            <label style={FIELD_BG}>
              <Mail size={18} color="var(--purple-light)" />
              <input
                style={styles.input}
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
              />
            </label>
          )}

          <label style={FIELD_BG}>
            <Lock size={18} color="var(--purple-light)" />
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>

          {mode === "signup" && (
            <label style={FIELD_BG}>
              <Lock size={18} color="var(--purple-light)" />
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}

          {mode === "login" && (
            <div style={styles.forgotRow}>
              <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
                Esqueceu sua senha?
              </a>
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerWord}>ou</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.googleSlot}>
          {/* O Google renderiza o botão oficial dentro desta div quando o domínio está autorizado */}
          <div
            ref={googleBtnRef}
            style={{
              display: googleStatus === "ready" ? "flex" : "none",
              justifyContent: "center",
              marginBottom: 12,
            }}
          />
          {googleStatus !== "ready" && (
            <button style={styles.socialBtn} onClick={handleDemoGoogle}>
              <GoogleIcon />
              Continuar com Google
            </button>
          )}
          {googleStatus === "unavailable" && (
            <p style={styles.googleNotice}>
              <AlertCircle size={13} />
              Login real com Google fica disponível assim que o app for
              publicado no domínio cadastrado no Google Cloud Console.
              Usando modo de demonstração por enquanto.
            </p>
          )}
        </div>

        <button style={styles.socialBtn} onClick={handleAppleSocial}>
          <AppleIcon />
          Continuar com Apple
        </button>

        <p style={styles.switchRow}>
          {mode === "login" ? (
            <>
              Ainda não tem uma conta?{" "}
              <a
                href="#"
                style={styles.linkStrong}
                onClick={(e) => {
                  e.preventDefault();
                  setError("");
                  setMode("signup");
                }}
              >
                Criar conta
              </a>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <a
                href="#"
                style={styles.linkStrong}
                onClick={(e) => {
                  e.preventDefault();
                  setError("");
                  setMode("login");
                }}
              >
                Entrar
              </a>
            </>
          )}
        </p>

        <p style={styles.trustRow}>
          <ShieldCheck size={15} color="var(--purple-light)" />
          Seus dados estão protegidos conosco.{" "}
          <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
            Saiba mais
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 20px",
    position: "relative",
    overflow: "hidden",
  },
  glowTopLeft: {
    position: "absolute",
    top: -160,
    left: -160,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,92,252,0.35), transparent 70%)",
    pointerEvents: "none",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -180,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.22), transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  brand: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 },
  wordmark: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 44,
    margin: "8px 0 6px",
    color: "var(--ink)",
  },
  tagline: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.35,
    textAlign: "center",
    margin: 0,
    color: "var(--ink)",
  },
  headingBlock: { marginBottom: 18, textAlign: "left" },
  heading: { fontSize: 23, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" },
  subheading: { fontSize: 14.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 },
  errorBox: {
    background: "rgba(251,113,133,0.12)",
    border: "1px solid rgba(251,113,133,0.4)",
    color: "var(--red)",
    fontSize: 13.5,
    padding: "10px 14px",
    borderRadius: 10,
    marginBottom: 14,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--ink)",
    fontSize: 15,
    width: "100%",
  },
  eyeBtn: {
    border: "none",
    background: "transparent",
    color: "var(--purple-light)",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
  },
  forgotRow: { display: "flex", justifyContent: "flex-end", marginTop: -4 },
  link: { color: "var(--purple-light)", fontSize: 13.5, textDecoration: "none" },
  linkStrong: { color: "var(--purple-light)", fontWeight: 700, textDecoration: "none" },
  submitBtn: {
    marginTop: 4,
    background: "linear-gradient(135deg, #8b6bf7, var(--purple-dark))",
    color: "var(--white)",
    border: "none",
    borderRadius: 14,
    padding: "16px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 16px 30px -12px var(--purple-glow)",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "22px 0" },
  dividerLine: { flex: 1, height: 1, background: "var(--line)" },
  dividerWord: { fontSize: 12.5, color: "var(--muted)" },
  googleSlot: { display: "flex", flexDirection: "column" },
  googleNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    fontSize: 11.5,
    lineHeight: 1.5,
    color: "var(--muted)",
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "9px 11px",
    margin: "-2px 0 12px",
  },
  socialBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    fontSize: 14.5,
    fontWeight: 600,
    padding: "14px",
    borderRadius: 14,
    cursor: "pointer",
    marginBottom: 12,
  },
  switchRow: {
    textAlign: "center",
    fontSize: 14,
    color: "var(--ink-soft)",
    margin: "10px 0 18px",
  },
  trustRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
    fontSize: 12.5,
    color: "var(--muted)",
    margin: 0,
    textAlign: "center",
  },
};
