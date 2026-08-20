import React, { useState, useEffect } from 'react';
import { ProfileBatchCount } from '../types';
import { Zap, Layers } from 'lucide-react';

interface BatchSelectorProps {
  selectedCount: ProfileBatchCount | number;
  onSelectCount: (count: ProfileBatchCount) => void;
  uaCount: number;
}

const PRESET_OPTIONS = [1, 10, 20, 50, 100] as const;

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  selectedCount,
  onSelectCount,
  uaCount,
}) => {
  const isPreset = (PRESET_OPTIONS as readonly number[]).includes(selectedCount);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!isPreset);
  const [customInputValue, setCustomInputValue] = useState<string>(
    !isPreset ? String(selectedCount) : '200'
  );

  // Sync if selectedCount changes externally (e.g. sample loaded or reset)
  useEffect(() => {
    if ((PRESET_OPTIONS as readonly number[]).includes(selectedCount)) {
      setIsCustomMode(false);
    } else {
      setIsCustomMode(true);
      setCustomInputValue(String(selectedCount));
    }
  }, [selectedCount]);

  const handleSelectPreset = (count: number) => {
    setIsCustomMode(false);
    onSelectCount(count);
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
    const num = parseInt(customInputValue, 10);
    if (!isNaN(num) && num >= 1) {
      onSelectCount(num);
    } else {
      setCustomInputValue('200');
      onSelectCount(200);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strictly positive whole numbers: reject letters, decimals, negative signs, and strip leading zeros
    const digitsOnly = val.replace(/\D/g, '');
    const sanitized = digitsOnly.replace(/^0+/, '');

    setCustomInputValue(sanitized);

    if (sanitized.length > 0) {
      const num = parseInt(sanitized, 10);
      if (!isNaN(num) && num >= 1) {
        onSelectCount(num);
      }
    }
  };

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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PRESET_OPTIONS.map((count) => {
          const isSelected = !isCustomMode && selectedCount === count;
          return (
            <button
              key={count}
              type="button"
              onClick={() => handleSelectPreset(count)}
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

        {/* Custom Button */}
        <button
          type="button"
          onClick={handleSelectCustom}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
            isCustomMode
              ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
          }`}
        >
          <span className="text-sm">Custom</span>
          <span className={`text-[9px] uppercase tracking-wider ${isCustomMode ? 'text-slate-950/80 font-extrabold' : 'text-slate-500'}`}>
            Profiles
          </span>
        </button>
      </div>

      {/* Custom Input Field when CUSTOM is selected */}
      {isCustomMode && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Custom Profile Count:</span>
            <span className="text-[11px] text-slate-400">Enter a positive whole number (min 1)</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customInputValue}
              onChange={handleCustomInputChange}
              placeholder="e.g. 200"
              className="w-32 px-3 py-1.5 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 font-mono text-sm rounded-xl outline-none transition-all text-center"
            />
            <span className="text-xs text-slate-400 font-medium">profiles</span>
          </div>
        </div>
      )}
    </div>
  );
};
