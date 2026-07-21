import React, { useState, useEffect, useRef } from "react";
import {
  Home, Search, Users, Send, Bell, Bookmark, User, Settings, LogOut,
  Image as ImageIcon, Camera, Video, Code2, MessageCircle, Heart,
  Pencil, Check, X, Eye, EyeOff, Plus,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   FEWARD — recriação funcional das telas do PDF de referência.
   Login/cadastro reais, perfil editável (foto, nome, bio), feed com
   publicação de fotos/textos, curtidas, comentários, salvos, comunidades
   (com criação de comunidade pelo usuário).
   Dados persistem em window.storage (não usa localStorage).
   Equipe FEW — Pedro · Chris Brum · Tony · Eduarda — Versão 1.0.0
   ──────────────────────────────────────────────────────────────────────── */

const USERS_KEY = "feward:users";
const SESSION_KEY = "feward:session";
const POSTS_KEY = "feward:posts";
const COMMUNITIES_KEY = "feward:communities";

function defaultCommunities() {
  const now = new Date().toISOString();
  return [
    { id: "c-jogos", name: "Jogos", description: "Tudo sobre games.", color: "linear-gradient(160deg,#3a3a3f,#1c1c20)", members: [], createdAt: now },
    { id: "c-animes", name: "Animes", description: "Fãs de anime e mangá.", color: "linear-gradient(160deg,#4a4a50,#222226)", members: [], createdAt: now },
    { id: "c-prog", name: "Programação", description: "Devs e curiosos de tech.", color: "linear-gradient(160deg,#2fd9ff,#0a6fa8)", members: [], createdAt: now },
    { id: "c-circus", name: "Digital Circus", description: "Comunidade da série.", color: "linear-gradient(160deg,#e8262c,#7a1013)", members: [], createdAt: now },
    { id: "c-fanart", name: "FanArte", description: "Arte feita por fãs.", color: "linear-gradient(160deg,#0a0f2e,#1c1470)", members: [], createdAt: now },
  ];
}

const COMMUNITY_COLORS = [
  "linear-gradient(160deg,#3a3a3f,#1c1c20)",
  "linear-gradient(160deg,#0a0f2e,#1c1470)",
  "linear-gradient(160deg,#2fd9ff,#0a6fa8)",
  "linear-gradient(160deg,#e8262c,#7a1013)",
  "linear-gradient(160deg,#34d399,#0a6f4a)",
  "linear-gradient(160deg,#f472b6,#7a1050)",
];

const STYLES = `
.few2 {
  --red: #ee3b3b;
  --red-dark: #9c1f1f;
  --red-glow: rgba(238, 59, 59, 0.45);
  --blue: #1c1470;
  --blue-dark: #0c0a2e;
  --bg: #0a0714;
  --panel-2: #10182a;
  --cyan: #2fd9ff;
  --ink: #f5f3ff;
  --ink-soft: #c7c3d8;
  --muted: #8f8aa3;
  --line: rgba(255,255,255,0.08);
  font-family: "Inter", system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  width: 100%;
}
.few2 * { box-sizing: border-box; }

.few2 .fw-nebula { position: relative; min-height: 100vh; overflow: hidden; background: var(--bg); }
.few2 .fw-nebula::before, .few2 .fw-nebula::after {
  content: ""; position: absolute; width: 120vmax; height: 120vmax; border-radius: 50%;
  filter: blur(70px); opacity: 0.6; z-index: 0;
}
.few2 .fw-nebula::before { top: -35vmax; left: -45vmax; background: radial-gradient(circle at 30% 30%, var(--blue) 0%, rgba(28,20,112,0) 60%); }
.few2 .fw-nebula::after { bottom: -40vmax; right: -40vmax; background: radial-gradient(circle at 70% 70%, var(--red) 0%, rgba(238,59,59,0) 60%); }
.few2 .fw-nebula.fw-nebula-swap::before { background: radial-gradient(circle at 30% 30%, var(--red) 0%, rgba(238,59,59,0) 60%); }
.few2 .fw-nebula.fw-nebula-swap::after { background: radial-gradient(circle at 70% 70%, var(--blue) 0%, rgba(28,20,112,0) 60%); }

.few2 .fw-loading-screen { position:relative; z-index:1; min-height:100vh; display:flex; align-items:center; justify-content:center; color: var(--muted); font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }

.few2 .fw-auth-shell { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 48px 20px 24px; gap: 20px; }

.few2 .fw-hex {
  position: relative; width: 150px; height: 104px;
  background: linear-gradient(160deg, #ff5c5c, var(--red) 65%, var(--red-dark));
  clip-path: polygon(18% 0%, 82% 0%, 100% 22%, 100% 78%, 82% 100%, 18% 100%, 0% 78%, 0% 22%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 55px -5px var(--red-glow);
}
.few2 .fw-hex span { font-family: "Poppins", sans-serif; font-weight: 900; font-size: 34px; letter-spacing: 1px; color: #0a0a0a; }
.few2 .fw-tagline { font-size: 12.5px; letter-spacing: 5px; color: var(--muted); text-transform: uppercase; font-weight: 600; text-align: center; }

.few2 .fw-authform { width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.few2 .fw-field { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.few2 .fw-field label { font-size: 12px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; padding-left: 4px; text-align: center; }
.few2 .fw-field input, .few2 .fw-field .fw-textarea {
  width: 100%; padding: 15px 20px; border-radius: 999px; border: 1px solid var(--line);
  background: linear-gradient(180deg, #14141a, #08080c);
  box-shadow: inset 0 2px 6px rgba(0,0,0,.6);
  color: var(--ink); font-size: 14.5px; outline: none;
  transition: box-shadow .2s ease, border-color .2s ease; font-family: inherit;
}
.few2 .fw-field textarea.fw-textarea { border-radius: 18px; resize: vertical; min-height: 64px; }
.few2 .fw-field input::placeholder, .few2 textarea::placeholder { color: #55505f; }
.few2 .fw-field input:focus, .few2 .fw-textarea:focus {
  border-color: var(--cyan); box-shadow: inset 0 2px 6px rgba(0,0,0,.6), 0 0 16px -2px rgba(47,217,255,.5);
}
.few2 .fw-field.fw-error input, .few2 .fw-field.fw-error .fw-textarea {
  border-color: #ff5d5d; box-shadow: inset 0 2px 6px rgba(0,0,0,.6), 0 0 14px -2px rgba(255,93,93,.5);
}
.few2 .fw-error-text { color: #ff8a8a; font-size: 11.5px; padding-left: 6px; min-height: 14px; text-align: center; }

.few2 .fw-forgot { align-self: center; background: none; border: none; color: var(--ink-soft); font-size: 12px; font-weight: 700; letter-spacing: .5px; text-decoration: underline; cursor: pointer; margin-top: -4px; }
.few2 .fw-forgot:hover { color: var(--cyan); }

.few2 .fw-btn {
  width: 100%; max-width: 360px; padding: 15px 22px; border-radius: 999px; font-weight: 700; font-size: 14px;
  letter-spacing: 3px; text-transform: uppercase; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 10px; border: none; transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
}
.few2 .fw-btn:active { transform: scale(.97); }
.few2 .fw-btn:disabled { opacity: .6; cursor: progress; }
.few2 .fw-btn-outline { background: transparent; border: 1.5px solid var(--cyan); color: var(--ink); }
.few2 .fw-btn-outline:hover { box-shadow: 0 0 22px -4px rgba(47,217,255,.55); }
.few2 .fw-btn-google { background: linear-gradient(180deg, #4b3bff, #2a1bcf 60%, #1c11a8); border: 1px solid #6a5cff; color: #fff; text-transform: none; letter-spacing: .3px; box-shadow: 0 0 20px -6px rgba(90,70,255,.6); }
.few2 .fw-btn-google:hover { box-shadow: 0 0 28px -4px rgba(90,70,255,.8); }
.few2 .fw-btn-facebook { background: linear-gradient(180deg, #e02f36, #a3181c 60%, #7a1013); border: 1px solid #ff5d63; color: #fff; text-transform: none; letter-spacing: .3px; box-shadow: 0 0 20px -6px rgba(224,47,54,.6); }
.few2 .fw-btn-facebook:hover { box-shadow: 0 0 28px -4px rgba(224,47,54,.8); }
.few2 .fw-icon-badge { width: 22px; height: 22px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.few2 .fw-icon-badge svg { width: 14px; height: 14px; }

.few2 .fw-authfooter { position: relative; z-index: 1; text-align: center; padding: 8px 0 28px; color: #55505f; font-size: 11px; letter-spacing: 1.5px; }
.few2 .fw-authfooter .fw-credit { display: block; margin-top: 6px; font-size: 10.5px; color: #45414f; }
.few2 .fw-authfooter b { color: #6a6575; }

.few2 .fw-app { min-height: 100vh; background: var(--bg); display: grid; grid-template-columns: 250px 1fr; }
.few2 .fw-sidebar { background: linear-gradient(180deg, var(--red-dark), #4a0f0f 70%, var(--bg)); padding: 20px 16px; display: flex; flex-direction: column; gap: 10px; border-right: 1px solid var(--line); }
.few2 .fw-sidebar .fw-logoword { font-family: "Poppins", sans-serif; font-weight: 900; font-size: 26px; color: var(--red); -webkit-text-stroke: 0.5px #000; margin-bottom: 18px; letter-spacing: 1px; }
.few2 .fw-navbtn { display: flex; align-items: center; gap: 10px; background: linear-gradient(180deg, #d81f1f, #971414); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-weight: 700; font-size: 14px; padding: 11px 16px; border-radius: 999px; cursor: pointer; text-align: left; box-shadow: 0 3px 0 rgba(0,0,0,0.35); transition: transform .12s ease, box-shadow .12s ease; }
.few2 .fw-navbtn:hover { transform: translateY(-1px); }
.few2 .fw-navbtn.active { background: linear-gradient(180deg, #ff5252, #c41e1e); box-shadow: 0 0 16px -2px var(--red-glow), 0 3px 0 rgba(0,0,0,0.35); }
.few2 .fw-navbtn.fw-nav-exit { margin-top: auto; background: linear-gradient(180deg, #3a2fd9, #1c1470); border-color: rgba(255,255,255,0.2); }

.few2 .fw-main { display: grid; grid-template-columns: 1fr; }
.few2 .fw-main.fw-with-panel { grid-template-columns: 1fr 300px; }
.few2 .fw-center { padding: 22px 26px 60px; max-width: 640px; }
.few2 .fw-h1 { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 26px; margin: 0 0 18px; }

.few2 .fw-composer { background: linear-gradient(180deg, #16161c, #0a0a0e); border: 1px solid var(--line); border-radius: 20px; padding: 16px; margin-bottom: 24px; }
.few2 .fw-composer-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--panel-2); display: flex; align-items: center; justify-content: center; color: var(--ink-soft); flex-shrink: 0; overflow: hidden; }
.few2 .fw-composer-icons { display: flex; gap: 12px; color: var(--muted); }
.few2 .fw-composer-icons svg { cursor: pointer; }
.few2 .fw-composer-icons svg:hover { color: var(--red); }

.few2 .fw-chip { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink-soft); font-size: 11.5px; font-weight: 700; cursor: pointer; }
.few2 .fw-chip.active { background: linear-gradient(180deg, #ff5252, #c41e1e); color: #fff; border-color: transparent; }

.few2 .fw-post { background: #e9e9ea; border-radius: 16px; overflow: hidden; margin-bottom: 22px; }
.few2 .fw-post-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #17171a; font-weight: 700; font-size: 13px; }
.few2 .fw-post-head .fw-avatar-sm { width: 22px; height: 22px; border-radius: 50%; background: #3a3a3e; display: flex; align-items: center; justify-content: center; color: #cfcfd2; overflow: hidden; flex-shrink: 0; }
.few2 .fw-post-media { padding: 0 14px 10px; }
.few2 .fw-post-caption { padding: 0 14px 10px; color: #17171a; font-size: 13.5px; line-height: 1.45; }
.few2 .fw-post-actions { display: flex; gap: 18px; align-items: center; padding: 10px 14px; background: #d5d5da; }
.few2 .fw-post-actions button { background: none; border: none; display: flex; align-items: center; gap: 5px; color: #2c2c30; cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; }
.few2 .fw-post-actions button.liked { color: #e8262c; }
.few2 .fw-post-actions button.saved { color: #1c1470; }
.few2 .fw-comments { padding: 12px 14px; background: #dcdce0; display: flex; flex-direction: column; gap: 8px; }
.few2 .fw-comment { font-size: 12.5px; color: #222; }
.few2 .fw-comment b { margin-right: 6px; }
.few2 .fw-comment-form { display: flex; gap: 8px; margin-top: 2px; }
.few2 .fw-comment-form input { flex: 1; border-radius: 999px; border: 1px solid #bcbcc2; padding: 9px 14px; font-size: 12.5px; outline: none; }
.few2 .fw-comment-form button { background: #1793d8; color: #fff; border: none; border-radius: 999px; width: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

.few2 .fw-panel { padding: 22px; border-left: 1px solid var(--line); }
.few2 .fw-panel-search { background: linear-gradient(180deg, #3a2fd9, #1c1470); border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; padding: 10px 18px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; margin-bottom: 20px; }
.few2 .fw-panel-title { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 20px; margin: 0 0 12px; }
.few2 .fw-panel-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-weight: 700; font-size: 14.5px; }
.few2 .fw-panel-item .fw-thumb { width: 30px; height: 30px; border-radius: 6px; background: var(--panel-2); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted); }
.few2 .fw-panel-divider { height: 1px; background: var(--line); margin: 18px 0; }
.few2 .fw-trending { font-weight: 700; font-size: 14px; line-height: 1.9; color: var(--ink-soft); }

.few2 .fw-profile-grid { display: grid; grid-template-columns: 280px 1fr 300px; min-height: 100vh; }
.few2 .fw-profile-side { background: linear-gradient(180deg, var(--blue), #06051a 65%); padding: 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.few2 .fw-avatar-upload-wrap { position: relative; width: 118px; height: 118px; margin-bottom: 6px; }
.few2 .fw-profile-avatar { width: 118px; height: 118px; border-radius: 50%; background: #000; border: 3px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: #6a6a78; overflow: hidden; }
.few2 .fw-avatar-edit-btn { position: absolute; bottom: 2px; right: 2px; width: 34px; height: 34px; border-radius: 50%; background: var(--red); border: 2px solid var(--bg); display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
.few2 .fw-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
.few2 .fw-profile-name { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 21px; font-style: italic; margin-bottom: 2px; }
.few2 .fw-profile-section { width: 100%; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 10px; margin-top: 10px; }
.few2 .fw-profile-label { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 18px; margin: 0 0 6px; }
.few2 .fw-profile-bio { color: var(--ink-soft); font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
.few2 .fw-profile-link { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14.5px; padding: 10px 0; cursor: pointer; color: var(--ink); }
.few2 .fw-profile-link:hover { color: var(--cyan); }
.few2 .fw-profile-link.fw-exit { margin-top: auto; color: #a9a3ff; }
.few2 .fw-profile-center { padding: 26px 30px; }
.few2 .fw-notepage { background: repeating-linear-gradient(to bottom, #e6e6ea 0px, #e6e6ea 37px, #cfcfd6 38px), #eeeef1; border-radius: 6px; padding: 18px 22px; color: #17171a; min-height: 640px; }
.few2 .fw-notepage .fw-note-name { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 24px; margin: 0 0 4px; }
.few2 .fw-notepage .fw-note-role { font-weight: 700; font-size: 15px; color: #2b2b2f; }
.few2 .fw-profile-images { background: var(--blue); padding: 22px; }
.few2 .fw-profile-images h3 { font-family: "Poppins", sans-serif; font-style: italic; font-weight: 800; font-size: 26px; margin: 0 0 16px; }
.few2 .fw-imggrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.few2 .fw-imggrid .fw-imgcell { aspect-ratio: 1.4; border-radius: 6px; overflow: hidden; background: var(--panel-2); display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--muted); font-weight: 700; text-align: center; padding: 6px; }

.few2 .fw-saved-grid { padding: 26px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.few2 .fw-saved-card { aspect-ratio: 1.6; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: "Poppins", sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-align: center; padding: 12px; transition: outline .15s ease; }

.few2 .fw-community-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--panel-2); border-radius: 14px; margin-bottom: 10px; }
.few2 .fw-join-btn { padding: 8px 16px; border-radius: 999px; border: none; font-weight: 700; font-size: 12.5px; cursor: pointer; background: linear-gradient(180deg,#d81f1f,#971414); color: #fff; }
.few2 .fw-join-btn.joined { background: linear-gradient(180deg,#2fd9ff,#0a6fa8); }

.few2 .fw-comm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.few2 .fw-comm-card { border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; min-height: 150px; color: #fff; }
.few2 .fw-comm-card-name { font-family: "Poppins", sans-serif; font-weight: 800; font-size: 20px; }
.few2 .fw-comm-card-desc { font-size: 13px; opacity: .85; margin-top: 6px; line-height: 1.4; }
.few2 .fw-comm-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 12px; opacity: .9; }
.few2 .fw-comm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 90; display: flex; align-items: center; justify-content: center; padding: 20px; }
.few2 .fw-comm-modal { background: linear-gradient(180deg,#16161c,#0a0a0e); border: 1px solid var(--line); border-radius: 20px; padding: 24px; width: 100%; max-width: 380px; }
@media (max-width: 600px) { .few2 .fw-comm-grid { grid-template-columns: 1fr; } }

.few2 .fw-emptystate { color: var(--muted); font-size: 14px; padding: 50px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }

.few2 .fw-editrow { display: flex; gap: 8px; align-items: center; }
.few2 .fw-iconbtn { background: none; border: none; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; }
.few2 .fw-iconbtn:hover { color: var(--cyan); }

.few2 .fw-hidden-input { display: none; }

.few2 .fw-toast { position: fixed; top: 20px; left: 50%; transform: translate(-50%,-140%); background: linear-gradient(180deg,#0f1a13,#081008); border: 1px solid #2fd97a55; color: #c9ffe0; padding: 12px 22px; border-radius: 999px; font-size: 13px; letter-spacing: .5px; box-shadow: 0 0 24px -6px rgba(47,217,120,.6); transition: transform .4s cubic-bezier(.34,1.56,.64,1); z-index: 100; max-width: 90vw; text-align: center; }
.few2 .fw-toast.fw-show { transform: translate(-50%,0); }

.few2 .fw-credits-btn {
  position: absolute; top: 20px; right: 20px; z-index: 5;
  background: linear-gradient(180deg, #26232f, #0e0c14); border: 1px solid rgba(255,255,255,0.25);
  color: var(--ink); font-weight: 700; font-size: 12.5px; letter-spacing: 1px;
  padding: 9px 18px; border-radius: 999px; cursor: pointer;
}
.few2 .fw-credits-btn:hover { border-color: var(--cyan); color: var(--cyan); }
.few2 .fw-credits-screen { position: relative; z-index: 1; min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
.few2 .fw-credits-left { background: linear-gradient(160deg,#ff5c5c,var(--red) 60%,var(--red-dark)); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
.few2 .fw-credits-left h1 { font-family: "Poppins", sans-serif; font-weight: 900; font-style: italic; font-size: 30px; margin: 0; color: #0a0a0a; line-height: 1.25; }
.few2 .fw-credits-thanks { background: var(--blue); border-radius: 18px; padding: 22px 26px; margin-top: 26px; color: #fff; }
.few2 .fw-credits-thanks p { margin: 4px 0; font-weight: 700; font-size: 15px; }
.few2 .fw-credits-thanks span { display: block; font-size: 12.5px; font-weight: 600; color: #cfd0ff; margin-top: 10px; }
.few2 .fw-credits-right { background: linear-gradient(160deg,#ff5c5c,var(--red) 60%,var(--red-dark)); padding: 60px 44px; display: flex; flex-direction: column; gap: 26px; justify-content: center; }
.few2 .fw-credits-person b { display: block; font-size: 18px; font-family: "Poppins", sans-serif; font-weight: 800; font-style: italic; color: #0a0a0a; }
.few2 .fw-credits-person span { display: block; font-size: 13.5px; font-weight: 700; color: #2b0a0a; margin-top: 4px; }
.few2 .fw-credits-back { position: absolute; top: 20px; left: 20px; z-index: 5; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-weight: 700; font-size: 12.5px; padding: 9px 18px; border-radius: 999px; cursor: pointer; }
.few2 .fw-credits-back:hover { background: rgba(0,0,0,0.55); }
@media (max-width: 720px) {
  .few2 .fw-credits-screen { grid-template-columns: 1fr; }
  .few2 .fw-credits-left h1 { font-size: 24px; }
  .few2 .fw-credits-right { padding: 32px 26px; }
}

.few2 .fw-mobilenav { display: none; }

@media (max-width: 900px) {
  .few2 .fw-app { grid-template-columns: 1fr; }
  .few2 .fw-sidebar { display: none; }
  .few2 .fw-profile-grid { grid-template-columns: 1fr; }
  .few2 .fw-main.fw-with-panel { grid-template-columns: 1fr; }
  .few2 .fw-saved-grid { grid-template-columns: 1fr 1fr; }
  .few2 .fw-center, .few2 .fw-profile-images { padding-bottom: 86px; }
  .few2 .fw-mobilenav {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
    background: linear-gradient(180deg,#141018,#0a0710); border-top: 1px solid var(--line);
    padding: 6px 4px; gap: 2px; overflow-x: auto;
  }
  .few2 .fw-mobilenav button {
    flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 2px;
    background: none; border: none; color: var(--ink-soft); font-size: 9px; padding: 6px 10px; border-radius: 10px; cursor: pointer;
  }
  .few2 .fw-mobilenav button.active { color: var(--red); }
}
`;

/* ── ícones sociais ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.3 27 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.4C40.9 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.6 0 12 0S0 5.4 0 12.07C0 18.1 4.4 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.6 23.09 24 18.1 24 12.07z"/>
    </svg>
  );
}
function FewHex() {
  return (
    <div className="fw-hex"><span>FEW</span></div>
  );
}

/* ── helpers ── */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}
async function loadJSON(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), false); } catch (e) { console.error(e); }
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function seedPosts() {
  return [{
    id: "seed-1",
    authorEmail: "equipe@feward.app",
    authorName: "Equipe FEW",
    authorUsername: "feward",
    authorAvatar: null,
    image: null,
    caption: "Bem-vindo(a) ao Feward! Crie sua conta, monte seu perfil e publique sua primeira foto.",
    category: "Geral",
    likedBy: [],
    comments: [],
    savedBy: [],
    createdAt: new Date().toISOString(),
  }];
}
function useToast() {
  const [toast, setToast] = useState({ show: false, msg: "" });
  const show = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };
  return [toast, show];
}

