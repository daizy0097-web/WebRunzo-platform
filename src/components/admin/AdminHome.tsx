import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminCustomers } from './AdminCustomers';
import { AdminCustomerProfile } from './AdminCustomerProfile';
import { AdminOrders } from './AdminOrders';
import { AdminWebsites } from './AdminWebsites';
import { AdminBackups } from './AdminBackups';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminPayments } from './AdminPayments';
import { AdminTemplates } from './AdminTemplates';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminSupport } from './AdminSupport';
import { AdminSettings } from './AdminSettings';
import { AdminLogin } from './AdminLogin';

export const AdminHome: React.FC = () => {
  const { adminTab, session } = useApp();

  // If not logged in as admin, show AdminLogin screen
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
      {adminTab === 'backups' && <AdminBackups />}
      {adminTab === 'subscriptions' && <AdminSubscriptions />}
      {adminTab === 'payments' && <AdminPayments />}
      {adminTab === 'templates' && <AdminTemplates />}
      {adminTab === 'enquiries' && <AdminEnquiries />}
      {adminTab === 'support' && <AdminSupport />}
      {adminTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
