import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const initialState = {
  hero: {
    eyebrow: "Micro-Lote de Especialidad",
    lot: "Lote N.º 014 / 2026",
    title_main: "Beethoven",
    title_accent: "Kaffee.",
    subline: "Cultivado en las laderas volcánicas de Nariño, nuestro café ofrece una complejidad sensorial única — resultado de un proceso artesanal meticuloso y la pasión de caficultores locales.",
    cup_score: 84,
    image: "assets/img/bag-bourbon.jpg",
    image_caption: "Bourbon Rosado · Edición 2026",
    altitude: "1.800",
    origin_city: "La Florida, Nariño",
    process: "Lavado · Secado al Sol",
    status: "published",
  },
  proceso_intro: {
    title_main: "Del grano a la taza,",
    title_accent: "seis pasos sin atajos.",
    lede: "Un recorrido a través del año cafetero en La Florida. Cada paso fue documentado en finca por nuestros caficultores. Deslice para acompañarlos.",
    status: "published",
  },
  chapters: [
    { id: 1, step: "I — La Tierra", title: "Suelo volcánico que recuerda fuego antiguo.", body: "La finca se asienta sobre cenizas del Galeras. Esa mineralidad — magnesio, potasio, hierro — es la primera nota de la taza, mucho antes de que llegue al molino.", stat_v: "1.800", stat_k: "m. sobre el mar", image: "assets/img/farm-drone.jpg" },
    { id: 2, step: "II — La Planta", title: "Cuatro variedades, una sola conversación.", body: "Bourbon Rosado, Caturra, Colombia y Castillo conviven en la misma ladera. Cada una aporta una voz distinta — dulzura, cuerpo, acidez, resistencia.", stat_v: "04", stat_k: "varietales en armonía", image: "assets/img/farm-pasto.jpg" },
    { id: 3, step: "III — El Fruto", title: "La cereza decide cuándo está lista.", body: "Recolección manual, grano a grano. Solo se cosecha la cereza madura — la que cede al primer pellizco. El resto espera a la siguiente ronda.", stat_v: "100%", stat_k: "recolección selectiva", image: "assets/img/beans-fruits.jpg" },
    { id: 4, step: "IV — El Lavado", title: "Fermentación corta, agua de montaña.", body: "Despulpado el mismo día. Fermentación entre 14 y 18 horas según altitud y temperatura ambiente. Lavado con agua que baja de los páramos.", stat_v: "16 h", stat_k: "fermentación promedio", image: "assets/img/farm-pasto.jpg" },
    { id: 5, step: "V — El Secado", title: "Sol y paciencia, sin máquinas.", body: "El grano se extiende en marquesinas elevadas. Se voltea cada cuatro horas. Cuando la humedad llega al 11%, se descansa por treinta días antes del tueste.", stat_v: "11%", stat_k: "humedad ideal", image: "assets/img/beans-header.jpg" },
    { id: 6, step: "VI — El Tueste", title: "Tostado fresco, por encargo.", body: "Tueste medio, perfilado para preservar la acidez cítrica y el dulzor a panela. Se empaca dentro de las 72 horas siguientes. Llega a su taza con menos de tres semanas de tostado.", stat_v: "≤ 21 d", stat_k: "del tueste al pedido", image: "assets/img/bags.jpg" },
  ],
  notes: [
    { id: 1, name: "Dulzura", sub: "panela · miel de caña", intensity: 5 },
    { id: 2, name: "Acidez", sub: "cítrica · mandarina", intensity: 4 },
    { id: 3, name: "Cuerpo", sub: "medio · sedoso", intensity: 3 },
    { id: 4, name: "Retrogusto", sub: "chocolate de leche", intensity: 4 },
    { id: 5, name: "Fragancia", sub: "floral · jazmín", intensity: 3 },
    { id: 6, name: "Equilibrio", sub: "complejo · armónico", intensity: 5 },
  ],
  cta: {
    eyebrow: "El Encuentro · Sala Final",
    title_main: "Descubra a qué sabe",
    title_accent: "el café de especialidad.",
    sub: "Tostado fresco para que note la diferencia desde el primer sorbo. El pedido se confirma por WhatsApp con uno de nuestros caficultores.",
    button: "Hacer Pedido por WhatsApp",
    status: "published",
  },
  products: [
    { id: 1, num: "01", name: "Bourbon Rosado", accent: "Edición 2026", tag: "Insignia", price: 78000, weight: 340, stock: 24, stock_max: 60, description: "El más floral del año. Recolectado de las plantas más altas de la finca. Acidez cítrica viva, final a miel.", image: "assets/img/bag-bourbon.jpg", status: "published" },
    { id: 2, num: "02", name: "Edición Especial", accent: "Galeras", tag: "Microlote", price: 96000, weight: 340, stock: 8, stock_max: 30, description: "Un solo cuartel, una sola cosecha. Cuerpo más denso, retro a cacao oscuro y nuez tostada. Lote limitado.", image: "assets/img/bag-edicion.jpg", status: "published" },
    { id: 3, num: "03", name: "Tradicional", accent: "de finca", tag: "Cotidiano", price: 62000, weight: 340, stock: 41, stock_max: 80, description: "Mezcla de los cuatro varietales. El café de todos los días en la finca — equilibrado, dulce, sin sorpresas.", image: "assets/img/bags.jpg", status: "published" },
    { id: 4, num: "04", name: "Catación de Caficultor", accent: "trío de muestras", tag: "Edición Limitada", price: 145000, weight: 240, stock: 0, stock_max: 20, description: "Tres bolsas de 80g — Bourbon Rosado, Galeras y Tradicional. Para descubrir el perfil completo de la finca en una sola caja.", image: "assets/img/bags.jpg", status: "draft" },
  ],
  imageLibrary: [
    "assets/img/beans-header.jpg",
    "assets/img/beans-fruits.jpg",
    "assets/img/farm-drone.jpg",
    "assets/img/farm-pasto.jpg",
    "assets/img/bags.jpg",
    "assets/img/bag-bourbon.jpg",
    "assets/img/bag-edicion.jpg",
  ],
  activity: [
    { id: 1, icon: "Edit", t: "Maya editó la sección Hero", s: "Cambió el subtítulo principal", when: "hace 12 min" },
    { id: 2, icon: "Package", t: "Edición Especial · Galeras quedó con stock bajo", s: "Quedan 8 bolsas — umbral 10", when: "hace 1 h" },
    { id: 3, icon: "Mail", t: "3 pedidos nuevos por WhatsApp", s: "2 Bourbon Rosado, 1 Tradicional", when: "hace 2 h" },
    { id: 4, icon: "Image", t: "Andrés subió 2 fotografías a la galería", s: "Cosecha mayo 2026", when: "hace 5 h" },
    { id: 5, icon: "Edit", t: "Capítulo IV · El Lavado fue revisado", s: "Ajuste de tiempos de fermentación", when: "ayer" },
    { id: 6, icon: "Star", t: "Lote 014 fue calificado por SCA", s: "Puntaje 84 — confirmado oficialmente", when: "ayer" },
  ],
};

