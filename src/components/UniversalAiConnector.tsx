import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Cpu, 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Server, 
  Sliders, 
  Check, 
  Copy,
  Zap,
  Radio
} from 'lucide-react';

interface UniversalAiConnectorProps {
  language?: 'my' | 'en';
  onModelChange?: (model: string, apiKey?: string) => void;
}

export interface UniversalModelConfig {
  modelName: string;
  provider: 'gemini' | 'openai-compatible' | 'custom-rest' | 'local-ollama';
  apiEndpoint: string;
  apiKey: string;
}

export const UniversalAiConnector: React.FC<UniversalAiConnectorProps> = ({
  language = 'my',
  onModelChange,
}) => {
  // Load saved config or default to gemini-3.8-flash
  const [modelConfig, setModelConfig] = useState<UniversalModelConfig>(() => {
    const saved = localStorage.getItem('netrecon_universal_ai_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      modelName: 'gemini-3.8-flash',
      provider: 'gemini',
      apiEndpoint: '/api/gemini/analyze',
      apiKey: '',
    };
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
    model?: string;
  } | null>(null);

  // Sync to parent on mount
  useEffect(() => {
    if (onModelChange) {
      onModelChange(modelConfig.modelName, modelConfig.apiKey || undefined);
    }
  }, []);

  const PRESET_MODELS = [
    { name: 'gemini-3.8-flash', provider: 'gemini' as const, label: 'Gemini 3.8 Flash (Active)' },
    { name: 'gemini-2.5-pro', provider: 'gemini' as const, label: 'Gemini 2.5 Pro (Deep Reasoning)' },
    { name: 'gemini-1.5-flash', provider: 'gemini' as const, label: 'Gemini 1.5 Flash (Ultra Fast)' },
    { name: 'gpt-4o', provider: 'openai-compatible' as const, label: 'GPT-4o (OpenAI Proxy)' },
    { name: 'deepseek-r1', provider: 'custom-rest' as const, label: 'DeepSeek R1 (Custom Gateway)' },
  ];

  const handleSelectPreset = (preset: typeof PRESET_MODELS[0]) => {
    const updated: UniversalModelConfig = {
      ...modelConfig,
      modelName: preset.name,
      provider: preset.provider,
      apiEndpoint: preset.provider === 'gemini' ? '/api/gemini/analyze' : 'https://api.openai.com/v1',
    };
    setModelConfig(updated);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/universal-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: modelConfig.modelName.trim(),
          provider: modelConfig.provider,
          apiKey: modelConfig.apiKey.trim() || undefined,
          apiEndpoint: modelConfig.apiEndpoint.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection test failed');
      }

      setTestResult({
        success: true,
        latencyMs: data.latencyMs,
        message: data.message,
        model: data.model,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || (language === 'my' ? 'ချိတ်ဆက်မှု မအောင်မြင်ပါ' : 'Connection failed'),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleApplyConfig = () => {
    localStorage.setItem('netrecon_universal_ai_config', JSON.stringify(modelConfig));
    if (onModelChange) {
      onModelChange(modelConfig.modelName, modelConfig.apiKey || undefined);
    }
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-[#23293e] bg-[#0f121d] p-5 shadow-2xl space-y-4 font-sans text-slate-200">
      {/* Universal Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23293e] pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#4ea8de]/20 via-[#a855f7]/20 to-[#fb7185]/20 border border-[#4ea8de]/30 text-[#4ea8de]">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                {language === 'my' ? 'Universal AI Connector (စိတ်ကြိုက် AI ချိတ်ဆက်မှု)' : 'Universal AI Connector & Model Switcher'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Active Gateway
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'my'
                ? 'Model Name နှင့် API သတ်မှတ်ရုံဖြင့် မည်သည့် AI (Gemini, OpenAI, Claude, DeepSeek, Local) နှင့်မဆို ချိတ်ဆက်အသုံးပြုနိုင်သည်'
                : 'Connect any AI model by specifying Model Name + API Endpoint/Key. Supports Gemini, OpenAI protocol, or custom proxies.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#4ea8de] border border-slate-700 text-xs font-mono disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? (language === 'my' ? 'စစ်ဆေးနေ...' : 'Testing...') : (language === 'my' ? 'Test Connection' : 'Test Connection')}</span>
          </button>

          <button
            type="button"
            onClick={handleApplyConfig}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-md shadow-indigo-950/50 transition-all active:scale-98"
          >
            {applied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{applied ? (language === 'my' ? 'သတ်မှတ်ပြီး' : 'Applied!') : (language === 'my' ? 'Apply Model' : 'Apply Model')}</span>
          </button>
        </div>
      </div>

      {/* Preset Model Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>{language === 'my' ? 'လူသုံးများသော Model များ (Quick Presets):' : 'Quick Model Presets:'}</span>
          <span className="text-[10px] text-slate-500 font-mono">Click to autofill</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MODELS.map((preset) => {
            const isSelected = modelConfig.modelName === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#4ea8de]/30 to-[#a855f7]/30 text-white border border-[#4ea8de]/60 font-semibold shadow-sm'
                    : 'bg-[#141827] text-slate-300 border border-[#23293e] hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Responsive Config Form (Medium Size) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs font-mono">
        {/* Model Name Input */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-[#4ea8de]" />
              Model Name:
            </span>
            <span className="text-[10px] text-[#4ea8de]">Required</span>
          </label>
          <input
            type="text"
            value={modelConfig.modelName}
            onChange={(e) => setModelConfig({ ...modelConfig, modelName: e.target.value })}
            placeholder="e.g. gemini-3.8-flash, gpt-4o, claude-3-5-sonnet"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#4ea8de]"
          />
        </div>

        {/* Provider Protocol Dropdown */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium flex items-center gap-1.5 text-slate-300">
            <Server className="w-3.5 h-3.5 text-[#c084fc]" />
            Provider / Protocol Format:
          </label>
          <select
            value={modelConfig.provider}
            onChange={(e) => setModelConfig({ ...modelConfig, provider: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-[#c084fc]"
          >
            <option value="gemini">Google Gemini SDK (Direct / Server Proxy)</option>
            <option value="openai-compatible">OpenAI-Compatible REST Gateway</option>
            <option value="custom-rest">Custom API Proxy Endpoint</option>
            <option value="local-ollama">Local Host (Ollama / vLLM / llama.cpp)</option>
          </select>
        </div>

        {/* API Endpoint / Proxy Base URL */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium flex items-center gap-1.5 text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-[#fb7185]" />
            API Base Endpoint:
          </label>
          <input
            type="text"
            value={modelConfig.apiEndpoint}
            onChange={(e) => setModelConfig({ ...modelConfig, apiEndpoint: e.target.value })}
            placeholder="e.g. /api/gemini/analyze or https://api.openai.com/v1"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#fb7185]"
          />
        </div>

        {/* Custom API Key Input with Eye Toggle */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              API Key (Optional):
            </span>
            <span className="text-[10px] text-slate-500">
              {modelConfig.apiKey ? 'Custom Key' : 'Default: Server Secret'}
            </span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={modelConfig.apiKey}
              onChange={(e) => setModelConfig({ ...modelConfig, apiKey: e.target.value })}
              placeholder={language === 'my' ? 'မထည့်ပါက Server Secret (GEMINI_API_KEY) ကို သုံးမည်' : 'Leave empty to use secured server secret'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-9 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Test Connection Result Feedback */}
      {testResult && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono ${
            testResult.success
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {testResult.success 
                  ? (language === 'my' ? 'Universal Connection ချိတ်ဆက်မှု အောင်မြင်သည်' : 'Universal Connection Verified') 
                  : (language === 'my' ? 'ချိတ်ဆက်မှု မအောင်မြင်ပါ' : 'Connection Failed')}
              </span>
              {testResult.latencyMs !== undefined && (
                <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-emerald-300 border border-emerald-700/50">
                  {testResult.latencyMs} ms
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">{testResult.message || testResult.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
