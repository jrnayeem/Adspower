import React from 'react';
import { ProfileBatchCount } from '../types';
import { Zap, Layers } from 'lucide-react';

interface BatchSelectorProps {
  selectedCount: ProfileBatchCount | number;
  onSelectCount: (count: ProfileBatchCount) => void;
  uaCount: number;
}

const BATCH_OPTIONS: ProfileBatchCount[] = [1, 10, 100, 500, 1000, 5000, 10000];

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  selectedCount,
  onSelectCount,
  uaCount,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Supported Batch Size
            </h3>
            <p className="text-xs text-slate-400">
              Select total profiles to generate automatically in Bulk Import TXT
            </p>
          </div>
        </div>

        {uaCount > 0 && (
          <div className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Cycling <strong className="text-cyan-300">{uaCount}</strong> parsed User-Agents</span>
          </div>
        )}
      </div>

      {/* Selector Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {BATCH_OPTIONS.map((count) => {
          const isSelected = selectedCount === count;
          return (
            <button
              key={count}
              type="button"
              onClick={() => onSelectCount(count)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <span className="text-sm">{count.toLocaleString()}</span>
              <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-slate-950/80 font-extrabold' : 'text-slate-500'}`}>
                {count === 1 ? 'Profile' : 'Profiles'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
