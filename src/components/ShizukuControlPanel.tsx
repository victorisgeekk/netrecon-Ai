import React, { useState } from 'react';
import { 
  Radio, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  Smartphone,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2
} from 'lucide-react';
import { GradientTerminalBox } from './GradientTerminalBox';

interface ShizukuControlPanelProps {
  language?: 'my' | 'en';
  onResetComplete?: (newIp: string) => void;
}

export const ShizukuControlPanel: React.FC<ShizukuControlPanelProps> = ({ 
  language = 'my',
  onResetComplete 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'control' | 'guide'>('control');
  const [selectedGuideStep, setSelectedGuideStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [cellularIp, setCellularIp] = useState('10.142.88.24');
  const [logs, setLogs] = useState<Array<{ text: string; burmese: string }>>([
    {
      text: '[shizuku-daemon] Service registered via ShizukuProvider authority.',
      burmese: 'Shizuku daemon service ချိတ်ဆက်မှု အောင်မြင်ပါသည်။'
    },
    {
      text: '[shizuku-ipc] Ping binder succeeded. Privileged API v13.1 ready.',
      burmese: 'Root မလိုဘဲ privileged shell access ရရှိထားသည်။'
    },
    {
      text: '[telephony-mgr] Interface rmnet_data0 active on carrier band.',
      burmese: 'Cellular network (rmnet_data0) active ဖြစ်နေသည်။'
    }
  ]);

  const addLog = (text: string, burmese: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs((prev) => [...prev.slice(-12), { text: `[${timestamp}] ${text}`, burmese }]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExecuteReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    addLog(
      'Initiating network reset sequence via Shizuku binder...',
      'Shizuku binder ဖြင့် network reset စတင်နေပါသည်...'
    );

    // Step 1: Enable Airplane Mode
    setCurrentStep(
      language === 'my'
        ? 'Airplane mode ကို ON နေပါသည် (cmd connectivity airplane-mode enable)...'
        : 'Enabling Airplane Mode (cmd connectivity airplane-mode enable)...'
    );
    await new Promise((r) => setTimeout(r, 700));
    addLog(
      'Executing: cmd connectivity airplane-mode enable',
      'Airplane mode ON: Cellular data interface ဖြတ်တောက်ပြီး။'
    );

    // Step 2: 3-second delay
    for (let c = 3; c > 0; c--) {
      setCountdown(c);
      setCurrentStep(
        language === 'my'
          ? `Radio detachment cooldown စောင့်ဆိုင်းနေပါသည် (${c}s)...`
          : `Holding radio detachment (${c}s cooldown)...`
      );
      await new Promise((r) => setTimeout(r, 1000));
      addLog(`Detachment timer: ${c}s remaining...`, `IP အသစ် ရယူရန် cooldown စောင့်ဆိုင်းချိန် ${c}s...`);
    }

    // Step 3: Disable Airplane Mode
    setCurrentStep(
      language === 'my'
        ? 'Airplane mode ကို OFF နေပါသည် (cmd connectivity airplane-mode disable)...'
        : 'Disabling Airplane Mode (cmd connectivity airplane-mode disable)...'
    );
    await new Promise((r) => setTimeout(r, 700));
    addLog(
      'Executing: cmd connectivity airplane-mode disable',
      'Airplane mode OFF: Cell tower နှင့် reconnect ပြန်လည်လုပ်ဆောင်နေသည်။'
    );

    // Step 4: Re-acquire fresh IP
    await new Promise((r) => setTimeout(r, 900));
    const randomOctet3 = 50 + Math.floor(Math.random() * 150);
    const randomOctet4 = 2 + Math.floor(Math.random() * 250);
    const newAssignedIp = `10.${randomOctet3}.99.${randomOctet4}`;
    setCellularIp(newAssignedIp);
    addLog(
      `Carrier PDP context re-established. New interface IP: ${newAssignedIp}`,
      `Carrier PDP context ပြန်လည်ရရှိ: Dynamic IP အသစ် (${newAssignedIp})။`
    );

    setCurrentStep(null);
    setIsResetting(false);
    if (onResetComplete) {
      onResetComplete(newAssignedIp);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base">
                Shizuku Privileged Radio Manager
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Binder Alive
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'my' 
                ? 'Root မလိုဘဲ ADB Shell ခွင့်ပြုချက်ဖြင့် Airplane mode ကို toggle လုပ်ပြီး IP အသစ် ရယူခြင်း'
                : 'Zero-root system privileges for toggling radio interfaces & cycling network allocations'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Control vs Setup Guide */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('control')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'control'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Radio Controller' : 'Live Controller'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'guide'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Setup Guide (ချိတ်ဆက်ပုံ)' : 'Setup & Integration Guide'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'control' && (
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex-wrap gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-300 font-semibold font-mono">
                {language === 'my' ? 'Dynamic IP Reset လုပ်ဆောင်ချက်' : 'Carrier Dynamic IP Rotation'}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'my' 
                  ? 'Shizuku shell မှတဆင့် Airplane mode ကို 3 စက္ကန့် ဖွင့်/ပိတ် လုပ်ကာ ISP Carrier IP အသစ် တောင်းယူမည်။'
                  : 'Executes privileged shell intent to cycle cellular baseband for fresh carrier allocation.'}
              </p>
            </div>

            <button
              onClick={handleExecuteReset}
              disabled={isResetting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all shadow-md active:scale-98 ${
                isResetting
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40'
              }`}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{`Resetting (${countdown}s)...`}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Reset Radio (Airplane Mode Toggle)</span>
                </>
              )}
            </button>
          </div>

          {/* Interface Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                IPC Permission
              </div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 font-mono">
                <ShieldCheck className="w-4 h-4" />
                API_V23 (Granted)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                Radio State
              </div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-1 font-mono">
                {isResetting ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Cycling (Airplane Mode ON)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Cellular Online
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                Carrier IP (rmnet_data0)
              </div>
              <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 mt-1 font-mono">
                <Wifi className="w-4 h-4 text-cyan-400" />
                {cellularIp}
              </div>
            </div>
          </div>

          {/* Progress Notification */}
          {currentStep && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
              <span>{currentStep}</span>
            </div>
          )}

          {/* Gradient CLI Terminal (Styled identically to the user's screenshot) */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'my' ? 'Shizuku စနစ်ထိန်းချုပ်မှု လုပ်ဆောင်ချက် ကွန်ဆိုးလ်' : 'Shizuku Execution Console'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">cmd connectivity airplane-mode</span>
            </div>

            <GradientTerminalBox
              branchName="main"
              statusNumbers="1   0   0   0"
              commandText="To resume this session: gemini"
              actionSubtitle="--resume"
              outputDetails="4bfa3399-ceee-4ece-abe2-517a29fd9d6d"
              burmeseExplanation="ဤ session ကို ပြန်လည်ဆက်လက်လုပ်ဆောင်ရန် အထက်ပါ gemini --resume command နှင့် ID ကို အသုံးပြုနိုင်ပါသည်။"
            />
          </div>

          {/* Shell Log Records with Burmese Translations */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
              {language === 'my' ? 'အသေးစိတ် စနစ်စစ်ဆေးမှု မှတ်တမ်းများ (Live Debug Logs)' : 'Detailed Execution Logs'}
            </div>
            <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] font-mono text-xs max-h-52 overflow-y-auto space-y-2 divide-y divide-[#23293e]/50">
              {logs.map((log, idx) => (
                <div key={`shizuku-log-entry-${idx}-${log.text.slice(0, 15)}`} className="pt-2 first:pt-0 space-y-0.5">
                  <div className="text-slate-300 text-[11px]">
                    {log.text.includes('succeeded') || log.text.includes('re-established') ? (
                      <span className="text-emerald-400">{log.text}</span>
                    ) : log.text.includes('Executing') || log.text.includes('Initiating') ? (
                      <span className="text-[#4ea8de] font-semibold">{log.text}</span>
                    ) : (
                      <span>{log.text}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#f472b6] font-sans">
                    ↳ {log.burmese}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Bilingual Setup & Integration Guide */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          {/* Guide Steps Navigation Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {[
              { id: 1, titleEn: '1. Shizuku Service Pairing', titleMy: '၁။ Shizuku ဝန်ဆောင်မှု Pairing', icon: Smartphone },
              { id: 2, titleEn: '2. Manifest & Permissions', titleMy: '၂။ Manifest ခွင့်ပြုချက်များ', icon: ShieldCheck },
              { id: 3, titleEn: '3. VpnService & Xray-Core', titleMy: '၃။ VpnService & Xray ချိတ်ဆက်ပုံ', icon: Layers },
              { id: 4, titleEn: '4. Gemini Agent Recovery', titleMy: '၄။ Gemini Agent & Reset စနစ်', icon: Sparkles }
            ].map((step) => {
              const Icon = step.icon;
              const isSelected = selectedGuideStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedGuideStep(step.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#4ea8de]' : 'text-slate-500'}`} />
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Step {step.id}</span>
                  </div>
                  <div className="font-semibold text-xs leading-tight">
                    {language === 'my' ? step.titleMy : step.titleEn}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step 1: Shizuku Service Pairing (Wireless Debugging & ADB) */}
          {selectedGuideStep === 1 && (
            <div className="p-5 rounded-2xl bg-[#0f121d] border border-[#23293e] space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#23293e] pb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] to-[#a855f7] font-semibold text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#4ea8de]" />
                  Step 1: Shizuku Service Setup (Zero-Root Pairing)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-[#4ea8de] border border-cyan-800/40">
                  Android 11+ Recommended
                </span>
              </div>

              <div className="text-slate-300 font-sans space-y-2 text-xs leading-relaxed">
                <p>
                  {language === 'my'
                    ? 'Shizuku သည် Root access မလိုဘဲ ADB (Android Debug Bridge) shell အဆင့်မြင့် ခွင့်ပြုချက်ကို Binder IPC ဖြင့် third-party app များသို့ မျှဝေပေးသော စနစ်ဖြစ်ပါသည်။'
                    : 'Shizuku allows ordinary applications to directly invoke privileged ADB shell APIs via Binder IPC without requiring device root.'}
                </p>
              </div>

              {/* Method A: Wireless Debugging */}
              <div className="p-3.5 rounded-xl bg-[#141827] border border-[#23293e] space-y-2">
                <div className="text-xs font-semibold text-[#4ea8de]">
                  {language === 'my' ? 'နည်းလမ်း (A) - ဖုန်းတွင်း Wireless Debugging ဖြင့် တိုက်ရိုက် စတင်နည်း (Android 11+)' : 'Method A: Wireless Debugging (On-device, Android 11+)'}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 font-sans text-xs">
                  <li>{language === 'my' ? 'ဖုန်း Settings > Developer options သို့ သွားပြီး Wireless debugging ကို ဖွင့်ပါ။' : 'Enable Developer Options > Wireless Debugging in Android Settings.'}</li>
                  <li>{language === 'my' ? 'Shizuku app ကို ဖွင့်ပြီး "Pairing" ကို နှိပ်ကာ 6-digit pairing code ကို ရိုက်ထည့်ပါ။' : 'Open Shizuku app, tap "Pairing", and enter the 6-digit code shown in Wireless Debugging.'}</li>
                  <li>{language === 'my' ? 'Pairing ပြီးပါက Shizuku app တွင် "Start" ကို နှိပ်လိုက်သည်နှင့် Service အသင့် ဖြစ်သွားပါမည်။' : 'Tap "Start" in Shizuku. The service will report "Shizuku is running (API v13.1)".'}</li>
                </ol>
              </div>

              {/* Method B: Computer ADB */}
              <div className="p-3.5 rounded-xl bg-[#141827] border border-[#23293e] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#c084fc]">
                    {language === 'my' ? 'နည်းလမ်း (B) - ကွန်ပျူတာ USB ADB ဖြင့် စတင်နည်း (Android 8 - 14)' : 'Method B: Computer USB ADB Shell'}
                  </div>
                  <button
                    onClick={() => copyToClipboard('adb shell sh /sdcard/Android/data/moe.shizuku.privileged.api/start.sh', 'adb-cmd')}
                    className="flex items-center gap-1 text-[11px] text-[#4ea8de] hover:text-cyan-300"
                  >
                    {copiedCode === 'adb-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'adb-cmd' ? 'Copied' : 'Copy ADB'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a0d16] border border-[#23293e] text-[11px] text-slate-300 font-mono select-all">
                  adb shell sh /sdcard/Android/data/moe.shizuku.privileged.api/start.sh
                </div>
              </div>

              {/* Authorize Step */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-sans text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{language === 'my' ? 'App အား ခွင့်ပြုချက် ပေးရန်:' : 'Grant Authorization:'} </span>
                  {language === 'my'
                    ? 'Shizuku app ၏ "Authorized Applications" စာရင်းထဲတွင် မိမိတို့ NetRecon app အား toggle ဖွင့်ပေးရပါမည်။'
                    : 'Open Shizuku app > "Authorized Applications" and toggle ON permission for your NetRecon package.'}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: AndroidManifest & Permissions Setup */}
          {selectedGuideStep === 2 && (
            <div className="p-5 rounded-2xl bg-[#0f121d] border border-[#23293e] space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#23293e] pb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#fb7185] font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#a855f7]" />
                  Step 2: AndroidManifest.xml & Build Setup
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-[#c084fc] border border-purple-800/40">
                  Gradle + Manifest
                </span>
              </div>

              {/* Gradle dependency */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>1. App-Level build.gradle.kts Dependencies:</span>
                  <button
                    onClick={() => copyToClipboard('implementation("dev.rikka.shizuku:api:13.1.5")\nimplementation("dev.rikka.shizuku:provider:13.1.5")', 'gradle-deps')}
                    className="flex items-center gap-1 text-[11px] text-[#4ea8de] hover:text-cyan-300"
                  >
                    {copiedCode === 'gradle-deps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'gradle-deps' ? 'Copied' : 'Copy Gradle'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#0a0d16] border border-[#23293e] text-[11px] text-indigo-300 font-mono overflow-x-auto leading-relaxed">
{`dependencies {
    // Shizuku Core API & Binder Provider
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")
}`}
                </pre>
              </div>

              {/* Manifest XML */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>2. AndroidManifest.xml Queries & Permissions:</span>
                  <button
                    onClick={() => copyToClipboard(`<queries>\n    <package android:name="moe.shizuku.privileged.api" />\n</queries>\n<uses-permission android:name="moe.shizuku.manager.permission.API_V23" />`, 'manifest-xml')}
                    className="flex items-center gap-1 text-[11px] text-[#4ea8de] hover:text-cyan-300"
                  >
                    {copiedCode === 'manifest-xml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'manifest-xml' ? 'Copied' : 'Copy XML'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#0a0d16] border border-[#23293e] text-[11px] text-cyan-300 font-mono overflow-x-auto leading-relaxed">
{`<!-- Android 11+ Package Visibility (Queries) -->
<queries>
    <package android:name="moe.shizuku.privileged.api" />
</queries>

<!-- Shizuku Privileged IPC Permission -->
<uses-permission android:name="moe.shizuku.manager.permission.API_V23" />`}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 font-sans text-xs">
                <span className="text-[#fb7185] font-semibold">သတိပြုရန် (Android 11+ Visibility):</span>{' '}
                {language === 'my'
                  ? '<queries> ထဲတွင် Shizuku package name မထည့်ထားပါက Android 11+ စနစ်များတွင် Binder resolution မရရှိဘဲ dead binder ဖြစ်သွားနိုင်ပါသည်။'
                  : 'Without the <queries> entry, Android 11+ package visibility filters will block binding to the privileged Shizuku provider.'}
              </div>
            </div>
          )}

          {/* Step 3: VpnService & Xray-Core Connection Setup */}
          {selectedGuideStep === 3 && (
            <div className="p-5 rounded-2xl bg-[#0f121d] border border-[#23293e] space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#23293e] pb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] font-semibold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4ea8de]" />
                  Step 3: VpnService & Xray-Core Handshake
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-[#4ea8de] border border-cyan-800/40">
                  TUN + Core Socket
                </span>
              </div>

              <div className="text-slate-300 font-sans space-y-2 text-xs leading-relaxed">
                <p>
                  {language === 'my'
                    ? 'Android VpnService ဖြင့် virtual TUN interface တည်ဆောက်ပြီး ရရှိလာသော FileDescriptor (socket) ကို Xray-core သို့ ပေးပို့ကာ TCP/UDP payload များကို ဖြတ်သန်းစေခြင်း ဖြစ်သည်။'
                    : 'The Android VpnService establishes a local TUN interface and passes its raw FileDescriptor to the embedded Go Xray-core daemon.'}
                </p>
              </div>

              {/* Code snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Kotlin VpnService.Builder & Handshake:</span>
                  <button
                    onClick={() => copyToClipboard(`val vpnInterface = Builder()\n    .setSession("NetRecon")\n    .addAddress("10.0.0.2", 24)\n    .addDnsServer("1.1.1.1")\n    .addRoute("0.0.0.0", 0)\n    .addDisallowedApplication(packageName)\n    .establish()`, 'vpn-builder')}
                    className="flex items-center gap-1 text-[11px] text-[#4ea8de] hover:text-cyan-300"
                  >
                    {copiedCode === 'vpn-builder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'vpn-builder' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#0a0d16] border border-[#23293e] text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
{`val vpnInterface = Builder()
    .setSession("NetRecon")
    .addAddress("10.0.0.2", 24)
    .addDnsServer("1.1.1.1")
    .addRoute("0.0.0.0", 0)
    // CRITICAL: Prevent self-routing loops for Gemini API & Shizuku
    .addDisallowedApplication(packageName)
    .establish()`}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-[#141827] border border-[#23293e] text-slate-300 font-sans text-xs space-y-1">
                <div className="font-semibold text-[#4ea8de]">Xray-core Native Binary Placement:</div>
                <p>
                  {language === 'my'
                    ? 'Go ဖြင့် compile လုပ်ထားသော libxray.so သို့မဟုတ် libv2ray.so ကို `app/src/main/jniLibs/arm64-v8a/` တွင် ထည့်သွင်းထားရပါမည်။ VpnService သည် ၎င်း socket FD ကို native thread သို့ ပို့ပေးပါသည်။'
                    : 'Compiled Go binaries (libxray.so) reside in jniLibs/arm64-v8a/. The VpnService passes the TUN fd via JNI to start tun2socks routing.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Gemini AI Agent & Radio Reset Fallback Setup */}
          {selectedGuideStep === 4 && (
            <div className="p-5 rounded-2xl bg-[#0f121d] border border-[#23293e] space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#23293e] pb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#a855f7] to-[#34d399] font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#34d399]" />
                  Step 4: Gemini Agent & Radio Reset Failover Loop
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800/40">
                  AI + Shizuku Recovery
                </span>
              </div>

              <div className="text-slate-300 font-sans space-y-2 text-xs leading-relaxed">
                <p>
                  {language === 'my'
                    ? 'Gemini 3.8 AI က SNI စာရင်းကို စစ်ဆေး၍ split-tunneling JSON ထုတ်ပေးပြီး၊ ချိတ်ဆက်မှု မအောင်မြင်ပါက ShizukuNetworkManager.resetNetwork() ဖြင့် Airplane mode ကို toggle လုပ်ကာ radio state ပြန်စတင်ခြင်း ဖြစ်သည်။'
                    : 'If routing generation or ping verification fails, AINetworkAgent catches the exception and immediately invokes ShizukuNetworkManager.resetNetwork() for radio recovery.'}
                </p>
              </div>

              {/* Recovery loop snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>AINetworkAgent.kt Recovery Handshake:</span>
                  <button
                    onClick={() => copyToClipboard(`if (!verifyRoutingSuccess(routingConfig)) {\n    // Trigger Shizuku radio toggle recovery\n    ShizukuNetworkManager.resetNetwork()\n}`, 'recovery-code')}
                    className="flex items-center gap-1 text-[11px] text-[#4ea8de] hover:text-cyan-300"
                  >
                    {copiedCode === 'recovery-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'recovery-code' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#0a0d16] border border-[#23293e] text-[11px] text-pink-300 font-mono overflow-x-auto leading-relaxed">
{`try {
    val routingConfig = geminiAgent.analyzeTraffic(capturedSnis)
    applyXrayRouting(routingConfig)
} catch (e: Exception) {
    Log.e("NetRecon", "Routing failed; triggering Shizuku radio reset...", e)
    // Invokes privileged 'cmd connectivity airplane-mode enable -> 3s -> disable'
    shizukuManager.resetNetwork()
}`}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 font-sans text-xs">
                <span className="text-[#34d399] font-semibold">Zero-Trust Key Security:</span>{' '}
                {language === 'my'
                  ? 'Gemini API Key ကို client APK ထဲတွင် hardcode မထည့်ဘဲ BuildConfig.GEMINI_API_KEY (သို့မဟုတ် ဆာဗာ proxy /api/gemini/analyze) မှတဆင့်သာ ခေါ်ယူရပါမည်။'
                  : 'Ensure GEMINI_API_KEY is securely supplied via BuildConfig or your proxy endpoint (/api/gemini/analyze) without exposing raw keys.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
