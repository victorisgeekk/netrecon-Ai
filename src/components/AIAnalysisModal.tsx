import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  AlertTriangle, 
  Code, 
  RefreshCw,
  Radio,
  Plus,
  SlidersHorizontal,
  Info,
  ChevronRight,
  Zap,
  WifiOff
} from 'lucide-react';
import { GeneratedRoutingConfig } from '../types/traffic';
import { FlashlightNotification } from './FlashlightNotification';
import { generateLocalOfflineAnalysis } from '../utils/localOfflineAi';

interface AIAnalysisModalProps {
  language?: 'my' | 'en';
  snis: string[];
  isOpen: boolean;
  onClose: () => void;
  onTriggerRadioReset: () => void;
  onOpenOfflineModelManager?: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  language = 'my',
  snis,
  isOpen,
  onClose,
  onTriggerRadioReset,
  onOpenOfflineModelManager,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeneratedRoutingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Human Override & Manual Guidance States
  const [editableSnis, setEditableSnis] = useState<string[]>([]);
  const [newSniInput, setNewSniInput] = useState('');
  const [customDirective, setCustomDirective] = useState('');

  // Read active model from Universal AI Connector
  const activeUniversalConfig = (() => {
    try {
      const saved = localStorage.getItem('netrecon_universal_ai_config');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const activeModelName = activeUniversalConfig?.modelName || 'gemini-3.8-flash';

  // Sync incoming SNIs whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEditableSnis([...snis]);
      setError(null);
    }
  }, [isOpen, snis]);

  if (!isOpen) return null;

