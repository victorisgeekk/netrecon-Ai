import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Play, 
  Pause, 
  PlusCircle, 
  Plus,
  Eye, 
  Layers, 
  Globe, 
  Copy, 
  Check,
  Terminal,
  Smartphone,
  AlertTriangle,
  ShieldAlert,
  X,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { PacketLog, generatePacketId } from '../types/traffic';
import { MOCK_NEW_PACKETS_POOL } from '../mock/samplePackets';
import { HttpInjectorPayloadModal } from './HttpInjectorPayloadModal';

interface TrafficLogInspectorProps {
  language?: 'my' | 'en';
  packets: PacketLog[];
  isCapturing: boolean;
  onToggleCapture: () => void;
  onClearPackets: () => void;
  onAddPacket: (packet: PacketLog) => void;
  onAnalyzeWithAI: (selectedSnis: string[]) => void;
}

export const TrafficLogInspector: React.FC<TrafficLogInspectorProps> = ({
  language = 'my',
  packets,
  isCapturing,
  onToggleCapture,
  onClearPackets,
  onAddPacket,
  onAnalyzeWithAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'ALL' | 'IP' | 'DOMAIN' | 'PROTOCOL'>('ALL');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | 'TLS' | 'DNS' | 'TCP' | 'UDP'>('ALL');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState<boolean>(false);
  const [selectedPacket, setSelectedPacket] = useState<PacketLog | null>(null);
  const [copiedHex, setCopiedHex] = useState(false);
  const [showInjectInput, setShowInjectInput] = useState(false);
  const [customSniToInject, setCustomSniToInject] = useState('api.google.com');
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  // Helper to determine if a packet is categorized as suspicious
  const isPacketSuspicious = (p: PacketLog): boolean => {
    if (p.category === 'suspicious') return true;
    const lowerSni = (p.sni || '').toLowerCase();
    if (
      lowerSni.includes('c2') ||
      lowerSni.includes('botnet') ||
      lowerSni.includes('malware') ||
      lowerSni.includes('crypto-miner') ||
      lowerSni.includes('spyware') ||
      lowerSni.includes('dns-leak')
    ) {
      return true;
    }
    // Unusual high ports or non-standard ports
    if (p.destPort === 8080 || p.destPort === 8443 || p.destPort === 6667) {
      return true;
    }
    return false;
  };

  const suspiciousCount = packets.filter(isPacketSuspicious).length;

  // Filter packets by IP, domain (SNI), protocol, and suspicious toggle
  const filteredPackets = packets.filter((p) => {
    // 1. Suspicious Toggle Filter
    if (showSuspiciousOnly && !isPacketSuspicious(p)) {
      return false;
    }

    // 2. Protocol Filter
    if (protocolFilter !== 'ALL') {
      if (protocolFilter === 'TLS' && !p.isTlsClientHello && !p.protocol.includes('TLS')) return false;
      if (protocolFilter === 'DNS' && p.protocol !== 'DNS (UDP)') return false;
      if (protocolFilter === 'TCP' && !p.protocol.includes('TCP')) return false;
      if (protocolFilter === 'UDP' && !p.protocol.includes('UDP')) return false;
    }

    // 3. Search Filter (by IP, domain/SNI, protocol, or all)
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();

    if (searchField === 'IP') {
      return (
        p.sourceIP.toLowerCase().includes(term) ||
        p.destIP.toLowerCase().includes(term)
      );
    }

    if (searchField === 'DOMAIN') {
      return !!(p.sni && p.sni.toLowerCase().includes(term));
    }

    if (searchField === 'PROTOCOL') {
      return p.protocol.toLowerCase().includes(term);
    }

    // Default 'ALL': checks IP address, domain (SNI), protocol, port
    const matchesIp = p.sourceIP.toLowerCase().includes(term) || p.destIP.toLowerCase().includes(term);
    const matchesSni = !!(p.sni && p.sni.toLowerCase().includes(term));
    const matchesProtocol = p.protocol.toLowerCase().includes(term);
    const matchesPort = p.destPort.toString().includes(term) || p.sourcePort.toString().includes(term);

    return matchesIp || matchesSni || matchesProtocol || matchesPort;
  });

  const isAnyFilterActive = searchTerm !== '' || protocolFilter !== 'ALL' || showSuspiciousOnly || searchField !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchField('ALL');
    setProtocolFilter('ALL');
    setShowSuspiciousOnly(false);
  };

  // Extract distinct SNIs
  const extractedSnis = Array.from(
    new Set(packets.map((p) => p.sni).filter((sni): sni is string => !!sni))
  );

  const handleSimulateNewTraffic = () => {
    const template = MOCK_NEW_PACKETS_POOL[Math.floor(Math.random() * MOCK_NEW_PACKETS_POOL.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    const newPkt: PacketLog = {
      id: generatePacketId(),
      timestamp: timeStr,
      sourceIP: '10.0.0.2',
      sourcePort: 45000 + Math.floor(Math.random() * 15000),
      destIP: template.ip,
      destPort: 443,
      protocol: 'TLS (TCP)',
      lengthBytes: 450 + Math.floor(Math.random() * 200),
      sni: template.sni,
      flags: ['PSH', 'ACK'],
      isTlsClientHello: true,
      category: template.category,
      rawHexSample: `16 03 01 01 fc 01 00 01 f8 03 03 ... 00 00 00 ${template.sni.length.toString(16)} 00 ${template.sni.split('').map(c => c.charCodeAt(0).toString(16)).join(' ')}`,
    };

    onAddPacket(newPkt);
  };

  const handleInjectCustomSni = () => {
    const targetSni = customSniToInject.trim().toLowerCase();
    if (!targetSni) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    const customPkt: PacketLog = {
      id: generatePacketId(),
      timestamp: timeStr,
      sourceIP: '10.0.0.2',
      sourcePort: 52000 + Math.floor(Math.random() * 8000),
      destIP: '142.250.190.14',
      destPort: 443,
      protocol: 'TLS (TCP)',
      lengthBytes: 528,
      sni: targetSni,
      flags: ['PSH', 'ACK'],
      isTlsClientHello: true,
      category: targetSni.includes('api') ? 'tunnel' : 'web',
      rawHexSample: `16 03 03 01 e5 01 00 01 e1 ... 00 00 00 ${targetSni.length.toString(16)} 00 ${targetSni.split('').map(c => c.charCodeAt(0).toString(16)).join(' ')}`,
    };

    onAddPacket(customPkt);
    setSelectedPacket(customPkt);
    setShowInjectInput(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `traffic-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100">
                {language === 'my' ? 'VpnService Traffic Log Inspector' : 'VpnService Traffic Log Inspector'}
              </h3>
              <span
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border ${
                  isCapturing
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCapturing ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                ></span>
                {isCapturing 
                  ? (language === 'my' ? 'ဖမ်းယူနေသည် (CAPTURING)' : 'CAPTURING') 
                  : (language === 'my' ? 'ခေတ္တရပ်ထားသည်' : 'PAUSED')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'my'
                ? 'TUN interface (tun0) မှ IP packet များကို ဖမ်းယူပြီး TLS ClientHello မှ SNI hostnames (RFC 6066) ကို ထုတ်ယူမှတ်တမ်းတင်ခြင်း'
                : 'Inspecting intercepted raw IP packets & extracting TLS ClientHello Server Name Indications (RFC 6066)'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleCapture}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isCapturing
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
            }`}
          >
            {isCapturing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isCapturing 
              ? (language === 'my' ? 'ဖမ်းယူမှု ရပ်တန့်မည်' : 'Pause Capture') 
              : (language === 'my' ? 'ဖမ်းယူမှု ပြန်စမည်' : 'Resume Capture')}
            </span>
          </button>

          <button
            onClick={handleSimulateNewTraffic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Random Packet' : 'Simulate Packet'}</span>
          </button>

          <button
            onClick={() => setShowInjectInput(!showInjectInput)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showInjectInput
                ? 'bg-purple-900/40 text-purple-200 border-purple-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-[#c084fc] border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'my' ? '+ Custom SNI (လူကြိုက်ထည့်ရန်)' : '+ Custom SNI'}</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={packets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'JSON ထုတ်ယူမည်' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => setIsPayloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'my' ? 'HTTP Injector Payload' : 'Injector Payload'}</span>
          </button>

          <button
            onClick={onClearPackets}
            disabled={packets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-900/50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'ရှင်းမည်' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* Custom SNI Quick Inject Bar */}
      {showInjectInput && (
        <div className="px-4 py-3 bg-[#141827] border-b border-[#23293e] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 whitespace-nowrap">
              {language === 'my' ? 'စစ်ဆေးလိုသော SNI ရိုက်ထည့်ပါ:' : 'Inject SNI:'}
            </span>
            <input
              type="text"
              value={customSniToInject}
              onChange={(e) => setCustomSniToInject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInjectCustomSni();
                }
              }}
              placeholder="e.g. api.google.com"
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1 text-slate-100 flex-1 max-w-sm focus:outline-none focus:border-[#c084fc]"
            />
            <button
              onClick={handleInjectCustomSni}
              disabled={!customSniToInject.trim()}
              className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-40 transition-colors"
            >
              {language === 'my' ? 'Packet ထည့်မည်' : 'Inject Packet'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 overflow-x-auto">
            <span className="text-slate-500">Presets:</span>
            {['api.google.com', 'dns.google', 'gateway.icloud.com', 'api.openai.com'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomSniToInject(preset)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[#4ea8de] border border-slate-800 hover:border-cyan-800/40"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Header Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/40 divide-x divide-slate-800 text-xs font-mono">
        <div className="p-3 pl-5">
          <span className="text-slate-500">{language === 'my' ? 'Total Packets:' : 'Total Packets:'}</span>{' '}
          <span className="text-slate-200 font-semibold">{packets.length}</span>
        </div>
        <div className="p-3 pl-5">
          <span className="text-slate-500">{language === 'my' ? 'Unique SNIs:' : 'Unique SNIs:'}</span>{' '}
          <span className="text-emerald-400 font-semibold">{extractedSnis.length}</span>
        </div>
        <div className="p-3 pl-5">
          <span className="text-slate-500">{language === 'my' ? 'Interface:' : 'Capture Interface:'}</span>{' '}
          <span className="text-cyan-400 font-semibold">tun0 (10.0.0.2)</span>
        </div>
        <div className="p-3 pl-5 flex items-center justify-between">
          <div>
            <span className="text-slate-500">MTU:</span> <span className="text-slate-200">1500 B</span>
          </div>
          {extractedSnis.length > 0 && (
            <button
              onClick={() => onAnalyzeWithAI(extractedSnis)}
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 transition-colors"
            >
              {language === 'my' ? 'Gemini ဖြင့် စစ်ဆေးမည် →' : 'Analyze with Gemini →'}
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800 space-y-3">
        {/* Row 1: Search Input with Target Field Selector + Suspicious Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box with Scope Selector */}
          <div className="flex-1 flex items-center bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-inner">
            {/* Field Scope Selector Dropdown / Pills */}
            <div className="flex items-center border-r border-slate-800 bg-slate-950/50 px-2 py-1">
              <span className="text-[11px] text-slate-400 mr-1.5 hidden sm:inline font-mono">
                {language === 'my' ? 'ရှာဖွေမည့်အကွက်:' : 'Field:'}
              </span>
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="bg-transparent text-cyan-300 text-xs font-mono font-medium focus:outline-none cursor-pointer py-1"
                title="Search Filter Target"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">
                  {language === 'my' ? 'အားလုံး (All)' : 'All Fields'}
                </option>
                <option value="IP" className="bg-slate-900 text-slate-200">
                  {language === 'my' ? 'IP လိပ်စာ (IP)' : 'IP Address'}
                </option>
                <option value="DOMAIN" className="bg-slate-900 text-slate-200">
                  {language === 'my' ? 'ဒိုမိန်း (SNI)' : 'Domain (SNI)'}
                </option>
                <option value="PROTOCOL" className="bg-slate-900 text-slate-200">
                  {language === 'my' ? 'ပရိုတိုကော (Protocol)' : 'Protocol'}
                </option>
              </select>
            </div>

            {/* Input with Search Icon */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  searchField === 'IP'
                    ? (language === 'my' ? 'IP လိပ်စာဖြင့် ရှာဖွေပါ (e.g. 10.0.0.2, 142.250)...' : 'Filter by IP address (e.g. 10.0.0.2, 142.250)...')
                    : searchField === 'DOMAIN'
                    ? (language === 'my' ? 'SNI ဒိုမိန်းဖြင့် ရှာဖွေပါ (e.g. google.com, telegram)...' : 'Filter by Domain / SNI (e.g. google.com, telegram)...')
                    : searchField === 'PROTOCOL'
                    ? (language === 'my' ? 'Protocol ဖြင့် ရှာဖွေပါ (e.g. TLS, DNS, TCP)...' : 'Filter by Protocol (e.g. TLS, DNS, TCP)...')
                    : (language === 'my' ? 'IP၊ ဒိုမိန်း (SNI)၊ Protocol သို့မဟုတ် Port ဖြင့် ရှာဖွေပါ...' : 'Search by IP address, domain (SNI), protocol, or port...')
                }
                className="w-full bg-transparent pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-200 absolute right-2.5 transition-colors"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Suspicious Traffic Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all active:scale-98 whitespace-nowrap shadow-md ${
              showSuspiciousOnly
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 font-bold shadow-rose-950/50 ring-1 ring-rose-500/50'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-rose-300 hover:border-rose-700/50'
            }`}
            title="Toggle to view only suspicious, malicious, or anomalous packets"
          >
            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${showSuspiciousOnly ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{language === 'my' ? 'မသင်္ကာဖွယ်ရာသာ' : 'Suspicious Only'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              showSuspiciousOnly 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-950 text-rose-300 border border-rose-800/60'
            }`}>
              {suspiciousCount}
            </span>
          </button>
        </div>

        {/* Row 2: Protocol Filters & Active Filter Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs font-mono">
          {/* Protocol Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-[#4ea8de]" />
              <span>{language === 'my' ? 'ပရိုတိုကော:' : 'Protocol:'}</span>
            </span>
            {(['ALL', 'TLS', 'DNS', 'TCP', 'UDP'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setProtocolFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  protocolFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                    : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {filter === 'ALL' 
                  ? (language === 'my' ? 'အားလုံး' : 'ALL') 
                  : filter === 'TLS' 
                  ? (language === 'my' ? 'TLS (SNI)' : 'TLS') 
                  : filter}
              </button>
            ))}
          </div>

          {/* Results Summary and Reset Filters Button */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">
              {language === 'my' ? 'တွေ့ရှိမှု:' : 'Showing:'}{' '}
              <strong className="text-cyan-300 font-bold">{filteredPackets.length}</strong> / {packets.length}
            </span>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors border border-slate-700"
                title="Reset all search queries and filters"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>{language === 'my' ? 'မူလအတိုင်းပြန်ထားမည်' : 'Clear Filters'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Packet Table & Detail View */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[380px] lg:max-h-[560px]">
        {/* Table List */}
        <div className="flex-1 overflow-auto border-b lg:border-b-0 lg:border-r border-slate-800 font-mono text-xs max-h-[320px] lg:max-h-none">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f121d] sticky top-0 z-10 text-[11px] text-[#8f96b0] uppercase tracking-wider border-b border-[#23293e]">
              <tr>
                <th className="py-2.5 px-3">{language === 'my' ? 'Time' : 'Time'}</th>
                <th className="py-2.5 px-3">{language === 'my' ? 'Protocol' : 'Protocol'}</th>
                <th className="py-2.5 px-3">{language === 'my' ? 'Source → Dest' : 'Source → Dest'}</th>
                <th className="py-2.5 px-3">{language === 'my' ? 'Extracted SNI' : 'Extracted SNI'}</th>
                <th className="py-2.5 px-3">{language === 'my' ? 'Category' : 'Category'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'my' ? 'Length' : 'Length'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPackets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <Filter className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                    <div>
                      {language === 'my' 
                        ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော Packet မတွေ့ပါ။' 
                        : 'No matching packets found for the active filter.'}
                    </div>
                    {isAnyFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
                      >
                        {language === 'my' ? 'Filter များကို ပယ်ဖျက်ပြီး အားလုံးပြန်ကြည့်မည်' : 'Clear filters to view all packets'}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPackets.map((pkt, idx) => {
                  const isSelected = selectedPacket?.id === pkt.id;
                  return (
                    <tr
                      key={`pkt-row-${pkt.id}-${idx}`}
                      onClick={() => setSelectedPacket(pkt)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#141b2d] hover:bg-[#182035] text-cyan-200'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {pkt.timestamp}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            pkt.isTlsClientHello
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : pkt.protocol === 'DNS (UDP)'
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {pkt.protocol}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {pkt.sourceIP}:{pkt.sourcePort} &rarr;{' '}
                        <span className="text-slate-200">{pkt.destIP}:{pkt.destPort}</span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium">
                        {pkt.sni ? (
                          <span className="flex items-center gap-1.5 font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] font-semibold">
                            <Globe className="w-3 h-3 text-[#4ea8de]" />
                            {pkt.sni}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">None (Raw TCP/DNS)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isPacketSuspicious(pkt) ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-300 border border-rose-500/60 font-bold inline-flex items-center gap-1 shadow-sm">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                            <span>{language === 'my' ? 'မသင်္ကာဖွယ်' : 'Suspicious'}</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900/90 text-slate-400 border border-slate-800 uppercase font-mono">
                            {pkt.category || 'General'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 whitespace-nowrap">
                        {pkt.lengthBytes} B
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Packet Inspection Panel */}
        <div className="w-full lg:w-96 bg-[#0f121d] p-3.5 sm:p-4 overflow-y-auto text-xs font-mono space-y-4 border-t lg:border-t-0 lg:border-l border-[#23293e] max-h-[380px] lg:max-h-none">
          <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
            <span className="text-[#8f96b0] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#4ea8de]" /> 
              {language === 'my' ? 'Packet Inspector' : 'Packet Inspector'}
            </span>
            {selectedPacket && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {selectedPacket.id}
              </span>
            )}
          </div>

          {selectedPacket ? (
            <div className="space-y-4">
              {/* Suspicious Anomaly Alert Banner */}
              {isPacketSuspicious(selectedPacket) && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/60 text-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{language === 'my' ? 'သတိပေးချက်: မသင်္ကာဖွယ်ရာ Traffic ဖြစ်ပါသည်' : 'Security Alert: Suspicious Traffic Detected'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {language === 'my'
                      ? 'ဤ packet သည် C2 server၊ telemetry ad-tracker သို့မဟုတ် ပုံမှန်မဟုတ်သော port ဖြစ်နိုင်ပါသည်။ Blocklist ထဲသို့ ထည့်သွင်းရန် သို့မဟုတ် Proxy routing သီးခြားခွဲထုတ်ရန် အကြံပြုပါသည်။'
                      : 'Flagged as anomalous C2 beacon, tracker telemetry, or untrusted destination. Recommend isolating via secure proxy or blocklist routing.'}
                  </p>
                </div>
              )}

              {/* SNI Callout with Gradient */}
              {selectedPacket.sni && (
                <div className="p-3.5 rounded-xl bg-[#141827] border border-[#23293e] space-y-1">
                  <div className="text-[10px] text-[#4ea8de] uppercase font-semibold">
                    {language === 'my' ? 'Extracted TLS SNI' : 'Extracted TLS SNI'}
                  </div>
                  <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] break-all">
                    {selectedPacket.sni}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'my' ? 'အမျိုးအစား:' : 'Category:'} <span className="text-slate-200 capitalize">{selectedPacket.category || 'General'}</span>
                  </div>
                </div>
              )}

              {/* Protocol Stack Details */}
              <div className="space-y-2 border border-[#23293e] rounded-xl p-3 bg-slate-900/60">
                <div className="text-[10px] text-[#8f96b0] uppercase tracking-wider font-semibold">
                  Layer 3 / 4 Breakdown
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div><span className="text-slate-500">Source:</span> {selectedPacket.sourceIP}:{selectedPacket.sourcePort}</div>
                  <div><span className="text-slate-500">Destination:</span> {selectedPacket.destIP}:{selectedPacket.destPort}</div>
                  <div><span className="text-slate-500">Protocol:</span> {selectedPacket.protocol}</div>
                  <div><span className="text-slate-500">Flags:</span> {selectedPacket.flags.join(', ') || 'N/A'}</div>
                </div>
              </div>

              {/* TLS Handshake Structure */}
              {selectedPacket.isTlsClientHello && (
                <div className="space-y-2 border border-[#23293e] rounded-xl p-3 bg-slate-900/60">
                  <div className="text-[10px] text-[#4ea8de] uppercase tracking-wider font-semibold">
                    TLS Handshake Metadata (RFC 6066)
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <div><span className="text-slate-500">Record Content:</span> 0x16 (Handshake)</div>
                    <div><span className="text-slate-500">Handshake Type:</span> 0x01 (ClientHello)</div>
                    <div><span className="text-slate-500">Extension:</span> 0x0000 (server_name)</div>
                  </div>
                </div>
              )}

              {/* Hex Sample */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{language === 'my' ? 'Packet Payload (Hex):' : 'Packet Payload Hex:'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPayloadModalOpen(true)}
                      className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>{language === 'my' ? 'HTTP Injector Payload ထုတ်ရန်' : 'HTTP Injector Format'}</span>
                    </button>
                    <button
                      onClick={() => handleCopyHex(selectedPacket.rawHexSample)}
                      className="flex items-center gap-1 text-[10px] text-[#4ea8de] hover:text-cyan-300"
                    >
                      {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHex ? (language === 'my' ? 'ကူးယူပြီး' : 'Copied') : (language === 'my' ? 'Hex ကူးယူမည်' : 'Copy Hex')}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a0d16] border border-[#23293e] text-[11px] text-slate-300 break-all leading-relaxed font-mono">
                  {selectedPacket.rawHexSample}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Layers className="w-8 h-8 mx-auto opacity-30 text-[#4ea8de]" />
              <p>
                {language === 'my'
                  ? 'Packet တစ်ခုအား နှိပ်၍ Header fields နှင့် Hex byte payload များကို ကြည့်ရှုနိုင်ပါသည်။'
                  : 'Select a packet row to inspect raw header fields, TLS handshake details, and byte hex samples.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* HTTP Injector & HTTP Custom Payload Modal */}
      <HttpInjectorPayloadModal
        language={language}
        isOpen={isPayloadModalOpen}
        onClose={() => setIsPayloadModalOpen(false)}
        packet={selectedPacket}
      />
    </div>
  );
};