/* ── campo de senha reutilizável ── */
function PasswordField({ id, label, value, onChange, error, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`fw-field ${error ? "fw-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ paddingRight: 46 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8a8a93", cursor: "pointer", display: "flex" }}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="fw-error-text">{error || ""}</div>
    </div>
  );
}

/* ── Créditos ── */
function CreditsScreen({ onBack }) {
  return (
    <div className="fw-credits-screen">
      <button className="fw-credits-back" onClick={onBack}>← Voltar</button>
      <div className="fw-credits-left">
        <h1>Créditos e<br />agradecimentos<br />FEWARD</h1>
        <div className="fw-credits-thanks">
          <p>Agradecimento a</p>
          <p>Arthur Pereira</p>
          <p>Maria Eduarda</p>
          <span>por sempre apoiar o projeto</span>
        </div>
      </div>
      <div className="fw-credits-right">
        <div className="fw-credits-person">
          <b>Pedro Rafael (DDRK)</b>
          <span>(criador e programador da Feward)</span>
        </div>
        <div className="fw-credits-person">
          <b>Christopher (Nullirã)</b>
          <span>(Adm da Feward)</span>
        </div>
        <div className="fw-credits-person">
          <b>Tony</b>
          <span>(nos ajudou na identidade visual, ajudou em fazer a Feward por um determinado tempo e programou um dos primeiros visuais)</span>
        </div>
      </div>
    </div>
  );
}

/* ── Login ── */
function LoginScreen({ onGoSignup, onLogin, onShowCredits, showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    const res = await onLogin(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  }

  function handleReset(e) {
    e.preventDefault();
    if (!resetEmail.trim()) { setResetMsg("Informe um e-mail."); return; }
    setResetMsg("Se existir uma conta com esse e-mail, um link seria enviado (recurso de demonstração).");
  }

  return (
    <div className="fw-nebula">
      <button className="fw-credits-btn" onClick={onShowCredits}>Créditos</button>
      <div className="fw-auth-shell">
        <FewHex />
        <div className="fw-tagline">Tecnologia e o futuro</div>

        {!showReset ? (
          <form className="fw-authform" onSubmit={handleSubmit} noValidate>
            <div className="fw-field">
              <label htmlFor="few-login-email">Digite o e-mail</label>
              <input id="few-login-email" type="email" placeholder="voce@exemplo.com" autoComplete="username"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
            </div>
            <PasswordField id="few-login-pass" label="Digite a senha" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••" autoComplete="current-password" />
            {error && <div className="fw-error-text">{error}</div>}
            <button type="button" className="fw-forgot" onClick={() => setShowReset(true)}>Esqueceu a senha?</button>
            <button type="submit" className="fw-btn fw-btn-outline" disabled={loading}>{loading ? "Entrando…" : "Login"}</button>
            <button type="button" className="fw-btn fw-btn-outline" onClick={onGoSignup}>Criar conta</button>
            <button type="button" className="fw-btn fw-btn-google" onClick={() => showToast("Login social indisponível nesta prévia.")}>
              <span className="fw-icon-badge"><GoogleIcon /></span> Continuar com Google
            </button>
            <button type="button" className="fw-btn fw-btn-facebook" onClick={() => showToast("Login social indisponível nesta prévia.")}>
              <span className="fw-icon-badge"><FacebookIcon /></span> Continuar com Facebook
            </button>
          </form>
        ) : (
          <form className="fw-authform" onSubmit={handleReset} noValidate>
            <div className="fw-field">
              <label htmlFor="few-reset-email">Redefinir senha</label>
              <input id="few-reset-email" type="email" placeholder="voce@exemplo.com" value={resetEmail}
                onChange={(e) => { setResetEmail(e.target.value); setResetMsg(""); }} />
            </div>
            {resetMsg && <div style={{ color: "var(--ink-soft)", fontSize: 12.5, textAlign: "center" }}>{resetMsg}</div>}
            <button type="submit" className="fw-btn fw-btn-outline">Enviar link</button>
            <button type="button" className="fw-forgot" onClick={() => { setShowReset(false); setResetMsg(""); }}>Voltar ao login</button>
          </form>
        )}
      </div>
      <div className="fw-authfooter">
        Versão 1.0.0
        <span className="fw-credit">Equipe FEW — <b>Pedro · Chris Brum · Tony · Eduarda</b></span>
      </div>
    </div>
  );
}

/* ── Cadastro ── */
function SignupScreen({ onGoLogin, onSignup, onShowCredits, showToast }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { showToast("Imagem muito grande (máx. 4MB)."); return; }
    try { setAvatar(await fileToDataURL(file)); } catch { showToast("Não foi possível carregar a imagem."); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await onSignup({ name, username, email, password, confirm, bio, avatar });
    setLoading(false);
    if (!res.ok) setErrors(res.errors || {});
  }

  return (
    <div className="fw-nebula fw-nebula-swap">
      <button className="fw-credits-btn" onClick={onShowCredits}>Créditos</button>
      <div className="fw-auth-shell">
        <FewHex />
        <div className="fw-tagline" style={{ fontWeight: 700, letterSpacing: "3px" }}>Criar conta Feward</div>

        <form className="fw-authform" onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="fw-avatar-upload-wrap" style={{ width: 88, height: 88 }}>
              <div className="fw-profile-avatar" style={{ width: 88, height: 88 }}>
                {avatar ? <img src={avatar} alt="" className="fw-avatar-img" /> : <User size={38} />}
              </div>
              <button type="button" className="fw-avatar-edit-btn" style={{ width: 30, height: 30 }} onClick={() => fileRef.current?.click()} aria-label="Escolher foto">
                <Camera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="fw-hidden-input" onChange={handleAvatarChange} />
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", letterSpacing: 1 }}>Foto de perfil (opcional)</span>
          </div>

          <div className={`fw-field ${errors.name ? "fw-error" : ""}`}>
            <label htmlFor="few-signup-name">Nome completo</label>
            <input id="few-signup-name" type="text" placeholder="Seu nome" value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} />
            <div className="fw-error-text">{errors.name}</div>
          </div>

          <div className={`fw-field ${errors.email ? "fw-error" : ""}`}>
            <label htmlFor="few-signup-email">Digite o e-mail</label>
            <input id="few-signup-email" type="email" placeholder="voce@exemplo.com" autoComplete="username" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} />
            <div className="fw-error-text">{errors.email}</div>
          </div>

          <PasswordField id="few-signup-pass" label="Digite a senha" value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
            error={errors.password} placeholder="••••••••" autoComplete="new-password" />

          <PasswordField id="few-signup-confirm" label="Repetir a senha" value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
            error={errors.confirm} placeholder="••••••••" autoComplete="new-password" />

          <div className={`fw-field ${errors.username ? "fw-error" : ""}`}>
            <label htmlFor="few-signup-user">Nome de usuário</label>
            <input id="few-signup-user" type="text" placeholder="seu.usuario" autoComplete="nickname" value={username}
              onChange={(e) => { setUsername(e.target.value.replace(/\s+/g, "").toLowerCase()); setErrors((p) => ({ ...p, username: "" })); }} />
            <div className="fw-error-text">{errors.username}</div>
          </div>

          <div className="fw-field">
            <label htmlFor="few-signup-bio">Bio</label>
            <textarea id="few-signup-bio" className="fw-textarea" placeholder="Conte um pouco sobre você…"
              maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <button type="submit" className="fw-btn fw-btn-outline" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? "Criando…" : "Criar conta"}
          </button>
          <button type="button" className="fw-forgot" onClick={onGoLogin}>Já tenho uma conta</button>
        </form>
      </div>
      <div className="fw-authfooter">
        Versão 1.0.0
        <span className="fw-credit">Equipe FEW — <b>Pedro · Chris Brum · Tony · Eduarda</b></span>
      </div>
    </div>
  );
}

/* ── navegação ── */
const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "explore", label: "Explorar", icon: Search },
  { key: "community", label: "comunidade", icon: Users },
  { key: "messages", label: "Mensagem", icon: Send },
  { key: "notifications", label: "Notificação", icon: Bell },
  { key: "saved", label: "Salvos", icon: Bookmark },
  { key: "profile", label: "Perfil", icon: User },
  { key: "settings", label: "Configuração", icon: Settings },
];

function Sidebar({ tab, setTab, onLogout }) {
  return (
    <aside className="fw-sidebar">
      <div className="fw-logoword">FEWARD</div>
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button key={key} className={`fw-navbtn ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
          <Icon size={16} /> {label}
        </button>
      ))}
      <button className="fw-navbtn fw-nav-exit" onClick={onLogout}><LogOut size={16} /> Sair</button>
    </aside>
  );
}

