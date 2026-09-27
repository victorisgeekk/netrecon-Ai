import React, { useState } from 'react';
import { 
  Zap, 
  Lightbulb, 
  Radio, 
  Copy, 
  Check, 
  ChevronRight, 
  X, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface FlashlightNotificationProps {
  language?: 'my' | 'en';
  tips: string[];
  onTriggerRadioReset?: () => void;
  onCopyConfig?: () => void;
}

export const FlashlightNotification: React.FC<FlashlightNotificationProps> = ({
  language = 'my',
  tips,
  onTriggerRadioReset,
  onCopyConfig,
}) => {
  const [isStrobeActive, setIsStrobeActive] = useState(true);
  const [copiedTipIndex, setCopiedTipIndex] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !tips || tips.length === 0) return null;

  const handleCopyTip = (tip: string, index: number) => {
    navigator.clipboard.writeText(tip);
    setCopiedTipIndex(index);
    setTimeout(() => setCopiedTipIndex(null), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#121829] via-[#101426] to-[#1c1429] p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.2)] transition-all duration-300">
      {/* Radiant Flashlight Beam Effect */}
      <div 
        className={`absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/30 via-cyan-400/20 to-transparent blur-2xl pointer-events-none transition-opacity duration-700 ${
          isStrobeActive ? 'opacity-100 animate-pulse' : 'opacity-40'
        }`}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header bar with Flashlight Beacon Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
        <div className="flex items-center space-x-2.5">
          {/* Pulsing Flashlight Bulb Icon */}
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping opacity-75"></span>
            <div className="relative p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
                {language === 'my' ? 'Flashlight Tips (AI အကြံပြုချက်များ)' : 'Flashlight Tips • AI Next Steps'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                Actionable ({tips.length})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {language === 'my'
                ? 'AI စစ်ဆေးမှုအပြီး ရှေ့ဆက်ဆောင်ရွက်ရမည့် အဆင့်များနှင့် သတိပြုရန် အချက်များ'
                : 'Prioritized recommendations and critical failover checks from Gemini AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Strobe Toggle button */}
          <button
            type="button"
            onClick={() => setIsStrobeActive(!isStrobeActive)}
            title="Toggle Flash Beam / Strobe"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors flex items-center gap-1 ${
              isStrobeActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{isStrobeActive ? 'Beam: ON' : 'Beam: OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            title="Dismiss Tips"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actionable Tips List styled like notification badges */}
      <div className="relative z-10 mt-3 space-y-2.5">
        {tips.map((tip, idx) => {
          const isRadioResetTip = tip.toLowerCase().includes('airplane') || tip.toLowerCase().includes('shizuku') || tip.toLowerCase().includes('radio');
          const isConfigTip = tip.toLowerCase().includes('json') || tip.toLowerCase().includes('xray') || tip.toLowerCase().includes('export');

          return (
            <div
              key={`flashlight-tip-${idx}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-[#262c42] hover:border-amber-500/40 transition-all text-xs font-mono"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 font-bold shrink-0 mt-0.5 text-[11px] border border-amber-500/20">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-sans leading-relaxed text-xs">
                    {tip}
                  </div>
                  {/* Subtle English technical tag reminder */}
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span>Target:</span>
                    <span className="text-[#4ea8de]">
                      {isRadioResetTip ? 'Airplane Mode / Shizuku Radio State' : isConfigTip ? 'Xray-core JSON Routing' : 'Network Diagnostics / TLS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for the Tip */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {isRadioResetTip && onTriggerRadioReset && (
                  <button
                    type="button"
                    onClick={onTriggerRadioReset}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono transition-colors"
                  >
                    <Radio className="w-3 h-3 text-indigo-400" />
                    <span>Reset Radio</span>
                  </button>
                )}

                {isConfigTip && onCopyConfig && (
                  <button
                    type="button"
                    onClick={onCopyConfig}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono transition-colors"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copy Config</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyTip(tip, idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-mono transition-colors"
                >
                  {copiedTipIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">{language === 'my' ? 'ကူးပြီး' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>{language === 'my' ? 'Copy Tip' : 'Copy Tip'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
