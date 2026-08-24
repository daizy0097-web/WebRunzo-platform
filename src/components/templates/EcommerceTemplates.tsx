import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  ShoppingBag, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Plus, 
  Minus, 
  X, 
  Check,
  Heart
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. NOVA ARTISAN GOODS & DECOR (tpl-ecom-1 / nova-artisan)
// Handcrafted Sustainable Home Goods, Ceramics & Organic Living
// ============================================================================
export const NovaArtisanDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; img: string }[]>([
    { id: '1', name: 'Kyoto Matte Ceramic Tea Set', price: 94, qty: 1, img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80' }
  ]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const products = [
    { id: '1', name: 'Kyoto Matte Ceramic Tea Set', price: 94, category: 'Ceramics', rating: 4.9, img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80' },
    { id: '2', name: 'Hand-Woven Organic Linen Throw', price: 120, category: 'Textiles', rating: 4.8, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
    { id: '3', name: 'Solid Walnut Sculptural Vessel', price: 165, category: 'Woodcraft', rating: 5.0, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80' },
    { id: '4', name: 'Pure Soy Wax Amber Candle (Oakmoss)', price: 38, category: 'Aromatics', rating: 4.9, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80' },
  ];

  const addToCart = (p: typeof products[0]) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, img: p.img }];
    });
    setCartDrawerOpen(true);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#18181b] text-stone-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#27272a] text-center py-2 text-xs text-stone-300 font-medium px-4 border-b border-zinc-800">
        🌿 100% Carbon-Neutral Shipping & Plastic-Free Biodegradable Packaging Worldwide.
      </div>

      {/* Nav */}
      <nav className="border-b border-zinc-800 bg-[#18181b]/95 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <span className="font-bold text-base tracking-wide text-white">{bizName}</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-stone-400 font-medium">
          <a href="#shop" className="hover:text-white transition">Ceramics</a>
          <a href="#shop" className="hover:text-white transition">Linen & Decor</a>
          <a href="#sustainability" className="hover:text-white transition">Sustainability</a>
        </div>

        <button
          onClick={() => setCartDrawerOpen(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-2 border border-zinc-700 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Bag ({totalItems})</span>
        </button>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Handmade in Small Batches by Master Craftsmen</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Mindful Living Essentials & Artisan Home Ceramics.
        </h1>

        <p className="text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
          Crafted to bring organic warmth, tactile beauty, and serenity into your everyday living rituals.
        </p>
      </header>

      {/* Product Catalog */}
      <section id="shop" className="py-10 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-baseline border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-bold text-white">Current Seasonal Collection</h2>
          <span className="text-xs text-stone-400">4 Signature Objects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition">
              <div className="h-48 overflow-hidden relative">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-stone-300">
                  {p.category}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="text-stone-300 text-[11px] font-medium">{p.rating} (Verified Buyer Review)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="font-bold text-white text-base">${p.price}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Slide-Over Cart Drawer Simulator */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-zinc-900 border-l border-zinc-800 w-full max-w-md h-full p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-white">Your Shopping Bag ({totalItems})</h3>
                <button onClick={() => setCartDrawerOpen(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-stone-400">${item.price} each</div>
                      <div className="text-emerald-400 font-bold mt-1">Qty: {item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <div className="flex justify-between text-sm font-bold text-white">
                <span>Subtotal:</span>
                <span className="text-emerald-400">${subtotal}</span>
              </div>

              {checkoutDone ? (
                <div className="p-4 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold text-center rounded-xl">
                  ✓ Simulated checkout complete! Order #NOVA-9182.
                </div>
              ) : (
                <button
                  onClick={() => { setCheckoutDone(true); if (onBookingSubmitted) onBookingSubmitted(`Cart order placed ($${subtotal})`); }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  Proceed to Checkout (${subtotal})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-stone-500 border-t border-zinc-900 mt-12">
        © {new Date().getFullYear()} {bizName}. Mindfully crafted for quiet living.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. MODA APPAREL & FOOTWEAR (tpl-ecom-2 / moda-apparel)
// High-Fashion Contemporary Streetwear & Tailored Japanese Denim
// ============================================================================
export const ModaApparelDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [bagItemAdded, setBagItemAdded] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#000000] text-white font-sans selection:bg-rose-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur">
        <span className="font-black tracking-widest text-lg uppercase">{bizName}</span>
        <div className="flex items-center gap-4 text-xs font-bold uppercase">
          <span className="text-zinc-400">London • Tokyo</span>
          <button className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded uppercase tracking-wider font-black">
            Bag
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-rose-500 font-mono">Autumn / Winter '26 Drop</span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none">
          Contemporary Urban Silhouettes & Japanese Denim.
        </h1>
      </header>

      {/* Featured Item */}
      <section className="px-6 py-8 max-w-3xl mx-auto bg-zinc-950 border border-zinc-800 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div className="h-64 rounded-xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80" alt="Drop" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <div className="text-rose-500 font-mono uppercase font-bold">Limited to 150 Pieces</div>
            <h3 className="text-xl font-black text-white uppercase mt-0.5">Heavy Oversized Raw Denim Overshirt</h3>
            <div className="text-lg font-black text-white mt-1">$260 USD</div>
          </div>

          <div>
            <div className="text-zinc-400 mb-1 font-bold">Select Size:</div>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-9 h-9 rounded font-bold text-xs ${
                    selectedSize === s ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {bagItemAdded ? (
            <div className="p-3 bg-rose-950 border border-rose-600 text-rose-200 font-bold text-center rounded">
              ✓ Size {selectedSize} Added to Bag!
            </div>
          ) : (
            <button
              onClick={() => { setBagItemAdded(true); if (onBookingSubmitted) onBookingSubmitted(`Added Raw Denim (Size ${selectedSize}) to bag`); }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider rounded transition cursor-pointer"
            >
              Add to Bag ($260)
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900 mt-12 font-mono">
        © {new Date().getFullYear()} {bizName}. All drops final. Worldwide shipping.
      </footer>
    </div>
  );
};