function MobileNav({ tab, setTab, onLogout }) {
  return (
    <nav className="fw-mobilenav">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
          <Icon size={16} /><span>{label}</span>
        </button>
      ))}
      <button onClick={onLogout}><LogOut size={16} /><span>Sair</span></button>
    </nav>
  );
}

const CATEGORIES = ["Geral", "Jogos", "Animes", "FanArte", "Digital Circus", "Filmes", "Memes"];

function Composer({ user, onCreatePost, showToast }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("Geral");
  const fileRef = useRef(null);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Imagem muito grande (máx. 5MB)."); return; }
    try { setImage(await fileToDataURL(file)); } catch { showToast("Não foi possível carregar a imagem."); }
  }

  function handlePublish() {
    if (!caption.trim() && !image) { showToast("Escreva algo ou adicione uma foto."); return; }
    onCreatePost({ image, caption: caption.trim(), category });
    setCaption(""); setImage(null); setCategory("Geral");
    if (fileRef.current) fileRef.current.value = "";
    showToast("Publicado!");
  }

  return (
    <div className="fw-composer">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: image ? 12 : 10 }}>
        <div className="fw-composer-avatar">
          {user.avatar ? <img src={user.avatar} className="fw-avatar-img" alt="" /> : <User size={16} />}
        </div>
        <input
          style={{ flex: 1, border: "none", background: "transparent", color: "var(--ink)", fontSize: 14.5, outline: "none", fontFamily: "inherit" }}
          placeholder="Fazer um post…" value={caption} onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      {image && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <img src={image} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 14 }} />
          <button type="button" onClick={() => setImage(null)}
            style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", border: "none", borderRadius: 999, width: 28, height: 28, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`fw-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="fw-composer-icons">
          <ImageIcon size={18} onClick={() => fileRef.current?.click()} />
          <Camera size={18} onClick={() => showToast("Em breve nesta prévia.")} />
          <Video size={18} onClick={() => showToast("Em breve nesta prévia.")} />
          <Code2 size={18} onClick={() => showToast("Em breve nesta prévia.")} />
        </div>
        <button type="button" onClick={handlePublish}
          style={{ background: "linear-gradient(180deg,#ff5252,#c41e1e)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 999, padding: "9px 18px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          Publicar <Send size={14} />
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="fw-hidden-input" onChange={handleImage} />
    </div>
  );
}

