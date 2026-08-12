import React, { useState } from 'react';
import { AdsPowerProfile } from '../types';
import { formatAdsPowerTXT } from '../utils/adspowerGenerator';
import { Download, Copy, Check, FileText, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: AdsPowerProfile[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  profiles,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const rawTxtContent = formatAdsPowerTXT(profiles);
  const blobSizeKb = (new Blob([rawTxtContent]).size / 1024).toFixed(1);

  const handleDownload = () => {
    const blob = new Blob([rawTxtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AdsPower_Import_Profiles_${profiles.length}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTxtContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                AdsPower Bulk Import TXT Export
              </h3>
              <p className="text-xs text-slate-400">
                Official AdsPower Bulk Import TXT syntax ready for direct import
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Info */}
        <div className="bg-slate-950/60 p-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-300">
              Profiles: <strong className="text-cyan-400 font-bold">{profiles.length}</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300">
              Est. File Size: <strong className="text-slate-100 font-bold">{blobSizeKb} KB</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% AdsPower TXT Compliant
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isCopied
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied TXT!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copy TXT</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Download className="w-4 h-4" />
              <span>Download TXT File</span>
            </button>
          </div>
        </div>

        {/* TXT Output Code Container */}
        <div className="p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200">
          <textarea
            readOnly
            value={rawTxtContent}
            rows={20}
            className="w-full bg-slate-950 border-0 text-cyan-300 focus:outline-none focus:ring-0 font-mono text-xs leading-relaxed resize-none selection:bg-cyan-500 selection:text-slate-950"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            Open AdsPower → Import → Select TXT File → Upload
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
