import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

interface LandingPageProps {
  onNavigate: (path: string) => void;
  isAdminLoggedIn: boolean;
}

export default function LandingPage({ onNavigate, isAdminLoggedIn }: LandingPageProps) {
  // Firestore state
  const [hero, setHero] = useState<any>(null);
  const [procesoIntro, setProcesoIntro] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [cta, setCta] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section tracking state
  const [activeSection, setActiveSection] = useState("hero");
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // References for scroll tracking
  const chapterRefs = useRef<HTMLDivElement[]>([]);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    // 1. Listen to Hero, ProcesoIntro, and CTA in sections
    const unsubscribeSections = onSnapshot(collection(db, "sections"), (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id === "hero") setHero(data);
        if (doc.id === "proceso_intro") setProcesoIntro(data);
        if (doc.id === "cta") setCta(data);
      });
    });

    // 2. Listen to Chapters sorted by ID
    const unsubscribeChapters = onSnapshot(collection(db, "chapters"), (snapshot) => {
      const chs: any[] = [];
      snapshot.forEach((doc) => {
        chs.push(doc.data());
      });
      chs.sort((a, b) => (a.id || 0) - (b.id || 0));
      setChapters(chs);
    });

    // 3. Listen to Tasting Notes sorted by ID
    const unsubscribeNotes = onSnapshot(collection(db, "notes"), (snapshot) => {
      const nts: any[] = [];
      snapshot.forEach((doc) => {
        nts.push(doc.data());
      });
      nts.sort((a, b) => (a.id || 0) - (b.id || 0));
      setNotes(nts);
    });

    // 4. Listen to Products (only published)
    const qProducts = query(collection(db, "products"), where("status", "==", "published"));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push(doc.data());
      });
      prods.sort((a, b) => (a.id || 0) - (b.id || 0));
      setProducts(prods);
      setLoading(false);
    });

    return () => {
      unsubscribeSections();
      unsubscribeChapters();
      unsubscribeNotes();
      unsubscribeProducts();
    };
  }, []);

  // Set up scroll active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const mid = scrollY + window.innerHeight * 0.3;

      const keys = ["hero", "proceso", "ficha", "perfil", "coleccion", "cta"];
      let active = "hero";

      for (const key of keys) {
        const el = sectionRefs.current[key];
        if (el && el.offsetTop <= mid) {
          active = key;
        }
      }
      setActiveSection(active);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  // Set up scrollytelling IntersectionObserver for Chapters
  useEffect(() => {
    if (chapters.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.4) {
            const idx = parseInt(e.target.getAttribute("data-scene-idx") || "0", 10);
            setActiveChapterIndex(idx);
          }
        });
      },
      { threshold: [0.4, 0.6, 0.8] }
    );

    chapterRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [chapters]);

  if (loading || !hero) {
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--bk-bone-soft)", letterSpacing: "0.05em" }}>Beethoven Kaffee...</div>
      </div>
    );
  }

  // Helper to scroll to section
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // WhatsApp checkout helpers
  const getWhatsAppProductLink = (prod: any) => {
    const text = `Hola Beethoven Kaffee, estoy interesado en adquirir una bolsa de su café de especialidad "${prod.name} ${prod.accent || ""}" (Lote ${prod.num}, precio: $${prod.price.toLocaleString("es-CO")} COP).`;
    return `https://wa.me/573217010401?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppGeneralLink = () => {
    const text = `Hola Beethoven Kaffee, he recorrido su museo virtual y me gustaría hacer un pedido de sus cafés de especialidad.`;
    return `https://wa.me/573217010401?text=${encodeURIComponent(text)}`;
  };

  // Generate SVG radar points based on tasting notes
  const getRadarPoints = () => {
    if (!notes || notes.length < 6) return "200,55 320,135 305,265 200,330 80,275 90,140"; // fallback default
    const center = 200;
    const maxR = 160;
    const points = notes.map((n, i) => {
      const intensity = Math.min(5, Math.max(0, n.intensity || 0));
      const r = (intensity / 5) * maxR;
      let x = center;
      let y = center;
      if (i === 0) { // Dulzura (up)
        y = center - r;
      } else if (i === 1) { // Acidez (up-right)
        x = center + r * 0.866025;
        y = center - r * 0.5;
      } else if (i === 2) { // Cuerpo (down-right)
        x = center + r * 0.866025;
        y = center + r * 0.5;
      } else if (i === 3) { // Retrogusto (down)
        y = center + r;
      } else if (i === 4) { // Equilibrio (down-left)
        x = center - r * 0.866025;
        y = center + r * 0.5;
      } else if (i === 5) { // Fragancia (up-left)
        x = center - r * 0.866025;
        y = center - r * 0.5;
      }
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    });
    return points.join(" ");
  };

  const getRadarVertices = () => {
    if (!notes || notes.length < 6) return [];
    const center = 200;
    const maxR = 160;
    return notes.map((n, i) => {
      const intensity = Math.min(5, Math.max(0, n.intensity || 0));
      const r = (intensity / 5) * maxR;
      let x = center;
      let y = center;
      if (i === 0) {
        y = center - r;
      } else if (i === 1) {
        x = center + r * 0.866025;
        y = center - r * 0.5;
      } else if (i === 2) {
        x = center + r * 0.866025;
        y = center + r * 0.5;
      } else if (i === 3) {
        y = center + r;
      } else if (i === 4) {
        x = center - r * 0.866025;
        y = center + r * 0.5;
      } else if (i === 5) {
        x = center - r * 0.866025;
        y = center - r * 0.5;
      }
      return { x, y };
    });
  };

  const currentChapter = chapters[activeChapterIndex] || {};
  const currentChapterImg = currentChapter.image?.startsWith("assets") ? `/${currentChapter.image}` : currentChapter.image;

  return (
    <div className="landing-root">
      <style>{`
        .landing-root {
          background: var(--bk-surface);
          color: var(--bk-bone);
          font-family: var(--font-sans);
          min-height: 100vh;
        }

        /* Top Nav Bar overrides */
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(19, 19, 19, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(78, 70, 57, 0.15);
          transition: background 300ms, padding 300ms;
        }

        .top-nav.is-scrolled {
          background: rgba(10, 10, 10, 0.95);
        }

        .top-nav__inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 820px) {
          .top-nav__inner {
            padding: 16px 24px;
          }
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .logo-wrap img {
          height: 38px;
          width: auto;
        }
        .logo-wrap .title {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 18px;
          color: var(--bk-bone);
          font-weight: 500;
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .logo-wrap .title small {
          font-family: var(--font-sans);
          font-style: normal;
          font-size: 8px;
          letter-spacing: 0.3em;
          color: var(--bk-bone-dim);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .nav-links a {
          color: var(--bk-bone-soft);
          transition: color 200ms;
          cursor: pointer;
        }
        .nav-links a:hover, .nav-links a.is-active {
          color: var(--bk-gold-200);
        }

        @media (max-width: 960px) {
          .nav-links {
            display: none;
          }
        }

        /* Sidebar Navigation Rail */
        .side-rail {
          position: fixed;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 900;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 1100px) {
          .side-rail {
            display: none;
          }
        }

        .rail-item {
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          group: true;
        }

        .rail-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid var(--bk-bone-dim);
          background: transparent;
          transition: all 300ms;
        }

        .rail-item:hover .rail-bullet, .rail-item.is-active .rail-bullet {
          background: var(--bk-gold-200);
          border-color: var(--bk-gold-200);
          box-shadow: var(--glow-gold);
          transform: scale(1.3);
        }

        .rail-label {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          opacity: 0;
          transform: translateX(-10px);
          transition: all 300ms;
          pointer-events: none;
        }

        .rail-item:hover .rail-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* Hero Widescreen Layout */
        .hero-sec {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          padding: 120px 96px 60px;
          gap: 64px;
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
        }

        @media (max-width: 820px) {
          .hero-sec {
            grid-template-columns: 1fr;
            padding: 100px 24px 48px;
            gap: 40px;
            text-align: center;
          }
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: start;
        }

        @media (max-width: 820px) {
          .hero-left {
            align-items: center;
          }
        }

        .hero-eyebrow {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--bk-gold-200);
          font-weight: 700;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hero-title {
          font-size: clamp(48px, 6vw, 84px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.95;
          margin: 0 0 28px;
          color: var(--bk-bone);
        }

        .hero-title em {
          display: block;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          color: var(--bk-gold-200);
          margin-top: 8px;
        }

        .hero-desc {
          font-size: 18px;
          color: var(--bk-bone-soft);
          line-height: 1.5;
          font-weight: 300;
          margin: 0 0 48px;
          max-width: 540px;
          text-align: left;
        }

        @media (max-width: 820px) {
          .hero-desc {
            text-align: center;
          }
        }

        .hero-btns {
          display: flex;
          gap: 16px;
          margin-bottom: 56px;
        }

        .hero-badge-row {
          display: flex;
          gap: 40px;
          border-top: 1px solid var(--bk-line-soft);
          padding-top: 32px;
          width: 100%;
        }

        .hero-badge-item .k {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 700;
          margin-bottom: 6px;
          text-align: left;
        }

        .hero-badge-item .v {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 18px;
          font-weight: 500;
        }

        .hero-right {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-plate-card {
          background: #191919;
          border: 1px solid rgba(233, 193, 118, 0.15);
          border-radius: 6px;
          padding: 16px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          position: relative;
        }

        .hero-plate-card img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-radius: 4px;
        }

        .hero-plate-caption {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          color: var(--bk-gold-200);
          text-align: center;
          margin-top: 16px;
          letter-spacing: 0.05em;
        }

        .hero-rating-sticker {
          position: absolute;
          bottom: -24px;
          right: -24px;
          background: var(--bk-gold-200);
          color: var(--bk-gold-700);
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: var(--glow-gold), 0 10px 20px rgba(0,0,0,0.3);
          font-family: var(--font-sans);
          z-index: 10;
        }

        @media (max-width: 820px) {
          .hero-rating-sticker {
            bottom: -12px;
            right: 0px;
            width: 80px;
            height: 80px;
          }
        }

        .hero-rating-sticker .star {
          font-size: 12px;
        }
        .hero-rating-sticker .score {
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
        }
        .hero-rating-sticker .label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Scrollytelling Bean-to-Cup Story (Sala II) */
        .story-container {
          position: relative;
          background: #0d0d0d;
        }

        .story-intro-box {
          max-width: 720px;
          margin: 0 auto;
          padding: 120px 24px 60px;
          text-align: center;
        }

        .ex-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .ex-label__num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 20px;
          color: var(--bk-gold-200);
        }
        .ex-label__eyebrow {
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 700;
        }
        .ex-label__line {
          width: 48px;
          height: 1px;
          background: var(--bk-line);
        }

        .section-title {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin: 0 0 24px;
        }
        .section-title em {
          display: block;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          color: var(--bk-gold-200);
          margin-top: 4px;
        }

        .section-lede {
          font-size: 16px;
          color: var(--bk-bone-soft);
          line-height: 1.6;
          font-weight: 300;
        }

        /* Widescreen Scrolly Split */
        .scrolly-split {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
        }

        @media (max-width: 820px) {
          .scrolly-split {
            grid-template-columns: 1fr;
          }
        }

        .scrolly-pinned-panel {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 48px;
        }

        @media (max-width: 820px) {
          .scrolly-pinned-panel {
            position: sticky;
            top: 68px; /* below mobile header */
            height: 44vh;
            padding: 12px 16px;
            z-index: 50;
            background: #0d0d0d;
          }
        }

        .scrolly-visual-viewport {
          width: 100%;
          height: 100%;
          max-height: 520px;
          background: #1a1a1a;
          border: 1px solid rgba(233, 193, 118, 0.15);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        @media (max-width: 820px) {
          .scrolly-visual-viewport {
            max-height: 100%;
          }
        }

        .scrolly-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scrolly-layer.is-active {
          opacity: 1;
        }

        .scrolly-caption {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 10;
          text-align: left;
        }

        .scrolly-caption .step {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 16px;
          color: var(--bk-gold-200);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .scrolly-caption .loc {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(247, 243, 235, 0.65);
          font-weight: 600;
        }

        .scrolly-progress {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .scrolly-progress .num {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--bk-gold-200);
        }

        .scrolly-progress .bar {
          width: 2px;
          height: 64px;
          background: rgba(247, 243, 235, 0.15);
          position: relative;
        }

        .scrolly-progress .indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: var(--bk-gold-200);
          box-shadow: var(--glow-gold);
          transition: height 500ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Scrolly Scrollable Text scenes */
        .scrolly-scroll-panel {
          padding: 80px 48px;
          display: flex;
          flex-direction: column;
          gap: 180px;
        }

        @media (max-width: 820px) {
          .scrolly-scroll-panel {
            padding: 24px 20px 80px;
            gap: 60px;
          }
        }

        .scrolly-scene-item {
          min-height: 48vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: start;
          text-align: left;
          border-left: 1px solid var(--bk-line-soft);
          padding-left: 36px;
          transition: border-color 400ms;
        }

        .scrolly-scene-item.is-active {
          border-left-color: var(--bk-gold-200);
        }

        .scene-step-num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 16px;
          color: var(--bk-gold-200);
          margin-bottom: 12px;
        }

        .scene-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin: 0 0 16px;
        }

        .scene-body {
          font-size: 15px;
          color: var(--bk-bone-soft);
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 24px;
          max-width: 440px;
        }

        .scene-stat-box {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          border: 1px solid var(--bk-line-soft);
          padding: 8px 16px;
        }

        .scene-stat-box .val {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 24px;
          font-weight: 500;
          color: var(--bk-gold-200);
        }

        .scene-stat-box .lbl {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 600;
        }

        /* Ficha Tecnica (Sala III) */
        .ficha-sec {
          max-width: 1440px;
          margin: 0 auto;
          padding: 120px 96px;
        }

        @media (max-width: 820px) {
          .ficha-sec {
            padding: 80px 24px;
          }
        }

        .ficha-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--bk-line-soft);
          padding-bottom: 24px;
          margin-bottom: 48px;
        }

        @media (max-width: 820px) {
          .ficha-head {
            flex-direction: column;
            align-items: start;
            gap: 16px;
          }
        }

        .ficha-head .title {
          font-size: 36px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .ficha-head .title em {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          color: var(--bk-gold-200);
        }

        .ficha-head .sub {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 600;
        }

        .ficha-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .ficha-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .ficha-grid {
            grid-template-columns: 1fr;
          }
        }

        .placard-card {
          background: #1c1b1b;
          border: 1px solid rgba(78, 70, 57, 0.15);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
        }

        .placard-card.wide {
          grid-column: span 2;
        }

        @media (max-width: 1024px) {
          .placard-card.wide {
            grid-column: span 2;
          }
        }
        @media (max-width: 600px) {
          .placard-card.wide {
            grid-column: span 1;
          }
        }

        .placard-card .num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 12px;
          color: var(--bk-gold-200);
        }

        .placard-card .key {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 700;
          margin-top: 12px;
          margin-bottom: 8px;
          text-align: left;
        }

        .placard-card .val {
          font-size: 14px;
          line-height: 1.5;
          color: var(--bk-bone);
          font-weight: 400;
          text-align: left;
        }

        .placard-card .val strong {
          font-weight: 700;
        }

        .placard-card .val em {
          font-family: var(--font-display);
          font-style: italic;
          color: var(--bk-gold-200);
        }

        /* Perfil Sensorial (Sala IV) */
        .perfil-sec {
          background: #0d0d0d;
          padding: 120px 96px;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 820px) {
          .perfil-sec {
            padding: 80px 24px;
          }
        }

        .perfil-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          gap: 48px;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .perfil-inner {
            grid-template-columns: 1fr;
            gap: 56px;
          }
        }

        .perfil-left {
          display: flex;
          flex-direction: column;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .perfil-left {
            align-items: center;
            text-align: center;
          }
        }

        .radar-box {
          position: relative;
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
          aspect-ratio: 1;
        }

        .note-row {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--bk-line-soft);
          gap: 16px;
        }

        .note-row .n-num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          color: var(--bk-gold-200);
          width: 24px;
        }

        .note-row .n-name {
          flex: 1;
          font-weight: 700;
          font-size: 14px;
          text-align: left;
        }
        .note-row .n-name span {
          display: block;
          font-size: 11px;
          color: var(--bk-bone-dim);
          font-weight: 400;
          margin-top: 4px;
        }

        .note-intensity-bars {
          display: flex;
          gap: 4px;
        }

        .note-intensity-bars i {
          width: 14px;
          height: 14px;
          border: 1px solid var(--bk-line);
          background: transparent;
          transform: rotate(45deg);
          transition: all 300ms;
        }

        .note-intensity-bars i.on {
          background: var(--bk-gold-200);
          border-color: var(--bk-gold-200);
          box-shadow: 0 0 10px rgba(233,193,118,0.5);
        }

        /* Coleccion Products Widescreen Grid (Sala V) */
        .col-sec {
          max-width: 1440px;
          margin: 0 auto;
          padding: 120px 96px;
        }

        @media (max-width: 820px) {
          .col-sec {
            padding: 80px 24px;
          }
        }

        .col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 48px;
        }

        @media (max-width: 960px) {
          .col-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .col-grid {
            grid-template-columns: 1fr;
          }
        }

        .col-bag-card {
          background: #1c1b1b;
          border: 1px solid rgba(78, 70, 57, 0.15);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-card);
        }

        .col-bag-card img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-bottom: 1px solid rgba(78, 70, 57, 0.15);
        }

        .col-bag-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .col-bag-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 0 0 8px;
        }

        .col-bag-title em {
          font-family: var(--font-display);
          font-style: italic;
          color: var(--bk-gold-200);
          font-weight: 400;
          margin-left: 6px;
        }

        .col-bag-desc {
          font-size: 13px;
          color: var(--bk-bone-soft);
          line-height: 1.5;
          font-weight: 300;
          margin: 0 0 24px;
          text-align: left;
        }

        .col-bag-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--bk-line-soft);
          padding-top: 18px;
        }

        .col-bag-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--bk-gold-200);
        }
        .col-bag-price small {
          display: block;
          font-size: 9px;
          color: var(--bk-bone-dim);
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-top: 4px;
          text-transform: uppercase;
        }

        /* Glass CTA Final (Sala VI) */
        .cta-sec {
          max-width: 1440px;
          margin: 0 auto;
          padding: 80px 96px 140px;
        }

        @media (max-width: 820px) {
          .cta-sec {
            padding: 48px 24px 100px;
          }
        }

        .cta-glass-card {
          background: rgba(28, 27, 27, 0.45);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid rgba(233, 193, 118, 0.15);
          border-radius: 8px;
          padding: 64px 80px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          align-items: center;
          box-shadow: 0 40px 80px rgba(0,0,0,0.4);
        }

        @media (max-width: 960px) {
          .cta-glass-card {
            grid-template-columns: 1fr;
            padding: 48px 32px;
            text-align: center;
            gap: 32px;
          }
        }

        .cta-glass-card .title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 16px;
        }

        .cta-glass-card .title em {
          font-family: var(--font-display);
          font-style: italic;
          color: var(--bk-gold-200);
          font-weight: 300;
        }

        .cta-glass-card .sub {
          font-size: 15px;
          color: var(--bk-bone-soft);
          line-height: 1.6;
          font-weight: 300;
          margin: 0;
          text-align: left;
        }

        @media (max-width: 960px) {
          .cta-glass-card .sub {
            text-align: center;
          }
        }

        .cta-right-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .cta-big-btn {
          width: 100%;
          max-width: 320px;
          background: var(--bk-gold-200);
          color: var(--bk-gold-700);
          border: none;
          padding: 18px 24px;
          border-radius: 4px;
          font: 700 12px var(--font-sans);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 300ms;
        }

        .cta-big-btn:hover {
          box-shadow: var(--glow-gold-lg);
          transform: translateY(-2px);
        }

        .cta-big-btn:active {
          transform: translateY(0);
        }

        .cta-big-btn svg {
          width: 18px;
          height: 18px;
        }

        .cta-legal {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 600;
        }

        /* Footer */
        .bk-footer {
          border-top: 1px solid var(--bk-line-soft);
          background: #0d0d0d;
          padding: 80px 96px;
        }

        @media (max-width: 820px) {
          .bk-footer {
            padding: 48px 24px;
          }
        }

        .bk-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 820px) {
          .bk-footer-inner {
            flex-direction: column;
            gap: 32px;
            text-align: center;
          }
        }

        .bk-footer-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .bk-footer-brand img {
          height: 48px;
        }
        .bk-footer-brand-text {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .bk-footer-tagline {
          font-family: var(--font-sans);
          font-size: 10px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 700;
        }

        .bk-footer-copy {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--bk-bone-dim);
          font-weight: 600;
        }
      `}</style>

      {/* Top Navbar */}
      <nav className={`top-nav ${activeSection !== "hero" ? "is-scrolled" : ""}`}>
        <div className="top-nav__inner">
          <div className="logo-wrap" onClick={() => scrollTo("hero")}>
            <img src="/assets/BK-Logo.png" alt="Beethoven Kaffee" />
            <div className="title">
              Beethoven Kaffee
              <small>Est. Nariño · Colombia</small>
            </div>
          </div>

          <div className="nav-links">
            <a onClick={() => scrollTo("hero")} className={activeSection === "hero" ? "is-active" : ""}>Origen</a>
            <a onClick={() => scrollTo("proceso")} className={activeSection === "proceso" ? "is-active" : ""}>Proceso</a>
            <a onClick={() => scrollTo("ficha")} className={activeSection === "ficha" ? "is-active" : ""}>Ficha</a>
            <a onClick={() => scrollTo("perfil")} className={activeSection === "perfil" ? "is-active" : ""}>Perfil</a>
            <a onClick={() => scrollTo("coleccion")} className={activeSection === "coleccion" ? "is-active" : ""}>Colección</a>
            <a onClick={() => scrollTo("cta")} className={activeSection === "cta" ? "is-active" : ""}>Contacto</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isAdminLoggedIn ? (
              <button
                onClick={() => onNavigate("/admin")}
                className="bk-btn bk-btn--ghost"
                style={{ padding: "8px 16px", borderRadius: 4, fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}
                title="Ir a Consola CMS"
              >
                <Icons.Sliders size={13} /> Panel
              </button>
            ) : (
              <button
                onClick={() => onNavigate("/login")}
                className="bk-btn bk-btn--ghost"
                style={{ padding: "8px 16px", borderRadius: 4, fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}
                title="Acceso de Caficultor"
              >
                <Icons.Lock size={12} /> Acceso
              </button>
            )}

            <a
              href={getWhatsAppGeneralLink()}
              target="_blank"
              rel="noreferrer"
              className="bk-btn"
              style={{ padding: "10px 18px", borderRadius: 4, fontSize: 11 }}
            >
              Comprar
            </a>
          </div>
        </div>
      </nav>

      {/* Floating Side Rail Bullet Navigation */}
      <div className="side-rail">
        {[
          { id: "hero", label: "I. Origen" },
          { id: "proceso", label: "II. Proceso" },
          { id: "ficha", label: "III. Ficha" },
          { id: "perfil", label: "IV. Perfil" },
          { id: "coleccion", label: "V. Colección" },
          { id: "cta", label: "VI. El Encuentro" },
        ].map((item) => (
          <div
            key={item.id}
            className={`rail-item ${activeSection === item.id ? "is-active" : ""}`}
            onClick={() => scrollTo(item.id)}
          >
            <div className="rail-bullet"></div>
            <div className="rail-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* EXHIBIT I: HERO & ORIGEN */}
      <section
        className="hero-sec"
        id="hero"
        ref={(el) => {
          sectionRefs.current["hero"] = el;
        }}
      >
        <div className="hero-left">
          <div className="hero-eyebrow">
            {hero.eyebrow}
            <span className="lot" style={{ opacity: 0.6, fontSize: 9 }}>· {hero.lot}</span>
          </div>
          <h1 className="hero-title">
            {hero.title_main}
            <em>{hero.title_accent}</em>
          </h1>
          <p className="hero-desc">{hero.subline}</p>
          <div className="hero-btns">
            <button className="bk-btn" onClick={() => scrollTo("coleccion")}>
              Ver Colección
            </button>
            <button className="bk-btn bk-btn--ghost" onClick={() => scrollTo("proceso")}>
              Comenzar Recorrido →
            </button>
          </div>

          <div className="hero-badge-row">
            <div className="hero-badge-item">
              <div className="k">Altitud</div>
              <div className="v">{hero.altitude} <span style={{ color: "var(--bk-gold-200)", fontSize: 11, fontStyle: "normal", fontFamily: "var(--font-sans)", fontWeight: 600 }}>msnm</span></div>
            </div>
            <div className="hero-badge-item">
              <div className="k">Origen</div>
              <div className="v">{hero.origin_city?.split(",")[0]} <span style={{ color: "var(--bk-gold-200)", fontSize: 11, fontStyle: "normal", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Nariño</span></div>
            </div>
            <div className="hero-badge-item">
              <div className="k">Proceso</div>
              <div className="v" style={{ fontSize: 16 }}>{hero.process?.split("·")[0]}</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-plate-card">
            <img src={hero.image?.startsWith("assets") ? `/${hero.image}` : hero.image} alt={hero.image_caption} />
            <div className="hero-plate-caption">{hero.image_caption}</div>
            <div className="hero-rating-sticker">
              <span className="star">★</span>
              <span className="score">{hero.cup_score}</span>
              <span className="label">Pts. de Taza</span>
            </div>
          </div>
        </div>
      </section>

      {/* EXHIBIT II: BEAN TO CUP STORY */}
      <section
        className="story-container"
        id="proceso"
        ref={(el) => {
          sectionRefs.current["proceso"] = el;
        }}
      >
        <div className="story-intro-box">
          <div className="ex-label">
            <span className="ex-label__num">II.</span>
            <span className="ex-label__eyebrow">{procesoIntro?.eyebrow || "El Proceso · Sala Inmersiva"}</span>
            <span className="ex-label__line"></span>
          </div>
          <h2 className="section-title">
            {procesoIntro?.title_main}
            <em>{procesoIntro?.title_accent}</em>
          </h2>
          <p className="section-lede">{procesoIntro?.lede}</p>
        </div>

        <div className="scrolly-split">
          {/* Left Pinned Image Visualizer */}
          <div className="scrolly-pinned-panel">
            <div className="scrolly-visual-viewport">
              {chapters.map((ch: any, i: number) => {
                const img = ch.image?.startsWith("assets") ? `/${ch.image}` : ch.image;
                return (
                  <div
                    key={ch.id}
                    className={`scrolly-layer ${activeChapterIndex === i ? "is-active" : ""}`}
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                );
              })}

              <div className="scrolly-caption">
                <div className="step">{currentChapter.step}</div>
                <div className="loc">{hero.origin_city} · {hero.altitude} msnm</div>
              </div>

              <div className="scrolly-progress">
                <div className="num">{String(activeChapterIndex + 1).padStart(2, "0")} / 06</div>
                <div className="bar">
                  <div
                    className="indicator"
                    style={{ height: `${((activeChapterIndex + 1) / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scrollable Text scenes */}
          <div className="scrolly-scroll-panel">
            {chapters.map((ch: any, i: number) => (
              <div
                key={ch.id}
                ref={(el) => {
                  if (el) chapterRefs.current[i] = el;
                }}
                data-scene-idx={i}
                className={`scrolly-scene-item ${activeChapterIndex === i ? "is-active" : ""}`}
              >
                <div className="scene-step-num">{ch.step?.split("—")[0].trim()}</div>
                <h3 className="scene-title">{ch.title}</h3>
                <p className="scene-body">{ch.body}</p>
                <div className="scene-stat-box">
                  <span className="val">{ch.stat_v}</span>
                  <span className="lbl">{ch.stat_k}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXHIBIT III: FICHA TÉCNICA */}
      <section
        className="ficha-sec"
        id="ficha"
        ref={(el) => {
          sectionRefs.current["ficha"] = el;
        }}
      >
        <div className="ficha-head">
          <h2 className="title">
            El expediente <em>del lote.</em>
          </h2>
          <span className="sub">Cosecha 2026 · Mitaca · Finca La Pradera</span>
        </div>

        <div className="ficha-grid">
          <div className="placard-card wide">
            <span className="num">N.º 01</span>
            <div className="key">Origen</div>
            <div className="val">
              Finca <strong>La Pradera</strong>, vereda <em>{hero.origin_city?.split(",")[0] || "La Florida"}</em>, municipio de Pasto — departamento de Nariño, Colombia. Tierras volcánicas.
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 02</span>
            <div className="key">Altitud</div>
            <div className="val">
              <strong>{hero.altitude}</strong> <em>msnm</em>
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 03</span>
            <div className="key">Suelo</div>
            <div className="val">
              Volcánico, derivado de cenizas del <em>Galeras</em>
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 04</span>
            <div className="key">Varietales</div>
            <div className="val">
              Bourbon Rosado · Caturra · Colombia · Castillo
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 05</span>
            <div className="key">Proceso</div>
            <div className="val">
              {hero.process}
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 06</span>
            <div className="key">Tueste</div>
            <div className="val">
              Medio · perfil sensorial
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 07</span>
            <div className="key">Cup Score</div>
            <div className="val">
              <strong>{hero.cup_score}</strong> <em>puntos SCA</em>
            </div>
          </div>

          <div className="placard-card">
            <span className="num">N.º 08</span>
            <div className="key">Producción</div>
            <div className="val">
              100% <em>agroecológica</em>
            </div>
          </div>
        </div>
      </section>

      {/* EXHIBIT IV: PERFIL SENSORIAL */}
      <section
        className="perfil-sec"
        id="perfil"
        ref={(el) => {
          sectionRefs.current["perfil"] = el;
        }}
      >
        <div className="perfil-inner">
          {/* Left Block */}
          <div className="perfil-left">
            <div className="ex-label" style={{ alignItems: "flex-start" }}>
              <span className="ex-label__num">IV.</span>
              <span className="ex-label__eyebrow">Perfil Sensorial</span>
              <span className="ex-label__line" style={{ margin: "12px 0 0" }}></span>
            </div>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              Lo que la taza <em>cuenta de sí.</em>
            </h2>
            <p className="section-lede" style={{ textAlign: "left", maxWidth: "340px", fontSize: "14px" }}>
              Un perfil de equilibrios. Dulzura prolongada a panela y frutos secos, acidez cítrica brillante y cuerpo sedoso característico de las laderas del Galeras.
            </p>
          </div>

          {/* Center Radar Plot */}
          <div className="radar-box">
            <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
              <defs>
                <radialGradient id="rg-plot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(233,193,118,0.45)" />
                  <stop offset="100%" stopColor="rgba(233,193,118,0.06)" />
                </radialGradient>
              </defs>
              {/* Outer and inner web rings */}
              <g fill="none" stroke="rgba(78,70,57,0.3)" strokeWidth="1">
                <polygon points="200,40 338.6,120 338.6,280 200,360 61.4,280 61.4,120" />
                <polygon points="200,72 310.9,136 310.9,264 200,328 89.1,264 89.1,136" />
                <polygon points="200,104 283.1,152 283.1,248 200,296 116.9,248 116.9,152" />
                <polygon points="200,136 255.4,168 255.4,232 200,264 144.6,232 144.6,168" />
                <polygon points="200,168 227.7,184 227.7,216 200,232 172.3,216 172.3,184" />
              </g>
              {/* Axis labels */}
              <g fill="#8a8276" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" letterSpacing="2" textAnchor="middle">
                <text x="200" y="26">DULZURA</text>
                <text x="365" y="120" textAnchor="start">ACIDEZ</text>
                <text x="365" y="285" textAnchor="start">CUERPO</text>
                <text x="200" y="385">RETROGUSTO</text>
                <text x="35" y="285" textAnchor="end">EQUILIBRIO</text>
                <text x="35" y="120" textAnchor="end">FRAGANCIA</text>
              </g>
              {/* Polygon Area Plot */}
              <polygon
                points={getRadarPoints()}
                fill="url(#rg-plot)"
                stroke="var(--bk-gold-200)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Vertices circles */}
              <g fill="var(--bk-gold-200)">
                {getRadarVertices().map((pt, idx) => (
                  <circle key={idx} cx={pt.x} cy={pt.y} r="4.5" style={{ filter: "drop-shadow(0 0 4px var(--bk-gold-200))" }} />
                ))}
              </g>
              {/* Central Cup Score placard */}
              <text x="200" y="195" textAnchor="middle" fontFamily="var(--font-display)" fontStyle="italic" fontWeight="400" fontSize="42" fill="var(--bk-gold-200)">
                {hero.cup_score}
              </text>
              <text x="200" y="215" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8.5" letterSpacing="2.5" fontWeight="700" fill="#8a8276">
                PUNTOS SCA
              </text>
            </svg>
          </div>

          {/* Right Notes list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.map((n: any, i: number) => (
              <div key={n.id} className="note-row">
                <span className="n-num">{String(i + 1).padStart(2, "0")}.</span>
                <div className="n-name">
                  {n.name}
                  <span>{n.sub}</span>
                </div>
                <div className="note-intensity-bars">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <i key={val} className={val <= (n.intensity || 0) ? "on" : ""}></i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXHIBIT V: PRODUCT CATALOG VITRINA */}
      <section
        className="col-sec"
        id="coleccion"
        ref={(el) => {
          sectionRefs.current["coleccion"] = el;
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="ex-label">
            <span className="ex-label__num">V.</span>
            <span className="ex-label__eyebrow">La Colección · Lotes Activos</span>
            <span className="ex-label__line"></span>
          </div>
          <h2 className="section-title">
            Tres lotes, <em>tres lenguajes.</em>
          </h2>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--bk-bone-dim)", fontWeight: 700 }}>
            Tueste por encargo semanal · Envío a todo el país
          </div>
        </div>

        <div className="col-grid">
          {products.map((p: any) => {
            const bagImg = p.image?.startsWith("assets") ? `/${p.image}` : p.image;
            return (
              <article key={p.id} className="col-bag-card">
                <div style={{ position: "relative" }}>
                  {p.tag && <span className="bag-preview-tag" style={{ position: "absolute", top: 16, left: 16 }}>{p.tag}</span>}
                  <img src={bagImg} alt={p.name} />
                </div>
                <div className="col-bag-content">
                  <div>
                    <span className="num" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 13, color: "var(--bk-gold-200)", display: "block", marginBottom: 6 }}>
                      Lote {p.num}
                    </span>
                    <h3 className="col-bag-title">
                      {p.name}
                      {p.accent && <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bk-gold-200)", fontWeight: 400, marginLeft: 6 }}>{p.accent}</em>}
                    </h3>
                    <p className="col-bag-desc">{p.description}</p>
                  </div>
                  <div className="col-bag-footer">
                    <div className="col-bag-price">
                      ${(p.price || 0).toLocaleString("es-CO")}
                      <small>COP / {p.weight || 340}g</small>
                    </div>
                    {p.stock === 0 ? (
                      <span className="pill pill--draft" style={{ padding: "6px 14px", borderRadius: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Agotado</span>
                    ) : (
                      <a
                        href={getWhatsAppProductLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="bk-btn--pill"
                        style={{ padding: "8px 18px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}
                      >
                        Pedir
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* EXHIBIT VI: CTA FINAL & ENCUENTRO */}
      <section
        className="cta-sec"
        id="cta"
        ref={(el) => {
          sectionRefs.current["cta"] = el;
        }}
      >
        <div className="cta-glass-card">
          <div>
            <div className="ex-label" style={{ alignItems: "flex-start", marginBottom: 18 }}>
              <span className="ex-label__num">VI.</span>
              <span className="ex-label__eyebrow">{cta?.eyebrow || "El Encuentro · Sala Final"}</span>
            </div>
            <h2 className="title" style={{ textAlign: "left" }}>
              {cta?.title_main || "Descubra a qué sabe"} <em>{cta?.title_accent || "el café de especialidad."}</em>
            </h2>
            <p className="sub">{cta?.sub || "Tostado fresco para que note la diferencia desde el primer sorbo."}</p>
          </div>

          <div className="cta-right-box">
            <a
              href={getWhatsAppGeneralLink()}
              target="_blank"
              rel="noreferrer"
              className="cta-big-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle" }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {cta?.button || "Hacer Pedido por WhatsApp"}
            </a>
            <div className="cta-legal">Respuesta directa de finca en 5 minutos</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bk-footer">
        <div className="bk-footer-inner">
          <div className="bk-footer-brand">
            <img src="/assets/BK-Logo.png" alt="BK" />
            <div className="bk-footer-brand-text">Beethoven Kaffee</div>
          </div>
          <div className="bk-footer-tagline">Una experiencia sensorial al paladar</div>
          <div className="bk-footer-copy">© 2026 BEETHOVEN KAFFEE · HECHO EN FINCA</div>
        </div>
      </footer>
    </div>
  );
}
