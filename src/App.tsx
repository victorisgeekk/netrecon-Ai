import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  Radio, 
  Sparkles, 
  Shield, 
  Terminal, 
  Code2, 
  Layers, 
  CheckCircle2, 
  FileCode,
  Languages,
  Cpu,
  ShieldCheck,
  WifiOff,
  Wifi,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { SettingsPanel } from './components/SettingsPanel';
import { TrafficLogInspector } from './components/TrafficLogInspector';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ShizukuControlPanel } from './components/ShizukuControlPanel';
import { GradientTerminalBox } from './components/GradientTerminalBox';
import { FlashlightNotification } from './components/FlashlightNotification';
import { SelfHealingMaintenanceModal } from './components/SelfHealingMaintenanceModal';
import { OfflineModelManagerModal } from './components/OfflineModelManagerModal';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { loadLicenseState, LicenseState } from './utils/licenseSecurity';
import { INITIAL_PACKETS, MOCK_NEW_PACKETS_POOL } from './mock/samplePackets';
import { PacketLog, ConnectionTestResult, generatePacketId } from './types/traffic';
import { TRANSLATIONS, Language } from './types/translations';

export default function App() {
  const [language, setLanguage] = useState<Language>('my');
  const [activeTab, setActiveTab] = useState<'inspector' | 'settings' | 'shizuku' | 'code'>('inspector');
  const [packets, setPackets] = useState<PacketLog[]>(INITIAL_PACKETS);
  const [isCapturing, setIsCapturing] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [analysisSnis, setAnalysisSnis] = useState<string[]>([]);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isOfflineModelModalOpen, setIsOfflineModelModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [licenseState, setLicenseState] = useState<LicenseState>(() => loadLicenseState());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Network connection watchdog
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = TRANSLATIONS[language];

  // Background packet generator when capture is active
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const template = MOCK_NEW_PACKETS_POOL[Math.floor(Math.random() * MOCK_NEW_PACKETS_POOL.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      const newPacket: PacketLog = {
        id: generatePacketId(),
        timestamp: timeStr,
        sourceIP: '10.0.0.2',
        sourcePort: 45000 + Math.floor(Math.random() * 15000),
        destIP: template.ip,
        destPort: 443,
        protocol: 'TLS (TCP)',
        lengthBytes: 420 + Math.floor(Math.random() * 250),
        sni: template.sni,
        flags: ['PSH', 'ACK'],
        isTlsClientHello: true,
        category: template.category,
        rawHexSample: `16 03 03 01 e5 01 00 01 e1 ... 00 00 00 ${template.sni.length.toString(16)} 00 ${template.sni
          .split('')
          .map((c) => c.charCodeAt(0).toString(16))
          .join(' ')}`,
      };

      setPackets((prev) => {
        const unique = prev.filter((p) => p.id !== newPacket.id);
        return [newPacket, ...unique.slice(0, 75)];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isCapturing]);

  const handleTestSuccess = (result: ConnectionTestResult) => {
    setGeminiConnected(result.success);
  };

  const handleOpenAiAnalysis = (snis: string[]) => {
    setAnalysisSnis(snis);
    setIsAiModalOpen(true);
  };

  const handleAddManualPacket = (packet: PacketLog) => {
    setPackets((prev) => {
      const unique = prev.filter((p) => p.id !== packet.id);
      return [packet, ...unique];
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Offline Watchdog Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 px-3 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2 font-mono sticky top-0 z-50">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>
            {language === 'my'
              ? 'Network ပြတ်တောက်နေပါသည် (Offline) • AI Self-Healing Engine မှ Offline Heuristic ဖြင့် ဆက်လက်ထိန်းသိမ်းထားပါသည်'
              : 'Network Disconnected (Offline) • AI Self-Healing Engine operating in Offline Heuristic mode.'}
          </span>
        </div>
      )}

      {/* Top Header & Status Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4ea8de] via-[#a855f7] to-[#fb7185] flex items-center justify-center text-white shadow-lg shadow-purple-950/40 flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] truncate">
                  {t.appName}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                  v1.2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Subsystem Status & Language Toggle */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-xs font-mono flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{t.statusTun}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-300">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.statusShizuku}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{geminiConnected === true ? (language === 'my' ? 'Gemini: အတည်ပြုပြီး' : 'Gemini: Verified') : t.statusGemini}</span>
            </div>

            {/* AI Self-Healing & Maintenance Button */}
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 transition-colors text-xs font-mono font-medium"
              title="Daily Maintenance & Self-Healing Hub"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{language === 'my' ? 'Auto-Fix' : 'Self-Healing'}</span>
            </button>

            {/* Offline AI Model Downloader Button */}
            <button
              onClick={() => setIsOfflineModelModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 transition-colors text-xs font-mono font-medium"
              title="Offline AI Model Downloader (GitHub Repo)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{language === 'my' ? 'Offline AI' : 'Offline Model'}</span>
            </button>

            {/* License Activation / Status Button */}
            <button
              onClick={() => setIsLicenseModalOpen(true)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full border transition-colors text-xs font-mono font-medium ${
                licenseState.isActivated && !licenseState.isExpired
                  ? 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-500/50 text-purple-300'
                  : 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/60 text-amber-300'
              }`}
              title="License Status & Activation (1 Month 5000 Ks)"
            >
              {licenseState.isActivated && !licenseState.isExpired ? (
                <Unlock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              )}
              <span className="hidden xs:inline sm:inline">
                {licenseState.isActivated && !licenseState.isExpired
                  ? `PRO (${licenseState.daysRemaining}d)`
                  : (language === 'my' ? 'Activate (5,000Ks)' : 'Activate Key')}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'my' ? 'en' : 'my')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#141827] border border-[#23293e] hover:border-[#4ea8de] text-slate-200 transition-colors text-xs font-sans font-medium"
              title="ဘာသာစကားပြောင်းရန် / Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#4ea8de] flex-shrink-0" />
              <span>{language === 'my' ? '🇲🇲 မြန်မာ' : '🇺🇸 EN'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inspector'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.tabInspector}</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
              {packets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#a855f7] text-[#c084fc] bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.tabSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('shizuku')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'shizuku'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{t.tabShizuku}</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-[#fb7185] text-[#fb7185] bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{t.tabCode}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with Screenshot-Matching Gradient Styling */}
        <div className="space-y-2">
          <GradientTerminalBox
            branchName="main"
            statusNumbers="1   0   0   0"
            commandText="To resume this session: gemini"
            actionSubtitle="--resume"
            outputDetails="4bfa3399-ceee-4ece-abe2-517a29fd9d6d"
            burmeseExplanation="NetRecon သည် Android VpnService ဖြင့် packet များကို capture လုပ်ကာ TLS SNI ဖော်ထုတ်ခြင်း၊ Shizuku ဖြင့် Airplane mode (Radio reset) ပြုလုပ်ခြင်း နှင့် Gemini 3.8 AI ဖြင့် traffic routing ကို analyze လုပ်ခြင်း စနစ် ဖြစ်သည်။"
          />
        </div>

        {/* AI Flashlight Notification Style Tips */}
        <FlashlightNotification
          language={language}
          tips={[
            'VpnService TUN interface (10.0.0.2) is active: inspect captured packets and extract TLS ClientHello SNI.',
            'If packet connection stalls or latency spikes, execute Airplane mode toggle via Shizuku.',
            'Select captured SNIs to let Gemini AI synthesize split-tunneling direct and proxy routing rules.',
          ]}
          onTriggerRadioReset={() => setActiveTab('shizuku')}
          onCopyConfig={() => {
            const snis = Array.from(new Set(packets.map((p) => p.sni).filter((s): s is string => !!s)));
            handleOpenAiAnalysis(snis);
          }}
        />

        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <TrafficLogInspector
              language={language}
              packets={packets}
              isCapturing={isCapturing}
              onToggleCapture={() => setIsCapturing(!isCapturing)}
              onClearPackets={() => setPackets([])}
              onAddPacket={handleAddManualPacket}
              onAnalyzeWithAI={handleOpenAiAnalysis}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <SettingsPanel 
              language={language} 
              onTestSuccess={handleTestSuccess} 
              onOpenOfflineModelManager={() => setIsOfflineModelModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'shizuku' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <ShizukuControlPanel language={language} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-base">
                    {language === 'my' ? 'Android Kotlin ပရောဂျက် အစအဆုံး အသေးစိတ် အပိုင်းလိုက် စစ်ဆေးချက်' : 'Android Kotlin Architecture Breakdown'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'my' 
                      ? 'ဆော့ဖ်ဝဲ၏ အဓိက အစိတ်အပိုင်း ၅ ခုနှင့် လုပ်ဆောင်ချက် အဆင့်ဆင့်' 
                      : 'Comprehensive module analysis of VpnService, Shizuku, Gemini AI & GitHub Actions'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Burmese Technical Audit Cards with Screenshot Color Palette */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                {/* Section 1 */}
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] to-[#a855f7] font-semibold text-sm flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#4ea8de]" />
                      Part 1: VpnService Packet Capture
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-[#4ea8de] border border-cyan-800/40">
                      NetworkDiagnosticVpnService
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    Android standard <code className="text-[#4ea8de]">VpnService</code> API ဖြင့် local TUN interface (10.0.0.2) တည်ဆောက်ပြီး outbound TCP/UDP packet များကို background coroutine ဖြင့် capture လုပ်သည်။
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#23293e]/60 space-y-1">
                    <div>• <span className="text-slate-300 font-semibold">Permission:</span> <code className="text-[#c084fc]">android.permission.BIND_VPN_SERVICE</code></div>
                    <div>• <span className="text-slate-300 font-semibold">Response:</span> TUN Interface FileDescriptor ပွင့်ပြီး raw packet bytes များကို non-blocking ဖတ်ရှုသည်။</div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#fb7185] font-semibold text-sm flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#a855f7]" />
                      Part 2: TLS SNI Parser (RFC 6066)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-[#c084fc] border border-purple-800/40">
                      TlsSniParser.kt
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    IPv4 header နှင့် TCP data offset ကိုကျော်ပြီး TLS ClientHello record (0x16) မှ Extension 0x0000 ကိုဖတ်ကာ target host (SNI) ကို extract လုပ်သည်။
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#23293e]/60 space-y-1">
                    <div>• <span className="text-slate-300 font-semibold">Validation:</span> Bounds-checked ByteBuffer ဖြင့် malformed/fragmented packet error မဖြစ်အောင် ထိန်းထားသည်။</div>
                    <div>• <span className="text-slate-300 font-semibold">Output:</span> Extracted SNI hostname (ဥပမာ: <code className="text-[#fb7185]">api.telegram.org</code>)။</div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] via-[#c084fc] to-[#fb7185] font-semibold text-sm flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-[#fb7185]" />
                      Part 3: Shizuku Radio Manager
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-[#fb7185] border border-rose-800/40">
                      ShizukuNetworkManager.kt
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    Root မလိုဘဲ Shizuku privileged IPC binder ဖြင့် <code className="text-[#4ea8de]">cmd connectivity airplane-mode enable</code> ခေါ်ပြီး 3s cooldown ယူကာ disable ပြန်လုပ်ခြင်းဖြင့် carrier Dynamic IP အသစ် ရယူသည်။
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#23293e]/60 space-y-1">
                    <div>• <span className="text-slate-300 font-semibold">Permission:</span> <code className="text-[#c084fc]">moe.shizuku.manager.permission.API_V23</code></div>
                    <div>• <span className="text-slate-300 font-semibold">Response:</span> Carrier Dynamic IP အသစ် re-assign ရရှိပြီး interface ပြန်လည်ကောင်းမွန်သည်။</div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ea8de] to-[#34d399] font-semibold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#34d399]" />
                      Part 4: Gemini AI Traffic Analysis
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800/40">
                      AINetworkAgent.kt
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    ဖမ်းယူရရှိသော SNIs စာရင်းကို Google Generative AI SDK (Gemini 3.8 Flash) သို့ပေးပို့ပြီး domain categorization နှင့် split-tunneling JSON routing config ထုတ်ပေးသည်။
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#23293e]/60 space-y-1">
                    <div>• <span className="text-slate-300 font-semibold">Model:</span> <code className="text-[#34d399]">gemini-3.8-flash</code> (Server proxy မှ zero-exposure ခေါ်ယူသည်)</div>
                    <div>• <span className="text-slate-300 font-semibold">Output:</span> Direct vs Proxy classification နှင့် standard routing JSON template။</div>
                  </div>
                </div>

                {/* Section 5: GitHub Actions */}
                <div className="p-4 rounded-xl bg-[#0f121d] border border-[#23293e] space-y-2.5 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-[#23293e] pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] font-semibold text-sm flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#38bdf8]" />
                      Part 5: GitHub Actions CI/CD Release Build
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-[#38bdf8] border border-cyan-800/40">
                      .github/workflows/android.yml
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    <code className="text-[#38bdf8]">main</code> branch သို့ push ပြုလုပ်ချိန်တိုင်း JDK 17 environment တည်ဆောက်ပြီး <code className="text-[#c084fc]">./gradlew assembleRelease</code> ဖြင့် Release APK တည်ဆောက်ကာ GitHub Actions artifact အဖြစ် auto-upload လုပ်ပေးသည်။
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#23293e]/60 space-y-1">
                    <div>• <span className="text-slate-300 font-semibold">Artifact:</span> <code className="text-[#38bdf8]">app-release-apk</code> (GitHub Actions tab မှ တိုက်ရိုက် download ပြုလုပ်နိုင်သည်)</div>
                    <div>• <span className="text-slate-300 font-semibold">Trigger:</span> Push to <code className="text-slate-200">main</code> branch သို့မဟုတ် manual workflow_dispatch။</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Traffic Analysis Modal */}
      <AIAnalysisModal
        language={language}
        snis={analysisSnis}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onTriggerRadioReset={() => setActiveTab('shizuku')}
        onOpenOfflineModelManager={() => setIsOfflineModelModalOpen(true)}
      />

      {/* AI Self-Healing & Daily/Weekly Maintenance Hub */}
      <SelfHealingMaintenanceModal
        language={language}
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onTriggerRadioReset={() => setActiveTab('shizuku')}
      />

      {/* Offline AI Model Downloader & Repository Manager */}
      <OfflineModelManagerModal
        language={language}
        isOpen={isOfflineModelModalOpen}
        onClose={() => setIsOfflineModelModalOpen(false)}
      />

      {/* APK Security & License Activation Hub */}
      <LicenseActivationModal
        language={language}
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onLicenseChanged={(state) => setLicenseState(state)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetRecon Network Diagnostic Suite • Google AI Studio</span>
          <span className="font-mono text-[11px] text-[#4ea8de]">
            Server Proxy Active • GEMINI_API_KEY Secured
          </span>
        </div>
      </footer>
    </div>
  );
}