function PostCard({ post, user, onToggleLike, onAddComment, onToggleSaved }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const liked = post.likedBy.includes(user.email);
  const saved = (post.savedBy || []).includes(user.email);

  function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  }

  return (
    <div className="fw-post">
      <div className="fw-post-head">
        <span className="fw-avatar-sm">
          {post.authorAvatar ? <img src={post.authorAvatar} className="fw-avatar-img" alt="" /> : <User size={13} />}
        </span>
        {post.authorName || "Usuário"}
        <span style={{ marginLeft: "auto", fontWeight: 500, color: "#6a6a70", fontSize: 11 }}>{timeAgo(post.createdAt)}</span>
      </div>
      {post.image && (
        <div className="fw-post-media">
          <img src={post.image} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 380, objectFit: "cover" }} />
        </div>
      )}
      {post.caption && <div className="fw-post-caption">{post.caption}</div>}
      <div className="fw-post-actions">
        <button className={liked ? "liked" : ""} onClick={() => onToggleLike(post.id)}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> {post.likedBy.length}
        </button>
        <button onClick={() => setShowComments((s) => !s)}>
          <MessageCircle size={16} /> {post.comments.length}
        </button>
        <button className={saved ? "saved" : ""} onClick={() => onToggleSaved(post.id)} style={{ marginLeft: "auto" }}>
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {showComments && (
        <div className="fw-comments">
          {post.comments.length === 0 && <div style={{ color: "#6a6a70", fontSize: 12 }}>Nenhum comentário ainda.</div>}
          {post.comments.map((c) => (
            <div key={c.id} className="fw-comment"><b>{c.author}:</b>{c.text}</div>
          ))}
          <form className="fw-comment-form" onSubmit={submitComment}>
            <input placeholder="Escreva um comentário…" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit"><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

function SidePanel({ posts }) {
  const counts = {};
  posts.forEach((p) => { counts[p.category || "Geral"] = (counts[p.category || "Geral"] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return (
    <aside className="fw-panel">
      <div className="fw-panel-search"><Search size={15} /> Explorar</div>
      <div className="fw-panel-title">Comunidade</div>
      {["Jogos", "Digital Circus", "FanArte"].map((name) => (
        <div className="fw-panel-item" key={name}><span className="fw-thumb">{name.slice(0, 2).toUpperCase()}</span>{name}</div>
      ))}
      <div className="fw-panel-divider" />
      <div className="fw-panel-title" style={{ fontSize: 17 }}>Em alta</div>
      <div className="fw-trending">
        {top.length ? top.map(([name, count]) => (<div key={name}>{name} · {count}</div>)) : <div>Ainda sem publicações suficientes.</div>}
      </div>
    </aside>
  );
}

function FeedTab({ user, posts, onCreatePost, onToggleLike, onAddComment, onToggleSaved, showToast }) {
  const sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <main className="fw-center">
      <h1 className="fw-h1">Início</h1>
      <Composer user={user} onCreatePost={onCreatePost} showToast={showToast} />
      {sorted.map((p) => (
        <PostCard key={p.id} post={p} user={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} />
      ))}
    </main>
  );
}

function ExploreTab({ posts, user, onToggleLike, onAddComment, onToggleSaved }) {
  const [filter, setFilter] = useState(null);
  const cats = [
    { label: "Jogos", bg: "linear-gradient(160deg,#3a3a3f,#1c1c20)" },
    { label: "FanArte", bg: "linear-gradient(160deg,#0a0f2e,#1c1470)" },
    { label: "Digital Circus", bg: "linear-gradient(160deg,#2fd9ff,#0a6fa8)" },
    { label: "Animes", bg: "linear-gradient(160deg,#4a4a50,#222226)" },
    { label: "Filmes", bg: "linear-gradient(160deg,#0a0f2e,#1c1470)" },
    { label: "Memes", bg: "linear-gradient(160deg,#2fd9ff,#0a6fa8)" },
  ];
  const filtered = filter ? posts.filter((p) => p.category === filter) : [];
  return (
    <main className="fw-center" style={{ maxWidth: 720 }}>
      <h1 className="fw-h1">Explorar</h1>
      <div className="fw-saved-grid" style={{ padding: 0, marginBottom: 28 }}>
        {cats.map((c) => (
          <div key={c.label} className="fw-saved-card"
            style={{ background: c.bg, cursor: "pointer", outline: filter === c.label ? "3px solid var(--cyan)" : "none" }}
            onClick={() => setFilter((f) => (f === c.label ? null : c.label))}>
            {c.label}
          </div>
        ))}
      </div>
      {filter && (
        <>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 14 }}>{filter}</h2>
          {filtered.length === 0 && <div className="fw-emptystate">Nenhuma publicação nesta categoria ainda.</div>}
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} user={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} />
          ))}
        </>
      )}
    </main>
  );
}

