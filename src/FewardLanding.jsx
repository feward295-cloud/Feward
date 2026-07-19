import { Heart, MessageCircle, Send, MapPin, ArrowRight } from "lucide-react";

const posts = [
  {
    user: "marina.costa",
    place: "Parque Ibirapuera",
    img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80",
    likes: 142,
  },
  {
    user: "grupo.trilha",
    place: "Serra Gaúcha",
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    likes: 318,
  },
  {
    user: "diego.h",
    place: "Cais Mauá",
    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80",
    likes: 89,
  },
];

const steps = [
  {
    label: "encontre",
    text: "Veja quem está perto e o que está rolando no seu bairro agora.",
  },
  {
    label: "combine",
    text: "Transforme uma curtida em convite. Marque o lugar, a hora, e pronto.",
  },
  {
    label: "viva",
    text: "Solte o celular no encontro. A próxima publicação é a lembrança, não a tela.",
  },
];

export default function FewardLanding() {
  return (
    <div style={s.page}>
      <header style={s.nav} className="fw-landing-nav">
        <div style={s.logo}>
          <span style={s.logoMark}>fw</span>
          <span style={s.logoWord}>feward</span>
        </div>
        <a href="#cta" style={s.navCta}>
          Entrar na lista
        </a>
      </header>

      <section style={s.hero} className="fw-landing-hero">
        <div style={s.heroText}>
          <span style={s.stamp}>sem filtro · 2026</span>
          <h1 style={s.heroTitle}>
            Conexões reais.
            <br />
            Vida real.
          </h1>
          <p style={s.heroSub}>
            O feward te mostra quem está por perto e te ajuda a transformar isso
            em algo que aconteça de verdade — fora da tela.
          </p>
          <div style={s.heroActions}>
            <a href="#cta" style={s.primaryBtn}>
              Quero entrar <ArrowRight size={16} />
            </a>
            <a href="#como-funciona" style={s.secondaryBtn}>
              Como funciona
            </a>
          </div>
        </div>

        <div style={s.phoneWrap} className="fw-landing-phone-wrap">
          <div style={s.phone}>
            <div style={s.phoneNotch} />
            <div style={s.phoneScreen}>
              <div style={s.phoneHeader}>
                <span style={s.phoneHeaderWord}>feward</span>
              </div>
              <div style={s.phoneFeed}>
                {posts.map((p) => (
                  <div key={p.user} style={s.card}>
                    <img src={p.img} alt="" style={s.cardImg} />
                    <div style={s.cardBody}>
                      <div style={s.cardTop}>
                        <span style={s.cardUser}>@{p.user}</span>
                      </div>
                      <div style={s.cardPlace}>
                        <MapPin size={11} /> {p.place}
                      </div>
                      <div style={s.cardActions}>
                        <span style={s.cardAction}>
                          <Heart size={14} /> {p.likes}
                        </span>
                        <span style={s.cardAction}>
                          <MessageCircle size={14} />
                        </span>
                        <span style={s.cardAction}>
                          <Send size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={s.tape} />
        </div>
      </section>

      <section id="como-funciona" style={s.steps}>
        <h2 style={s.stepsTitle}>Como funciona</h2>
        <div style={s.stepsGrid} className="fw-landing-steps-grid">
          {steps.map((step, i) => (
            <div key={step.label} style={s.stepCard}>
              <span style={s.stepLabel}>{step.label}</span>
              <p style={s.stepText}>{step.text}</p>
              {i < steps.length - 1 && <span style={s.stepArrow}>→</span>}
            </div>
          ))}
        </div>
      </section>

      <section id="cta" style={s.cta}>
        <div style={s.ctaCard} className="fw-landing-cta-card">
          <h2 style={s.ctaTitle}>Sua cidade tem gente real esperando.</h2>
          <p style={s.ctaSub}>
            Entre na lista de espera e seja avisado assim que o feward abrir na
            sua região.
          </p>
          <form style={s.ctaForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              style={s.ctaInput}
            />
            <button type="submit" style={s.primaryBtn}>
              Quero entrar <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      <footer style={s.footer}>
        <span>© 2026 feward — conexões reais, vida real.</span>
      </footer>
    </div>
  );
}

const s = {
  page: { background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "22px 24px",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    background: "linear-gradient(135deg, var(--purple-light), var(--purple-dark))",
    color: "var(--white)",
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  logoWord: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19 },
  navCta: {
    textDecoration: "none",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13.5,
    fontWeight: 600,
  },
  hero: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "40px 24px 80px",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: 48,
    alignItems: "center",
  },
  heroText: { maxWidth: 480 },
  stamp: {
    display: "inline-block",
    border: "1px solid var(--purple)",
    color: "var(--purple-light)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
    padding: "4px 10px",
    borderRadius: 999,
    transform: "rotate(-2deg)",
    marginBottom: 18,
  },
  heroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(40px, 6vw, 60px)",
    lineHeight: 1.04,
    margin: "0 0 18px",
    fontWeight: 600,
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.6,
    color: "var(--ink-soft)",
    margin: "0 0 28px",
  },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--purple)",
    color: "var(--white)",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14.5,
    padding: "13px 22px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--ink)",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14.5,
    padding: "13px 8px",
    borderBottom: "2px solid var(--ink)",
  },
  phoneWrap: { position: "relative", justifySelf: "center" },
  phone: {
    width: 300,
    height: 600,
    background: "var(--bg-elev-2)",
    borderRadius: 42,
    padding: 12,
    boxShadow: "var(--shadow)",
    transform: "rotate(3deg)",
  },
  phoneNotch: {
    position: "absolute",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    width: 90,
    height: 18,
    background: "var(--bg-elev-2)",
    borderRadius: 12,
    zIndex: 2,
  },
  phoneScreen: {
    background: "var(--bg)",
    width: "100%",
    height: "100%",
    borderRadius: 32,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  phoneHeader: {
    padding: "22px 18px 10px",
    borderBottom: "1px solid var(--line)",
  },
  phoneHeaderWord: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 },
  phoneFeed: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    background: "var(--bg-elev)",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid var(--line)",
  },
  cardImg: { width: "100%", height: 140, objectFit: "cover" },
  cardBody: { padding: 10 },
  cardTop: { display: "flex", justifyContent: "space-between" },
  cardUser: { fontSize: 12.5, fontWeight: 600 },
  cardPlace: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    color: "var(--purple-light)",
    fontSize: 11,
    margin: "3px 0 8px",
  },
  cardActions: { display: "flex", gap: 14 },
  cardAction: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11.5,
    color: "var(--muted)",
  },
  tape: {
    position: "absolute",
    top: -14,
    right: 30,
    width: 70,
    height: 26,
    background: "rgba(124,148,115,0.55)",
    transform: "rotate(-8deg)",
    borderRadius: 2,
  },
  steps: { maxWidth: 1180, margin: "0 auto", padding: "20px 24px 90px" },
  stepsTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    margin: "0 0 36px",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  stepCard: {
    position: "relative",
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 18,
    padding: "26px 22px",
  },
  stepLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    color: "var(--purple-light)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 1.55,
    color: "var(--ink-soft)",
    marginTop: 10,
  },
  stepArrow: {
    position: "absolute",
    right: -28,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--line)",
    fontSize: 22,
    display: "none",
  },
  cta: { padding: "0 24px 100px" },
  ctaCard: {
    maxWidth: 720,
    margin: "0 auto",
    background: "linear-gradient(155deg, var(--purple-dark), #2c1a66)",
    color: "var(--white)",
    borderRadius: 28,
    padding: "56px 40px",
    textAlign: "center",
  },
  ctaTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(26px, 4vw, 36px)",
    margin: "0 0 14px",
  },
  ctaSub: {
    fontSize: 15.5,
    color: "rgba(250,247,241,0.75)",
    margin: "0 0 28px",
  },
  ctaForm: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaInput: {
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "var(--white)",
    borderRadius: 999,
    padding: "13px 18px",
    fontSize: 14.5,
    minWidth: 240,
    outline: "none",
  },
  footer: {
    textAlign: "center",
    padding: "0 24px 40px",
    color: "var(--muted)",
    fontSize: 13,
  },
};
