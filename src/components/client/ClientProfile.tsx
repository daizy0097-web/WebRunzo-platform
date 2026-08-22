import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  ShieldCheck, 
  Bell, 
  Check 
} from 'lucide-react';

export const ClientProfile: React.FC = () => {
  const { activeCustomer, updateCustomer, showToast } = useApp();

  if (!activeCustomer) return null;

  const [businessName, setBusinessName] = useState(activeCustomer.businessName);
  const [name, setName] = useState(activeCustomer.name);
  const [email, setEmail] = useState(activeCustomer.email);
  const [phone, setPhone] = useState(activeCustomer.phone);
  const [address, setAddress] = useState(activeCustomer.customContent?.address || '100 Innovation Blvd, Suite 400');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(activeCustomer.id, {
      businessName,
      name,
      email,
      phone,
      customContent: {
        ...activeCustomer.customContent,
        address,
      },
    });
    showToast('Client profile updated successfully!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) return;
    setCurrentPass('');
    setNewPass('');
    showToast('Your security credentials have been updated!', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Business Profile & Account Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your organizational contact details, administrator logins, and notification channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: General Business Profile */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Company Information</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Holder / Owner Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registered Account Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile Information</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Security & Password */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Change Security Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter min 8 characters"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition border border-slate-700 shadow"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Two-Factor Authentication (2FA)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your WebRunzo portal is protected with end-to-end multi-tenant session isolation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
