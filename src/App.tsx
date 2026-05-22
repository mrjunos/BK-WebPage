import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, doc } from "firebase/firestore";
import * as Icons from "lucide-react";
import { auth, db } from "./firebase";
import { seedDatabaseIfEmpty } from "./services/seeder";

// Component Views
import LandingPage from "./components/landing/LandingPage";
import LoginPage from "./components/login/LoginPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import SectionsEditor from "./components/admin/SectionsEditor";
import ProductsEditor from "./components/admin/ProductsEditor";
import ImagesView from "./components/admin/ImagesView";

export default function App() {
  // Routing State
  const [path, setPath] = useState(window.location.pathname);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Firestore Synchronized State
  const [state, setState] = useState<any>({
    hero: null,
    proceso_intro: null,
    chapters: [],
    notes: [],
    cta: null,
    products: [],
    imageLibrary: [],
    activity: []
  });

  // Admin Dashboard and View Navigation State
  const [currentAdminView, setCurrentAdminView] = useState("dashboard");
  const [jumpHint, setJumpHint] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | React.ReactNode | null>(null);

  // Router listener
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  // Auth state observer & auto-seeder
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoadingAuth(false);
    });

    // Seed database if empty on startup
    seedDatabaseIfEmpty().then((seeded) => {
      if (seeded) {
        console.log("Database was initialized with default Beethoven Kaffee content.");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Guard routing logic
  useEffect(() => {
    if (!loadingAuth) {
      if (path === "/admin" && !user) {
        navigate("/login");
      } else if (path === "/login" && user) {
        navigate("/admin");
      }
    }
  }, [path, user, loadingAuth]);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubHero = onSnapshot(doc(db, "sections", "hero"), (docSnap) => {
      if (docSnap.exists()) {
        setState((prev: any) => ({ ...prev, hero: docSnap.data() }));
      }
    });

    const unsubProcesoIntro = onSnapshot(doc(db, "sections", "proceso_intro"), (docSnap) => {
      if (docSnap.exists()) {
        setState((prev: any) => ({ ...prev, proceso_intro: docSnap.data() }));
      }
    });

    const unsubCta = onSnapshot(doc(db, "sections", "cta"), (docSnap) => {
      if (docSnap.exists()) {
        setState((prev: any) => ({ ...prev, cta: docSnap.data() }));
      }
    });

    const unsubChapters = onSnapshot(collection(db, "chapters"), (snapshot) => {
      const chs: any[] = [];
      snapshot.forEach((doc) => {
        chs.push(doc.data());
      });
      chs.sort((a, b) => (a.id || 0) - (b.id || 0));
      setState((prev: any) => ({ ...prev, chapters: chs }));
    });

    const unsubNotes = onSnapshot(collection(db, "notes"), (snapshot) => {
      const nts: any[] = [];
      snapshot.forEach((doc) => {
        nts.push(doc.data());
      });
      nts.sort((a, b) => (a.id || 0) - (b.id || 0));
      setState((prev: any) => ({ ...prev, notes: nts }));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push(doc.data());
      });
      prods.sort((a, b) => (a.id || 0) - (b.id || 0));
      setState((prev: any) => ({ ...prev, products: prods }));
    });

    const unsubImages = onSnapshot(doc(db, "settings", "images"), (docSnap) => {
      if (docSnap.exists()) {
        setState((prev: any) => ({ ...prev, imageLibrary: docSnap.data().library || [] }));
      }
    });

    const unsubActivity = onSnapshot(collection(db, "activity"), (snapshot) => {
      const acts: any[] = [];
      snapshot.forEach((doc) => {
        acts.push(doc.data());
      });
      acts.sort((a, b) => (a.id || 0) - (b.id || 0));
      setState((prev: any) => ({ ...prev, activity: acts }));
    });

    return () => {
      unsubHero();
      unsubProcesoIntro();
      unsubCta();
      unsubChapters();
      unsubNotes();
      unsubProducts();
      unsubImages();
      unsubActivity();
    };
  }, []);

  // UI Toast handler
  const triggerToast = (msg: string | React.ReactNode) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sign out handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      triggerToast("Sesión cerrada correctamente.");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      triggerToast("Error al cerrar sesión.");
    }
  };

  // Navigation jump handler for dashboard cards
  const handleJump = (view: string, hint?: string) => {
    setCurrentAdminView(view);
    if (hint) {
      setJumpHint(hint);
    } else {
      setJumpHint(null);
    }
  };

  // Loading indicator for credentials validation
  if (loadingAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bk-surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <style>{`
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(233,193,118,0.15);
            border-top-color: var(--bk-gold-200);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner"></div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--bk-bone-soft)", letterSpacing: "0.05em" }}>Verificando credenciales...</div>
      </div>
    );
  }

  // Path Routing switcher
  if (path === "/login") {
    return <LoginPage onLoginSuccess={() => navigate("/admin")} />;
  }

  if (path === "/admin" && user) {
    return (
      <div className="shell">
        <aside className="side">
          <div className="side__brand">
            <img src="/assets/BK-Logo.png" alt="BK Logo" />
            <div className="txt">
              Beethoven Kaffee
              <small>EST. NARIÑO · COLOMBIA</small>
            </div>
          </div>

          <div className="side__section">
            <div className="side__section-label">Navegación</div>
            <nav className="side__nav">
              <button 
                className={`side__link ${currentAdminView === "dashboard" ? "is-active" : ""}`}
                onClick={() => { setCurrentAdminView("dashboard"); setJumpHint(null); }}
              >
                <Icons.LayoutDashboard />
                Dashboard
              </button>
              <button 
                className={`side__link ${currentAdminView === "sections" ? "is-active" : ""}`}
                onClick={() => { setCurrentAdminView("sections"); setJumpHint(null); }}
              >
                <Icons.Type />
                Secciones
                <span className="num">6 salas</span>
              </button>
              <button 
                className={`side__link ${currentAdminView === "products" ? "is-active" : ""}`}
                onClick={() => { setCurrentAdminView("products"); setJumpHint(null); }}
              >
                <Icons.Package />
                Colección Café
                <span className="num">{state.products?.length || 0} bags</span>
              </button>
              <button 
                className={`side__link ${currentAdminView === "images" ? "is-active" : ""}`}
                onClick={() => { setCurrentAdminView("images"); setJumpHint(null); }}
              >
                <Icons.Image />
                Visuales Finca
                <span className="num">{state.imageLibrary?.length || 0} pics</span>
              </button>
            </nav>
          </div>

          <div className="side__user">
            <div className="side__user-card">
              <div className="side__user-avatar">
                {user.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="spacer">
                <div className="side__user-name">Caficultor BK</div>
                <div className="side__user-role">{user.email || "admin@bk.co"}</div>
              </div>
              <button 
                onClick={handleLogout} 
                style={{ background: "none", border: "none", color: "var(--adm-fg-dim)", cursor: "pointer", display: "flex", alignItems: "center" }}
                title="Cerrar Sesión"
              >
                <Icons.LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="page-head">
            <div>
              <div className="page-head__crumb">
                <em>Beethoven Kaffee</em> · Panel de Control
              </div>
              <h1 className="page-head__title">
                {currentAdminView === "dashboard" && <>Resumen General <em>Dashboard</em></>}
                {currentAdminView === "sections" && <>Secciones de la Experiencia <em>Exhibición</em></>}
                {currentAdminView === "products" && <>Colección & Inventario <em>Bolsas</em></>}
                {currentAdminView === "images" && <>Archivo de Recursos Visuales <em>Galería</em></>}
              </h1>
            </div>
            <div className="page-head__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => navigate("/")}>
                <Icons.ExternalLink size={14} style={{ marginRight: 6 }} /> Sitio Público
              </button>
            </div>
          </header>

          <div className="content">
            {currentAdminView === "dashboard" && (
              <AdminDashboard 
                state={state} 
                onJump={handleJump}
                onToast={triggerToast}
              />
            )}
            {currentAdminView === "sections" && (
              <SectionsEditor 
                state={state} 
                setState={setState} 
                jumpHint={jumpHint} 
                onToast={triggerToast}
              />
            )}
            {currentAdminView === "products" && (
              <ProductsEditor 
                state={state} 
                setState={setState} 
                onToast={triggerToast} 
                jumpHint={jumpHint}
              />
            )}
            {currentAdminView === "images" && (
              <ImagesView 
                state={state} 
                setState={setState} 
                onToast={triggerToast}
              />
            )}
          </div>
        </main>

        {toastMsg && (
          <div className="toast">
            <i className="dot"></i>
            {toastMsg}
          </div>
        )}
      </div>
    );
  }

  // Default / fallback to Storefront landing page
  return <LandingPage onNavigate={navigate} isAdminLoggedIn={!!user} />;
}
