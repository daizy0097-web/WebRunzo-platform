import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminCustomers } from './AdminCustomers';
import { AdminCustomerProfile } from './AdminCustomerProfile';
import { AdminOrders } from './AdminOrders';
import { AdminWebsites } from './AdminWebsites';
import { AdminBackups } from './AdminBackups';
import { AdminCustomerTiers } from './AdminCustomerTiers';
import { AdminPayments } from './AdminPayments';
import { AdminTemplates } from './AdminTemplates';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminSupport } from './AdminSupport';
import { AdminStorage } from './AdminStorage';
import { AdminSettings } from './AdminSettings';
import { AdminLogin } from './AdminLogin';

export const AdminHome: React.FC = () => {
  const { adminTab, session, setCurrentExperience, setClientTab, addToast } = useApp();

  const isClient = session.role === 'normal_client' || session.role === 'premium_client' || session.role === 'client';

  // SECURITY ENFORCEMENT: If an authenticated client lands on AdminHome, block navigation immediately
  React.useEffect(() => {
    if (isClient) {
      addToast('error', 'Access Denied', 'Administrator privileges required. Client accounts cannot access Admin portals.');
      setCurrentExperience('client');
      setClientTab('dashboard');
    }
  }, [isClient, setCurrentExperience, setClientTab, addToast]);

  if (isClient) {
    return null; // Suppress admin portal and admin login rendering completely
  }

  // If not logged in as admin (e.g. unauthenticated guest navigating to #/admin), show AdminLogin screen
  if (session.role !== 'admin') {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      {adminTab === 'dashboard' && <AdminDashboard />}
      {adminTab === 'customers' && <AdminCustomers />}
      {adminTab === 'customer-profile' && <AdminCustomerProfile />}
      {adminTab === 'orders' && <AdminOrders />}
      {adminTab === 'websites' && <AdminWebsites />}
      {adminTab === 'storage' && <AdminStorage />}
      {adminTab === 'backups' && <AdminBackups />}
      {(adminTab === 'subscriptions' || adminTab === 'customer-tiers') && <AdminCustomerTiers />}
      {adminTab === 'payments' && <AdminPayments />}
      {adminTab === 'templates' && <AdminTemplates />}
      {adminTab === 'enquiries' && <AdminEnquiries />}
      {adminTab === 'support' && <AdminSupport />}
      {adminTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
