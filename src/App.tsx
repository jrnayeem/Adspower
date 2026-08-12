import React, { useState, useMemo, useEffect } from 'react';
import {
  ProfileBatchCount,
  ProfileNameType,
  ProxyProtocol,
  AdsPowerProfile,
} from './types';
import { parseUserAgent } from './utils/uaParser';
import { parseMultipleProxies } from './utils/proxyParser';
import { generateAdsPowerProfiles, formatAdsPowerTXT, formatSingleProfileTXT } from './utils/adspowerGenerator';
import { validateInputData } from './utils/validator';
import { SAMPLE_USER_AGENTS, SAMPLE_PROXIES, DEFAULT_TABS } from './data/sampleData';

import { Header } from './components/Header';
import { BatchSelector } from './components/BatchSelector';
import { InputSection } from './components/InputSection';
import { ValidationBanner } from './components/ValidationBanner';
import { PreviewTable } from './components/PreviewTable';
import { DeviceLookupModal } from './components/DeviceLookupModal';
import { ExportModal } from './components/ExportModal';

import {
  Play,
  Download,
  Copy,
  Check,
  FileCode2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Inputs
  const [uaInput, setUaInput] = useState<string>(SAMPLE_USER_AGENTS);
  const [proxyInput, setProxyInput] = useState<string>(SAMPLE_PROXIES);
  const [defaultProxyProtocol, setDefaultProxyProtocol] = useState<ProxyProtocol>('socks5');
  const [tabs, setTabs] = useState<string[]>(DEFAULT_TABS);

  // Configuration
  const [targetCount, setTargetCount] = useState<ProfileBatchCount>(10);
  const [namingType, setNamingType] = useState<ProfileNameType>('sequential');
  const [customPrefix, setCustomPrefix] = useState<string>('US_Mobile');
  const [defaultRemark, setDefaultRemark] = useState<string>('');

  // Modals & UI States
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopiedGlobal, setIsCopiedGlobal] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);

  // Parse User-Agents
  const parsedUAs = useMemo(() => {
    const lines = uaInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return lines.map((line) => parseUserAgent(line));
  }, [uaInput, cacheVersion]);

  // Parse Proxies
  const parsedProxies = useMemo(() => {
    return parseMultipleProxies(proxyInput, defaultProxyProtocol);
  }, [proxyInput, defaultProxyProtocol]);

  // Generate Profiles
  const generatedProfiles: AdsPowerProfile[] = useMemo(() => {
    if (parsedUAs.length === 0) return [];

    return generateAdsPowerProfiles({
      parsedUAs,
      proxies: parsedProxies,
      tabs,
      namingType,
      customPrefix,
      targetCount,
      defaultRemark,
    });
  }, [
    parsedUAs,
    parsedProxies,
    tabs,
    namingType,
    customPrefix,
    targetCount,
    defaultRemark,
  ]);

  // Validation Warnings
  const validationWarnings = useMemo(() => {
    return validateInputData(parsedUAs, parsedProxies, targetCount);
  }, [parsedUAs, parsedProxies, targetCount]);

  // Count metrics
  const readyProfiles = generatedProfiles.filter((p) => p.status === 'Ready').length;
  const unknownUAs = parsedUAs.filter((u) => u.isUnknownDevice && u.isValidUA);

  // Toast notification trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers for Tabs
  const handleAddTab = (url: string) => {
    if (url && !tabs.includes(url)) {
      setTabs([...tabs, url]);
      showToast('New tab added to profile configuration!');
    }
  };

  const handleRemoveTab = (index: number) => {
    setTabs(tabs.filter((_, idx) => idx !== index));
  };

  const handleResetTabsToDefault = () => {
    setTabs(DEFAULT_TABS);
    showToast('Tabs reset to default URLs!');
  };

  // Reset all
  const handleReset = () => {
    setUaInput('');
    setProxyInput('');
    setTabs(DEFAULT_TABS);
    setNamingType('sequential');
    setCustomPrefix('');
    setDefaultRemark('');
    showToast('All inputs cleared!');
  };

  // Load sample data
  const handleLoadSample = () => {
    setUaInput(SAMPLE_USER_AGENTS);
    setProxyInput(SAMPLE_PROXIES);
    setTabs(DEFAULT_TABS);
    setTargetCount(10);
    setNamingType('sequential');
    showToast('Sample User-Agents & Proxies loaded!');
  };

  // Global Copy TXT
  const handleCopyGlobalTXT = () => {
    if (generatedProfiles.length === 0) return;
    const txt = formatAdsPowerTXT(generatedProfiles);
    navigator.clipboard.writeText(txt);
    setIsCopiedGlobal(true);
    showToast(`Copied ${generatedProfiles.length} profiles in AdsPower TXT format!`);
    setTimeout(() => setIsCopiedGlobal(false), 2500);
  };

  // Copy Individual Profile
  const handleCopyIndividualProfile = (profile: AdsPowerProfile) => {
    const singleTxt = formatSingleProfileTXT(profile);
    navigator.clipboard.writeText(singleTxt);
    showToast(`Copied profile ${profile.name}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar Header */}
      <Header
        totalProfiles={generatedProfiles.length}
        readyProfiles={readyProfiles}
        unknownDeviceCount={unknownUAs.length}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onOpenLookupModal={() => setIsLookupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Batch Size Selector */}
        <BatchSelector
          selectedCount={targetCount}
          onSelectCount={(count) => setTargetCount(count)}
          uaCount={parsedUAs.length}
        />

        {/* Input Sections (User-Agents, Proxies, Tabs, Naming) */}
        <InputSection
          uaInput={uaInput}
          onUaInputChange={setUaInput}
          parsedUAs={parsedUAs}
          proxyInput={proxyInput}
          onProxyInputChange={setProxyInput}
          parsedProxies={parsedProxies}
          defaultProxyProtocol={defaultProxyProtocol}
          onProxyProtocolChange={setDefaultProxyProtocol}
          tabs={tabs}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onResetTabsToDefault={handleResetTabsToDefault}
          namingType={namingType}
          onNamingTypeChange={setNamingType}
          customPrefix={customPrefix}
          onCustomPrefixChange={setCustomPrefix}
          defaultRemark={defaultRemark}
          onDefaultRemarkChange={setDefaultRemark}
        />

        {/* Pre-export Validation Warnings */}
        <ValidationBanner
          warnings={validationWarnings}
          onTriggerDeviceLookup={() => setIsLookupModalOpen(true)}
          unknownCount={unknownUAs.length}
        />

        {/* Primary Action Generation Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center font-bold">
              {generatedProfiles.length}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Profiles Ready for Export</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  AdsPower TXT Format
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate and download complete AdsPower Bulk Import TXT file
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyGlobalTXT}
              disabled={generatedProfiles.length === 0}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border disabled:opacity-40 ${
                isCopiedGlobal
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isCopiedGlobal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied All TXT!</span>
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
              onClick={() => setIsExportModalOpen(true)}
              disabled={generatedProfiles.length === 0}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Download TXT File</span>
            </button>
          </div>
        </div>

        {/* Live Preview Table */}
        <PreviewTable
          profiles={generatedProfiles}
          onCopyIndividual={handleCopyIndividualProfile}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
		<div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
		<div className="flex items-center gap-2">
		<Cpu className="w-4 h-4 text-cyan-400" />
		<span>AdsPower Bulk Import TXT Profile Generator • Professional Edition</span>
		</div>
		<div className="flex items-center gap-4 text-slate-400 text-[11px]">
		<span>100% Client-Side Fast Generation</span>
		<span>•</span>
		<span>Official Template Fields Only</span>
		</div>
		</div>

		<div className="mt-3 text-slate-400 text-[11px]">
		<span>Created by Md Jubaer Rahman</span>
		<span className="mx-2">•</span>
		<span>Telegram: @mjrnayeem</span>
		</div>
	  </footer>

      {/* AI Device Specification Lookup Modal */}
      <DeviceLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        unknownUAs={unknownUAs}
        onDeviceUpdated={() => {
          setCacheVersion((v) => v + 1);
          showToast('Updated device specifications & regenerated AdsPower profiles!');
        }}
      />

      {/* Export TXT Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profiles={generatedProfiles}
      />
    </div>
  );
}
