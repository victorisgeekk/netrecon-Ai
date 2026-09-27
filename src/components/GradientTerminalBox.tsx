import React from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface GradientTerminalBoxProps {
  branchName?: string;
  statusNumbers?: string;
  commandText?: string;
  actionSubtitle?: string;
  outputDetails?: string;
  burmeseExplanation?: string;
  copyValue?: string;
}

export const GradientTerminalBox: React.FC<GradientTerminalBoxProps> = ({
  branchName = 'main',
  statusNumbers = '1   0   0   0',
  commandText = 'To resume this session: gemini',
  actionSubtitle = '--resume',
  outputDetails = '4bfa3399-ceee-4ece-abe2-517a29fd9d6d',
  burmeseExplanation,
  copyValue,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = copyValue || `${commandText} ${actionSubtitle} ${outputDetails}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#23293e] bg-[#0f121d] shadow-2xl font-mono text-xs text-slate-300">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2 bg-[#141827] border-b border-[#23293e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]/70"></div>
          <span className="text-[11px] text-[#8f96b0] ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#4ea8de]" />
            CLI / Debug Terminal (အပြန်အလှန်တုံ့ပြန်မှု ကွန်ဆိုးလ်)
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#8f96b0] hover:text-[#4ea8de] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'ကူးယူပြီး' : 'Copy Session'}</span>
        </button>
      </div>

      {/* Terminal Content styled exactly like the screenshot */}
      <div className="p-4 sm:p-5 space-y-2">
        {/* Branch / Status Line */}
        <div className="flex items-center space-x-6 text-[#9ba1b9] text-[13px] tracking-wide select-none">
          <span className="flex items-center gap-1.5 text-[#7e859b]">
            <span className="text-sm">↳</span>
            <span className="text-slate-300">{branchName}</span>
          </span>
          <span className="text-[#64748b] font-mono tracking-widest">{statusNumbers}</span>
        </div>

        {/* Gradient Text Lines - Matching Screenshot Colors: Blue (#4ea8de) -> Purple (#c084fc) -> Pink (#fb7185) */}
        <div className="text-[14px] sm:text-[15px] font-medium tracking-wide leading-relaxed">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#f472b6]">
            {commandText}
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#a855f7] to-[#fb7185]">
            {actionSubtitle}
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] break-all font-mono">
            {outputDetails}
          </div>
        </div>

        {/* Burmese Context Explanation Note */}
        {burmeseExplanation && (
          <div className="mt-3 pt-3 border-t border-[#23293e]/70 flex items-start gap-2 text-[12px] text-slate-300 font-sans leading-relaxed">
            <span className="text-[#4ea8de] font-semibold font-mono">မြန်မာဘာသာပြန်ချက်:</span>
            <span className="text-slate-200">{burmeseExplanation}</span>
          </div>
        )}
      </div>
    </div>
  );
};
