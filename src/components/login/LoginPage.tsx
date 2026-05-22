import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth } from "../../firebase";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const AUTHORIZED_ADMINS = ["admin@bk.co", "jjcadu@gmail.com"];

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email || !AUTHORIZED_ADMINS.includes(user.email.toLowerCase())) {
        await signOut(auth);
        setErrorMsg("Este correo electrónico de Google no está autorizado como administrador de Beethoven Kaffee.");
        triggerShake();
        setLoading(false);
        return;
      }

      setLoading(false);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Google sign in error: ", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("El proceso de inicio de sesión fue cancelado por el usuario.");
      } else {
        setErrorMsg("Error de autenticación con Google. Intente de nuevo.");
      }
      triggerShake();
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !password) {
      setErrorMsg("Ingrese su correo y contraseña.");
      triggerShake();
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Try to sign in
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      setLoading(false);
      onLoginSuccess();
    } catch (error: any) {
      console.log("Login error: ", error.code, error.message);
      
      // 2. Auto-registration fallback for admin@bk.co on first attempt
      if (cleanEmail === "admin@bk.co" && 
          (error.code === "auth/user-not-found" || 
           error.code === "auth/invalid-credential" ||
           error.code === "auth/invalid-email" ||
           error.message.includes("credential"))) {
        
        try {
          console.log("Admin account not found. Auto-registering admin...");
          await createUserWithEmailAndPassword(auth, cleanEmail, password);
          setLoading(false);
          onLoginSuccess();
          return;
        } catch (signupError: any) {
          console.error("Auto-registration failed: ", signupError);
          // If signup fails (e.g. password too weak), report it
          if (signupError.code === "auth/weak-password") {
            setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
          } else {
            setErrorMsg("Credenciales incorrectas o error de registro.");
          }
          triggerShake();
          setLoading(false);
          return;
        }
      }

      // Handle standard error codes
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setErrorMsg("La contraseña es incorrecta o no coincide.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMsg("El usuario no está registrado.");
      } else {
        setErrorMsg("Error de autenticación. Intente de nuevo.");
      }
      
      triggerShake();
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="login-page-root">
      <style>{`
        .login-page-root {
          position: fixed;
          inset: 0;
          height: 100vh;
          width: 100vw;
          background: #000;
          overflow: hidden;
          color: var(--bk-bone);
          font-family: var(--font-sans);
          z-index: 9999;
        }
        
        /* Ken Burns crossfade backdrop */
        .bg {
          position: absolute; inset: 0;
          overflow: hidden;
          z-index: 1;
        }
        
        .bg__layer {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0; 
          animation: kb 18s var(--ease-emph) infinite;
          transform: scale(1.05);
        }
        
        .bg__layer:nth-child(1) { 
          background-image: url('/assets/img/farm-drone.jpg'); 
          animation-delay: 0s; 
        }
        .bg__layer:nth-child(2) { 
          background-image: url('/assets/img/beans-fruits.jpg'); 
          animation-delay: 6s; 
        }
        .bg__layer:nth-child(3) { 
          background-image: url('/assets/img/farm-pasto.jpg'); 
          animation-delay: 12s; 
        }
        
        @keyframes kb {
          0%   { opacity: 0; transform: scale(1.08); }
          8%   { opacity: 1; }
          33%  { opacity: 1; }
          42%  { opacity: 0; transform: scale(1.0); }
          100% { opacity: 0; }
        }
        
        .bg::after {
          content: ""; 
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 60% 50%, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.95) 100%),
            linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.7) 100%);
        }

        /* Brand corner */
        .brand-mark {
          position: absolute; top: 40px; left: 48px; z-index: 10;
          display: flex; align-items: center; gap: 16px;
        }
        .brand-mark img { width: 44px; opacity: 0.95; }
        .brand-mark .txt {
          font-family: var(--font-display); font-style: italic; font-size: 20px;
          color: var(--bk-bone);
          text-align: left;
        }
        .brand-mark .txt small {
          display: block; font-family: var(--font-sans); font-style: normal;
          font-size: 9px; letter-spacing: 0.4em; color: var(--bk-bone-dim);
          margin-top: 4px; text-transform: uppercase; font-weight: 600;
        }
        .brand-corner-r {
          position: absolute; top: 40px; right: 48px; z-index: 10;
          font-family: var(--font-display); font-style: italic; font-size: 14px;
          color: var(--bk-bone-dim); display: flex; align-items: center; gap: 12px;
        }
        .brand-corner-r .num {
          font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
          font-family: var(--font-sans); font-style: normal; font-weight: 600;
          color: var(--bk-gold-200);
          padding: 6px 14px; border: 1px solid var(--bk-gold-200); border-radius: 999px;
        }

        /* Center: split layout — quote + login card */
        .frame {
          position: relative; z-index: 5;
          height: 100%;
          display: grid; grid-template-columns: 1.2fr 1fr;
          align-items: center;
          padding: 0 96px;
          gap: 96px;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Left: editorial quote */
        .quote {
          color: var(--bk-bone);
          text-align: left;
        }
        .quote__eyebrow {
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: var(--bk-gold-200); font-weight: 600;
          border-left: 2px solid var(--bk-gold-200);
          padding-left: 16px;
          margin-bottom: 36px;
          display: inline-block;
          text-align: left;
        }
        .quote__big {
          font-family: var(--font-sans);
          font-size: clamp(40px, 4vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.045em;
          color: var(--bk-bone);
          margin: 0 0 24px;
        }
        .quote__big em {
          font-family: var(--font-display); font-style: italic; font-weight: 300;
          color: var(--bk-gold-200);
        }
        .quote__sub {
          font-family: var(--font-display); font-style: italic;
          font-size: 20px;
          color: var(--bk-bone-soft); font-weight: 400;
          line-height: 1.4;
          margin: 0 0 56px;
          max-width: 520px;
        }
        .quote__meta {
          display: flex; gap: 36px; padding-top: 32px;
          border-top: 1px solid var(--bk-line-soft);
        }
        .quote__meta-item .k {
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--bk-bone-dim); font-weight: 600; margin-bottom: 8px;
        }
        .quote__meta-item .v {
          font-family: var(--font-display); font-style: italic;
          font-size: 18px; color: var(--bk-bone); font-weight: 500;
        }

        /* Right: glass login card */
        .card {
          background: rgba(28, 27, 27, 0.55);
          backdrop-filter: blur(28px) saturate(140%);
          -webkit-backdrop-filter: blur(28px) saturate(140%);
          border: 1px solid rgba(233, 193, 118, 0.18);
          border-radius: 4px;
          padding: 56px 52px 44px;
          max-width: 460px; width: 100%;
          margin-left: auto;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .card::before {
          content: ""; position: absolute; left: -100px; top: -100px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(233,193,118,0.12), transparent 60%);
          filter: blur(40px); pointer-events: none;
        }
        .card__head {
          border-bottom: 1px solid var(--bk-line-soft);
          padding-bottom: 24px; margin-bottom: 32px;
        }
        .card__num {
          font-family: var(--font-display); font-style: italic;
          font-size: 13px; color: var(--bk-gold-200); font-weight: 500;
          margin-bottom: 8px;
        }
        .card__title {
          font-family: var(--font-sans); font-size: 28px;
          font-weight: 700; letter-spacing: -0.03em; color: var(--bk-bone);
          margin: 0 0 6px;
        }
        .card__sub {
          font-size: 13px; color: var(--bk-bone-dim); font-weight: 400;
          letter-spacing: 0.05em;
        }

        .field { margin-bottom: 22px; position: relative; }
        .field label {
          display: block;
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--bk-bone-dim); font-weight: 600;
          margin-bottom: 10px;
          text-align: left;
        }
        .field input {
          width: 100%; padding: 14px 0;
          background: transparent; border: none; outline: none;
          border-bottom: 1px solid var(--bk-line-soft);
          font-family: var(--font-sans); font-size: 16px; color: var(--bk-bone); font-weight: 400;
          letter-spacing: -0.01em;
          transition: border-color 200ms;
        }
        .field input::placeholder { color: var(--bk-bone-dim); opacity: 0.6; }
        .field input:focus { border-bottom-color: var(--bk-gold-200); }
        .field--row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px; }
        .field--row label { font-size: 10px; letter-spacing: 0.15em; text-transform: none; color: var(--bk-bone-soft); font-weight: 400; cursor: pointer; display: flex; align-items: center; }
        .field--row a { color: var(--bk-gold-200); font-size: 10px; letter-spacing: 0.15em; cursor: pointer; }
        .field--row input[type="checkbox"] {
          width: 14px; height: 14px; appearance: none;
          border: 1px solid var(--bk-line-soft); border-radius: 2px;
          margin-right: 8px; vertical-align: middle;
          background: transparent;
          cursor: pointer;
        }
        .field--row input[type="checkbox"]:checked {
          background: var(--bk-gold-200); border-color: var(--bk-gold-200);
        }

        .submit {
          margin-top: 28px;
          width: 100%; padding: 18px 24px;
          background: var(--bk-gold-200); color: var(--bk-gold-700);
          border: none; cursor: pointer;
          font: 700 12px var(--font-sans); letter-spacing: 0.3em; text-transform: uppercase;
          transition: box-shadow 300ms, transform 200ms;
          border-radius: 4px;
        }
        .submit:hover:not(:disabled) { box-shadow: var(--glow-gold); }
        .submit:active:not(:disabled) { transform: scale(0.98); }
        .submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .card__divider {
          display: flex; align-items: center; gap: 16px;
          margin: 32px 0 20px;
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--bk-bone-dim); font-weight: 600;
        }
        .card__divider::before, .card__divider::after {
          content: ""; flex: 1; height: 1px; background: var(--bk-line-soft);
        }

        .ghost-btn {
          width: 100%; padding: 14px;
          background: transparent; color: var(--bk-bone);
          border: 1px solid var(--bk-line-soft); cursor: pointer;
          font: 500 12px var(--font-sans); letter-spacing: 0.25em; text-transform: uppercase;
          border-radius: 4px;
          transition: border-color 200ms, color 200ms;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .ghost-btn:hover { border-color: var(--bk-gold-200); color: var(--bk-gold-200); }
        .ghost-btn svg { width: 14px; height: 14px; }

        .footnote {
          margin-top: 32px;
          font-size: 11px; color: var(--bk-bone-dim);
          text-align: center; letter-spacing: 0.05em;
        }
        .footnote a { color: var(--bk-gold-200); }

        /* Helper "demo creds" pill */
        .demo {
          position: absolute; bottom: 40px; left: 48px; z-index: 10;
          font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--bk-bone-dim); font-weight: 600;
          background: rgba(28,27,27,0.7); backdrop-filter: blur(8px);
          padding: 12px 16px; border-radius: 4px;
          border: 1px solid var(--bk-line-soft);
          display: flex; align-items: center; gap: 12px;
        }
        .demo i { width: 6px; height: 6px; border-radius: 50%; background: var(--bk-gold-200); box-shadow: var(--glow-gold); }
        .demo .v { font-family: var(--font-display); font-style: italic; font-weight: 500; letter-spacing: 0; text-transform: none; font-size: 12px; color: var(--bk-bone); margin-left: 4px; }

        /* Loading / shake states */
        .card.is-error { animation: shake 0.4s; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
        .err {
          font-size: 11px; color: #e89c8c; margin-top: 8px; min-height: 14px;
          letter-spacing: 0.05em;
          text-align: left;
        }
        
        @media (max-width: 1024px) {
          .frame {
            grid-template-columns: 1fr;
            padding: 140px 32px 60px;
            gap: 48px;
            overflow-y: auto;
          }
          .quote {
            text-align: center;
          }
          .quote__eyebrow {
            margin-bottom: 24px;
            border-left: none;
            border-bottom: 2px solid var(--bk-gold-200);
            padding-left: 0;
            padding-bottom: 4px;
          }
          .quote__sub {
            margin: 0 auto 36px;
          }
          .quote__meta {
            justify-content: center;
            gap: 24px;
          }
          .card {
            margin: 0 auto;
          }
          .brand-mark, .brand-corner-r, .demo {
            position: fixed;
          }
          .brand-mark { top: 20px; left: 24px; }
          .brand-corner-r { top: 20px; right: 24px; }
          .demo { bottom: 20px; left: 24px; right: 24px; justify-content: center; }
        }
      `}</style>

      <div className="bg" aria-hidden="true">
        <div className="bg__layer"></div>
        <div className="bg__layer"></div>
        <div className="bg__layer"></div>
      </div>

      <div className="brand-mark">
        <img src="/assets/BK-Logo.png" alt="BK" />
        <div className="txt">
          Beethoven Kaffee
          <small>EST. NARIÑO · COLOMBIA</small>
        </div>
      </div>

      <div className="brand-corner-r">
        <span>Panel de Administración</span>
        <span className="num">v. 1.4</span>
      </div>

      <div className="frame">
        {/* Editorial left */}
        <div className="quote">
          <div className="quote__eyebrow">Acceso · Estación de Trabajo</div>
          <h1 className="quote__big">El café tiene <em>su propia voz.</em></h1>
          <p className="quote__sub">Aquí se afina, palabra por palabra, fotografía por fotografía, cómo se cuenta al mundo.</p>
          <div className="quote__meta">
            <div className="quote__meta-item">
              <div className="k">Lote activo</div>
              <div className="v">N.º 014 / 2026</div>
            </div>
            <div className="quote__meta-item">
              <div className="k">Última publicación</div>
              <div className="v">Hace 4 horas</div>
            </div>
            <div className="quote__meta-item">
              <div className="k">Pedidos pendientes</div>
              <div className="v">07 mensajes</div>
            </div>
          </div>
        </div>

        {/* Login card */}
        <form className={`card ${shake ? "is-error" : ""}`} onSubmit={handleSubmit} autoComplete="off">
          <div className="card__head">
            <div className="card__num">Sección N.º 01 — Identidad</div>
            <h2 className="card__title">Bienvenido de vuelta</h2>
            <div className="card__sub">Acceda con sus credenciales de caficultor.</div>
          </div>

          <div className="field">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="usted@beethovenkaffee.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field--row">
            <label>
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              /> 
              Mantener sesión iniciada
            </label>
            <a>¿Olvidó su clave?</a>
          </div>

          <div className="err">{errorMsg}</div>

          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Verificando…" : "Iniciar Sesión →"}
          </button>

          <div className="card__divider">o continúe con</div>

          <button 
            type="button" 
            className="ghost-btn" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 10H12v4h5.6c-.2 2.3-2.2 4-5.6 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.6 4 1.6l3-3C16.9 2.8 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 10-4 10-10 0-.7-.1-1.3-.2-2z"/></svg>
            Google Workspace
          </button>

          <div className="footnote">¿No tiene acceso? <a>Hable con un administrador →</a></div>
        </form>
      </div>

      <div className="demo">
        <i></i> Demo · <span className="v">admin@bk.co · cualquier clave</span>
      </div>
    </div>
  );
}