export async function seedDatabaseIfEmpty(): Promise<boolean> {
  try {
    // Check if sections collection has "hero" or is empty
    const sectionsRef = collection(db, "sections");
    const sectionsSnap = await getDocs(sectionsRef);
    
    if (!sectionsSnap.empty) {
      console.log("Database already seeded.");
      return false;
    }
    
    console.log("Seeding database with default Beethoven Kaffee config...");
    const batch = writeBatch(db);
    
    // 1. Sections
    batch.set(doc(db, "sections", "hero"), initialState.hero);
    batch.set(doc(db, "sections", "proceso_intro"), initialState.proceso_intro);
    batch.set(doc(db, "sections", "cta"), initialState.cta);
    
    // 2. Chapters
    initialState.chapters.forEach((chap) => {
      batch.set(doc(db, "chapters", chap.id.toString()), chap);
    });
    
    // 3. Notes
    initialState.notes.forEach((note) => {
      batch.set(doc(db, "notes", note.id.toString()), note);
    });
    
    // 4. Products
    initialState.products.forEach((prod) => {
      batch.set(doc(db, "products", prod.id.toString()), prod);
    });
    
    // 5. Image Library
    batch.set(doc(db, "settings", "images"), { library: initialState.imageLibrary });
    
    // 6. Activity Logs
    initialState.activity.forEach((act) => {
      batch.set(doc(db, "activity", act.id.toString()), act);
    });
    
    await batch.commit();
    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    return false;
  }
}
