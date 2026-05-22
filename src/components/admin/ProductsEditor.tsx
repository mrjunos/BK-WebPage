import React, { useState } from "react";
import * as Icons from "lucide-react";
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ProductModal from "./ProductModal";

interface ProductsEditorProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onToast: (msg: string | React.ReactNode) => void;
  jumpHint?: string | null;
}

type TabType = "all" | "published" | "draft" | "low_stock";

export default function ProductsEditor({ state, setState, onToast, jumpHint }: ProductsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Automatically open modal for new product if jumpHint is "new"
  React.useEffect(() => {
    if (jumpHint === "new") {
      handleAddNew();
    }
  }, [jumpHint]);

  const products = state.products || [];

  // Filter products based on active tab
  const filteredProducts = products.filter((p: any) => {
    if (activeTab === "published") return p.status === "published";
    if (activeTab === "draft") return p.status === "draft";
    if (activeTab === "low_stock") return (p.stock || 0) > 0 && (p.stock || 0) < 10;
    return true; // "all"
  });

  const handleAddNew = () => {
    const nextId = products.length > 0 ? Math.max(...products.map((p: any) => Number(p.id) || 0)) + 1 : 1;
    const nextNum = String(nextId).padStart(2, "0");
    setSelectedProduct({
      id: nextId,
      num: nextNum,
      name: "",
      accent: "",
      tag: "Microlote",
      price: 60000,
      weight: 340,
      stock: 20,
      stock_max: 50,
      description: "",
      image: "assets/img/bags.jpg",
      status: "draft"
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: any) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este producto de forma permanente?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", productId.toString()));
      const updatedProducts = products.filter((p: any) => p.id !== productId);
      setState((prev: any) => ({ ...prev, products: updatedProducts }));
      onToast("Producto eliminado exitosamente.");
    } catch (error) {
      console.error("Error deleting product: ", error);
      onToast("Error al eliminar el producto.");
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      await setDoc(doc(db, "products", productData.id.toString()), productData);
      
      const exists = products.some((p: any) => p.id === productData.id);
      let updatedProducts;
      if (exists) {
        updatedProducts = products.map((p: any) => p.id === productData.id ? productData : p);
      } else {
        updatedProducts = [...products, productData];
      }

      setState((prev: any) => ({ ...prev, products: updatedProducts }));
      setIsModalOpen(false);
      setSelectedProduct(null);
      onToast(exists ? "Producto actualizado correctamente." : "Nuevo producto creado correctamente.");
    } catch (error) {
      console.error("Error saving product: ", error);
      onToast("Error al guardar el producto.");
    }
  };

  // Helper to format currency
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper for stock health status
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="pill pill--draft">Agotado</span>;
    }
    if (stock < 10) {
      return <span className="pill pill--draft" style={{ background: "rgba(233,193,118,0.15)", color: "var(--bk-gold-200)", border: "1px solid rgba(233,193,118,0.3)" }}>Stock Bajo ({stock})</span>;
    }
    return <span className="pill pill--published">Disponible ({stock})</span>;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--adm-fg-dim)", fontWeight: 700, marginBottom: 8 }}>
            Inventario & Catálogo
          </div>
          <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: "-0.025em" }}>
            Cafés Disponibles <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 400 }}>Colección</em>
          </h2>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew}>
          <Icons.Plus size={14} style={{ marginRight: 6 }} /> Nueva Bolsa o Micro-lote
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--adm-line)", paddingBottom: 12 }}>
        {[
          { id: "all", label: "Todos los productos", count: products.length },
          { id: "published", label: "Publicados", count: products.filter((p: any) => p.status === "published").length },
          { id: "draft", label: "Borradores", count: products.filter((p: any) => p.status === "draft").length },
          { id: "low_stock", label: "Bajo Stock", count: products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            style={{
              padding: "8px 16px",
              background: activeTab === tab.id ? "var(--adm-sunken)" : "transparent",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === tab.id ? "var(--adm-accent)" : "var(--adm-fg-dim)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 200ms"
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? "var(--adm-accent-hi)" : "var(--adm-sunken)",
              color: activeTab === tab.id ? "var(--adm-accent-on)" : "var(--adm-fg-dim)",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 10
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Product List Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--adm-fg-dim)" }}>
            <Icons.Package size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No se encontraron productos en esta categoría.</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--adm-line)", background: "var(--adm-sunken)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--adm-fg-dim)", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>Lote</th>
                <th style={{ padding: "14px 20px" }}>Café</th>
                <th style={{ padding: "14px 20px" }}>Precio / Peso</th>
                <th style={{ padding: "14px 20px" }}>Disponibilidad / Inventario</th>
                <th style={{ padding: "14px 20px" }}>Estado</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p: any) => {
                const stockPercentage = Math.min(100, Math.round(((p.stock || 0) / (p.stock_max || 50)) * 100));
                const imgUrl = p.image?.startsWith("assets") ? `/${p.image}` : p.image;
                return (
                  <tr key={p.id} className="live-row" style={{ borderBottom: "1px solid var(--adm-line)", fontSize: 13, color: "var(--adm-fg)" }}>
                    <style>{`
                      .live-row:hover { background: var(--adm-sunken); }
                    `}</style>
                    <td style={{ padding: "16px 20px", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 16 }}>
                      {p.num}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 4, background: `url(${imgUrl}) center/cover`, border: "1px solid var(--adm-line)" }}></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name} <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--adm-accent)", fontWeight: 400 }}>{p.accent}</em></div>
                          <div style={{ fontSize: 11, color: "var(--adm-fg-dim)", marginTop: 4 }}>Tag: <span style={{ textTransform: "uppercase", fontWeight: 600 }}>{p.tag}</span></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 600 }}>{formatPrice(p.price || 0)}</div>
                      <div style={{ fontSize: 11, color: "var(--adm-fg-dim)", marginTop: 4 }}>{p.weight || 340}g</div>
                    </td>
                    <td style={{ padding: "16px 20px", width: "240px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                        {getStockBadge(p.stock || 0)}
                        <span style={{ color: "var(--adm-fg-dim)" }}>Máx: {p.stock_max || 50} bags</span>
                      </div>
                      <div style={{ width: "100%", height: 6, background: "var(--adm-sunken)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          width: `${stockPercentage}%`,
                          height: "100%",
                          background: (p.stock || 0) === 0 ? "rgba(220,53,69,0.5)" : (p.stock || 0) < 10 ? "var(--adm-accent)" : "rgba(40,167,69,0.7)",
                          borderRadius: 3
                        }}></div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {p.status === "published" ? (
                        <span className="pill pill--published"><i></i>Publicado</span>
                      ) : (
                        <span className="pill pill--draft">Borrador</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => handleEdit(p)}>
                          <Icons.Edit size={12} style={{ marginRight: 4 }} /> Editar
                        </button>
                        <button className="btn btn--ghost btn--sm" style={{ color: "#e89c8c" }} onClick={() => handleDelete(p.id)}>
                          <Icons.Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          imageLibrary={state.imageLibrary || []}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
