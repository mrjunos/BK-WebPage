import React, { useState } from "react";
import * as Icons from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface ImagesViewProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onToast: (msg: string | React.ReactNode) => void;
}

export default function ImagesView({ state, setState, onToast }: ImagesViewProps) {
  const [newUrl, setNewUrl] = useState("");
  const [copyingIndex, setCopyingIndex] = useState<number | null>(null);

  const library = state.imageLibrary || [];

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;

    if (library.includes(url)) {
      onToast("Esta imagen ya existe en la biblioteca.");
      return;
    }

    const updatedLibrary = [...library, url];

    try {
      await setDoc(doc(db, "settings", "images"), { library: updatedLibrary });
      setState((prev: any) => ({ ...prev, imageLibrary: updatedLibrary }));
      setNewUrl("");
      onToast("Nueva imagen agregada a la biblioteca de la finca.");
    } catch (error) {
      console.error("Error saving image: ", error);
      onToast("Error al guardar la imagen.");
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!window.confirm("¿Está seguro de que desea retirar esta imagen de la biblioteca? Los productos o capítulos que la usen conservarán su ruta, pero ya no aparecerá en el selector.")) {
      return;
    }

    const updatedLibrary = library.filter((src: string) => src !== url);

    try {
      await setDoc(doc(db, "settings", "images"), { library: updatedLibrary });
      setState((prev: any) => ({ ...prev, imageLibrary: updatedLibrary }));
      onToast("Imagen retirada de la biblioteca.");
    } catch (error) {
      console.error("Error deleting image: ", error);
      onToast("Error al retirar la imagen.");
    }
  };

  const handleCopyToClipboard = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopyingIndex(index);
    onToast(
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icons.Check size={14} style={{ color: "var(--adm-accent)" }} />
        Ruta copiada al portapapeles: <code>{url}</code>
      </span>
    );
    setTimeout(() => setCopyingIndex(null), 1500);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--adm-fg-dim)", fontWeight: 700, marginBottom: 8 }}>
            Archivo Visual de la Finca
          </div>
          <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: "-0.025em" }}>
            Fotografías & Gráficos <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 400 }}>Galería</em>
          </h2>
        </div>
      </div>

      <div className="row" style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 24 }}>
        {/* Left Column: Form & Help */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16 }}><em>I.</em> Registrar Nueva Fotografía</h3>
            <p style={{ fontSize: 12, color: "var(--adm-fg-dim)", lineHeight: 1.5, margin: "0 0 18px" }}>
              Registre una nueva ruta de recurso local (dentro de <code>assets/img/...</code>) o un enlace web público para que esté disponible en los selectores de los capítulos y productos.
            </p>
            <form onSubmit={handleAddImage}>
              <div className="field">
                <label className="field__label">Ruta o URL de Imagen</label>
                <input
                  type="text"
                  className="input"
                  placeholder="assets/img/nombre-de-foto.jpg"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: "100%", marginTop: 12 }}>
                <Icons.Plus size={14} style={{ marginRight: 6 }} /> Registrar en Biblioteca
              </button>
            </form>
          </div>

          <div className="card" style={{ background: "var(--adm-sunken)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 13 }}>Guía de Tamaños & Proporciones</h4>
            <ul style={{ fontSize: 12, color: "var(--adm-fg-dim)", paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Capítulos del Proceso</strong>: Utilice fotos de orientación apaisada (Landscape) o cuadradas. Resolución recomendada 1200x800px.</li>
              <li><strong>Empaques de Café</strong>: Proporciones de retrato (Portrait, 4:5). Evite fotos horizontales para que la bolsa no se corte en vitrina.</li>
              <li><strong>Fotógrafos locales</strong>: Andrés y Maya documentan las fincas semanalmente. Copie el nombre exacto de archivo desde el almacenamiento local.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Gallery Grid */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title"><em>II.</em> Galería de Recursos Disponibles</div>
              <div className="card__sub">Haga clic en una imagen para copiar su ruta e insertarla en cualquier sección</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--adm-fg-dim)", fontWeight: 600 }}>{library.length} fotografías</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            {library.map((src: string, index: number) => {
              const imgUrl = src.startsWith("assets") ? `/${src}` : src;
              return (
                <div
                  key={src}
                  style={{
                    border: "1px solid var(--adm-line)",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--adm-sunken)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                  className="gallery-tile"
                >
                  <style>{`
                    .gallery-tile:hover .gallery-actions {
                      opacity: 1;
                    }
                  `}</style>
                  {/* Image Viewport */}
                  <div style={{ aspectRatio: "4/3", background: `url(${imgUrl}) center/cover`, position: "relative" }}>
                    {/* Hover actions panel overlay */}
                    <div
                      className="gallery-actions"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        opacity: 0,
                        transition: "opacity 200ms"
                      }}
                    >
                      <button
                        className="btn btn--primary btn--icon btn--sm"
                        onClick={() => handleCopyToClipboard(src, index)}
                        title="Copiar ruta"
                      >
                        {copyingIndex === index ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                      </button>
                      <button
                        className="btn btn--sm"
                        style={{ background: "#d9534f", border: "none", color: "#fff" }}
                        onClick={() => handleDeleteImage(src)}
                        title="Retirar de biblioteca"
                      >
                        <Icons.Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata display */}
                  <div style={{ padding: 12 }}>
                    <div
                      onClick={() => handleCopyToClipboard(src, index)}
                      style={{
                        fontSize: 10,
                        fontFamily: "monospace",
                        color: "var(--adm-fg-dim)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                      title="Haga clic para copiar"
                    >
                      {src}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
