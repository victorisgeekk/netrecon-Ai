import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Activity, 
  Lock, 
  Server, 
  Sparkles,
  Info,
  Zap,
  Download
} from 'lucide-react';
import { ConnectionTestResult } from '../types/traffic';
import { GradientTerminalBox } from './GradientTerminalBox';
import { UniversalAiConnector } from './UniversalAiConnector';

interface SettingsPanelProps {
  language?: 'my' | 'en';
  onTestSuccess?: (result: ConnectionTestResult) => void;
  onModelChange?: (model: string, apiKey?: string) => void;
  onOpenOfflineModelManager?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  language = 'my',
  onTestSuccess,
  onModelChange,
  onOpenOfflineModelManager
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: ConnectionTestResult = await res.json();
      setTestResult(data);
      if (data.success && onTestSuccess) {
        onTestSuccess(data);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        hasApiKey: false,
        error: err.message || (language === 'my' ? 'ကွန်ရက်ချိတ်ဆက်မှု မအောင်မြင်ပါ။ ဆာဗာ အလုပ်လုပ်နေခြင်း ရှိမရှိ စစ်ဆေးပါ။' : 'Network request failed. Is the server running?'),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
              {language === 'my' ? 'Gemini AI စနစ် ဆက်တင်များနှင့် စစ်ဆေးမှု' : 'Gemini AI Agent Configuration'}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {language === 'my' ? 'အသင့်ဖြစ်' : 'Active'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {language === 'my' 
                ? 'AI စနစ်ချိတ်ဆက်မှု၊ မော်ဒယ်အချက်အလက်များနှင့် Backend API proxy ကို စစ်ဆေးပါ'
                : 'Manage connection status, model parameters, and test backend AI integration'}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md active:scale-98 ${
            testing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing 
            ? (language === 'my' ? 'ချိတ်ဆက်မှု စစ်ဆေးနေပါသည်...' : 'Verifying Link...') 
            : (language === 'my' ? 'ချိတ်ဆက်မှု စစ်ဆေးမည်' : 'Test Connection')}
          </span>
        </button>
      </div>

      {/* Terminal Display styled to match the screenshot colors */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#4ea8de]" />
            {language === 'my' ? 'Gemini Session တိုက်ရိုက်ကွပ်ကဲမှု အခြေအနေ (Active CLI State)' : 'Active CLI Session State'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">gemini-3.8-flash</span>
        </div>

        <GradientTerminalBox
          branchName="main"
          statusNumbers="1   0   0   0"
          commandText="To resume this session: gemini"
          actionSubtitle="--resume"
          outputDetails="4bfa3399-ceee-4ece-abe2-517a29fd9d6d"
          burmeseExplanation="ဤ session တွင် Gemini 3.8 Flash SDK အား Server-Side Proxy ဖြင့် ချိတ်ဆက်ထားပြီး traffic analysis ကို တိုက်ရိုက် လုပ်ဆောင်နိုင်ပါသည်။"
        />
      </div>

      {/* Universal AI Connection Hub (Medium Size) */}
      <UniversalAiConnector language={language} onModelChange={onModelChange} />

      {/* Offline On-Device AI Model (GitHub Repo Downloader) Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-100 font-mono">
                  {language === 'my' ? 'Offline AI Model (GitHub Repo ဒေါင်းလုဒ်စနစ်)' : 'Offline AI Model (GitHub Repo Source)'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  Qwen 2.5 0.5B
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {language === 'my'
                  ? 'အင်တာနက်လုံးဝမလိုသော Small GGUF Model ကို မိမိကိုယ်ပိုင် GitHub Repo URL မှ တိုက်ရိုက် ဆွဲတင်ပြီး အသုံးပြုနိုင်ပါသည်။'
                  : 'Install lightweight GGUF models directly from your GitHub Releases repository for zero-net offline inference.'}
              </p>
            </div>
          </div>

          {onOpenOfflineModelManager && (
            <button
              type="button"
              onClick={onOpenOfflineModelManager}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-950/40 flex items-center justify-center gap-1.5 font-mono shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'my' ? 'Model စီမံ/ဒေါင်းလုဒ်' : 'Manage & Download'}</span>
            </button>
          )}
        </div>
      </div>

      {/* API Key Storage Notice */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-slate-200">
              {language === 'my' ? 'လုံခြုံစိတ်ချရသော API Key ထိန်းသိမ်းမှု စနစ် (Zero-Trust)' : 'Zero-Trust Key Management Architecture'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'my'
                ? 'Gemini API Key ကို Browser ဘက်သို့ လုံးဝမရောက်စေဘဲ Server-Side Environment (GEMINI_API_KEY) ထဲတွင် လုံခြုံစွာထားရှိထားပါသည်။ Client သည် /api/gemini/* လမ်းကြောင်းမှသာ ဆက်သွယ်သည်။'
                : 'In accordance with secure full-stack standards, your Gemini API credentials are injected server-side via environment secrets (GEMINI_API_KEY). The browser connects exclusively through protected /api/gemini/* proxies.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">
              Secret Status
            </div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {language === 'my' ? 'Injected via Secrets' : 'Injected via Secrets'}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">
              Active Model
            </div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 font-mono">
              <Cpu className="w-4 h-4 text-emerald-500" />
              gemini-3.8-flash
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">
              Endpoint Handler
            </div>
            <div className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <Server className="w-4 h-4 text-slate-400" />
              Express Proxy /api
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Output */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            testResult.success
              ? 'bg-[#0f121d] border-emerald-500/40 text-emerald-200'
              : 'bg-[#0f121d] border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {testResult.success 
                    ? (language === 'my' ? 'Gemini AI ချိတ်ဆက်မှု စစ်ဆေးခြင်း အောင်မြင်ပါသည်' : 'Connection Test Passed')
                    : (language === 'my' ? 'ချိတ်ဆက်မှု စစ်ဆေးခြင်း မအောင်မြင်ပါ' : 'Connection Test Failed')}
                  {testResult.latencyMs !== undefined && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
                
                {/* Styled Response Message */}
                <div className="text-xs pt-1 font-mono leading-relaxed">
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] font-semibold text-sm">
                    {testResult.message || testResult.error}
                  </div>
                  {testResult.success && language === 'my' && (
                    <div className="text-slate-300 text-[11px] pt-1 font-sans">
                      ↳ တုံ့ပြန်မှု: Gemini AI ဆာဗာနှင့် လုံခြုံစွာ ချိတ်ဆက်ပြီးဖြစ်၍ အသွားအလာခွဲခြမ်းစိတ်ဖြာမှု စတင်နိုင်ပါပြီ။
                    </div>
                  )}
                </div>

                {testResult.timestamp && (
                  <div className="text-[11px] text-slate-400 pt-1 font-mono">
                    {language === 'my' ? 'စစ်ဆေးခဲ့သည့် အချိန်:' : 'Verified at:'} {new Date(testResult.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Checks checklist */}
          {testResult.success && (
            <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Server Proxy</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Model (3.8 Flash)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON Modality</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agent Ready</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Secret Configuration Help Box */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-slate-300 font-medium">
            {language === 'my' ? 'Gemini API Key ကို ပြင်ဆင်ထည့်သွင်းရန်:' : 'To update or configure your Gemini API Key:'}
          </span>
          <p>
            {language === 'my'
              ? 'Google AI Studio ဘေးဘက်ရှိ Settings > Secrets သို့ သွားရောက်ပြီး GEMINI_API_KEY တန်ဖိုးကို ထည့်သွင်းပေးပါ။ ထို့နောက် ဤနေရာတွင် "ချိတ်ဆက်မှု စစ်ဆေးမည်" ကို နှိပ်၍ စမ်းသပ်ပါ။'
              : 'Open the Settings > Secrets panel in the Google AI Studio sidebar and verify that the GEMINI_API_KEY variable is present. Changes take effect on subsequent test queries.'}
          </p>
        </div>
      </div>
    </div>
  );
};
