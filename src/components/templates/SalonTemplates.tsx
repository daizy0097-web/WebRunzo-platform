import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Sparkles, 
  Scissors, 
  Calendar, 
  Clock, 
  Check, 
  Star, 
  Heart, 
  Crown, 
  Gift, 
  Phone,
  ArrowRight
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. LUMIÈRE LUXE HAIR & BEAUTY (tpl-sal-1 / lumiere-salon)
// High-End Luxury Hair Salon, Balayage Color Masters & Extensions
// ============================================================================
export const LumiereSalonDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [selectedStylist, setSelectedStylist] = useState('Gisele V. (Master Colorist)');
  const [selectedService, setSelectedService] = useState('Signature French Balayage ($240)');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const stylists = [
    { name: 'Gisele V.', title: 'Master Colorist', exp: '12 yrs exp', specialty: 'Custom Blonde & Balayage' },
    { name: 'Antoine M.', title: 'Creative Director', exp: '15 yrs exp', specialty: 'Precision French Bob & Styling' },
    { name: 'Chantal L.', title: 'Extension Specialist', exp: '9 yrs exp', specialty: 'Great Lengths Keratin Bonds' },
  ];

  const services = [
    { name: 'Signature French Balayage & Gloss', price: '$240', duration: '2.5 hrs', desc: 'Hand-painted dimensional brightness tailored to your skin undertones.' },
    { name: 'Precision Cut & Luxury Blowout', price: '$120', duration: '60 min', desc: 'Bespoke shear sculpting and botanical scalp massage.' },
    { name: 'Keratin Smoothing & Silk Treatment', price: '$280', duration: '2 hrs', desc: 'Frizz elimination, intensive bond repair, and liquid glass shine.' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#12080c] text-rose-100 font-sans selection:bg-pink-600 selection:text-white">
      {/* Top Bar */}
      <div className="bg-[#240a17] text-rose-300 text-center py-2 text-xs font-semibold px-4 border-b border-rose-950">
        ✨ Complimentary champagne, artisanal cappuccino, and scalp ritual with every appointment.
      </div>

      {/* Nav */}
      <nav className="bg-[#180b11]/95 border-b border-rose-950/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-serif font-bold text-sm">
            L
          </div>
          <div>
            <div className="font-serif text-base font-bold text-white tracking-wide">{bizName}</div>
            <div className="text-[10px] text-pink-400 tracking-wider uppercase font-mono">Bespoke Hair & Color Studio</div>
          </div>
        </div>

        <a
          href="#book"
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-pink-900"
        >
          Book Stylist
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-800 text-pink-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Awarded Best Luxury Hair Studio 2025</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Bespoke Hair Artistry, Balayage Masters & Radiant Color.
        </h1>

        <p className="text-sm text-rose-200/80 max-w-xl mx-auto leading-relaxed">
          Step into our sanctuary of indulgence and leave with silky, vibrant hair crafted to celebrate your natural beauty.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <a href="#book" className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xl shadow-pink-900/60">
            Select Stylist & Time
          </a>
          <a href="#services" className="bg-[#240a17] border border-rose-900 text-rose-200 font-semibold text-xs px-6 py-3 rounded-xl hover:bg-[#300d1f] transition">
            View Service Menu
          </a>
        </div>
      </header>

      {/* Stylists */}
      <section className="py-10 px-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-bold text-pink-400">Our Artists</span>
          <h2 className="font-serif text-2xl text-white">Meet the Senior Team</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stylists.map((s, idx) => (
            <div key={idx} className="bg-[#1f0d16] border border-rose-950 p-5 rounded-2xl text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-pink-900/60 border border-pink-700/60 flex items-center justify-center mx-auto text-pink-200 font-serif font-bold text-lg">
                {s.name.charAt(0)}
              </div>
              <h3 className="font-serif font-bold text-white text-base">{s.name}</h3>
              <div className="text-xs text-pink-400 font-semibold">{s.title}</div>
              <p className="text-[11px] text-rose-300/80">{s.specialty}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Simulator */}
      <section id="book" className="py-16 px-6 max-w-lg mx-auto">
        <div className="bg-[#1f0d16] border border-pink-700/40 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
          <h2 className="font-serif text-2xl font-bold text-white text-center">Reserve an Appointment</h2>

          {bookingConfirmed ? (
            <div className="p-6 bg-pink-950/80 border border-pink-500 text-pink-200 text-xs font-bold text-center rounded-2xl space-y-2">
              <Check className="w-8 h-8 text-pink-400 mx-auto" />
              <div>Appointment Reserved with {selectedStylist}!</div>
              <p className="text-rose-300 font-normal">We look forward to pampering you.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setBookingConfirmed(true); if (onBookingSubmitted) onBookingSubmitted(`Hair salon appointment booked with ${selectedStylist}`); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-300 mb-1 font-semibold">Select Stylist</label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#12080c] border border-rose-900 text-white focus:outline-none focus:border-pink-500"
                >
                  {stylists.map((st, i) => (
                    <option key={i}>{st.name} ({st.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-rose-300 mb-1 font-semibold">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#12080c] border border-rose-900 text-white focus:outline-none focus:border-pink-500"
                >
                  {services.map((srv, i) => (
                    <option key={i}>{srv.name} — {srv.price}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-pink-900/50"
              >
                Confirm Luxury Booking
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-rose-500/60 border-t border-rose-950">
        © {new Date().getFullYear()} {bizName}. Beverly Hills • Manhattan.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. THE GROOMING ROOM BARBERSHOP (tpl-sal-2 / grooming-room)
// Classic Heritage Men’s Barbershop, Hot Towel Shaves & Beard Care
// ============================================================================
export const GroomingRoomDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [chairBooked, setChairBooked] = useState(false);

  const services = [
    { title: 'The Royal Cut & Straight Razor Neck Shave', price: '$45', time: '40 min' },
    { title: 'Traditional Hot Towel Beard Sculpting & Oil', price: '$35', time: '30 min' },
    { title: 'The Executive Head-to-Beard Full Treatment', price: '$75', time: '60 min' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#110e0c] text-stone-200 font-sans">
      {/* Nav */}
      <nav className="border-b border-stone-800 bg-[#161210] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-500" />
          <span className="font-serif font-black tracking-widest text-sm uppercase text-white">{bizName}</span>
        </div>

        <a href="#chair" className="bg-amber-600 hover:bg-amber-500 text-black font-black text-xs px-4 py-2 rounded uppercase tracking-wider">
          Book Chair
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-3xl mx-auto space-y-5">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-mono">Precision Fades • Single-Malt Whiskey • Hot Lather</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Timeless Cuts for the Modern Gentleman.
        </h1>
        <p className="text-sm text-stone-400 max-w-lg mx-auto">
          Take a seat, sip a cold brew or craft whiskey, and let master barbers give you an impeccable haircut and straight-razor shave.
        </p>
      </header>

      {/* Services Menu */}
      <section className="py-8 px-6 max-w-3xl mx-auto space-y-3">
        {services.map((s, idx) => (
          <div key={idx} className="bg-[#1c1714] border border-stone-800 p-4 rounded-xl flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">{s.title}</h3>
              <span className="text-stone-400">{s.time}</span>
            </div>
            <div className="text-right">
              <div className="font-black text-amber-400 text-base">{s.price}</div>
              <button
                onClick={() => { setChairBooked(true); if (onBookingSubmitted) onBookingSubmitted(`Barber chair booked for ${s.title}`); }}
                className="text-[10px] text-amber-400 hover:underline font-bold mt-1 cursor-pointer"
              >
                Select →
              </button>
            </div>
          </div>
        ))}
      </section>

      {chairBooked && (
        <div className="fixed bottom-6 right-6 bg-[#211a16] border border-amber-500 p-4 rounded-xl shadow-2xl text-xs text-amber-300 z-50">
          ✂️ Chair reserved! See you in the shop.
        </div>
      )}

      <footer className="py-6 text-center text-xs text-stone-600 border-t border-stone-900 mt-10">
        © {new Date().getFullYear()} {bizName}. Est. 2012. Walk-ins always welcome.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. VELVET & SILK DAY SPA (tpl-sal-3 / velvet-silk-spa)
// Holistic Skin Therapies, Organic Facials & Rejuvenating Massages
// ============================================================================
export const VelvetSilkSpaDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [voucherCreated, setVoucherCreated] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0d0914] text-purple-100 font-sans">
      {/* Nav */}
      <nav className="border-b border-purple-950 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0d0914]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-serif tracking-widest text-base text-white">{bizName}</span>
        </div>

        <a href="#rituals" className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow">
          Explore Rituals
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-3xl mx-auto space-y-5">
        <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">Botanical Wellness Sanctuary</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
          Your Personal Sanctuary of Deep Calm & Renewal.
        </h1>
        <p className="text-sm text-purple-200/70 max-w-xl mx-auto leading-relaxed">
          HydraFacial dermal skin therapy, hot stone organic aromatherapy, and private couples hydrotherapy pools.
        </p>
      </header>

      {/* Voucher Simulator */}
      <section id="rituals" className="py-12 px-6 max-w-md mx-auto text-center space-y-4">
        <div className="bg-[#181124] border border-purple-800 p-6 rounded-3xl space-y-4">
          <h3 className="font-serif text-xl text-white">Digital Gift Certificate</h3>
          <p className="text-xs text-purple-300">Instantly generate a spa voucher for yourself or a loved one.</p>

          {voucherCreated ? (
            <div className="p-4 bg-purple-950 border border-purple-500 text-purple-200 text-xs font-bold rounded-xl">
              🎁 Voucher #SPA-GIFT-200 generated! Ready for redemption.
            </div>
          ) : (
            <button
              onClick={() => { setVoucherCreated(true); if (onBookingSubmitted) onBookingSubmitted('Spa gift voucher generated'); }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl transition cursor-pointer shadow-lg shadow-purple-900"
            >
              Generate $200 Spa Ritual Pass
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-purple-500/60 border-t border-purple-950">
        © {new Date().getFullYear()} {bizName}. Unwind body, mind and spirit.
      </footer>
    </div>
  );
};
