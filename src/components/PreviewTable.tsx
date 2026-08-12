import React, { useState } from 'react';
import { AdsPowerProfile, ProfileStatus } from '../types';
import { formatSingleProfileTXT } from '../utils/adspowerGenerator';
import {
  Search,
  Copy,
  Check,
  Eye,
  Smartphone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface PreviewTableProps {
  profiles: AdsPowerProfile[];
  onCopyIndividual: (profile: AdsPowerProfile) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  profiles,
  onCopyIndividual,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProfileStatus | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectProfile, setInspectProfile] = useState<AdsPowerProfile | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleCopyRow = (profile: AdsPowerProfile) => {
    onCopyIndividual(profile);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.parsedUA.brand.toLowerCase().includes(term) ||
      p.parsedUA.model.toLowerCase().includes(term) ||
      p.ua.toLowerCase().includes(term) ||
      (p.proxy && p.proxy.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: ProfileStatus) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </span>
        );
      case 'Estimated Device':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80">
            <Smartphone className="w-3 h-3" />
            Estimated Device
          </span>
        );
      case 'Unknown Device':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <AlertTriangle className="w-3 h-3" />
            Unknown Device
          </span>
        );
      case 'Proxy Missing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/80">
            <Shield className="w-3 h-3" />
            Proxy Missing
          </span>
        );
      case 'Invalid UA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/80">
            <XCircle className="w-3 h-3" />
            Invalid UA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 backdrop-blur-sm">
        <Smartphone className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-300 mb-1">
          No Profiles Generated Yet
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Paste User-Agents in Section 1 above and click Generate to preview complete AdsPower Import TXT profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm space-y-0">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search profiles, UA, proxies..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="text-xs text-slate-400 shrink-0 font-medium hidden sm:block">
            Showing <span className="text-slate-200 font-bold">{filteredProfiles.length}</span> of {profiles.length}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('ALL');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
              selectedStatus === 'ALL'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All ({profiles.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Ready');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
              selectedStatus === 'Ready'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Ready
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Unknown Device');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
              selectedStatus === 'Unknown Device'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Unknown Dev
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Profile Name</th>
              <th className="py-3 px-4">Brand / Model</th>
              <th className="py-3 px-4">OS / Browser</th>
              <th className="py-3 px-4">Resolution</th>
              <th className="py-3 px-4">Proxy</th>
              <th className="py-3 px-4">FB Version</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {paginatedProfiles.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Name */}
                  <td className="py-3 px-4 font-bold text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-400 font-mono text-[11px]">{p.name}</span>
                    </div>
                  </td>

                  {/* Brand / Model */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-200">
                      {p.parsedUA.brand}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.parsedUA.model}
                    </div>
                  </td>

                  {/* OS / Browser */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-slate-200">
                      {p.parsedUA.osName} {p.parsedUA.osVersion}
                    </div>
                    <div className="text-[10px] text-cyan-400">
                      {p.parsedUA.browserName} {p.parsedUA.browserVersion}
                    </div>
                  </td>

                  {/* Resolution */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-cyan-300 font-semibold">
                    {p.resolution}
                  </td>

                  {/* Proxy */}
                  <td className="py-3 px-4 max-w-[160px] truncate">
                    {p.proxy ? (
                      <span className="font-mono text-[11px] text-slate-300 truncate block">
                        {p.proxy}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">noproxy</span>
                    )}
                  </td>

                  {/* FB Version */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {p.parsedUA.facebookAppVersion || '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(p.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectProfile(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 border border-transparent hover:border-cyan-800/60 transition-all"
                        title="Inspect Profile Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyRow(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border ${
                          isCopied
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                        title="Copy Individual AdsPower TXT Profile"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-cyan-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
        <div>
          Page <strong className="text-slate-200">{currentPage}</strong> of <strong className="text-slate-200">{totalPages}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspect Single Profile Drawer Modal */}
      {inspectProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>AdsPower TXT Block Inspector:</span>
                  <span className="text-cyan-400 font-mono">{inspectProfile.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Exact AdsPower Bulk Import Key-Value Format
                </p>
              </div>

              <button
                onClick={() => setInspectProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto whitespace-pre">
                {formatSingleProfileTXT(inspectProfile)}
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyRow(inspectProfile)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Copy className="w-4 h-4" />
                <span>Copy TXT Block</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
