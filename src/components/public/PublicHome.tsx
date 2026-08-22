import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { HeroSection } from './HeroSection';
import { WhyWebRunzo } from './WhyWebRunzo';
import { ServicesSection } from './ServicesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { AboutSection } from './AboutSection';
import { TemplateGallery } from './TemplateGallery';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { FinalCTASection } from './FinalCTASection';
import { PublicFooter } from './PublicFooter';

export const PublicHome: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <WhyWebRunzo />
        <ServicesSection />
        <HowItWorksSection />
        <TemplateGallery />
        <PricingSection />
        <AboutSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
};
