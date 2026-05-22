import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface SectionsEditorProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  jumpHint: string | null;
  onToast: (msg: string | React.ReactNode) => void;
}

export default function SectionsEditor({ state, setState, jumpHint, onToast }: SectionsEditorProps) {
  const [active, setActive] = useState<string | null>(jumpHint);
  const [subActive, setSubActive] = useState<number | null>(null);

  useEffect(() => {
    if (jumpHint) {
      setActive(jumpHint);
    }
  }, [jumpHint]);

  const sections = [
    { id: "hero", num: "I", title: "Hero", em: "El Origen", sub: "Eyebrow, titulares, lote, badge SCA", count: "5 campos" },
    { id: "proceso", num: "II", title: "Proceso", em: "Introducción", sub: "Título e introducción al recorrido inmersivo", count: "3 campos" },
    { id: "chapters", num: "II.b", title: "Capítulos del Proceso", em: "Bean-to-cup", sub: "6 escenas con texto, stat e imagen", count: `${state.chapters?.length || 6} capítulos` },
    { id: "ficha", num: "III", title: "Ficha Técnica", em: "Sala de Documentación", sub: "Origen, altitud, suelo, varietales, puntaje", count: "8 placards · auto" },
    { id: "notes", num: "IV", title: "Perfil Sensorial", em: "Notas de Cata", sub: "6 notas con intensidad", count: `${state.notes?.length || 6} notas` },
    { id: "cta", num: "VI", title: "CTA Final", em: "El Encuentro", sub: "Llamado a WhatsApp", count: "4 campos" },
  ];

  const handleBack = () => {
    setActive(null);
    setSubActive(null);
  };

  if (active === "hero") {
    return <SectionHeroEditor state={state} setState={setState} onBack={handleBack} onToast={onToast} />;
  }
  if (active === "proceso") {
    return <SectionProcesoEditor state={state} setState={setState} onBack={handleBack} onToast={onToast} />;
  }
  if (active === "chapters") {
    return <ChaptersEditor state={state} setState={setState} onBack={handleBack} onToast={onToast} subActive={subActive} setSubActive={setSubActive} />;
  }
  if (active === "notes") {
    return <NotesEditor state={state} setState={setState} onBack={handleBack} onToast={onToast} />;
  }
  if (active === "cta") {
    return <SectionCTAEditor state={state} setState={setState} onBack={handleBack} onToast={onToast} />;
  }
  if (active === "ficha") {
    return <FichaPlaceholder onBack={handleBack} />;
  }

  return (
    <div className="section-list">
      {sections.map((s) => (
        <div key={s.id} className="section-row" onClick={() => setActive(s.id)}>
          <div className="section-row__num">{s.num}.</div>
          <div>
            <div className="section-row__title">
              {s.title} <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)" }}>{s.em}</em>
            </div>
            <div className="section-row__sub">{s.count}</div>
          </div>
          <div className="section-row__pre">{s.sub}</div>
          <div className="flex" style={{ gap: 12 }}>
            <span className="pill pill--published"><i></i>Publicada</span>
            <button className="btn btn--ghost btn--sm">
              <Icons.Edit size={14} style={{ marginRight: 4 }} /> Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// SHARED CMS CONTROLS
// ====================================================================
interface FieldTextProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  hint?: string;
  multiline?: boolean;
  display?: boolean;
  placeholder?: string;
  type?: string;
}

function FieldText({ label, value, onChange, hint, multiline, display, placeholder, type = "text" }: FieldTextProps) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {multiline ? (
        <textarea
          className={`textarea ${display ? "input--display" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          type={type}
          className={`input ${display ? "input--display" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

interface ImagePickerProps {
  value: string;
  onChange: (val: string) => void;
  library: string[];
}

function ImagePicker({ value, onChange, library }: ImagePickerProps) {
  return (
    <div className="field">
      <label className="field__label">Imagen</label>
      <div className="img-grid">
        {library.map((src) => (
          <div 
            key={src} 
            className={`img-tile ${src === value ? "is-selected" : ""}`} 
            onClick={() => onChange(src)}
          >
            <img src={src.startsWith("assets") ? `/${src}` : src} alt="" />
          </div>
        ))}
      </div>
      <div className="field__hint">
        Seleccione una imagen de la galería de la finca.
      </div>
    </div>
  );
}

interface EditorHeadProps {
  num: string;
  title: string;
  em: string;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
}

function EditorHead({ num, title, em, onBack, onSave, onPreview }: EditorHeadProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <button className="btn btn--ghost btn--sm" onClick={onBack} style={{ marginBottom: 12 }}>← Volver a Secciones</button>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--adm-fg-dim)", fontWeight: 700, marginBottom: 8 }}>
          <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 500, marginRight: 6, letterSpacing: 0, textTransform: "none" }}>{num}.</em>
          Editor de Sección
        </div>
        <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: "-0.025em" }}>
          {title} <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 400 }}>{em}</em>
        </h2>
      </div>
      <div className="flex" style={{ gap: 12 }}>
        <button className="btn btn--ghost" onClick={onPreview}>
          <Icons.Eye size={14} style={{ marginRight: 6 }} /> Vista Previa
        </button>
        <button className="btn btn--primary" onClick={onSave}>
          <Icons.Save size={14} style={{ marginRight: 6 }} /> Guardar Cambios
        </button>
      </div>
    </div>
  );
}

