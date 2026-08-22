import React from 'react';
import { useApp } from '../../context/AppContext';
import { LiveWebsitePreviewFrame } from './LiveWebsitePreviewFrame';
import { X, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';

export const PreviewModal: React.FC = () => {
  const { previewModal, closePreviewModal, openEnquiryModal } = useApp();

  if (!previewModal.isOpen) return null;

  const { template, customer } = previewModal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-hidden animate-in fade-in">
      
      {/* Top Bar Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 mb-2 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
            W
          </div>
          <div>
            <div className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>{customer ? customer.businessName : template?.name || 'Live Preview'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                {customer ? 'Customer Website' : `${template?.category} Template`}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {customer ? customer.websiteUrl : `preview.webrunzo.app/${template?.id || 'demo'}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {template && !customer && (
            <button
              onClick={() => {
                closePreviewModal();
                openEnquiryModal(template.id);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use This Template</span>
            </button>
          )}

          <button
            onClick={closePreviewModal}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Frame Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
        <LiveWebsitePreviewFrame customer={customer} template={template} initialDevice="desktop" />
      </div>

    </div>
  );
};
