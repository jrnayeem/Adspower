import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Layers, RefreshCw } from 'lucide-react';

interface HeaderProps {
  totalProfiles: number;
  readyProfiles: number;
  unknownDeviceCount: number;
  onReset: () => void;
  onLoadSample: () => void;
  onOpenLookupModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalProfiles,
  readyProfiles,
  unknownDeviceCount,
  onReset,
  onLoadSample,
  onOpenLookupModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-100 via-cyan-100 to-blue-400 bg-clip-text text-transparent">
                AdsPower Profile Generator
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Bulk TXT Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Auto UA Parser & Hardware Resolution Matcher according to official AdsPower Template
            </p>
          </div>
        </div>

        {/* Stats Badges & Actions */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {totalProfiles > 0 && (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Generated: <strong className="text-slate-100">{totalProfiles}</strong></span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ready: <strong>{readyProfiles}</strong></span>
              </div>
              {unknownDeviceCount > 0 && (
                <>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={onOpenLookupModal}
                    className="flex items-center gap-1.5 text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 px-2 py-0.5 rounded-lg transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Lookup Hardware Specs (<strong>{unknownDeviceCount}</strong>)</span>
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={onLoadSample}
            type="button"
            className="btn btn-sm btn-outline-info text-cyan-400 border-cyan-500/40 hover:bg-cyan-950/60 hover:text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={onReset}
            type="button"
            className="btn btn-sm btn-outline-secondary text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-medium py-1.5 px-2.5 rounded-lg"
            title="Reset All Inputs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
