import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  X, 
  Sparkles, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Menu, 
  AlertOctagon, 
  Wrench, 
  ShieldAlert, 
  Power, 
  RefreshCw 
} from 'lucide-react';

// Specialized Template Demos
import { NexusCorporateDemo, VanguardConsultingDemo, SynergyAgencyDemo } from '../templates/BusinessTemplates';
import { BistroBloomDemo, ArtisanTrattoriaDemo, UrbanSpiceDemo } from '../templates/RestaurantTemplates';
import { AuraCreativeDemo, MinimalistArchitectDemo, LensAndLightDemo } from '../templates/PortfolioTemplates';
import { ApexFitnessDemo, IronForgeAthleticsDemo, ZenithYogaDemo } from '../templates/GymTemplates';
import { LumiereSalonDemo, GroomingRoomDemo, VelvetSilkSpaDemo } from '../templates/SalonTemplates';
import { PrimeRealtyDemo, SkylineLuxuryEstatesDemo } from '../templates/RealEstateTemplates';
import { NovaArtisanDemo, ModaApparelDemo } from '../templates/EcommerceTemplates';
import { TheThoughtLeaderDemo, VitalityCoachDemo, TheCreatorHubDemo } from '../templates/PersonalBrandTemplates';

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
  const { openEnquiryModal, addToast, previewModal, setPreviewDeviceMode, session, toggleWebsiteStatus } = useApp();
  const deviceMode = previewModal.deviceMode || 'desktop';

  const isSuspended = customer?.websiteStatus === 'Suspended';
  const businessName = customer?.customContent?.businessName || customer?.businessName || template.name;
  const contactEmail = customer?.customContent?.contactEmail || customer?.email || 'contact@example.com';
  const contactPhone = customer?.customContent?.contactPhone || customer?.phone || '+1 (555) 234-5678';
  const address = customer?.customContent?.address || '100 Business Center Blvd, Suite 400';

  const handleBookingNotification = (msg: string) => {
    addToast('success', 'Interactive Demo Action', msg);
  };

  const handleUseThisTemplate = () => {
    if (onClose) onClose();
    openEnquiryModal(template.id);
  };

  const renderTemplateDemo = () => {
    const props = {
      template,
      customer,
      onUseTemplate: handleUseThisTemplate,
      onBookingSubmitted: handleBookingNotification,
    };

    switch (template.id) {
      // Business Category
      case 'tpl-bus-1':
        return <NexusCorporateDemo {...props} />;
      case 'tpl-bus-2':
        return <VanguardConsultingDemo {...props} />;
      case 'tpl-bus-3':
        return <SynergyAgencyDemo {...props} />;

      // Restaurant Category
      case 'tpl-rest-1':
        return <BistroBloomDemo {...props} />;
      case 'tpl-rest-2':
        return <ArtisanTrattoriaDemo {...props} />;
      case 'tpl-rest-3':
        return <UrbanSpiceDemo {...props} />;

      // Portfolio Category
      case 'tpl-port-1':
        return <AuraCreativeDemo {...props} />;
      case 'tpl-port-2':
        return <MinimalistArchitectDemo {...props} />;
      case 'tpl-port-3':
        return <LensAndLightDemo {...props} />;

      // Gym & Fitness Category
      case 'tpl-gym-1':
        return <ApexFitnessDemo {...props} />;
      case 'tpl-gym-2':
        return <IronForgeAthleticsDemo {...props} />;
      case 'tpl-gym-3':
        return <ZenithYogaDemo {...props} />;

      // Salon & Spa Category
      case 'tpl-sal-1':
        return <LumiereSalonDemo {...props} />;
      case 'tpl-sal-2':
        return <GroomingRoomDemo {...props} />;
      case 'tpl-sal-3':
        return <VelvetSilkSpaDemo {...props} />;

      // Real Estate Category
      case 'tpl-re-1':
        return <PrimeRealtyDemo {...props} />;
      case 'tpl-re-2':
        return <SkylineLuxuryEstatesDemo {...props} />;

      // E-commerce Category
      case 'tpl-ecom-1':
        return <NovaArtisanDemo {...props} />;
      case 'tpl-ecom-2':
        return <ModaApparelDemo {...props} />;

      // Personal Brand Category
      case 'tpl-pb-1':
        return <TheThoughtLeaderDemo {...props} />;
      case 'tpl-pb-2':
        return <VitalityCoachDemo {...props} />;
      case 'tpl-pb-3':
        return <TheCreatorHubDemo {...props} />;

      default:
        // Fallback for custom or newly added templates
        return <NexusCorporateDemo {...props} />;
    }
  };

  const frameWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-[390px] h-[750px]'
      : deviceMode === 'tablet'
      ? 'max-w-[800px] h-[780px]'
      : 'w-full h-full min-h-[650px]';

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
            {customer ? (customer.customDomain ? `https://${customer.customDomain}` : customer.websiteUrl) : `https://${template.demoSlug}.webrunzo.app`}
          </div>
          {customer && (
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 ${
              customer.websiteStatus === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              customer.websiteStatus === 'Suspended' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold' :
              customer.websiteStatus === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            }`}>
              {customer.websiteStatus === 'Suspended' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Shut Down (Offline)</span>
                </>
              ) : customer.websiteStatus === 'Live' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Website</span>
                </>
              ) : (
                <span>{customer.websiteStatus}</span>
              )}
            </span>
          )}
        </div>

        {/* Device Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setPreviewDeviceMode('desktop')}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewDeviceMode('tablet')}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewDeviceMode('mobile')}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
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
              onClick={handleUseThisTemplate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Use This Template</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Body Simulator */}
      <div className="flex-1 bg-slate-950 flex items-start justify-center p-2 sm:p-4 overflow-y-auto min-h-0 w-full">
        <div className={`w-full mx-auto transition-all duration-300 bg-slate-900 text-slate-100 rounded-b-xl shadow-2xl overflow-y-auto ${frameWidthClass} border border-slate-800 flex flex-col`}>
          
          {isSuspended ? (
            /* ========================================================================= */
            /* Website Offline / Suspended Maintenance Screen                            */
            /* ========================================================================= */
            <div className="min-h-[560px] flex flex-col justify-between bg-slate-950 text-slate-100">
              
              {/* Top Warning Banner */}
              <div className="bg-rose-600/20 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Website Temporarily Offline • Maintenance / Administrative Suspension</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                  Status: 503 Offline
                </span>
              </div>

              {/* Maintenance Main Content */}
              <div className="p-8 sm:p-12 max-w-2xl mx-auto text-center space-y-6">
                
                {/* Visual Icon Badge */}
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/50">
                    <Wrench className="w-10 h-10" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow">
                    !
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Temporary Service Suspension Notice</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {businessName} is Currently Offline
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    {customer?.maintenanceNotice ||
                      'This website has been temporarily taken offline for scheduled maintenance, updates, or administrative review. All customer data and records remain secure. Normal live service will resume shortly.'}
                  </p>
                </div>

                {/* Direct Contact Card for Visitors */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Need Immediate Assistance? Contact the Business Directly:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">{contactEmail}</span>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2 text-slate-400 text-[11px]">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{address}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Action Button (If logged in as admin) */}
                {session?.role === 'admin' && customer && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <Power className="w-4 h-4" />
                      <span>Owner Admin Quick Override</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      As an admin, you can immediately reactivate this website and restore public traffic.
                    </p>
                    <button
                      onClick={() => toggleWebsiteStatus(customer.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reactivate Website Now (Set to Live)</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Maintenance Footer */}
              <footer className="border-t border-slate-900 p-4 text-center text-slate-500 text-xs bg-slate-950">
                <p>© {new Date().getFullYear()} {businessName} • Protected by WebRunzo Secure Managed Infrastructure</p>
              </footer>

            </div>
          ) : (
            /* Render the distinct website demo for this specific template */
            renderTemplateDemo()
          )}
        </div>
      </div>
    </div>
  );
};

