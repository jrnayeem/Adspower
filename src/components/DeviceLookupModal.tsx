import React, { useState, useEffect, useMemo } from 'react';
import { ParsedUA, DeviceSpec } from '../types';
import {
  extractUniqueUnknownDevices,
  executeBatchHardwareLookup,
  BatchLookupStatus,
  UniqueUnknownDevice,
} from '../utils/hardwareLookupEngine';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Cpu,
  Layers,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DeviceLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  unknownUAs: ParsedUA[];
  onDeviceUpdated: () => void;
}

export const DeviceLookupModal: React.FC<DeviceLookupModalProps> = ({
  isOpen,
  onClose,
  unknownUAs,
  onDeviceUpdated,
}) => {
  // Extract unique unknown devices once when modal opens or unknownUAs changes
  const uniqueUnknowns = useMemo(() => {
    return extractUniqueUnknownDevices(unknownUAs);
  }, [unknownUAs]);

  const [isSearching, setIsSearching] = useState(false);
  const [batchStatus, setBatchStatus] = useState<BatchLookupStatus | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSearching(false);
      setBatchStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Single-Click Batch Lookup Trigger
  const handleStartBatchLookup = async () => {
    if (uniqueUnknowns.length === 0) return;

    setIsSearching(true);

    await executeBatchHardwareLookup(uniqueUnknowns, (status) => {
      setBatchStatus(status);
      if (status.isFinished) {
        setIsSearching(false);
        onDeviceUpdated(); // Trigger profile update and TXT regeneration automatically!
      }
    });
  };

  const completedCount = batchStatus ? batchStatus.completed : 0;
  const totalCount = uniqueUnknowns.length;
  const percent = batchStatus ? batchStatus.percent : 0;
  const isFinished = batchStatus?.isFinished || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-600 text-slate-950 font-extrabold shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Hardware Lookup Engine</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Bulk Auto Match
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                1-Click search official manufacturer specs for all unique unknown models
              </p>
            </div>
          </div>

          {!isSearching && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Summary Banner before start */}
          {!isSearching && !isFinished && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Discovered Unique Unknown Models ({uniqueUnknowns.length}):</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Deduplicated from {unknownUAs.length} UAs
                </span>
              </div>

              {/* Unique Models Badge List */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {uniqueUnknowns.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800"
                  >
                    <Cpu className="w-3 h-3 text-amber-400" />
                    {item.brand} {item.model}
                  </span>
                ))}
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1-Click automatic batch search</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-source fallback specification pipeline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CORS & static host deployment compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Auto-caches & updates all matching profiles</span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Searching Progress Bar */}
          {(isSearching || isFinished) && (
            <div className="bg-slate-950 border border-cyan-800/60 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Searching Hardware Specifications...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Batch Hardware Lookup Complete!</span>
                    </>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {percent}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Live Status Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Models</div>
                  <div className="text-sm font-bold text-slate-200">{totalCount}</div>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-emerald-500 uppercase font-semibold">Completed</div>
                  <div className="text-sm font-bold text-emerald-400">{completedCount}</div>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-cyan-500 uppercase font-semibold">Remaining</div>
                  <div className="text-sm font-bold text-cyan-400">{Math.max(0, totalCount - completedCount)}</div>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-amber-500 uppercase font-semibold">Cached Specs</div>
                  <div className="text-sm font-bold text-amber-400">{batchStatus?.resolvedSpecs.length || 0}</div>
                </div>
              </div>

              {/* Active Item Status Text */}
              {batchStatus && (
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-300 font-semibold truncate">
                      {batchStatus.currentDevice}
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono shrink-0 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {batchStatus.currentSource}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Results List */}
          {batchStatus && batchStatus.resolvedSpecs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Discovered & Cached Device Specifications ({batchStatus.resolvedSpecs.length}):</span>
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <Database className="w-3 h-3" /> Saved to Local Storage
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {batchStatus.resolvedSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-200">
                          {spec.brand} {spec.model}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {spec.ram} RAM • {spec.cpuCores} Cores • {spec.deviceType}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-cyan-400 font-bold text-[11px]">
                        {spec.nativeResolution}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        DPR {spec.dpr}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% AdsPower Import Compliant</span>
          </div>

          <div className="flex items-center gap-2">
            {!isSearching && !isFinished && (
              <button
                type="button"
                onClick={handleStartBatchLookup}
                className="bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 hover:from-amber-400 hover:to-blue-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lookup Hardware Specs ({uniqueUnknowns.length} Models)</span>
              </button>
            )}

            {isFinished && (
              <button
                type="button"
                onClick={() => {
                  onDeviceUpdated();
                  onClose();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done & Regenerate Profiles</span>
              </button>
            )}

            {!isSearching && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