  const handleAddSni = () => {
    const trimmed = newSniInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!editableSnis.includes(trimmed)) {
      setEditableSnis((prev) => [...prev, trimmed]);
    }
    setNewSniInput('');
  };

  const handleRemoveSni = (target: string) => {
    setEditableSnis((prev) => prev.filter((s) => s !== target));
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    const targetSnis = editableSnis.length > 0 ? editableSnis : snis;

    // Check if client is offline upfront
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineResult = generateLocalOfflineAnalysis(targetSnis, customDirective, language);
      setAnalysisResult(offlineResult);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          snis: targetSnis,
          customDirective: customDirective.trim() || undefined,
          modelName: activeModelName,
          customApiKey: activeUniversalConfig?.apiKey || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || (language === 'my' ? 'ခွဲခြမ်းစိတ်ဖြာမှု မအောင်မြင်ပါ' : 'Failed to complete analysis'));
      }

      setAnalysisResult(json.data);
    } catch (err: any) {
      // Automatic seamless failover to Local Offline AI Engine on network failure or fetch error
      const offlineResult = generateLocalOfflineAnalysis(targetSnis, customDirective, language);
      setAnalysisResult(offlineResult);
    } finally {
      setLoading(false);
    }
  };

  const handleRunLocalOffline = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const targetSnis = editableSnis.length > 0 ? editableSnis : snis;
      const offlineResult = generateLocalOfflineAnalysis(targetSnis, customDirective, language);
      setAnalysisResult(offlineResult);
      setLoading(false);
    }, 250);
  };

  const jsonConfigString = analysisResult?.recommendedRouting
    ? JSON.stringify(analysisResult.recommendedRouting, null, 2)
    : analysisResult?.raw || '';

  const handleCopyConfig = () => {
    if (!jsonConfigString) return;
    navigator.clipboard.writeText(jsonConfigString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                {language === 'my' ? 'Gemini Traffic Analysis & Routing' : 'Gemini Traffic Analysis & Routing'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {activeModelName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'my'
                  ? `SNI ဒိုမိန်း (${editableSnis.length}) ခု အား analyze လုပ်၍ split-tunneling routing configuration ထုတ်လုပ်ခြင်း`
                  : `Evaluating ${editableSnis.length} target SNIs with human override support`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Target Hostnames with Manual Override UI */}
          <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#4ea8de]" />
                {language === 'my' ? `Target SNI ဒိုမိန်းများ စာရင်း (${editableSnis.length})` : `Target SNIs (${editableSnis.length})`}
              </span>
              <span className="text-[11px] text-[#4ea8de]">
                {language === 'my' ? 'လူကနေ ပြင်ဆင်/ဖျက်/ထည့်သွင်းနိုင်သည်' : 'Human Override Enabled'}
              </span>
            </div>

            {/* Tags with delete buttons */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {editableSnis.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  {language === 'my' ? 'Target SNI မရှိသေးပါ။ အောက်တွင် အသစ်ထည့်ပါ (ဥပမာ: api.google.com)' : 'No target SNIs. Add one below (e.g. api.google.com)'}
                </span>
              ) : (
                editableSnis.map((host, idx) => (
                  <span
                    key={`modal-host-${host}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141827] text-slate-200 border border-[#23293e] text-xs font-mono group hover:border-[#4ea8de]/50 transition-colors"
                  >
                    <span>{host}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSni(host)}
                      title={`Remove ${host}`}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom SNI Input (e.g., api.google.com) */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#23293e]/60">
              <input
                type="text"
                value={newSniInput}
                onChange={(e) => setNewSniInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSni();
                  }
                }}
                placeholder={language === 'my' ? 'SNI အသစ်ထည့်မည် (ဥပမာ: api.google.com)...' : 'Add custom SNI (e.g. api.google.com)...'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#4ea8de] font-mono"
              />
              <button
                type="button"
                onClick={handleAddSni}
                disabled={!newSniInput.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#4ea8de] border border-slate-700 text-xs font-mono disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'my' ? 'SNI ထည့်မည်' : 'Add SNI'}</span>
              </button>
            </div>
          </div>

          {/* Human Directive / Custom Instruction to Gemini */}
          <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                {language === 'my' ? 'AI ထံသို့ လူကိုယ်တိုင် ညွှန်ကြားချက် (Human Directive)' : 'Human Directive / Custom Override Prompt'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Optional</span>
            </div>

            <textarea
              rows={2}
              value={customDirective}
              onChange={(e) => setCustomDirective(e.target.value)}
              placeholder={language === 'my' 
                ? 'ဥပမာ: "google.com မဟုတ်ဘဲ api.google.com ကိုသာ Proxy အဖြစ် သတ်မှတ်ပေးပါ" သို့မဟုတ် "API subdomain များကို ဦးစားပေး လမ်းကြောင်းခွဲပေးပါ"...' 
                : 'e.g. "Force api.google.com to Proxy route while keeping apex google.com as Direct", or "Route all *.api.* via proxy tunnel"...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c084fc] font-mono resize-none leading-relaxed"
            />

            {/* Quick Directive Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
              <span className="text-slate-500 flex items-center gap-0.5">
                <ChevronRight className="w-3 h-3 text-[#4ea8de]" />
                {language === 'my' ? 'အမြန်ရွေးရန်:' : 'Quick Presets:'}
              </span>
              <button
                type="button"
                onClick={() => setCustomDirective('Force api.google.com to Proxy routing and apex google.com to Direct.')}
                className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/60 transition-colors"
              >
                api.google.com &rarr; Proxy
              </button>
              <button
                type="button"
                onClick={() => setCustomDirective('Prioritize all developer API and microservice subdomains via encrypted proxy.')}
                className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-800/60 transition-colors"
              >
                Subdomains &rarr; Proxy
              </button>
              <button
                type="button"
                onClick={() => setCustomDirective('')}
                className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800 transition-colors"
              >
                {language === 'my' ? 'ဖျက်မည်' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Explanation Info Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
            <Info className="w-4 h-4 text-[#4ea8de] shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              <span className="text-slate-200 font-medium">
                {language === 'my' ? 'လူကနေ AI ကို ညွှန်ကြားပုံ မူဘောင်:' : 'Human-in-the-Loop Override:'}{' '}
              </span>
              {language === 'my'
                ? 'အလိုအလျောက် စနစ်က google.com ဟု သတ်မှတ်ထားသော်လည်း လူက api.google.com သို့မဟုတ် လိုချင်သော subdomain ကို ပြောင်းလဲခွဲခြမ်းစိတ်ဖြာလိုပါက အထက်ပါအတိုင်း SNI အသစ်ထည့်ပြီး ညွှန်ကြားချက် ပေးပို့နိုင်ပါသည်။ Gemini သည် မူရင်း heuristic ထက် လူ၏ ညွှန်ကြားချက်ကို ပထမဦးစားပေး အဖြစ် လက်ခံဆောင်ရွက်ပါမည်။'
                : 'If automated packet interception detects an apex domain (e.g. google.com) but you require granular subdomain testing (e.g. api.google.com), simply adjust the SNIs above or specify custom constraints. The Gemini model prioritizes human directives over default heuristics.'}
            </div>
          </div>

          {/* Trigger Button or Loading State */}
          {!loading && !error && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4 border-t border-slate-800/70 pt-5">
              <button
                onClick={handleRunAnalysis}
                disabled={editableSnis.length === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-950/50 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {analysisResult 
                    ? (language === 'my' ? 'Cloud AI ဖြင့် ထပ်မံ Analyze လုပ်မည်' : 'Re-Analyze with Cloud AI') 
                    : (language === 'my' ? 'Gemini AI ဖြင့် Analysis စတင်မည်' : 'Analyze Traffic with Gemini')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleRunLocalOffline}
                disabled={editableSnis.length === 0}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 font-medium text-xs shadow transition-all active:scale-98 flex items-center justify-center gap-2 font-mono"
                title="အင်တာနက်မလိုဘဲ ဖုန်းတွင်းမှ ချက်ချင်းတွက်ချက်ရန်"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'my' ? '⚡ Local Offline စနစ်ဖြင့် တွက်မည်' : '⚡ Run Local Offline (Zero Net)'}</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-200 font-mono">
                  {language === 'my' ? 'Gemini AI traffic analysis ပြုလုပ်နေပါသည်...' : 'Synthesizing Routing Logic with Gemini...'}
                </div>
                <div className="text-xs text-slate-500">
                  Applying user directives • Formulating JSON routing rules
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm">
                    {language === 'my' ? 'Traffic Analysis မအောင်မြင်ပါ' : 'Traffic Analysis Failed'}
                  </div>
                  <p className="text-xs text-rose-300 font-mono">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-rose-500/20">
                <button
                  onClick={handleRunAnalysis}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-medium text-rose-100 transition-colors"
                >
                  {language === 'my' ? 'ပြန်လည်စမ်းသပ်မည်' : 'Retry Analysis'}
                </button>
                <button
                  onClick={() => {
                    onTriggerRadioReset();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/60 text-xs font-medium text-amber-200 border border-amber-700/50 transition-colors flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Execute Shizuku Radio Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-5 pt-3 border-t border-[#23293e]">
              {/* Engine Mode Badge (Cloud AI vs Local Offline Engine) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">
                  {language === 'my' ? 'တွက်ချက်သည့် စနစ် (Inference Engine):' : 'Inference Engine Mode:'}
                </span>
                {(analysisResult as any).isOfflineLocal ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-500/50 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'my' ? '⚡ Local Offline Engine (အင်တာနက်မလို)' : '⚡ Local Offline Engine (Zero Net)'}</span>
                    </span>
                    {onOpenOfflineModelManager && (
                      <button
                        type="button"
                        onClick={onOpenOfflineModelManager}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                      >
                        {language === 'my' ? 'GitHub Model စီမံမည်' : 'Manage GGUF'}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'my' ? `Cloud AI (${activeModelName})` : `Cloud AI (${activeModelName})`}</span>
                  </span>
                )}
              </div>

              {/* Flashlight Notification Style for AI Next Step Tips */}
              <FlashlightNotification
                language={language}
                tips={analysisResult.nextStepSuggestions || [
                  'Inspect DNS queries on port 53 to verify resolver leaks do not bypass the tunnel.',
                  'Cycle Airplane mode via Shizuku if socket drops or cellular IP re-allocation stalls.',
                  'Test latency and throughput on isolated target SNIs via proxy.',
                  'Export the generated split-tunneling JSON routing template to Xray-core config.json.'
                ]}
                onTriggerRadioReset={() => {
                  onTriggerRadioReset();
                  onClose();
                }}
                onCopyConfig={handleCopyConfig}
              />

              {/* Summary Box */}
              {analysisResult.summary && (
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185]">
                    {language === 'my' ? 'Security & Privacy Summary' : 'Security & Privacy Summary'}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {analysisResult.summary}
                  </p>
                </div>
              )}

              {/* Domain Categories */}
              {analysisResult.domainCategories && (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    {language === 'my' ? 'Domain Categorization' : 'Domain Categorization'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(analysisResult.domainCategories).map(([domain, category], idx) => (
                      <div
                        key={`cat-domain-${domain}-${idx}`}
                        className="p-2.5 rounded-lg bg-[#0f121d] border border-[#23293e] flex items-center justify-between"
                      >
                        <span className="text-slate-200 truncate pr-2">{domain}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-[#4ea8de] border border-[#4ea8de]/30 whitespace-nowrap">
                          {category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON Configuration View */}
              {jsonConfigString && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#4ea8de]" /> 
                      {language === 'my' ? 'Generated Routing Profile (JSON)' : 'Generated Routing Profile (JSON)'}
                    </span>
                    <button
                      onClick={handleCopyConfig}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors font-mono"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? (language === 'my' ? 'ကူးယူပြီး' : 'Copied') : (language === 'my' ? 'JSON ကူးယူမည်' : 'Copy JSON')}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] font-mono overflow-x-auto max-h-60 leading-relaxed font-semibold">
                    {jsonConfigString}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            {language === 'my' ? 'Gemini 3.8 Flash • Human Directive Override Supported' : 'Powered by Gemini Generative AI SDK • Human Directive Override'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            {language === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
