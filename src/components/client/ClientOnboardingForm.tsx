import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Sparkles, 
  Palette, 
  Globe, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Save, 
  Send, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Calendar,
  Layers,
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { OnboardingStatus } from '../../types';

interface Props {
  onSuccess?: () => void;
  isModal?: boolean;
}

const CATEGORY_OPTIONS = [
  'Healthcare & Dental',
  'Real Estate & Architecture',
  'Restaurant, Cafe & Hospitality',
  'Professional & Legal Services',
  'Gym, Fitness & Wellness',
  'Beauty, Salon & Spa',
  'Tech, SaaS & IT Services',
  'Retail & E-Commerce',
  'Education & Coaching',
  'Creative & Media',
  'Other / Custom Industry'
];

const VISUAL_STYLE_OPTIONS = [
  'Minimalist & Clean',
  'Modern & High-Tech',
  'Luxury & High-End',
  'Bold & Dynamic',
  'Warm & Approachable',
  'Corporate & Trustworthy'
];

const SECTION_OPTIONS = [
  'Hero Header & Call-to-Action',
  'About Us & Company Story',
  'Services / Offerings Grid',
  'Client Testimonials & Reviews',
  'Pricing & Packages Table',
  'Portfolio / Photo Gallery',
  'Frequently Asked Questions (FAQ)',
  'Contact Form & Inquiries',
  'Google Maps Location'
];

const SPECIAL_FEATURE_OPTIONS = [
  'WhatsApp Instant Connect Button',
  'Interactive Booking / Appointment Form',
  'Google Maps Interactive Location',
  'Customer Review Slider',
  'Lead Capture Modal / Newsletter',
  'Multi-Language Ready'
];

const COLOR_PRESETS = [
  { label: 'Indigo Classic', primary: '#4f46e5', secondary: '#06b6d4' },
  { label: 'Ocean Blue', primary: '#2563eb', secondary: '#38bdf8' },
  { label: 'Emerald Mint', primary: '#059669', secondary: '#34d399' },
  { label: 'Luxury Amber', primary: '#d97706', secondary: '#fbbf24' },
  { label: 'Crimson Rose', primary: '#e11d48', secondary: '#fb7185' },
  { label: 'Royal Violet', primary: '#7c3aed', secondary: '#a855f7' },
  { label: 'Modern Slate', primary: '#0f172a', secondary: '#64748b' },
];

