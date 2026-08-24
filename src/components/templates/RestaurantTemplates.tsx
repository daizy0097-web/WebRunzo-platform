import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Utensils, 
  Wine, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  Flame, 
  Check, 
  ShoppingBag, 
  Star, 
  Sparkles,
  Phone,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. BISTRO BLOOM & WINE BAR (tpl-rest-1 / bistro-bloom)
// Fine Dining, Farm-to-Table Seasonal Gastronomy & Curated Wine Cellar
// ============================================================================
export const BistroBloomDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [activeMenuCat, setActiveMenuCat] = useState<'tasting' | 'starters' | 'mains' | 'cellar'>('tasting');
  const [resDate, setResDate] = useState('2026-09-12');
  const [resTime, setResTime] = useState('19:30');
  const [partySize, setPartySize] = useState('2 Guests');
  const [seatingArea, setSeatingArea] = useState('Main Dining Room');
  const [resSubmitted, setResSubmitted] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  const menuItems = {
    tasting: [
      { name: '7-Course Chef’s Seasonal Journey', price: '$145', desc: 'Handcrafted seasonal progression featuring wild Sonoma black truffles, dry-aged heritage duck, and organic garden botanicals.', wine: 'Optional Sommelier Reserve Pairing: +$95' },
      { name: 'Plant-Forward Botanical Symphony', price: '$120', desc: 'Charred heirloom brassicas, fermented chanterelle broth, smoked kohlrabi carpaccio, and preserved summer blossoms.', wine: 'Optional Natural & Biodynamic Pairing: +$80' },
    ],
    starters: [
      { name: 'Hokkaido Scallop Crudo', price: '$28', desc: 'Finger lime pearls, compressed cucumber, yuzu-dill vinaigrette, and sea fennel.' },
      { name: 'Pan-Seared Hudson Valley Foie Gras', price: '$34', desc: 'Brioche toast, poached mission figs, aged port reduction, and toasted hazelnuts.' },
      { name: 'Charred Heirloom Burrata', price: '$24', desc: 'Oak-smoked peach compote, wild arugula, 25-year balsamic drizzle.' },
    ],
    mains: [
      { name: 'Dry-Aged Prime Wagyu Ribeye (A5)', price: '$88', desc: 'Bone marrow butter, potato mousseline, roasted chanterelles, red wine demi-glace.' },
      { name: 'Pan-Roasted Mediterranean Sea Bass', price: '$46', desc: 'Fennel pollen crust, saffron broth, baby artichokes, and castelvetrano olive puree.' },
      { name: 'Heritage Berkshire Pork Chop', price: '$42', desc: 'Cider glaze, parsnip puree, charred broccolini, and spiced cherry jus.' },
    ],
    cellar: [
      { name: 'Domaine de la Romanée-Conti 2017', price: '$650 / btl', desc: 'Grand Cru, Côte de Nuits, Burgundy, France • Silky tannins, dark cherries, forest floor notes.' },
      { name: 'Château Margaux 1er Grand Cru Classé 2015', price: '$520 / btl', desc: 'Bordeaux, France • Ripe blackcurrant, cedar, delicate violet aromatics.' },
      { name: 'Opus One Napa Valley Red Blend 2019', price: '$410 / btl', desc: 'Oakville, California • Rich cassis, dark chocolate, structured velvety finish.' },
    ],
  };

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setResSubmitted(true);
    if (onBookingSubmitted) onBookingSubmitted(`Table reserved for ${partySize} at ${resTime} on ${resDate}`);
  };

  return (
    <div className="w-full bg-[#120f0d] text-[#e8ded5] font-serif selection:bg-amber-800 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#1c1815] border-b border-[#2d2520] px-6 py-2 text-xs font-sans text-amber-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wine className="w-3.5 h-3.5 text-amber-400" />
          <span>Michelin Guide Recommended • Wine Spectator Award of Excellence</span>
        </div>
        <div className="hidden sm:block text-stone-400 text-[11px]">
          Dinner Service: Tuesday – Sunday from 5:00 PM
        </div>
      </div>

      {/* Nav */}
      <nav className="border-b border-[#2d2520] bg-[#120f0d]/95 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif italic text-base">
            B
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-[#f5efe6] tracking-wide">{bizName}</div>
            <div className="text-[9px] uppercase tracking-widest text-amber-400/80 font-sans">Gastronomy & Wine Room</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[#a89b91]">
          <a href="#story" className="hover:text-amber-300 transition">Our Philosophy</a>
          <a href="#menu" className="hover:text-amber-300 transition">Menus</a>
          <a href="#cellar" className="hover:text-amber-300 transition">Wine Cellar</a>
          <a href="#reserve" className="hover:text-amber-300 transition">Reservations</a>
        </div>

        <a
          href="#reserve"
          className="bg-[#b45309] hover:bg-[#92400e] text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded transition shadow-md"
        >
          Book a Table
        </a>
      </nav>

      {/* Hero */}
      <header className="relative px-6 py-20 sm:py-28 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-600/30 bg-amber-950/40 text-amber-300 text-xs font-sans uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Farm-to-Table Culinary Artistry</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-normal text-[#fcf8f2] tracking-tight leading-tight">
          Where Artisanal Gastronomy Meets Rare Vintages.
        </h1>

        <p className="text-sm sm:text-base text-[#b8aba0] max-w-2xl mx-auto font-sans leading-relaxed">
          Rooted in heritage farming and modern culinary technique. Every dish is a tribute to seasonal terroir, accompanied by over 400 handpicked international labels.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 font-sans">
          <a
            href="#reserve"
            className="bg-[#b45309] hover:bg-[#92400e] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded transition shadow-lg shadow-amber-950"
          >
            Reserve Your Experience
          </a>
          <a
            href="#menu"
            className="border border-[#423730] text-[#e8ded5] hover:bg-[#1f1915] font-semibold text-xs sm:text-sm px-6 py-3 rounded transition"
          >
            Explore Seasonal Menu
          </a>
        </div>
      </header>

      {/* Menu Section */}
      <section id="menu" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-sans">Curated Offerings</span>
          <h2 className="text-3xl sm:text-4xl font-normal text-white">Seasonal Culinary Repertoire</h2>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-10 font-sans text-xs uppercase tracking-wider flex-wrap">
          {(['tasting', 'starters', 'mains', 'cellar'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveMenuCat(cat)}
              className={`px-4 py-2 rounded transition cursor-pointer ${
                activeMenuCat === cat
                  ? 'bg-amber-900/60 border border-amber-600/60 text-amber-200'
                  : 'text-stone-400 hover:text-white border border-transparent'
              }`}
            >
              {cat === 'tasting' ? 'Tasting Menus' : cat === 'starters' ? 'First Courses' : cat === 'mains' ? 'Entrées' : 'Sommelier Reserve'}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        <div className="space-y-6">
          {menuItems[activeMenuCat].map((item, idx) => (
            <div key={idx} className="bg-[#181411] border border-[#2d2520] p-6 rounded-xl hover:border-amber-700/40 transition">
              <div className="flex items-baseline justify-between border-b border-[#2d2520] pb-2 mb-2">
                <h3 className="text-lg text-[#fcf8f2] font-normal">{item.name}</h3>
                <span className="text-base font-sans font-bold text-amber-400">{item.price}</span>
              </div>
              <p className="text-xs font-sans text-[#a89b91] leading-relaxed">{item.desc}</p>
              {'wine' in item && item.wine && (
                <div className="mt-2 text-[11px] font-sans text-amber-300/90 italic flex items-center gap-1.5">
                  <Wine className="w-3.5 h-3.5" />
                  <span>{item.wine}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reservation Interactive Form */}
      <section id="reserve" className="py-16 px-6 bg-[#16120f] border-t border-[#2d2520]">
        <div className="max-w-3xl mx-auto bg-[#1a1512] border border-[#382e27] p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-sans">Guaranteed Seating</span>
            <h2 className="text-2xl sm:text-3xl font-normal text-white">Reserve a Dining Table</h2>
            <p className="text-xs font-sans text-stone-400">For parties of 6 or more, please contact our concierge directly at concierge@bistrobloom.com</p>
          </div>

          {resSubmitted ? (
            <div className="p-8 text-center bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 font-sans">
              <Check className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Reservation Confirmed!</h3>
              <p className="text-xs text-amber-200/90">We look forward to hosting your party of {partySize} on {resDate} at {resTime}.</p>
            </div>
          ) : (
            <form onSubmit={handleReservation} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a89b91] mb-1">Date</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#120f0d] border border-[#382e27] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#a89b91] mb-1">Time</label>
                  <select
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#120f0d] border border-[#382e27] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>17:30</option>
                    <option>18:15</option>
                    <option>19:00</option>
                    <option>19:30</option>
                    <option>20:15</option>
                    <option>21:00</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a89b91] mb-1">Party Size</label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#120f0d] border border-[#382e27] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                    <option>5 Guests</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a89b91] mb-1">Seating Atmosphere</label>
                  <select
                    value={seatingArea}
                    onChange={(e) => setSeatingArea(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#120f0d] border border-[#382e27] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>Main Dining Room</option>
                    <option>Sommelier Wine Cellar (Quiet)</option>
                    <option>Garden Courtyard (Heated Patio)</option>
                    <option>Chef's Counter</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-lg"
              >
                Confirm Table Reservation
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-8 text-center text-xs font-sans text-stone-500 border-t border-[#241d18]">
        © {new Date().getFullYear()} {bizName}. 1422 Vine Street, Sonoma Valley. Valet parking provided.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. ARTISAN TRATTORIA ROMANA (tpl-rest-2 / artisan-trattoria)
// Authentic Handcrafted Roman Pasta, Wood-Fired Pizza & Italian Wine
// ============================================================================
export const ArtisanTrattoriaDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [orderSent, setOrderSent] = useState(false);

  const pastaAndPizza = [
    { name: 'Tagliolini al Tartufo Nero', price: 26, desc: 'Fresh egg tagliolini tossed in rich butter emulsion, Parmigiano-Reggiano 36-month, and freshly shaved black summer truffles.' },
    { name: 'Rigatoni alla Carbonara Autentica', price: 22, desc: 'Crispy Guanciale di Amatrice, farm egg yolks, Pecorino Romano DOP, and freshly cracked black peppercorns. No cream, ever.' },
    { name: 'Pizza Margherita Verace D.O.P.', price: 19, desc: 'San Marzano tomatoes, fresh Mozzarella di Bufala Campana, organic sweet basil, extra virgin olive oil.' },
    { name: 'Pizza Diavola Piccante', price: 21, desc: 'Fiery Calabrian Soppressata, smoked fior di latte, hot honey drizzle, and crushed chili oil.' },
  ];

  const addToCart = (item: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { name: item.name, price: item.price, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#1a0f0d] text-stone-200 font-sans">
      {/* Top Banner */}
      <div className="bg-[#7f1d1d] text-rose-100 text-center py-2 text-xs font-semibold px-4">
        🇮🇹 Direct from Rome to your table: Fresh pasta hand-rolled daily at 6:00 AM.
      </div>

      {/* Nav */}
      <nav className="bg-[#1f1210] border-b border-rose-950 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-serif font-black text-sm">
            T
          </div>
          <div>
            <div className="font-serif font-bold text-base text-white">{bizName}</div>
            <div className="text-[10px] text-red-400 uppercase tracking-widest font-mono">Cucina Tradizionale Romana</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a href="#menu" className="hover:text-red-400 transition hidden sm:inline">Il Menu</a>
          <a href="#story" className="hover:text-red-400 transition hidden sm:inline">La Nostra Storia</a>
          <a
            href="#takeaway"
            className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway ({cart.reduce((s, i) => s + i.qty, 0)})</span>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-16 sm:py-24 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>Wood-Fired & Handcrafted Since 1984</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Authentic Roman Pasta & Wood-Fired Pizza Specialità.
        </h1>

        <p className="text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Centuries-old recipes passed through three generations of Roman pizzaioli and pasta master chefs. Pure ingredients imported directly from Lazio and Campania.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <a href="#menu" className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg">
            View Traditional Menu
          </a>
          <a href="#takeaway" className="bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold px-6 py-3 rounded-xl hover:bg-stone-800 transition">
            Order Pickup Online
          </a>
        </div>
      </header>

      {/* Specialty Menu */}
      <section id="menu" className="py-12 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs uppercase font-bold text-red-400">Le Specialità</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">Signature Handmade Dishes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastaAndPizza.map((dish, idx) => (
            <div key={idx} className="bg-[#241513] border border-rose-950 p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif font-bold text-base text-white">{dish.name}</h3>
                  <span className="text-sm font-bold text-red-400">${dish.price}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{dish.desc}</p>
              </div>
              <button
                onClick={() => addToCart(dish)}
                className="self-end bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add to Order
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Takeaway Order Simulator */}
      <section id="takeaway" className="py-12 px-6 max-w-xl mx-auto">
        <div className="bg-[#221311] border border-rose-900 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-rose-950 pb-3">
            <h3 className="font-serif font-bold text-lg text-white">Your Pickup Basket</h3>
            <span className="text-xs text-stone-400">Ready in ~25 mins</span>
          </div>

          {cart.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-4">Your basket is empty. Click "+ Add to Order" above.</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-stone-300">
                  <span>{item.qty}x {item.name}</span>
                  <span className="font-bold text-white">${item.price * item.qty}</span>
                </div>
              ))}
              <div className="border-t border-rose-950 pt-3 flex justify-between font-bold text-sm text-white">
                <span>Total:</span>
                <span className="text-red-400">${total}</span>
              </div>
            </div>
          )}

          {orderSent ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold">
              ✓ Order transmitted to kitchen! Order #TR-8492.
            </div>
          ) : (
            <button
              disabled={cart.length === 0}
              onClick={() => { setOrderSent(true); if (onBookingSubmitted) onBookingSubmitted(`Takeaway order of $${total} sent`); }}
              className="w-full py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Confirm Takeaway Pickup (${total})
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-stone-600 border-t border-[#241513]">
        © {new Date().getFullYear()} {bizName}. Via della Scrofa 42. Made with amore.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. URBAN SPICE FUSION GRILL (tpl-rest-3 / urban-spice)
// High-Energy Southeast Asian Fusion, Charred Robata Grills & Late Night
// ============================================================================
export const UrbanSpiceDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [quickOrderSent, setQuickOrderSent] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState('🌶️🌶️ Medium Hot');

  const skewersAndWoks = [
    { name: 'Charred Pork Belly Robata Skewers', price: '$16', tags: 'Sweet Soy, Yuzu Glaze, Toasted Sesame', spice: '🌶️ Mild' },
    { name: 'Fiery Wok Black Pepper Beef', price: '$22', tags: 'Snake River Farms Angus, Scallions, Crispy Garlic', spice: '🌶️🌶️🌶️ Extra Hot' },
    { name: 'Crispy Bangkok Drunken Noodles', price: '$19', tags: 'Thai Basil, Tiger Prawns, Birdseye Chili', spice: '🌶️🌶️ Medium' },
    { name: 'Smoky Miso Glazed Eggplant', price: '$14', tags: 'Red Miso, Ginger Pearls, Furikake Crunch', spice: 'Mild' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#120a05] text-slate-200 font-sans">
      {/* Dynamic Header */}
      <nav className="bg-[#1c0f08] border-b border-orange-950 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-600/30">
            🔥
          </div>
          <div>
            <div className="font-black text-base text-white tracking-wider">{bizName.toUpperCase()}</div>
            <div className="text-[10px] text-orange-400 font-mono">Robata Grill & Late Night Bites</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#qr-order"
            className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-orange-600/40 uppercase tracking-wider"
          >
            Express Pickup
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-16 sm:py-20 max-w-4xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-700 text-orange-400 text-xs font-black uppercase tracking-widest">
          <span>Charred Robata • Wok Fire • Ice Cold Highballs</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
          Ignite Your Senses With Southeast Asian Fire & Spice.
        </h1>

        <p className="text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
          Smoky binchotan charcoal grills, sizzling woks, and electrifying chili oil combinations crafted for the bold palate.
        </p>
      </header>

      {/* Menu Grid */}
      <section className="py-10 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skewersAndWoks.map((item, idx) => (
            <div key={idx} className="bg-[#1e1008] border border-orange-900/50 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-sm">{item.name}</h3>
                <span className="font-black text-orange-400 text-sm">{item.price}</span>
              </div>
              <p className="text-xs text-stone-400">{item.tags}</p>
              <div className="text-[10px] font-bold text-orange-500">{item.spice}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Express Order Form */}
      <section id="qr-order" className="py-12 px-6 max-w-md mx-auto">
        <div className="bg-[#24130a] border border-orange-600 p-6 rounded-2xl text-center space-y-4">
          <h3 className="font-black text-lg text-white uppercase">Express Takeaway Box</h3>
          <p className="text-xs text-stone-300">Choose your spice profile and grab hot food at the express window in 15 mins.</p>

          {quickOrderSent ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold text-xs rounded-xl">
              🔥 Order Sent to Grill! Pickup Code: #SPICE-99
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-[#140a04] border border-orange-900 text-white font-bold"
              >
                <option>🌶️ Mild (Citrus Sweet)</option>
                <option>🌶️🌶️ Medium Hot (Szechuan Peppercorn)</option>
                <option>🌶️🌶️🌶️ Extra Hot (Ghost Pepper Crisps)</option>
              </select>

              <button
                onClick={() => { setQuickOrderSent(true); if (onBookingSubmitted) onBookingSubmitted(`Express takeout ordered (${spiceLevel})`); }}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer shadow-lg"
              >
                Order Express Street Box ($24)
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-stone-600 border-t border-orange-950">
        © {new Date().getFullYear()} {bizName}. Open till 2:00 AM Thursday – Sunday.
      </footer>
    </div>
  );
};
