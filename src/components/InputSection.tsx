import React, { useState } from 'react';
import {
  ProfileNameType,
  ProxyProtocol,
  ParsedUA,
  ProxyItem,
} from '../types';
import {
  Globe,
  Shield,
  Plus,
  Trash2,
  FileText,
  Smartphone,
  Settings2,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface InputSectionProps {
  uaInput: string;
  onUaInputChange: (val: string) => void;
  parsedUAs: ParsedUA[];

  proxyInput: string;
  onProxyInputChange: (val: string) => void;
  parsedProxies: ProxyItem[];
  defaultProxyProtocol: ProxyProtocol;
  onProxyProtocolChange: (proto: ProxyProtocol) => void;

  tabs: string[];
  onAddTab: (url: string) => void;
  onRemoveTab: (index: number) => void;
  onResetTabsToDefault: () => void;

  namingType: ProfileNameType;
  onNamingTypeChange: (type: ProfileNameType) => void;
  customPrefix: string;
  onCustomPrefixChange: (val: string) => void;

  defaultRemark: string;
  onDefaultRemarkChange: (val: string) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  uaInput,
  onUaInputChange,
  parsedUAs,

  proxyInput,
  onProxyInputChange,
  parsedProxies,
  defaultProxyProtocol,
  onProxyProtocolChange,

  tabs,
  onAddTab,
  onRemoveTab,
  onResetTabsToDefault,

  namingType,
  onNamingTypeChange,
  customPrefix,
  onCustomPrefixChange,

  defaultRemark,
  onDefaultRemarkChange,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'ua' | 'proxy' | 'tabs' | 'naming'>('ua');
  const [newTabUrl, setNewTabUrl] = useState('');

  const handleTabAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTabUrl.trim()) {
      onAddTab(newTabUrl.trim());
      setNewTabUrl('');
    }
  };

  const validUACount = parsedUAs.filter((u) => u.isValidUA).length;
  const validProxyCount = parsedProxies.filter((p) => p.isValid).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Navigation Bar for Inputs */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveInputTab('ua')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeInputTab === 'ua'
              ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Section 1: User Agents</span>
          {parsedUAs.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
              {parsedUAs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveInputTab('proxy')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeInputTab === 'proxy'
              ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Section 2: Proxies</span>
          {parsedProxies.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
              {parsedProxies.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveInputTab('tabs')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeInputTab === 'tabs'
              ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Section 3: Tabs</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800">
            {tabs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInputTab('naming')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeInputTab === 'naming'
              ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Settings2 className="w-4 h-4 text-amber-400" />
          <span>Section 4: Profile Name</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        {/* SECTION 1: USER AGENTS */}
        {activeInputTab === 'ua' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span>User-Agent Strings Input</span>
                  <span className="text-xs font-normal text-slate-400">(One per line)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Paste one or multiple User-Agents. Device brand, model, Android/iOS version & Chrome version are parsed automatically.
                </p>
              </div>

              {parsedUAs.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validUACount} Valid
                  </span>
                  {parsedUAs.length - validUACount > 0 && (
                    <span className="text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {parsedUAs.length - validUACount} Invalid
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={uaInput}
                onChange={(e) => onUaInputChange(e.target.value)}
                rows={8}
                placeholder="Paste User-Agent strings here (One per line)&#10;e.g.&#10;Mozilla/5.0 (Linux; Android 14; Pixel 9 Build/GUR23; wv)...&#10;Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-y"
              />
              {uaInput && (
                <button
                  onClick={() => onUaInputChange('')}
                  type="button"
                  className="absolute top-3 right-3 text-xs text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick UA parser preview */}
            {parsedUAs.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                <div className="text-slate-400 font-semibold flex items-center justify-between">
                  <span>Detected Devices Breakdown:</span>
                  <span className="text-cyan-400">{parsedUAs.length} UAs Parsed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-28 overflow-y-auto pr-1">
                  {parsedUAs.slice(0, 8).map((parsed, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 text-[11px]"
                    >
                      <div className="font-bold text-slate-200 truncate">
                        {parsed.brand} {parsed.model}
                      </div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <span className="text-cyan-400">{parsed.osName} {parsed.osVersion}</span>
                        <span>•</span>
                        <span>{parsed.browserName}</span>
                      </div>
                    </div>
                  ))}
                  {parsedUAs.length > 8 && (
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-2 text-[11px] text-slate-500 flex items-center justify-center">
                      +{parsedUAs.length - 8} more UAs...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: PROXIES */}
        {activeInputTab === 'proxy' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span>Proxies Input (Optional)</span>
                  <span className="text-xs font-normal text-slate-400">(One proxy per line)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Proxies will be mapped sequentially (Proxy 1 → Profile 1, Proxy 2 → Profile 2).
                </p>
              </div>

              {/* Protocol selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Default Protocol:</span>
                <select
                  value={defaultProxyProtocol}
                  onChange={(e) => onProxyProtocolChange(e.target.value as ProxyProtocol)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="socks5">SOCKS5</option>
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                  <option value="ssh">SSH</option>
                  <option value="noproxy">No Proxy</option>
                </select>
              </div>
            </div>

            {/* Supported Formats Info */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1 text-slate-400">
              <span className="font-semibold text-slate-300">Supported Proxy Formats:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-1 text-slate-300">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  host:port:user:password
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  username:password@host:port
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  host:port
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  No Proxy
                </div>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={proxyInput}
                onChange={(e) => onProxyInputChange(e.target.value)}
                rows={7}
                placeholder="Paste proxies here (One per line)&#10;e.g.&#10;192.168.1.1:8080:username:password&#10;user:pass@104.28.19.12:1080&#10;45.33.22.11:3128"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-y"
              />
              {proxyInput && (
                <button
                  onClick={() => onProxyInputChange('')}
                  type="button"
                  className="absolute top-3 right-3 text-xs text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {parsedProxies.length > 0 && (
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Parsed Proxies: <strong className="text-emerald-400">{parsedProxies.length}</strong></span>
                <span>Valid Proxies: <strong className="text-emerald-400">{validProxyCount}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: TABS */}
        {activeInputTab === 'tabs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Tabs Manager
                </h4>
                <p className="text-xs text-slate-400">
                  Add unlimited tabs. Each profile will contain all selected tabs separated exactly as required by AdsPower.
                </p>
              </div>

              <button
                type="button"
                onClick={onResetTabsToDefault}
                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1 rounded-lg"
              >
                Reset Default Tabs
              </button>
            </div>

            {/* Add New Tab Form */}
            <form onSubmit={handleTabAddSubmit} className="flex gap-2">
              <input
                type="url"
                value={newTabUrl}
                onChange={(e) => setNewTabUrl(e.target.value)}
                placeholder="https://example.com/"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tab</span>
              </button>
            </form>

            {/* Current Tabs List */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-medium">
                Active Tabs ({tabs.length}):
              </div>

              {tabs.length === 0 ? (
                <div className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl text-center border border-slate-800">
                  No tabs added. Profiles will be generated with empty tab field.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tabs.map((tabUrl, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-slate-200 group hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        <a
                          href={tabUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 font-mono text-[11px] truncate flex items-center gap-1"
                        >
                          {tabUrl}
                          <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveTab(idx)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                        title="Remove tab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: PROFILE NAMING & REMARKS */}
        {activeInputTab === 'naming' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Profile Naming Options
              </h4>
              <p className="text-xs text-slate-400">
                Choose how AdsPower profile names are formatted during generation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sequential */}
              <button
                type="button"
                onClick={() => onNamingTypeChange('sequential')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  namingType === 'sequential'
                    ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 mb-1">
                  Sequential
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mb-1">
                  Profile-001, Profile-002...
                </div>
                <p className="text-[10px] text-slate-500">
                  Standard numbered sequence prefix
                </p>
              </button>

              {/* Random Device Based */}
              <button
                type="button"
                onClick={() => onNamingTypeChange('random')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  namingType === 'random'
                    ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 mb-1">
                  Random / Device Model
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mb-1">
                  Pixel9-001, Moto-002...
                </div>
                <p className="text-[10px] text-slate-500">
                  Name incorporates detected device model
                </p>
              </button>

              {/* Custom Prefix */}
              <button
                type="button"
                onClick={() => onNamingTypeChange('custom_prefix')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  namingType === 'custom_prefix'
                    ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 mb-1">
                  Custom Prefix
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mb-1">
                  {customPrefix || 'Prefix'}-001...
                </div>
                <p className="text-[10px] text-slate-500">
                  Define your own custom prefix string
                </p>
              </button>
            </div>

            {/* Custom Prefix Input if selected */}
            {namingType === 'custom_prefix' && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Custom Name Prefix:
                </label>
                <input
                  type="text"
                  value={customPrefix}
                  onChange={(e) => onCustomPrefixChange(e.target.value)}
                  placeholder="e.g. US_Mobile_FB"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Optional Remark Prefix */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Custom Remark Tag (Optional):
              </label>
              <input
                type="text"
                value={defaultRemark}
                onChange={(e) => onDefaultRemarkChange(e.target.value)}
                placeholder="e.g. Batch_Aug2026_ProjectA"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500">
                Appended alongside auto-detected OS and hardware specs in the AdsPower `remark` field.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
