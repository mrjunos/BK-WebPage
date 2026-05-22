import React from "react";
import * as Icons from "lucide-react";

interface DashboardProps {
  state: any;
  onJump: (view: string, subView?: string) => void;
  onToast: (msg: string) => void;
}

export default function AdminDashboard({ state, onJump, onToast }: DashboardProps) {
  const totalStock = state.products.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
  const lowStock = state.products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
  
  const drafts = [state.hero, state.proceso_intro, state.cta].filter((s) => s?.status === "draft").length +
                 state.products.filter((p: any) => p.status === "draft").length;

  // Helper to map icon string to Lucide icon component
  const getIcon = (name: string) => {
    const LucideIcon = (Icons as any)[name];
    return LucideIcon ? <LucideIcon size={16} /> : <Icons.Activity size={16} />;
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 28 }}>
        <div className="stats">
          <div className="stat">
            <div className="stat__k">Lote Activo</div>
            <div className="stat__v">N.º {state.hero?.lot?.match(/\d+/)?.[0] || "014"}</div>
            <div className="stat__d">cosecha 2026 · <strong>{state.hero?.cup_score || 84} pts.</strong></div>
          </div>
          <div className="stat">
            <div className="stat__k">Bolsas en Stock</div>
            <div className="stat__v">{totalStock}</div>
            <div className={`stat__d ${lowStock ? "is-warn" : ""}`}>
              {lowStock > 0 ? (
                <><strong>{lowStock} producto{lowStock > 1 ? "s" : ""}</strong> bajo umbral</>
              ) : (
                <><strong>Niveles saludables</strong></>
              )}
            </div>
          </div>
          <div className="stat">
            <div className="stat__k">Pedidos · Hoy</div>
            <div className="stat__v">07</div>
            <div className="stat__d"><strong>↑ 22%</strong> vs. ayer</div>
          </div>
          <div className="stat">
            <div className="stat__k">Borradores</div>
            <div className="stat__v">{String(drafts).padStart(2, "0")}</div>
            <div className="stat__d">{drafts > 0 ? "Pendientes de revisar" : "Todo publicado"}</div>
          </div>
        </div>
      </div>

      <div className="row" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title"><em>I.</em> Acciones Rápidas</div>
              <div className="card__sub">Atajos a las áreas que se editan con más frecuencia</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 8 }}>
            <QuickActionButton 
              icon="Type" 
              label="Editar Hero" 
              sub="Título, lote y subline" 
              onClick={() => onJump("sections", "hero")} 
            />
            <QuickActionButton 
              icon="Coffee" 
              label="Capítulos del Proceso" 
              sub="Las 6 escenas inmersivas" 
              onClick={() => onJump("sections", "chapters")} 
            />
            <QuickActionButton 
              icon="Star" 
              label="Notas de Cata" 
              sub="Perfil sensorial · 6 notas" 
              onClick={() => onJump("sections", "notes")} 
            />
            <QuickActionButton 
              icon="Package" 
              label="Nuevo Producto" 
              sub="Sumar bolsa o microlote" 
              onClick={() => onJump("products", "new")} 
            />
            <QuickActionButton 
              icon="Image" 
              label="Subir Fotografía" 
              sub="Galería de la finca" 
              onClick={() => onJump("images")} 
            />
            <QuickActionButton 
              icon="Send" 
              label="Probar CTA" 
              sub="Vista previa del enlace WA" 
              onClick={() => onJump("sections", "cta")} 
            />
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title"><em>II.</em> Actividad Reciente</div>
            </div>
            <a className="muted" style={{ fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" }} onClick={() => onToast("Historial completo próximamente")}>Ver todo →</a>
          </div>
          <div className="activity">
            {state.activity && state.activity.slice(0, 6).map((a: any) => (
              <div key={a.id} className="activity__row">
                <div className="activity__dot">{getIcon(a.icon)}</div>
                <div className="activity__body">
                  <div className="t">{a.t}</div>
                  <div className="s">{a.s}</div>
                </div>
                <div className="activity__time">{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 28 }}>
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title"><em>III.</em> Lote {state.hero?.lot?.match(/\d+/)?.[0] || "014"} / 2026 — Vista General</div>
              <div className="card__sub">El expediente del café que se está vendiendo ahora mismo</div>
            </div>
            <a className="btn btn--ghost btn--sm" href="/" target="_blank">
              <Icons.ExternalLink size={14} style={{ marginRight: 6 }} /> Ver Sitio Público
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--adm-line)" }}>
            {[
              ["Origen", `Finca La Pradera, vereda ${state.hero?.origin_city || "La Florida"}`],
              ["Altitud", `${state.hero?.altitude || "1.800"} msnm`],
              ["Suelo", "Volcánico · cenizas del Galeras"],
              ["Varietales", "Bourbon Rosado · Caturra · Colombia · Castillo"],
              ["Proceso", state.hero?.process || "Lavado · Secado al sol"],
              ["Tueste", "Medio · perfil sensorial"],
              ["Cup Score", `${state.hero?.cup_score || 84} pts. SCA`],
              ["Producción", "100% agroecológica"],
            ].map(([k, v], i) => (
              <div 
                key={i} 
                style={{ 
                  padding: "18px 20px", 
                  borderRight: ((i % 4) !== 3) ? "1px solid var(--adm-line)" : "none", 
                  borderBottom: i < 4 ? "1px solid var(--adm-line)" : "none" 
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--adm-fg-dim)", fontWeight: 700, marginBottom: 8 }}>{k}</div>
                <div style={{ fontSize: 14, color: "var(--adm-fg)", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface QuickActionButtonProps {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, sub, onClick }: QuickActionButtonProps) {
  const LucideIcon = (Icons as any)[icon];
  const renderedIcon = LucideIcon ? <LucideIcon size={20} /> : <Icons.Activity size={20} />;
  
  return (
    <button 
      onClick={onClick} 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "start", 
        gap: 8, 
        padding: 16, 
        background: "var(--adm-paper)", 
        border: "1px solid var(--adm-line)", 
        borderRadius: 10, 
        textAlign: "left", 
        cursor: "pointer", 
        transition: "border-color 200ms, transform 200ms" 
      }} 
      className="quick-action-btn"
    >
      <style>{`
        .quick-action-btn:hover {
          border-color: var(--adm-accent) !important;
          transform: translateY(-1px);
        }
      `}</style>
      <div style={{ color: "var(--adm-accent)" }}>{renderedIcon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-fg)" }}>{label}</div>
      <div style={{ fontSize: 11, color: "var(--adm-fg-dim)", lineHeight: 1.3 }}>{sub}</div>
    </button>
  );
}
