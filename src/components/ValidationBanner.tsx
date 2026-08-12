import React from 'react';
import { ValidationWarning } from '../types';
import { AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle } from 'lucide-react';

interface ValidationBannerProps {
  warnings: ValidationWarning[];
  onTriggerDeviceLookup?: () => void;
  unknownCount: number;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  warnings,
  onTriggerDeviceLookup,
  unknownCount,
}) => {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, idx) => {
        let icon = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
        let borderClass = 'border-cyan-800/60 bg-cyan-950/40 text-cyan-200';

        if (w.type === 'danger') {
          icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
          borderClass = 'border-red-800/60 bg-red-950/40 text-red-200';
        } else if (w.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-800/60 bg-amber-950/40 text-amber-200';
        }

        return (
          <div
            key={idx}
            className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${borderClass}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div>
                <p className="font-medium leading-tight">{w.message}</p>
                {w.details && w.details.length > 0 && (
                  <div className="mt-1 font-mono text-[10px] opacity-80 max-h-16 overflow-y-auto">
                    {w.details.map((d, i) => (
                      <div key={i}>• {d}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Special action for unknown devices */}
            {w.code === 'UNKNOWN_DEVICE' && onTriggerDeviceLookup && unknownCount > 0 && (
              <button
                type="button"
                onClick={onTriggerDeviceLookup}
                className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Hardware Lookup ({unknownCount})</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
