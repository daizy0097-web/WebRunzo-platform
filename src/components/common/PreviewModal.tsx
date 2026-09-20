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
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                {customer ? 'Customer Website' : `${template?.category} Template`}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
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
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use This Template</span>
            </button>
          )}

          <button
            onClick={closePreviewModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Close Preview"
            aria-label="Close Preview"
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
