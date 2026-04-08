/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Coffee, 
  MapPin, 
  Wind, 
  Droplets, 
  Leaf, 
  Send,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FARM_IMAGES = [
  "/images/Farm/BK-Coffee-Farm-Drone-View-Pasto.jpg",
  "/images/Farm/BK-Coffee-Farm-Pasto.jpg"
];

const PRODUCT_IMAGES = [
  "/images/Products/BK-Coffee-Bags-Product.jpg",
  "/images/Products/BK-Coffee-Bag-Bourbon-Rosado.jpg",
  "/images/Products/BK-Coffee-Bag-Edicion-Especial.jpg"
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentFarmImage, setCurrentFarmImage] = useState(0);
  
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [productDirection, setProductDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFarmImage((prev) => (prev + 1) % FARM_IMAGES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (PRODUCT_IMAGES.length <= 1) return;
    const interval = setInterval(() => {
      setProductDirection(1);
      setCurrentProductIndex((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [currentProductIndex]);

  const handleNextProduct = () => {
    setProductDirection(1);
    setCurrentProductIndex((prev) => prev + 1);
  };

  const handlePrevProduct = () => {
    setProductDirection(-1);
    setCurrentProductIndex((prev) => prev - 1);
  };

  const productVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const navLinks = [
    { name: "Origen", href: "#origen" },
    { name: "Proceso", href: "#proceso" },
    { name: "Perfil", href: "#perfil" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src="/images/BK-Logo.png" 
              alt="Beethoven Kaffee Logo" 
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-10 text-xs tracking-[0.2em] uppercase font-medium">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/573217010401"
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary border border-primary/30 px-6 py-2.5 rounded-full hover:bg-primary hover:text-on-primary transition-all duration-300 active:scale-95"
            >
              <WhatsAppIcon size={14} />
              Comprar
            </a>
            <button 
              className="md:hidden text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-surface-container-low border-b border-outline-variant/10 px-6 py-8 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-sm tracking-[0.2em] uppercase text-on-surface-variant"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 lg:pt-20 lg:pb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10" />
          <img 
            src="/images/BK-Header-Background-Coffee-Beans.jpg" 
            alt="Premium Coffee Bag" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-primary font-bold border-l-2 border-primary pl-4">
                Micro-lote de Especialidad
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-on-background">
                Beethoven Kaffee: <br/>
                <span className="text-primary-container italic font-light text-xl md:text-2xl block mt-4 mb-2 tracking-normal">Una experiencia sensorial al paladar</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-black text-xl flex items-center gap-2 shadow-[0_0_40px_rgba(233,193,118,0.3)] border border-white/10">
                <Star size={22} fill="currentColor" />
                84 Puntos de Taza
              </div>
            </div>

            <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed font-light">
              Cultivado en las laderas volcánicas de Nariño, nuestro café ofrece una complejidad sensorial única, resultado de un proceso artesanal meticuloso y la pasión de caficultores locales.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <a 
                href="https://wa.me/573217010401"
                className="flex items-center justify-center gap-3 bg-primary text-on-primary px-10 py-4 rounded-xl font-bold text-center hover:shadow-[0_0_40px_rgba(233,193,118,0.3)] transition-all active:scale-95"
              >
                <WhatsAppIcon size={20} />
                Comprar
              </a>

            </div>
          </motion.div>

          {/* Decorative Image Overlap */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative lg:mt-0 max-w-[300px] sm:max-w-sm lg:max-w-none mx-auto w-full group"
          >
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
            <div className="glass-card p-3 rounded-2xl shadow-2xl overflow-hidden relative aspect-[4/5]">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <AnimatePresence initial={false} custom={productDirection}>
                  <motion.img 
                    key={currentProductIndex}
                    src={PRODUCT_IMAGES[(((currentProductIndex % PRODUCT_IMAGES.length) + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length)]}
                    custom={productDirection}
                    variants={productVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset }) => {
                      const swipeThreshold = 50;
                      if (offset.x < -swipeThreshold) {
                        handleNextProduct();
                      } else if (offset.x > swipeThreshold) {
                        handlePrevProduct();
                      }
                    }}
                    alt="Coffee Product" 
                    className="w-full h-full object-cover absolute top-0 left-0"
                    draggable={false}
                  />
                </AnimatePresence>
              </div>

              {PRODUCT_IMAGES.length > 1 && (
                <>
                  <div className="hidden lg:flex absolute inset-y-0 left-0 items-center justify-center pl-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <button onClick={handlePrevProduct} aria-label="Previous" className="pointer-events-auto bg-surface/80 p-2 rounded-full text-on-surface hover:text-primary backdrop-blur-sm transition-all shadow-lg active:scale-95 border border-white/10">
                      <ChevronLeft size={24} />
                    </button>
                  </div>
                  <div className="hidden lg:flex absolute inset-y-0 right-0 items-center justify-center pr-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <button onClick={handleNextProduct} aria-label="Next" className="pointer-events-auto bg-surface/80 p-2 rounded-full text-on-surface hover:text-primary backdrop-blur-sm transition-all shadow-lg active:scale-95 border border-white/10">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ficha Técnica Section */}
      <section id="origen" className="py-32 bg-surface-container-low">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-20">
            <h2 className="text-4xl font-bold tracking-tighter mb-4">Ficha Técnica</h2>
            <div className="h-1 w-24 bg-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Origen", value: "La Florida, Nariño", desc: "Vereda: El Maco. Tierras volcánicas únicas.", icon: <MapPin size={20} /> },
              { label: "Altura", value: "1.800 msnm", desc: "Altitud óptima para una maduración lenta.", icon: <Wind size={20} /> },
              { label: "Variedad", value: "Blend Especial", desc: "Bourbon Rosado, Caturra, Colomba y Castillo.", icon: <Leaf size={20} /> },
              { label: "Proceso", value: "Lavado", desc: "Secado: Natural al sol.", icon: <Droplets size={20} /> },
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="text-primary flex items-center gap-2">
                  {item.icon}
                  <span className="font-bold uppercase tracking-[0.2em] text-[10px]">{item.label}</span>
                </div>
                <h3 className="text-2xl font-light">{item.value}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sensory Profile */}
      <section id="perfil" className="py-32 relative overflow-hidden">
        {/* Background Decorative Image */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <img 
            src="/images/BK-Coffee-Brans-Fruits.jpg" 
            alt="Sensory Profile Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-24">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary-container font-bold">Notas de Cata</span>
            <h2 className="text-5xl font-extrabold tracking-tighter mt-4">Perfil Sensorial</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Dulzura", 
                subtitle: "Muy marcada", 
                desc: "Notas intensas de chocolate y frutos rojos que definen el carácter del grano.",
                icon: <Star className="text-primary" size={32} />
              },
              { 
                title: "Sabor", 
                subtitle: "Complejo y Balanceado", 
                desc: "Rico en matices de chocolate y frutos rojos, con una arquitectura que evoluciona en paladar.",
                icon: <Coffee className="text-primary" size={32} />
              },
              { 
                title: "Acidez", 
                subtitle: "Buena y Balanceada", 
                desc: "Destacando especialmente cuando el café se enfría, aportando una brillantez cítrica controlada.",
                icon: <Wind className="text-primary" size={32} />
              }
            ].map((note, i) => (
              <motion.div 
                key={note.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-10 rounded-3xl group hover:bg-surface-container-highest transition-all duration-500"
              >
                <div className="mb-8 p-4 bg-primary/5 rounded-2xl inline-block">
                  {note.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{note.title}</h3>
                <p className="text-primary-container font-medium mb-4 text-sm tracking-wide">{note.subtitle}</p>
                <p className="text-on-surface-variant text-sm leading-relaxed font-light">
                  {note.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Overlay Map Section */}
      <section id="proceso" className="h-[600px] relative group overflow-hidden">
        <div className="absolute inset-0 bg-surface/50 z-10 transition-colors duration-700 group-hover:bg-surface/30" />
        <AnimatePresence>
          <motion.img 
            key={currentFarmImage}
            src={FARM_IMAGES[currentFarmImage]}
            alt="Nariño Landscape" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[5000ms]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="space-y-6 p-12 md:p-20 max-w-4xl w-full bg-[radial-gradient(ellipse_35%_35%_at_50%_50%,rgba(19,19,19,0.8)_0%,rgba(19,19,19,0)_100%)]"
          >
            <MapPin className="text-primary mx-auto drop-shadow-lg" size={48} />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white drop-shadow-md">La Florida, Nariño</h2>
            <p className="text-white max-w-md mx-auto text-lg font-medium leading-relaxed drop-shadow-md">
              El lugar donde la geografía y el clima se unen para crear la perfección cafetera.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="contacto" className="py-32 bg-surface">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glass-card p-12 md:p-20 rounded-[2.5rem] border-outline-variant/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tighter">Descubre a qué sabe el café de especialidad</h2>
            <p className="text-on-surface-variant mb-12 text-lg font-light max-w-2xl mx-auto">
              Tostado fresco para que notes la diferencia desde el primer sorbo.
            </p>
            <a 
              href="https://wa.me/573217010401"
              className="inline-flex items-center gap-4 bg-primary text-on-primary px-12 py-5 rounded-2xl font-bold hover:shadow-[0_0_50px_rgba(233,193,118,0.4)] transition-all active:scale-95 text-lg"
            >
              <WhatsAppIcon size={24} />
              Hacer Pedido
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full py-16 px-6 md:px-12 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/BK-Logo.png" 
                alt="BK Logo" 
                className="h-12 w-auto brightness-110"
              />
            </div>
            <p className="text-on-surface-variant text-xs tracking-widest uppercase font-medium">
              Una experiencia sensorial al paladar
            </p>
          </div>

          <div className="text-on-surface-variant text-[10px] tracking-[0.2em] uppercase font-medium">
            © 2026 Beethoven Kaffee
          </div>
        </div>
      </footer>
    </div>
  );
}
