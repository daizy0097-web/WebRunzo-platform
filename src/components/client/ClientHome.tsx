import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClientLayout } from './ClientLayout';
import { ClientDashboard } from './ClientDashboard';
import { ClientWebsite } from './ClientWebsite';
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
  const { clientTab, session, currentClientCustomer } = useApp();

  // If not authenticated as client or no current client customer, show ClientLogin
  if (session.role !== 'normal_client' && session.role !== 'premium_client' && !currentClientCustomer) {
    return <ClientLogin />;
  }

  return (
    <ClientLayout>
      {clientTab === 'dashboard' && <ClientDashboard />}
      {clientTab === 'website' && <ClientWebsite />}
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