// ====================================================================
// LIVE PREVIEW TILES (EMULATING DARK SITE)
// ====================================================================
function PreviewHero({ s }: { s: any }) {
  const imgUrl = s.image?.startsWith("assets") ? `/${s.image}` : s.image;
  return (
    <div className="preview-surface" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="preview-surface__bg" style={{ backgroundImage: `url(${imgUrl})` }}></div>
      <div className="preview-surface__inner">
        <div className="preview-surface__eyebrow">{s.eyebrow} · {s.lot}</div>
        <h2 className="preview-surface__title">{s.title_main} <em>{s.title_accent}</em></h2>
        <div className="preview-surface__body">{s.subline}</div>
        <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "var(--bk-bone-soft)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
          <span style={{ color: "var(--bk-gold-200)" }}>★ {s.cup_score} pts.</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>{s.altitude} msnm</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>{s.origin_city}</span>
        </div>
      </div>
    </div>
  );
}

function PreviewChapter({ c }: { c: any }) {
  const imgUrl = c.image?.startsWith("assets") ? `/${c.image}` : c.image;
  return (
    <div className="preview-surface" style={{ minHeight: 240 }}>
      <div className="preview-surface__bg" style={{ backgroundImage: `url(${imgUrl})` }}></div>
      <div className="preview-surface__inner">
        <div className="preview-surface__pill" style={{ color: "var(--bk-gold-200)", fontStyle: "italic", fontFamily: "var(--font-display)", textTransform: "none", letterSpacing: 0, fontSize: 13, marginBottom: 8 }}>Capítulo {c.step?.split("—")[0].trim() || c.step}</div>
        <h2 className="preview-surface__title" style={{ fontSize: 24, lineHeight: 1.2 }}>{c.title}</h2>
        <div className="preview-surface__body" style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{c.body}</div>
        <div style={{ marginTop: 16, display: "inline-flex", padding: "8px 14px", border: "1px solid rgba(78,70,57,0.4)", gap: 10, alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bk-gold-200)", fontSize: 20, fontWeight: 500 }}>{c.stat_v}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--bk-bone-soft)", fontWeight: 600 }}>{c.stat_k}</span>
        </div>
      </div>
    </div>
  );
}