/* ── Comunidade (com criação de comunidade) ── */
function CreateCommunityModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), color: COMMUNITY_COLORS[colorIdx] });
    onClose();
  }

  return (
    <div className="fw-comm-modal-overlay" onClick={onClose}>
      <div className="fw-comm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="fw-h1" style={{ fontSize: 20, marginBottom: 16 }}>Nova comunidade</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="fw-field">
            <label>Nome da comunidade</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Speedrun BR" maxLength={40} />
          </div>
          <div className="fw-field">
            <label>Descrição (opcional)</label>
            <textarea className="fw-textarea" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} placeholder="Sobre o que é essa comunidade?" />
          </div>
          <div className="fw-field">
            <label>Cor</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COMMUNITY_COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  style={{
                    width: 30, height: 30, borderRadius: "50%", background: c,
                    border: colorIdx === i ? "3px solid var(--cyan)" : "2px solid transparent", cursor: "pointer",
                  }}
                  aria-label={`Cor ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="fw-btn fw-btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="fw-btn fw-btn-outline" style={{ background: "linear-gradient(180deg,#ff5252,#c41e1e)", color: "#fff", border: "none" }}>Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommunityTab({ user, communities, onJoinToggle, onCreateCommunity, showToast }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="fw-center" style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h1 className="fw-h1" style={{ margin: 0 }}>Comunidade</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: 38, height: 38, borderRadius: "50%", border: "none",
            background: "linear-gradient(180deg,#ff5252,#c41e1e)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
          aria-label="Criar comunidade"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="fw-comm-grid">
        {communities.map((c) => {
          const isIn = (c.members || []).includes(user.email);
          return (
            <div key={c.id} className="fw-comm-card" style={{ background: c.color }}>
              <div>
                <div className="fw-comm-card-name">{c.name}</div>
                {c.description && <div className="fw-comm-card-desc">{c.description}</div>}
              </div>
              <div className="fw-comm-card-foot">
                <span>{(c.members || []).length} membro{(c.members || []).length === 1 ? "" : "s"}</span>
                <button className={`fw-join-btn ${isIn ? "joined" : ""}`} onClick={() => onJoinToggle(c.id)}>
                  {isIn ? "Participando" : "Participar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateCommunityModal
          onClose={() => setShowModal(false)}
          onCreate={(data) => { onCreateCommunity(data); showToast("Comunidade criada!"); }}
        />
      )}
    </main>
  );
}

function MessagesTab() {
  return (
    <main className="fw-center">
      <h1 className="fw-h1">Mensagens</h1>
      <div className="fw-emptystate"><Send size={30} /><div>Nenhuma mensagem ainda. Esse recurso chega em breve nesta prévia.</div></div>
    </main>
  );
}
function NotificationsTab() {
  return (
    <main className="fw-center">
      <h1 className="fw-h1">Notificações</h1>
      <div className="fw-emptystate"><Bell size={30} /><div>Você está em dia — nenhuma notificação nova.</div></div>
    </main>
  );
}

function SavedTab({ posts, user, onToggleLike, onAddComment, onToggleSaved }) {
  const saved = posts.filter((p) => (p.savedBy || []).includes(user.email));
  return (
    <main className="fw-center">
      <h1 className="fw-h1">Salvos</h1>
      {saved.length === 0 && <div className="fw-emptystate"><Bookmark size={30} /><div>Você ainda não salvou nenhuma publicação. Toque no marcador de um post para salvá-lo aqui.</div></div>}
      {saved.map((p) => (
        <PostCard key={p.id} post={p} user={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} />
      ))}
    </main>
  );
}

function ProfileTab({ user, posts, onUpdateUser, onLogout, onDeleteAccount, showToast }) {
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [bioDraft, setBioDraft] = useState(user.bio || "");
  const [showRecados, setShowRecados] = useState(false);
  const [recadoText, setRecadoText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { setNameDraft(user.name); setBioDraft(user.bio || ""); }, [user.name, user.bio]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { showToast("Imagem muito grande (máx. 4MB)."); return; }
    try { onUpdateUser({ avatar: await fileToDataURL(file) }); showToast("Foto atualizada!"); }
    catch { showToast("Não foi possível carregar a imagem."); }
  }

  function saveName() { onUpdateUser({ name: nameDraft.trim() || user.name }); setEditingName(false); }
  function saveBio() { onUpdateUser({ bio: bioDraft.trim() }); setEditingBio(false); }

  function addRecado(e) {
    e.preventDefault();
    if (!recadoText.trim()) return;
    const recados = [...(user.recados || []), { id: `r-${Date.now()}`, text: recadoText.trim() }];
    onUpdateUser({ recados });
    setRecadoText("");
  }

  const myImages = posts.filter((p) => p.authorEmail === user.email && p.image);

  return (
    <div className="fw-profile-grid">
      <aside className="fw-profile-side">
        <div className="fw-avatar-upload-wrap">
          <div className="fw-profile-avatar">
            {user.avatar ? <img src={user.avatar} className="fw-avatar-img" alt="" /> : <User size={54} />}
          </div>
          <button className="fw-avatar-edit-btn" onClick={() => fileRef.current?.click()} aria-label="Alterar foto">
            <Camera size={16} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="fw-hidden-input" onChange={handleAvatarChange} />
        </div>

        {editingName ? (
          <div className="fw-editrow" style={{ marginBottom: 16 }}>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
              style={{ borderRadius: 999, border: "1px solid var(--line)", background: "#0c0c12", color: "#fff", padding: "6px 12px", fontSize: 14, width: 150 }} />
            <button className="fw-iconbtn" onClick={saveName}><Check size={17} /></button>
            <button className="fw-iconbtn" onClick={() => { setEditingName(false); setNameDraft(user.name); }}><X size={17} /></button>
          </div>
        ) : (
          <div className="fw-profile-name" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setEditingName(true)}>
            {user.name} <Pencil size={13} style={{ opacity: .6 }} />
          </div>
        )}
        <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>@{user.username}</div>

        <div className="fw-profile-section" style={{ width: "100%" }}>
          <div className="fw-profile-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Bio
            {!editingBio && <Pencil size={13} style={{ cursor: "pointer", opacity: .6 }} onClick={() => setEditingBio(true)} />}
          </div>
          {editingBio ? (
            <div>
              <textarea className="fw-textarea" maxLength={160} value={bioDraft} onChange={(e) => setBioDraft(e.target.value)} />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="fw-iconbtn" onClick={saveBio}><Check size={17} /></button>
                <button className="fw-iconbtn" onClick={() => { setEditingBio(false); setBioDraft(user.bio || ""); }}><X size={17} /></button>
              </div>
            </div>
          ) : (
            <div className="fw-profile-bio">{user.bio || "Nenhuma bio ainda. Toque no lápis para escrever a sua."}</div>
          )}
        </div>

        <div className="fw-profile-section" style={{ width: "100%", marginTop: "auto" }}>
          <div className="fw-profile-link" onClick={() => showToast("Você ainda não tem amigos adicionados nesta prévia.")}><Users size={16} /> Amigos</div>
          <div className="fw-profile-link"><User size={16} /> Perfil</div>
          <div className="fw-profile-link" onClick={() => setShowRecados((s) => !s)}><MessageCircle size={16} /> Recado</div>
          <div className="fw-profile-link fw-exit" onClick={onLogout}><LogOut size={16} /> Sair</div>
          <div
            className="fw-profile-link"
            style={{ color: "#ff8a8a" }}
            onClick={() => {
              if (confirmDelete) onDeleteAccount();
              else { setConfirmDelete(true); showToast("Toque novamente para confirmar a exclusão."); }
            }}
          >
            <X size={16} /> {confirmDelete ? "Confirmar exclusão" : "Deletar"}
          </div>
        </div>
      </aside>

      <main className="fw-profile-center">
        {!showRecados ? (
          <div className="fw-notepage">
            <p className="fw-note-name">{user.name}</p>
            <p className="fw-note-role">Criou a Feward em {new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
            <p style={{ marginTop: 18, fontWeight: 600, color: "#2b2b2f" }}>{user.bio || "Sem bio por enquanto."}</p>
          </div>
        ) : (
          <div className="fw-notepage">
            <p className="fw-note-name">Recados</p>
            <form onSubmit={addRecado} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={recadoText} onChange={(e) => setRecadoText(e.target.value)} placeholder="Deixe um recado no seu mural…"
                style={{ flex: 1, borderRadius: 999, border: "1px solid #ccc", padding: "8px 14px", fontSize: 13 }} />
              <button type="submit" style={{ background: "#1793d8", border: "none", color: "#fff", borderRadius: 999, padding: "8px 16px", cursor: "pointer" }}>
                <Send size={14} />
              </button>
            </form>
            {(user.recados || []).length === 0 && <p style={{ color: "#555" }}>Nenhum recado ainda.</p>}
            {[...(user.recados || [])].reverse().map((r) => (
              <p key={r.id} style={{ borderBottom: "1px solid #cfcfd6", paddingBottom: 8, marginBottom: 8, color: "#222" }}>{r.text}</p>
            ))}
          </div>
        )}
      </main>

      <aside className="fw-profile-images">
        <h3>Imagens</h3>
        <div className="fw-imggrid">
          {myImages.length === 0 && <div className="fw-imgcell">Sem fotos ainda</div>}
          {myImages.slice(0, 6).map((p) => (
            <div className="fw-imgcell" key={p.id} style={{ padding: 0 }}>
              <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SettingsTab({ user, onUpdateUser, onLogout, onDeleteAccount, showToast }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() { onUpdateUser({ name: name.trim() || user.name, bio: bio.trim() }); showToast("Alterações salvas!"); }

  return (
    <main className="fw-center">
      <h1 className="fw-h1">Configuração</h1>
      <div className="fw-field" style={{ marginBottom: 14 }}>
        <label>Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="fw-field" style={{ marginBottom: 18 }}>
        <label>Bio</label>
        <textarea className="fw-textarea" maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <button className="fw-btn fw-btn-outline" style={{ maxWidth: 220, marginBottom: 26 }} onClick={save}>Salvar alterações</button>

      <button className="fw-btn" style={{ maxWidth: 220, background: "linear-gradient(180deg,#3a2fd9,#1c1470)", color: "#fff", marginBottom: 12 }} onClick={onLogout}>
        Sair da conta
      </button>
      <button className="fw-btn" style={{ maxWidth: 220, background: "transparent", border: "1px solid #ff5d5d", color: "#ff8a8a" }}
        onClick={() => {
          if (confirmDelete) onDeleteAccount();
          else { setConfirmDelete(true); showToast("Toque novamente para confirmar a exclusão."); }
        }}>
        {confirmDelete ? "Confirmar exclusão" : "Excluir conta"}
      </button>
    </main>
  );
}

function AppShell({ user, tab, setTab, posts, communities, onLogout, onUpdateUser, onCreatePost, onToggleLike, onAddComment, onToggleSaved, onJoinCommunity, onCreateCommunity, onDeleteAccount, showToast }) {
  let content;
  if (tab === "home") {
    content = (
      <div className="fw-main fw-with-panel">
        <FeedTab user={user} posts={posts} onCreatePost={onCreatePost} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} showToast={showToast} />
        <SidePanel posts={posts} />
      </div>
    );
  } else if (tab === "explore") {
    content = <div className="fw-main"><ExploreTab posts={posts} user={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} /></div>;
  } else if (tab === "community") {
    content = (
      <div className="fw-main">
        <CommunityTab
          user={user}
          communities={communities}
          onJoinToggle={onJoinCommunity}
          onCreateCommunity={onCreateCommunity}
          showToast={showToast}
        />
      </div>
    );
  } else if (tab === "messages") {
    content = <div className="fw-main"><MessagesTab /></div>;
  } else if (tab === "notifications") {
    content = <div className="fw-main"><NotificationsTab /></div>;
  } else if (tab === "saved") {
    content = <div className="fw-main"><SavedTab posts={posts} user={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSaved={onToggleSaved} /></div>;
  } else if (tab === "profile") {
    content = <ProfileTab user={user} posts={posts} onUpdateUser={onUpdateUser} onLogout={onLogout} onDeleteAccount={onDeleteAccount} showToast={showToast} />;
  } else if (tab === "settings") {
    content = <div className="fw-main"><SettingsTab user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} onDeleteAccount={onDeleteAccount} showToast={showToast} /></div>;
  }

  return (
    <div className="fw-app">
      <Sidebar tab={tab} setTab={setTab} onLogout={onLogout} />
      {content}
      <MobileNav tab={tab} setTab={setTab} onLogout={onLogout} />
    </div>
  );
}

/* ── App raiz ── */
export default function FewardApp({ user: authUser, onLogout: onLogoutProp }) {
  const [booted, setBooted] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [sessionEmail, setSessionEmail] = useState(authUser?.email || null);
  const [authView, setAuthView] = useState("login");
  const [showCredits, setShowCredits] = useState(false);
  const [tab, setTab] = useState("home");
  const [toast, showToast] = useToast();

  useEffect(() => {
    (async () => {
      let u = await loadJSON(USERS_KEY, []);
      let p = await loadJSON(POSTS_KEY, null);
      if (!p) { p = seedPosts(); await saveJSON(POSTS_KEY, p); }
      let c = await loadJSON(COMMUNITIES_KEY, null);
      if (!c) { c = defaultCommunities(); await saveJSON(COMMUNITIES_KEY, c); }

      if (authUser?.email) {
        // Ja logado via Supabase (FewLogin): garante um perfil local basico
        // para essa conta, sem pedir login de novo aqui dentro.
        const jaExiste = u.some((x) => x.email === authUser.email);
        if (!jaExiste) {
          u = [...u, {
            email: authUser.email,
            username: authUser.email.split("@")[0],
            name: authUser.nome || authUser.name || "",
            bio: "",
            avatar: null,
            password: null,
          }];
          await saveJSON(USERS_KEY, u);
        }
        setUsers(u); setPosts(p); setCommunities(c); setSessionEmail(authUser.email); setBooted(true);
        return;
      }

      let s = null;
      try { const r = await window.storage.get(SESSION_KEY, false); s = r ? r.value : null; } catch { s = null; }
      setUsers(u); setPosts(p); setCommunities(c); setSessionEmail(s); setBooted(true);
    })();
  }, [authUser]);

  const localUser = users.find((u) => u.email === sessionEmail) || null;
  // Se veio autenticado do Supabase (FewLogin) mas ainda não existe um perfil
  // local (username/bio/avatar) para essa conta, cria um perfil basico na hora.
  const currentUser =
    localUser ||
    (authUser
      ? {
          email: authUser.email,
          username: authUser.email ? authUser.email.split("@")[0] : "usuario",
          name: authUser.nome || authUser.name || "",
          bio: "",
          avatar: null,
          password: null,
        }
      : null);

  async function persistUsers(next) { setUsers(next); await saveJSON(USERS_KEY, next); }
  async function persistPosts(next) { setPosts(next); await saveJSON(POSTS_KEY, next); }
  async function persistCommunities(next) { setCommunities(next); await saveJSON(COMMUNITIES_KEY, next); }

  async function login(email, password) {
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "Não encontramos uma conta com esse e-mail." };
    if (found.password !== password) return { ok: false, error: "Senha incorreta." };
    setSessionEmail(found.email);
    try { await window.storage.set(SESSION_KEY, found.email, false); } catch { /* noop */ }
    return { ok: true };
  }

  async function signup(data) {
    const errors = {};
    if (!data.name.trim()) errors.name = "Informe seu nome.";
    if (!data.username.trim()) errors.username = "Escolha um nome de usuário.";
    else if (users.some((u) => u.username.toLowerCase() === data.username.trim().toLowerCase())) errors.username = "Esse nome de usuário já existe.";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "E-mail inválido.";
    else if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) errors.email = "Já existe uma conta com esse e-mail.";
    if (data.password.length < 6) errors.password = "Mínimo de 6 caracteres.";
    if (data.password !== data.confirm) errors.confirm = "As senhas não coincidem.";
    if (Object.keys(errors).length) return { ok: false, errors };

    const newUser = {
      email: data.email.trim(), password: data.password, username: data.username.trim(),
      name: data.name.trim(), bio: data.bio.trim(), avatar: data.avatar || null,
      communities: [], recados: [], createdAt: new Date().toISOString(),
    };
    const next = [...users, newUser];
    await persistUsers(next);
    setSessionEmail(newUser.email);
    try { await window.storage.set(SESSION_KEY, newUser.email, false); } catch { /* noop */ }
    return { ok: true };
  }

  async function logout() {
    setSessionEmail(null); setTab("home");
    try { await window.storage.delete(SESSION_KEY, false); } catch { /* noop */ }
    if (onLogoutProp) onLogoutProp();
  }

  function updateCurrentUser(patch) {
    const next = users.map((u) => (u.email === sessionEmail ? { ...u, ...patch } : u));
    persistUsers(next);
  }

  function createPost({ image, caption, category }) {
    const post = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorEmail: currentUser.email, authorName: currentUser.name, authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar, image: image || null, caption: caption || "", category: category || "Geral",
      likedBy: [], comments: [], savedBy: [], createdAt: new Date().toISOString(),
    };
    persistPosts([post, ...posts]);
  }

  function toggleLike(postId) {
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const has = p.likedBy.includes(currentUser.email);
      return { ...p, likedBy: has ? p.likedBy.filter((e) => e !== currentUser.email) : [...p.likedBy, currentUser.email] };
    });
    persistPosts(next);
  }

  function addComment(postId, text) {
    const next = posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { id: `c-${Date.now()}`, author: currentUser.name, text }] } : p));
    persistPosts(next);
  }

  function toggleSaved(postId) {
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const arr = p.savedBy || [];
      const has = arr.includes(currentUser.email);
      return { ...p, savedBy: has ? arr.filter((e) => e !== currentUser.email) : [...arr, currentUser.email] };
    });
    persistPosts(next);
  }

  function joinCommunity(communityId) {
    const next = communities.map((c) => {
      if (c.id !== communityId) return c;
      const members = c.members || [];
      const isIn = members.includes(currentUser.email);
      return { ...c, members: isIn ? members.filter((e) => e !== currentUser.email) : [...members, currentUser.email] };
    });
    persistCommunities(next);
  }

  function createCommunity({ name, description, color }) {
    const community = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name, description, color,
      members: [currentUser.email],
      createdBy: currentUser.email,
      createdAt: new Date().toISOString(),
    };
    persistCommunities([community, ...communities]);
  }

  function deleteAccount() {
    const nextUsers = users.filter((u) => u.email !== currentUser.email);
    const nextPosts = posts.filter((p) => p.authorEmail !== currentUser.email);
    persistUsers(nextUsers);
    persistPosts(nextPosts);
    setSessionEmail(null);
    try { window.storage.delete(SESSION_KEY, false); } catch { /* noop */ }
    showToast("Conta excluída.");
  }

  if (!booted) {
    return (
      <div className="few2">
        <style>{STYLES}</style>
        <div className="fw-nebula"><div className="fw-loading-screen">Carregando Feward…</div></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="few2">
        <style>{STYLES}</style>
        {showCredits ? (
          <CreditsScreen onBack={() => setShowCredits(false)} />
        ) : authView === "login" ? (
          <LoginScreen onGoSignup={() => setAuthView("signup")} onLogin={login} onShowCredits={() => setShowCredits(true)} showToast={showToast} />
        ) : (
          <SignupScreen onGoLogin={() => setAuthView("login")} onSignup={signup} onShowCredits={() => setShowCredits(true)} showToast={showToast} />
        )}
        <div className={`fw-toast ${toast.show ? "fw-show" : ""}`}>{toast.msg}</div>
      </div>
    );
  }

  return (
    <div className="few2">
      <style>{STYLES}</style>
      <AppShell
        user={currentUser} tab={tab} setTab={setTab} posts={posts} communities={communities}
        onLogout={logout} onUpdateUser={updateCurrentUser} onCreatePost={createPost}
        onToggleLike={toggleLike} onAddComment={addComment} onToggleSaved={toggleSaved}
        onJoinCommunity={joinCommunity} onCreateCommunity={createCommunity}
        onDeleteAccount={deleteAccount} showToast={showToast}
      />
      <div className={`fw-toast ${toast.show ? "fw-show" : ""}`}>{toast.msg}</div>
    </div>
  );
}