export const ClientOnboardingForm: React.FC<Props> = ({ onSuccess, isModal = false }) => {
  const { 
    currentClientCustomer, 
    activeCustomer, 
    updateCustomer, 
    templates, 
    refreshData,
    addToast 
  } = useApp();

  const customer = currentClientCustomer || activeCustomer;
  const existingOnboarding = customer?.customContent?.onboarding;

  // Active step in the form (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(
    !existingOnboarding?.status || existingOnboarding?.status === 'Not Started' || existingOnboarding?.status === 'In Progress'
  );

  // Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  // Branding & Visual Identity
  const [logoUrl, setLogoUrl] = useState('');
  const [logoText, setLogoText] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#0ea5e9');
  const [preferredVisualStyles, setPreferredVisualStyles] = useState<string[]>([]);

  // Website Specifications
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [requiredSections, setRequiredSections] = useState<string[]>([
    'Hero Header & Call-to-Action',
    'About Us & Company Story',
    'Services / Offerings Grid',
    'Contact Form & Inquiries'
  ]);
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [services, setServices] = useState<{ title: string; desc: string }[]>([
    { title: 'Primary Offering', desc: 'Comprehensive core service customized for your needs.' }
  ]);
  const [customDomain, setCustomDomain] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    linkedin: '',
    whatsapp: '',
    twitter: ''
  });

  // Project Requirements
  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);
  const [specialFeaturesNotes, setSpecialFeaturesNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from existing customer data
  useEffect(() => {
    if (!customer) return;

    const ob = customer.customContent?.onboarding;
    const cc = customer.customContent;

    setBusinessName(ob?.businessName || customer.businessName || '');
    setBusinessCategory(ob?.businessCategory || 'Healthcare & Dental');
    setBusinessDescription(ob?.businessDescription || '');
    setContactEmail(ob?.contactEmail || customer.email || '');
    setContactPhone(ob?.contactPhone || customer.phone || '');
    setAddress(ob?.address || cc?.address || '100 Innovation Blvd, Suite 400');

    setLogoUrl(ob?.logoUrl || cc?.logoUrl || '');
    setLogoText(ob?.logoText || cc?.logoText || (customer.businessName ? customer.businessName.toUpperCase() : ''));
    setPrimaryColor(ob?.primaryColor || cc?.primaryColor || '#4f46e5');
    setSecondaryColor(ob?.secondaryColor || cc?.secondaryColor || '#0ea5e9');
    setPreferredVisualStyles(ob?.preferredVisualStyles || ['Minimalist & Clean']);

    setSelectedTemplateId(ob?.selectedTemplateId || customer.templateId || templates[0]?.id || 'tpl-health-1');
    if (ob?.requiredSections && ob.requiredSections.length > 0) {
      setRequiredSections(ob.requiredSections);
    }
    setHeadline(ob?.headline || cc?.heroHeadline || `Welcome to ${customer.businessName}`);
    setTagline(ob?.tagline || cc?.tagline || 'Engineered for exceptional client experiences');
    setAboutText(ob?.aboutText || cc?.aboutText || '');

    if (ob?.servicesList && ob.servicesList.length > 0) {
      setServices(ob.servicesList.map((s) => ({ title: s.title, desc: s.desc })));
    } else if (cc?.servicesList && cc.servicesList.length > 0) {
      setServices(cc.servicesList.map((s) => ({ title: s.title, desc: s.desc })));
    }

    setCustomDomain(ob?.customDomain || customer.customDomain || '');
    setSocialLinks({
      instagram: ob?.socialLinks?.instagram || cc?.socialLinks?.instagram || '',
      facebook: ob?.socialLinks?.facebook || cc?.socialLinks?.facebook || '',
      linkedin: ob?.socialLinks?.linkedin || cc?.socialLinks?.linkedin || '',
      whatsapp: ob?.socialLinks?.whatsapp || cc?.socialLinks?.whatsapp || '',
      twitter: ob?.socialLinks?.twitter || cc?.socialLinks?.twitter || ''
    });

    setSpecialFeatures(ob?.specialFeatures || []);
    setSpecialFeaturesNotes(ob?.specialFeaturesNotes || '');
    setAdditionalNotes(ob?.additionalNotes || '');

    if (ob?.status === 'Submitted') {
      setIsEditMode(false);
    }
  }, [customer, templates]);

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        Customer profile not found. Please log in to access onboarding.
      </div>
    );
  }

  const completionStatus: OnboardingStatus = existingOnboarding?.status || 'Not Started';

  // Toggle visual style chip
  const toggleVisualStyle = (style: string) => {
    if (!isEditMode) return;
    setPreferredVisualStyles((prev) => 
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  // Toggle required section
  const toggleSection = (section: string) => {
    if (!isEditMode) return;
    setRequiredSections((prev) => 
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Toggle special feature
  const toggleSpecialFeature = (feat: string) => {
    if (!isEditMode) return;
    setSpecialFeatures((prev) => 
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  // Service item management
  const handleAddService = () => {
    if (!isEditMode) return;
    setServices((prev) => [...prev, { title: '', desc: '' }]);
  };

  const handleUpdateService = (index: number, field: 'title' | 'desc', value: string) => {
    if (!isEditMode) return;
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveService = (index: number) => {
    if (!isEditMode) return;
    if (services.length <= 1) return;
    setServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Logo image file exceeds the 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        setFormError(null);
        addToast('success', 'Logo Loaded', 'Logo file ready for upload with your specifications.');
      }
    };
    reader.onerror = () => {
      setFormError('Failed to read logo image file.');
    };
    reader.readAsDataURL(file);
  };

  // Build the payload
  const buildPayload = (isDraft: boolean) => {
    return {
      businessName,
      businessCategory,
      businessDescription,
      contactEmail,
      contactPhone,
      address,
      logoUrl,
      logoText,
      primaryColor,
      secondaryColor,
      preferredVisualStyles,
      selectedTemplateId,
      requiredSections,
      headline,
      heroHeadline: headline,
      tagline,
      heroSubhead: tagline,
      aboutText,
      servicesList: services.filter((s) => s.title.trim() !== ''),
      socialLinks: {
        instagram: socialLinks.instagram.trim() || undefined,
        facebook: socialLinks.facebook.trim() || undefined,
        linkedin: socialLinks.linkedin.trim() || undefined,
        whatsapp: socialLinks.whatsapp.trim() || undefined,
        twitter: socialLinks.twitter.trim() || undefined,
      },
      customDomain: customDomain.trim(),
      specialFeatures,
      specialFeaturesNotes,
      additionalNotes,
      isDraft,
    };
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    setFormError(null);
    setIsSavingDraft(true);

    try {
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      const token = sbSession?.access_token;

      const payload = buildPayload(true);

      const res = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save onboarding draft.');
      }

      // Update local state and synchronize
      updateCustomer(customer.id, {
        businessName: payload.businessName || customer.businessName,
        templateId: payload.selectedTemplateId || customer.templateId,
        customDomain: payload.customDomain || customer.customDomain,
        customContent: data.customContent || {
          ...customer.customContent,
          onboarding: data.onboarding,
        },
      });

      await refreshData();
      addToast('success', 'Draft Saved', 'Your website requirements draft was successfully saved in Supabase.');
    } catch (err: any) {
      console.error('Error saving onboarding draft:', err);
      setFormError(err.message || 'Failed to save draft. Please check your connection and try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit Final Requirements
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form client-side validation
    if (!businessName.trim()) {
      setFormError('Business name is required.');
      setActiveStep(1);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      setFormError('A valid contact email address is required.');
      setActiveStep(1);
      return;
    }

    if (!contactPhone.trim()) {
      setFormError('A contact phone number is required.');
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      const token = sbSession?.access_token;

      const payload = buildPayload(false);

      const res = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit onboarding specifications.');
      }

      // Update local state and synchronize
      updateCustomer(customer.id, {
        businessName: payload.businessName,
        templateId: payload.selectedTemplateId || customer.templateId,
        customDomain: payload.customDomain || customer.customDomain,
        customContent: data.customContent || {
          ...customer.customContent,
          onboarding: data.onboarding,
        },
      });

      await refreshData();
      setIsEditMode(false);
      addToast('success', 'Requirements Submitted', 'Your website requirements were successfully submitted to WebRunzo!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting onboarding:', err);
      setFormError(err.message || 'Submission failed. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? '' : 'animate-in fade-in duration-200'}`}>
      
      {/* Top Status Header Bar */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Website Intake Portal</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
              completionStatus === 'Submitted'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : completionStatus === 'In Progress'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {completionStatus === 'Submitted' && <CheckCircle2 className="w-3 h-3" />}
              {completionStatus === 'In Progress' && <Clock className="w-3 h-3" />}
              {completionStatus === 'Not Started' && <AlertCircle className="w-3 h-3" />}
              <span>Onboarding: {completionStatus}</span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
            Website Specifications & Requirements
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            {completionStatus === 'Submitted'
              ? `Submitted on ${existingOnboarding?.submittedAt ? new Date(existingOnboarding.submittedAt).toLocaleDateString() : 'recently'}. WebRunzo engineers are building your platform.`
              : completionStatus === 'In Progress'
              ? 'Draft in progress. You can save your progress and return anytime before final submission.'
              : 'Provide your business, branding, and content details so WebRunzo can build your website.'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {completionStatus === 'Submitted' && !isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Update Specifications</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Error saving onboarding information</div>
            <div className="mt-0.5 text-rose-300/90">{formError}</div>
          </div>
          <button 
            type="button"
            onClick={() => setFormError(null)}
            className="text-rose-400 hover:text-rose-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeStep === 1
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Business Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeStep === 2
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>2. Branding & Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeStep === 3
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>3. Website Specs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className={`px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeStep === 4
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>4. Scope & Review</span>
        </button>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmitFinal} className="space-y-6">
        
        {/* STEP 1: Business Profile */}
        {activeStep === 1 && (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Business & Contact Profile</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tell us about your organization. This information forms the core foundation of your website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Company / Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditMode}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Zenith Dental Clinic"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Industry / Business Category <span className="text-rose-400">*</span>
                </label>
                <select
                  disabled={!isEditMode}
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Business Description & Mission
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Briefly describe what your business does, your target audience, and your unique value proposition..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Public Contact Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!isEditMode}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. hello@zenithdental.com"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Public Contact Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={!isEditMode}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 345-6789"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Physical Address / Location
                </label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Suite 300, Springfield"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Branding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Branding & Identity */}
        {activeStep === 2 && (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>Branding, Color Palette & Visual Style</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide your logo and aesthetic preferences so our designers match your brand identity.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Logo Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>Brand Logo</span>
                  {logoUrl && (
                    <button
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => setLogoUrl('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1">
                    <div className="h-28 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-3 relative overflow-hidden">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt="Logo Preview" 
                          className="max-h-full max-w-full object-contain" 
                        />
                      ) : (
                        <div className="text-center text-slate-500">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <div className="text-[10px]">No Logo Provided</div>
                          <div className="text-[9px] text-slate-600 mt-0.5">Will use text logo fallback</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2.5">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Logo Image File (PNG, SVG, JPG, WebP)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        disabled={!isEditMode}
                        onChange={handleLogoFileUpload}
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Upload Logo File (Max 5MB)</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Or enter public Logo Image URL
                      </label>
                      <input
                        type="url"
                        disabled={!isEditMode}
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/assets/logo.png"
                        className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Text Logo (Rendered if logo image is not set)
                      </label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        placeholder={businessName.toUpperCase() || 'BUSINESS'}
                        className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">Brand Color Palette</div>
                
                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => {
                        setPrimaryColor(p.primary);
                        setSecondaryColor(p.secondary);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.primary }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Primary Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={!isEditMode}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-800 bg-transparent cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-slate-800 bg-slate-900 font-mono text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Secondary / Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={!isEditMode}
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-800 bg-transparent cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-slate-800 bg-slate-900 font-mono text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Visual Styles */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">Preferred Visual Style</div>
                <p className="text-[11px] text-slate-400">Select one or more design styles that match your vision:</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VISUAL_STYLE_OPTIONS.map((style) => {
                    const isSelected = preferredVisualStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => toggleVisualStyle(style)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer disabled:opacity-60 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[11px]">{style}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Website Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Website Structure & Content */}
        {activeStep === 3 && (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Website Structure, Template & Content</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure your preferred website architecture, sections, headline copy, and offerings.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Template Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Selected Base Template
                </label>
                <select
                  disabled={!isEditMode}
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category}) - {tpl.features.slice(0, 2).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Sections */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">Required Website Sections</div>
                <p className="text-[11px] text-slate-400">Select which sections should be included on your live site:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SECTION_OPTIONS.map((sec) => {
                    const isSelected = requiredSections.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => toggleSection(sec)}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer disabled:opacity-60 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[11px] truncate">{sec}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Headline & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Website Hero Headline
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Modern Dentistry with a Gentle Touch"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Empowering healthy smiles for the entire family."
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* About Us Summary */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  About Us / Company Story Text
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Share your business origin story, credentials, values, or team overview..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none disabled:opacity-60"
                />
              </div>

              {/* Services & Offerings Dynamic List */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-200">Featured Services / Products</div>
                  <button
                    type="button"
                    disabled={!isEditMode}
                    onClick={handleAddService}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Offering</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {services.map((svc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          disabled={!isEditMode}
                          value={svc.title}
                          onChange={(e) => handleUpdateService(idx, 'title', e.target.value)}
                          placeholder={`Service ${idx + 1} Title (e.g. Cosmetic Dentistry)`}
                          className="flex-1 p-2 rounded-lg border border-slate-800 bg-slate-950 text-white font-semibold text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                        />
                        {services.length > 1 && (
                          <button
                            type="button"
                            disabled={!isEditMode}
                            onClick={() => handleRemoveService(idx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        disabled={!isEditMode}
                        value={svc.desc}
                        onChange={(e) => handleUpdateService(idx, 'desc', e.target.value)}
                        placeholder="Description of this service or offering..."
                        className="w-full p-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-60"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Domain & Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Custom Domain (If owned or desired)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. zenithdental.com"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">WebRunzo can configure DNS and automated SSL certificate.</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditMode}
                    value={socialLinks.whatsapp}
                    onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                    placeholder="e.g. +1 (555) 987-6543"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Instagram Profile</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Facebook Page</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">LinkedIn Company</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Project Scope</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Project Scope & Final Review */}
        {activeStep === 4 && (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Special Functionality, Notes & Final Submission</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select special interactive features, add specific design or build instructions, and finalize your submission.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Special Features Chips */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">Special Website Features Requested</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIAL_FEATURE_OPTIONS.map((feat) => {
                    const isSelected = specialFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => toggleSpecialFeature(feat)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer disabled:opacity-60 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[11px]">{feat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Features Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Feature Details / Booking Logic
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditMode}
                  value={specialFeaturesNotes}
                  onChange={(e) => setSpecialFeaturesNotes(e.target.value)}
                  placeholder="e.g. For booking, we want visitors to pick their preferred service and date, and notify us via email..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none disabled:opacity-60"
                />
              </div>

              {/* Additional Notes & Instructions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Additional Notes, Competitor Inspiration or Preferences
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Mention websites you like, special deadlines, assets in cloud storage, or specific instructions for our engineers..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none disabled:opacity-60"
                />
              </div>

              {/* Comprehensive Summary Review Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>Intake Specifications Summary</span>
                  <span className="text-[10px] text-indigo-400 font-mono">Ready for submission</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Business</div>
                    <div className="font-bold text-white truncate mt-0.5">{businessName || 'Not specified'}</div>
                    <div className="text-[10px] text-slate-500">{businessCategory}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Primary Color</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                      <span className="font-mono text-white text-[10px]">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Sections</div>
                    <div className="font-bold text-white mt-0.5">{requiredSections.length} Sections</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Domain</div>
                    <div className="font-mono text-white text-[10px] truncate mt-0.5">{customDomain || 'webrunzo.app'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isSavingDraft}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting 
                      ? 'Submitting...' 
                      : completionStatus === 'Submitted' 
                      ? 'Update Specifications' 
                      : 'Submit Website Requirements'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