function PreviewCTA({ s }: { s: any }) {
  return (
    <div className="preview-surface">
      <div className="preview-surface__bg" style={{ backgroundImage: `url(/assets/img/farm-pasto.jpg)` }}></div>
      <div className="preview-surface__inner">
        <div className="preview-surface__eyebrow">{s.eyebrow}</div>
        <h2 className="preview-surface__title">{s.title_main} <em>{s.title_accent}</em></h2>
        <div className="preview-surface__body">{s.sub}</div>
        <div style={{ marginTop: 22, display: "inline-flex", padding: "14px 22px", background: "var(--bk-gold-200)", color: "var(--bk-gold-700)", borderRadius: 999, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700 }}>
          {s.button}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// HERO EDITOR
// ====================================================================
interface SubEditorProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onBack: () => void;
  onToast: (msg: string | React.ReactNode) => void;
}

function SectionHeroEditor({ state, setState, onBack, onToast }: SubEditorProps) {
  const s = state.hero || {};
  const [localHero, setLocalHero] = useState({ ...s });

  useEffect(() => {
    setLocalHero({ ...state.hero });
  }, [state.hero]);

  const set = (k: string, v: any) => {
    setLocalHero((prev: any) => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "sections", "hero"), localHero);
      setState((prev: any) => ({ ...prev, hero: localHero }));
      onToast(<>Sección Hero guardada · publicada en producción</>);
    } catch (e) {
      console.error(e);
      onToast("Error al guardar la sección Hero.");
    }
  };

  return (
    <div>
      <EditorHead 
        num="I" 
        title="Hero" 
        em="El Origen" 
        onBack={onBack} 
        onSave={handleSave} 
        onPreview={() => window.open("/#hero", "_blank")} 
      />

      <div className="editor">
        <div className="editor__pane card">
          <h3><em>A.</em> Contenido</h3>
          <FieldText label="Eyebrow" value={localHero.eyebrow} onChange={(v) => set("eyebrow", v)} hint="Texto en mayúsculas sobre el título. Distintivo del sistema BK." />
          <FieldText label="Etiqueta de Lote" value={localHero.lot} onChange={(v) => set("lot", v)} />
          <FieldText label="Título Principal" value={localHero.title_main} onChange={(v) => set("title_main", v)} display />
          <FieldText label="Título · Acento Serif" value={localHero.title_accent} onChange={(v) => set("title_accent", v)} display hint="Aparece en cursiva dorada, debajo del título principal." />
          <FieldText label="Subline" value={localHero.subline} onChange={(v) => set("subline", v)} multiline hint="Una sola frase. Léelo en voz alta — si suena denso, acórtalo." />
          
          <h3 style={{ marginTop: 24 }}><em>B.</em> Datos del lote</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldText label="Puntaje SCA" value={localHero.cup_score} onChange={(v) => set("cup_score", parseInt(v) || 0)} type="number" />
            <FieldText label="Altitud (msnm)" value={localHero.altitude} onChange={(v) => set("altitude", v)} />
          </div>
          <FieldText label="Origen · Ciudad" value={localHero.origin_city} onChange={(v) => set("origin_city", v)} />
          <FieldText label="Proceso" value={localHero.process} onChange={(v) => set("process", v)} />
        </div>

        <div className="editor__pane">
          <h3><em>C.</em> Imagen del Producto</h3>
          <ImagePicker value={localHero.image} onChange={(v) => set("image", v)} library={state.imageLibrary || []} />
          <FieldText label="Pie de imagen" value={localHero.image_caption} onChange={(v) => set("image_caption", v)} />

          <h3 style={{ marginTop: 24 }}><em>D.</em> Vista Previa en Vivo</h3>
          <PreviewHero s={localHero} />
          <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--adm-card)", border: "1px solid var(--adm-line)", borderRadius: 8, fontSize: 12, color: "var(--adm-fg-dim)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--adm-fg)" }}>Recordatorio de marca · </strong>
            tono formal de tercera persona — usted, no tú. Ningún signo de exclamación, ningún emoji. Las cifras concretas hacen el trabajo.
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// PROCESO INTRO EDITOR
// ====================================================================
function SectionProcesoEditor({ state, setState, onBack, onToast }: SubEditorProps) {
  const s = state.proceso_intro || {};
  const [localProceso, setLocalProceso] = useState({ ...s });

  useEffect(() => {
    setLocalProceso({ ...state.proceso_intro });
  }, [state.proceso_intro]);

  const set = (k: string, v: any) => {
    setLocalProceso((prev: any) => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "sections", "proceso_intro"), localProceso);
      setState((prev: any) => ({ ...prev, proceso_intro: localProceso }));
      onToast(<>Introducción del proceso guardada</>);
    } catch (e) {
      console.error(e);
      onToast("Error al guardar la introducción del proceso.");
    }
  };

  return (
    <div>
      <EditorHead 
        num="II" 
        title="Proceso · Introducción" 
        em="Bean to Cup" 
        onBack={onBack} 
        onSave={handleSave} 
        onPreview={() => window.open("/#proceso", "_blank")} 
      />
      <div className="editor" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="editor__pane card">
          <h3><em>A.</em> Texto introductorio</h3>
          <FieldText label="Título Principal" value={localProceso.title_main} onChange={(v) => set("title_main", v)} display />
          <FieldText label="Título · Acento Serif" value={localProceso.title_accent} onChange={(v) => set("title_accent", v)} display />
          <FieldText label="Lede" value={localProceso.lede} onChange={(v) => set("lede", v)} multiline />
          <div className="field__hint" style={{ marginTop: 12 }}>
            Para editar las 6 escenas del recorrido (La Tierra, La Planta...), use{" "}
            <a style={{ color: "var(--adm-accent)", cursor: "pointer", textDecoration: "underline" }} onClick={onBack}>
              Capítulos del Proceso →
            </a>
          </div>
        </div>
        <div className="editor__pane">
          <h3><em>B.</em> Vista Previa</h3>
          <div className="preview-surface" style={{ minHeight: 280 }}>
            <div className="preview-surface__inner">
              <div className="preview-surface__eyebrow">El Proceso · Sala Inmersiva</div>
              <h2 className="preview-surface__title">{localProceso.title_main} <em>{localProceso.title_accent}</em></h2>
              <div className="preview-surface__body">{localProceso.lede}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// CHAPTERS EDITOR
// ====================================================================
interface ChaptersEditorProps extends SubEditorProps {
  subActive: number | null;
  setSubActive: React.Dispatch<React.SetStateAction<number | null>>;
}

function ChaptersEditor({ state, setState, onBack, onToast, subActive, setSubActive }: ChaptersEditorProps) {
  const chapters = state.chapters || [];
  const editingId = subActive;

  if (editingId != null) {
    const chap = chapters.find((c: any) => c.id === editingId);
    if (!chap) {
      setSubActive(null);
      return null;
    }

    const setChap = (k: string, v: any) => {
      const updatedChapters = chapters.map((c: any) => (c.id === editingId ? { ...c, [k]: v } : c));
      setState((prev: any) => ({ ...prev, chapters: updatedChapters }));
    };

    const handleSave = async () => {
      try {
        await setDoc(doc(db, "chapters", editingId.toString()), chap);
        onToast(`Capítulo ${chap.step?.split("—")[0].trim() || chap.step} guardado`);
      } catch (e) {
        console.error(e);
        onToast("Error al guardar el capítulo.");
      }
    };

    return (
      <div>
        <EditorHead 
          num={`II.${chap.id}`} 
          title={`Capítulo ${chap.step?.split("—")[0].trim() || ""}`} 
          em={chap.step?.split("—")[1]?.trim() || ""} 
          onBack={() => setSubActive(null)} 
          onSave={handleSave} 
          onPreview={() => window.open("/#proceso", "_blank")} 
        />
        <div className="editor">
          <div className="editor__pane card">
            <h3><em>A.</em> Contenido del capítulo</h3>
            <FieldText label="Numeración · Romana — Nombre" value={chap.step} onChange={(v) => setChap("step", v)} hint="Formato: 'I — La Tierra'" />
            <FieldText label="Título del capítulo" value={chap.title} onChange={(v) => setChap("title", v)} display />
            <FieldText label="Cuerpo (una idea, máximo 30 palabras)" value={chap.body} onChange={(v) => setChap("body", v)} multiline />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
              <FieldText label="Cifra destacada" value={chap.stat_v} onChange={(v) => setChap("stat_v", v)} />
              <FieldText label="Etiqueta de cifra" value={chap.stat_k} onChange={(v) => setChap("stat_k", v)} />
            </div>
          </div>
          <div className="editor__pane">
            <h3><em>B.</em> Fotografía de Escena</h3>
            <ImagePicker value={chap.image} onChange={(v) => setChap("image", v)} library={state.imageLibrary || []} />
            <h3 style={{ marginTop: 20 }}><em>C.</em> Vista Previa</h3>
            <PreviewChapter c={chap} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <EditorHead 
        num="II.b" 
        title="Capítulos del Proceso" 
        em="Las 6 escenas" 
        onBack={onBack} 
        onSave={() => onToast("Orden y capítulos sincronizados con el servidor")} 
        onPreview={() => window.open("/#proceso", "_blank")} 
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {chapters.map((c: any) => {
          const imgUrl = c.image?.startsWith("assets") ? `/${c.image}` : c.image;
          return (
            <div 
              key={c.id} 
              className="card card--hi" 
              style={{ padding: 0, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }} 
              onClick={() => setSubActive(c.id)}
            >
              <div style={{ aspectRatio: "3/2", background: `url(${imgUrl}) center/cover`, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))" }}></div>
                <div style={{ position: "absolute", bottom: 12, left: 14, color: "var(--bk-bone)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, fontWeight: 500 }}>{c.step}</div>
                <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", background: "rgba(10,10,10,0.7)", color: "var(--bk-gold-200)", fontSize: 10, letterSpacing: "0.2em", fontWeight: 700, fontFamily: "var(--font-display)", fontStyle: "italic" }}>{c.stat_v}</div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--adm-fg)", lineHeight: 1.3, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "var(--adm-fg-dim)", letterSpacing: "0.1em" }}>{c.stat_k}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// NOTES EDITOR
// ====================================================================
function NotesEditor({ state, setState, onBack, onToast }: SubEditorProps) {
  const notes = state.notes || [];

  const setNote = (id: number, k: string, v: any) => {
    const updatedNotes = notes.map((n: any) => (n.id === id ? { ...n, [k]: v } : n));
    setState((prev: any) => ({ ...prev, notes: updatedNotes }));
  };

  const handleSave = async () => {
    try {
      // Save all 6 notes
      for (const n of notes) {
        await setDoc(doc(db, "notes", n.id.toString()), n);
      }
      onToast("Perfil sensorial guardado · 6 notas");
    } catch (e) {
      console.error(e);
      onToast("Error al guardar las notas de cata.");
    }
  };

  return (
    <div>
      <EditorHead 
        num="IV" 
        title="Perfil Sensorial" 
        em="Notas de Cata" 
        onBack={onBack} 
        onSave={handleSave} 
        onPreview={() => window.open("/#perfil", "_blank")} 
      />
      <div className="card">
        {notes.map((n: any, i: number) => (
          <div key={n.id} className="live-row" style={{ display: "grid", gridTemplateColumns: "60px 1.5fr 2fr 1fr", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--adm-line)" }}>
            <div className="live-row__k" style={{ fontSize: 11, color: "var(--adm-fg-dim)", fontWeight: 600 }}>N.º {String(i + 1).padStart(2, "0")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input 
                className="input input--display" 
                value={n.name || ""} 
                onChange={(e) => setNote(n.id, "name", e.target.value)} 
                style={{ fontSize: 16, fontWeight: 700, background: "transparent", border: "none", borderBottom: "1px dashed var(--adm-line)", color: "var(--adm-fg)", padding: "4px 0", outline: "none" }}
              />
              <input 
                className="input" 
                value={n.sub || ""} 
                onChange={(e) => setNote(n.id, "sub", e.target.value)} 
                style={{ fontSize: 12, color: "var(--adm-fg-dim)", background: "transparent", border: "none", outline: "none" }} 
                placeholder="Descriptor corto (ej. panela · caña)" 
              />
            </div>
            <div>
              <div className="field__label" style={{ marginBottom: 8, fontSize: 10, textTransform: "uppercase", tracking: "0.1em", color: "var(--adm-fg-dim)" }}>Intensidad (0–5)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setNote(n.id, "intensity", v)} 
                    style={{
                      width: 36, height: 36,
                      background: v <= n.intensity ? "var(--adm-accent-hi)" : "var(--adm-sunken)",
                      border: "none", borderRadius: 6, cursor: "pointer",
                      fontSize: 12, fontWeight: 700, color: v <= n.intensity ? "var(--adm-accent-on)" : "var(--adm-fg-dim)",
                      transition: "background 200ms"
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button className="btn btn--ghost btn--icon btn--sm" title="Mover arriba">
                <Icons.ArrowUp size={14} />
              </button>
              <button className="btn btn--ghost btn--icon btn--sm" title="Mover abajo">
                <Icons.ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// CTA EDITOR
// ====================================================================
function SectionCTAEditor({ state, setState, onBack, onToast }: SubEditorProps) {
  const s = state.cta || {};
  const [localCTA, setLocalCTA] = useState({ ...s });

  useEffect(() => {
    setLocalCTA({ ...state.cta });
  }, [state.cta]);

  const set = (k: string, v: any) => {
    setLocalCTA((prev: any) => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "sections", "cta"), localCTA);
      setState((prev: any) => ({ ...prev, cta: localCTA }));
      onToast(<>Sección CTA guardada</>);
    } catch (e) {
      console.error(e);
      onToast("Error al guardar el CTA final.");
    }
  };

  return (
    <div>
      <EditorHead 
        num="VI" 
        title="CTA Final" 
        em="El Encuentro" 
        onBack={onBack} 
        onSave={handleSave} 
        onPreview={() => window.open("/#cta", "_blank")} 
      />
      <div className="editor">
        <div className="editor__pane card">
          <h3><em>A.</em> Contenido</h3>
          <FieldText label="Eyebrow" value={localCTA.eyebrow} onChange={(v) => set("eyebrow", v)} />
          <FieldText label="Título Principal" value={localCTA.title_main} onChange={(v) => set("title_main", v)} display />
          <FieldText label="Título · Acento Serif" value={localCTA.title_accent} onChange={(v) => set("title_accent", v)} display />
          <FieldText label="Sub-texto" value={localCTA.sub} onChange={(v) => set("sub", v)} multiline />
          <FieldText label="Texto del botón" value={localCTA.button} onChange={(v) => set("button", v)} />
        </div>
        <div className="editor__pane">
          <h3><em>B.</em> Vista Previa</h3>
          <PreviewCTA s={localCTA} />
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// FICHA TECHNIQUE AUTO-GENERATION INFO
// ====================================================================
function FichaPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <button className="btn btn--ghost btn--sm" onClick={onBack} style={{ marginBottom: 12 }}>← Volver a Secciones</button>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--adm-fg-dim)", fontWeight: 700, marginBottom: 8 }}>
            <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 500, marginRight: 6, letterSpacing: 0, textTransform: "none" }}>III.</em>
            Ficha Técnica
          </div>
          <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: "-0.025em" }}>
            Ficha Técnica <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 400 }}>Auto-generada</em>
          </h2>
        </div>
      </div>
      <div className="card">
        <div style={{ padding: 64, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--adm-fg-muted)", marginBottom: 8 }}>Generada del lote activo.</div>
          <div style={{ fontSize: 13, color: "var(--adm-fg-dim)", lineHeight: 1.6, maxWidth: 540, margin: "0 auto" }}>
            Los 8 placards (origen, altitud, varietales, etc.) se construyen automáticamente desde los datos del lote que configure en la sección Hero.
            <br />
            Para modificarlos, simplemente edite la sección{" "}
            <a style={{ color: "var(--adm-accent)", cursor: "pointer", textDecoration: "underline" }} onClick={onBack}>
              Hero → Datos del Lote
            </a>.
          </div>
        </div>
      </div>
    </div>
  );
}
