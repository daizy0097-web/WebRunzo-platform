import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  X, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  ArrowRight,
  Shield,
  Star,
  Menu
} from 'lucide-react';

interface Props {
  template: Template;
  customer?: Customer | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const LiveWebsitePreviewFrame: React.FC<Props> = ({
  template,
  customer,
  onClose,
  isModal = false,
}) => {
  const { openEnquiryModal, addToast, previewModal, setPreviewDeviceMode } = useApp();
  const deviceMode = previewModal.deviceMode || 'desktop';

  // State for simulated interactive form inside the rendered template
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Content to render: customer's customized content if available, otherwise template sample content
  const businessName = customer?.customContent?.businessName || customer?.businessName || template.name;
  const logoText = customer?.customContent?.logoText || businessName.toUpperCase();
  const tagline = customer?.customContent?.tagline || template.sampleSections.tagline;
  const heroHeading = customer?.customContent?.heroHeadline || template.sampleSections.heroHeading;
  const heroSubhead = customer?.customContent?.heroSubhead || template.sampleSections.heroSubtitle;
  const primaryColor = customer?.customContent?.primaryColor || template.colorScheme.accent;
  const contactEmail = customer?.customContent?.contactEmail || customer?.email || 'contact@example.com';
  const contactPhone = customer?.customContent?.contactPhone || customer?.phone || '+1 (555) 234-5678';
  const address = customer?.customContent?.address || '100 Business Center Blvd, Suite 400';
  const aboutText = customer?.customContent?.aboutText || `${businessName} provides premium, industry-leading solutions designed to exceed customer expectations with precision and care.`;
  const services = customer?.customContent?.servicesList || template.sampleSections.services.map((s) => ({
    title: s,
    desc: 'High quality bespoke service delivered by seasoned specialists tailored to your precise needs.',
  }));

  const handleSimulatedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail) return;
    setBookingSuccess(true);
    addToast('success', 'Simulated Booking Received', `Thank you ${bookingName}! The customer website received your request.`);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const frameWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-[380px] h-[720px]'
      : deviceMode === 'tablet'
      ? 'max-w-[780px] h-[750px]'
      : 'w-full h-full min-h-[600px]';

  return (
    <div className={`flex flex-col h-full ${isModal ? 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto' : 'w-full'}`}>
      {/* Frame Control Bar */}
      <div className="bg-slate-900 text-white rounded-t-xl px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <div className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-slate-700 max-w-[200px] sm:max-w-xs truncate">
            {customer ? customer.websiteUrl : `https://${template.demoSlug}.webrunzo.app`}
          </div>
          {customer && (
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
              customer.websiteStatus === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              customer.websiteStatus === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            }`}>
              {customer.websiteStatus}
            </span>
          )}
        </div>

        {/* Device Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setPreviewDeviceMode('desktop')}
            className={`p-1.5 rounded text-xs transition ${
              deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewDeviceMode('tablet')}
            className={`p-1.5 rounded text-xs transition ${
              deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewDeviceMode('mobile')}
            className={`p-1.5 rounded text-xs transition ${
              deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {!customer && (
            <button
              onClick={() => {
                if (onClose) onClose();
                openEnquiryModal(template.id);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Use This Template</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Body Simulator */}
      <div className="flex-1 bg-slate-950 flex items-start justify-center p-2 sm:p-4 overflow-y-auto min-h-0 w-full">
        <div className={`w-full mx-auto transition-all duration-300 bg-white text-slate-900 rounded-b-xl shadow-2xl overflow-y-auto ${frameWidthClass} border border-slate-200 flex flex-col`}>
          
          {/* Simulated Website Header / Navbar */}
          <nav className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {logoText.charAt(0)}
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                {logoText}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
              <a href="#services" className="hover:text-indigo-600 transition">Services</a>
              <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
              <a href="#testimonials" className="hover:text-indigo-600 transition">Testimonials</a>
              <a href="#contact" className="hover:text-indigo-600 transition">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="#contact"
                className="text-xs font-semibold px-4 py-2 rounded-lg text-white transition shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Book Appointment
              </a>
            </div>

            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-slate-600 p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
          </nav>

          {mobileNavOpen && (
            <div className="md:hidden bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-2">
              <a href="#services" className="block py-1 text-slate-700 font-medium">Services</a>
              <a href="#about" className="block py-1 text-slate-700 font-medium">About Us</a>
              <a href="#contact" className="block py-1 text-slate-700 font-medium">Contact</a>
            </div>
          )}

          {/* Simulated Hero Section */}
          <section className="relative px-6 py-12 sm:py-16 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tagline}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {heroHeading}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {heroSubhead}
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-md transition transform hover:-translate-y-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  Schedule Free Consultation
                </a>
                <a
                  href="#services"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  Explore Capabilities
                </a>
              </div>
            </div>

            {/* Hero Visual Banner */}
            <div className="mt-8 max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200/80">
              <img
                src={template.previewImage}
                alt={businessName}
                className="w-full h-48 sm:h-72 object-cover"
                loading="lazy"
              />
            </div>
          </section>

          {/* Simulated Services Section */}
          <section id="services" className="px-6 py-12 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Expertise</h2>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Tailored Solutions for Superior Results</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:shadow-md transition">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-3 text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      0{idx + 1}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{srv.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Simulated About Section */}
          <section id="about" className="px-6 py-10 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">About {businessName}</span>
                <h3 className="text-xl font-bold mt-1 mb-3">Committed to Quality, Transparency & Growth</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{aboutText}</p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-lg font-bold text-white">99.8%</div>
                    <div className="text-[10px] text-slate-400">Client Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">500+</div>
                    <div className="text-[10px] text-slate-400">Projects Done</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">24/7</div>
                    <div className="text-[10px] text-slate-400">Dedicated Support</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-xs space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-200 italic leading-relaxed">
                  "{businessName} delivered beyond our highest expectations. Their attention to detail and modern approach set them apart."
                </p>
                <div className="font-semibold text-white text-[11px]">— Verified Client Review</div>
              </div>
            </div>
          </section>

          {/* Simulated Interactive Booking & Contact Form */}
          <section id="contact" className="px-6 py-12 bg-slate-50">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Get In Touch / Book an Appointment</h3>
                <p className="text-xs text-slate-600 mt-1">Leave your details and our team will get back to you promptly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Info Column */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-4 shadow-sm">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Direct Contact</div>
                  
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Phone</div>
                      <div>{contactPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Email</div>
                      <div className="truncate">{contactEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Location</div>
                      <div>{address}</div>
                    </div>
                  </div>
                </div>

                {/* Form Column */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  {bookingSuccess ? (
                    <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-emerald-900">Request Sent Successfully!</h4>
                      <p className="text-xs text-emerald-700">We have received your appointment request and will contact you via email shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSimulatedBooking} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Full Name</label>
                          <input
                            type="text"
                            required
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={bookingEmail}
                            onChange={(e) => setBookingEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preferred Date / Notes</label>
                        <input
                          type="text"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          placeholder="e.g. Next Tuesday morning or specific requirements"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition shadow cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Submit Request
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Simulated Footer */}
          <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-400 text-xs px-6 py-6 text-center">
            <p>© {new Date().getFullYear()} {businessName}. All rights owned by WebRunzo. Powered by WebRunzo Managed Infrastructure.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
