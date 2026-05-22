import React, { useState } from "react";
import * as Icons from "lucide-react";

interface ProductModalProps {
  product: any;
  imageLibrary: string[];
  onClose: () => void;
  onSave: (productData: any) => void;
}

export default function ProductModal({ product, imageLibrary, onClose, onSave }: ProductModalProps) {
  const [localProduct, setLocalProduct] = useState({ ...product });

  const set = (k: string, v: any) => {
    setLocalProduct((prev: any) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localProduct.name.trim()) {
      alert("Por favor ingrese el nombre del café.");
      return;
    }
    onSave(localProduct);
  };

  const imgUrl = localProduct.image?.startsWith("assets") ? `/${localProduct.image}` : localProduct.image;

  // Format price
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="modal-backdrop">
      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-container {
          background: var(--adm-bg);
          border: 1px solid var(--adm-line);
          border-radius: 8px;
          max-width: 960px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
          animation: modalAppear 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--adm-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--adm-line);
          background: var(--adm-sunken);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Dark Public Bag Card Preview */
        .preview-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bag-preview-card {
          background: #151414;
          border: 1px solid rgba(233, 193, 118, 0.15);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          color: #f7f3eb;
          font-family: var(--font-sans);
          position: relative;
        }

        .bag-preview-img {
          width: 100%;
          aspect-ratio: 4/5;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .bag-preview-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(233, 193, 118, 0.12);
          border: 1px solid rgba(233, 193, 118, 0.3);
          color: #e9c176;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 99px;
        }

        .bag-preview-num {
          position: absolute;
          top: 16px;
          right: 16px;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          color: #e9c176;
          opacity: 0.8;
        }

        .bag-preview-content {
          padding: 20px;
        }

        .bag-preview-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .bag-preview-accent {
          font-family: var(--font-display);
          font-style: italic;
          color: #e9c176;
          font-weight: 400;
          margin-left: 6px;
        }

        .bag-preview-desc {
          font-size: 12px;
          color: rgba(247, 243, 235, 0.7);
          line-height: 1.5;
          margin: 0 0 16px;
          font-weight: 300;
        }

        .bag-preview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(247, 243, 235, 0.08);
          padding-top: 16px;
        }

        .bag-preview-price {
          font-size: 18px;
          font-weight: 700;
          color: #e9c176;
        }

        .bag-preview-weight {
          font-size: 11px;
          color: rgba(247, 243, 235, 0.4);
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="modal-container">
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Icons.Coffee size={20} style={{ color: "var(--adm-accent)" }} />
            {localProduct.name ? `Editar: ${localProduct.name}` : "Nuevo Producto Especial"}
          </h3>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onClose}>
            <Icons.X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <div className="modal-body">
            {/* Left Column: Form Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label className="field__label">Lote (Número)</label>
                  <input
                    type="text"
                    className="input"
                    value={localProduct.num || ""}
                    onChange={(e) => set("num", e.target.value)}
                    placeholder="01"
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label">Tag Destacado</label>
                  <input
                    type="text"
                    className="input"
                    value={localProduct.tag || ""}
                    onChange={(e) => set("tag", e.target.value)}
                    placeholder="Microlote, Insignia..."
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
                <div className="field">
                  <label className="field__label">Nombre del Café</label>
                  <input
                    type="text"
                    className="input"
                    value={localProduct.name || ""}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Bourbon Rosado"
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label">Nombre Acento (Italic)</label>
                  <input
                    type="text"
                    className="input"
                    value={localProduct.accent || ""}
                    onChange={(e) => set("accent", e.target.value)}
                    placeholder="Edición 2026"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label className="field__label">Precio (COP)</label>
                  <input
                    type="number"
                    className="input"
                    value={localProduct.price || 0}
                    onChange={(e) => set("price", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label">Peso en gramos</label>
                  <input
                    type="number"
                    className="input"
                    value={localProduct.weight || 340}
                    onChange={(e) => set("weight", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label className="field__label">Stock Actual</label>
                  <input
                    type="number"
                    className="input"
                    value={localProduct.stock || 0}
                    onChange={(e) => set("stock", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label">Stock Máximo (Lote)</label>
                  <input
                    type="number"
                    className="input"
                    value={localProduct.stock_max || 50}
                    onChange={(e) => set("stock_max", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field__label">Descripción Sensorial (Palabras sencillas)</label>
                <textarea
                  className="textarea"
                  value={localProduct.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="El perfil floral más alto del año. Dulzura prolongada con notas cítricas marcadas..."
                  rows={3}
                />
              </div>

              <div className="field">
                <label className="field__label">Estado del Producto</label>
                <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={localProduct.status === "published"}
                      onChange={() => set("status", "published")}
                    />
                    Publicar directamente en vitrina
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={localProduct.status === "draft"}
                      onChange={() => set("status", "draft")}
                    />
                    Borrador (Oculto del público)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Asset Select + Dark Live Card Preview */}
            <div className="preview-pane">
              <div>
                <label className="field__label" style={{ marginBottom: 10 }}>Seleccionar Diseño de Empaque</label>
                <div className="img-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {imageLibrary.map((src) => (
                    <div
                      key={src}
                      className={`img-tile ${src === localProduct.image ? "is-selected" : ""}`}
                      onClick={() => set("image", src)}
                      style={{ cursor: "pointer", aspectRatio: "1", borderRadius: 4, overflow: "hidden", border: src === localProduct.image ? "2px solid var(--adm-accent)" : "1px solid var(--adm-line)" }}
                    >
                      <img src={src.startsWith("assets") ? `/${src}` : src} alt="" style={{ width: "100%", height: "100%", objectCover: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="field__label" style={{ marginBottom: 8 }}>Vista Previa en Vitrina</label>
                <div className="bag-preview-card">
                  <div className="bag-preview-img" style={{ backgroundImage: `url(${imgUrl})` }}>
                    {localProduct.tag && <div className="bag-preview-tag">{localProduct.tag}</div>}
                    <div className="bag-preview-num">Lote {localProduct.num}</div>
                  </div>
                  <div className="bag-preview-content">
                    <h4 className="bag-preview-title">
                      {localProduct.name || "Café Beethoven"}
                      {localProduct.accent && <span className="bag-preview-accent">{localProduct.accent}</span>}
                    </h4>
                    <p className="bag-preview-desc">
                      {localProduct.description || "Agregue una descripción para el cliente en el formulario de la izquierda."}
                    </p>
                    <div className="bag-preview-footer">
                      <span className="bag-preview-price">{formatPrice(localProduct.price || 0)}</span>
                      <span className="bag-preview-weight">{localProduct.weight || 340}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              <Icons.Save size={14} style={{ marginRight: 6 }} /> Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
