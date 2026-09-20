import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoHeaderBar } from './components/common/DemoHeaderBar';
import { ToastContainer } from './components/common/ToastContainer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { EnquiryModal } from './components/common/EnquiryModal';
import { PreviewModal } from './components/common/PreviewModal';
import { PublicHome } from './components/public/PublicHome';
import { AdminHome } from './components/admin/AdminHome';
import { ClientHome } from './components/client/ClientHome';

const MainContent: React.FC = () => {
  const { currentExperience, session } = useApp();

  // Platform switcher only visible to authorized administrators when outside the public website
  const showPlatformSwitcher = currentExperience !== 'public' && session.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Universal Demo Switcher Bar - hidden on public site and for unauthenticated visitors */}
      {showPlatformSwitcher && <DemoHeaderBar />}

      {/* Experience Switcher */}
      <div className="flex-1 flex flex-col">
        {currentExperience === 'public' && <PublicHome />}
        {currentExperience === 'admin' && (
          session.role === 'admin' || session.role === 'guest' ? <AdminHome /> : <ClientHome />
        )}
        {currentExperience === 'client' && <ClientHome />}
      </div>

      {/* Global Interactive Overlays */}
      <EnquiryModal />
      <PreviewModal />
      <FloatingWhatsApp />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
