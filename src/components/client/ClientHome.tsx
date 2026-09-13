import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClientLayout } from './ClientLayout';
import { ClientDashboard } from './ClientDashboard';
import { ClientOnboardingView } from './ClientOnboardingView';
import { ClientWebsite } from './ClientWebsite';
import { ClientStorage } from './ClientStorage';
import { ClientOrders } from './ClientOrders';
import { ClientPlan } from './ClientPlan';
import { ClientPayments } from './ClientPayments';
import { ClientProfile } from './ClientProfile';
import { ClientSupport } from './ClientSupport';
import { ClientPremiumHealth } from './ClientPremiumHealth';
import { ClientPremiumSEO } from './ClientPremiumSEO';
import { ClientPremiumScripts } from './ClientPremiumScripts';
import { ClientLogin } from './ClientLogin';

export const ClientHome: React.FC = () => {
  const { clientTab, session, currentClientCustomer, isPasswordResetMode, customers } = useApp();

  const isClientRole = session.role === 'normal_client' || session.role === 'premium_client';
  const shouldRenderPortal = !isPasswordResetMode && isClientRole && !!currentClientCustomer;

  console.log('[AUTH_DIAGNOSTIC] ClientHome render evaluation:', {
    isPasswordResetMode,
    sessionRole: session.role,
    sessionCustomerId: session.customerId,
    hasCurrentClientCustomer: !!currentClientCustomer,
    currentClientCustomerId: currentClientCustomer?.id,
    currentClientBusiness: currentClientCustomer?.businessName,
    customersInStateCount: customers.length,
    shouldRenderPortal,
    renderChoice: shouldRenderPortal ? 'ClientLayout' : 'ClientLogin',
    blockingReasons: !shouldRenderPortal
      ? {
          isPasswordResetMode,
          notClientRole: !isClientRole,
          missingCurrentClientCustomer: !currentClientCustomer,
        }
      : null,
  });

  // If in password recovery mode, or not authenticated as client or no current client customer, show ClientLogin
  if (!shouldRenderPortal) {
    return <ClientLogin />;
  }

  return (
    <ClientLayout>
      {clientTab === 'dashboard' && <ClientDashboard />}
      {clientTab === 'onboarding' && <ClientOnboardingView />}
      {clientTab === 'website' && <ClientWebsite />}
      {clientTab === 'storage' && <ClientStorage />}
      {clientTab === 'orders' && <ClientOrders />}
      {clientTab === 'plan' && <ClientPlan />}
      {clientTab === 'payments' && <ClientPayments />}
      {clientTab === 'profile' && <ClientProfile />}
      {clientTab === 'support' && <ClientSupport />}
      {clientTab === 'premium-health' && <ClientPremiumHealth />}
      {clientTab === 'premium-seo' && <ClientPremiumSEO />}
      {clientTab === 'premium-scripts' && <ClientPremiumScripts />}
    </ClientLayout>
  );
};
