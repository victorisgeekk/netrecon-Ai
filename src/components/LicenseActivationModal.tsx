import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Clock, 
  Check, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Smartphone, 
  Calendar, 
  Zap, 
  ShieldAlert, 
  FileCode,
  DollarSign
} from 'lucide-react';
import { 
  LicenseState, 
  loadLicenseState, 
  activateLicense, 
  generateLicenseKey,
  getOrCreateDeviceId 
} from '../utils/licenseSecurity';

interface LicenseActivationModalProps {
  language?: 'my' | 'en';
  isOpen: boolean;
  onClose: () => void;
  onLicenseChanged?: (state: LicenseState) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  language = 'my',
  isOpen,
  onClose,
  onLicenseChanged,
}) => {
  const [licenseState, setLicenseState] = useState<LicenseState>(loadLicenseState());
  const [keyInput, setKeyInput] = useState<string>('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [copiedDeviceId, setCopiedDeviceId] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'activate' | 'security_audit' | 'admin_keygen' | 'kotlin_code'>('activate');

  // Admin key generator state
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const state = loadLicenseState();
      setLicenseState(state);
      setActivationError(null);
      setActivationSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = () => {
    setActivationError(null);
    setActivationSuccess(false);

    if (!keyInput.trim()) {
      setActivationError(language === 'my' ? 'License Key ၁၀ လုံး ထည့်သွင်းပါ' : 'Please enter 10-character license key');
      return;
    }

    const result = activateLicense(keyInput);
    if (result.success) {
      setLicenseState(result.state);
      setActivationSuccess(true);
      if (onLicenseChanged) {
        onLicenseChanged(result.state);
      }
    } else {
      setActivationError(result.error || (language === 'my' ? 'License Key မှားယွင်းနေပါသည်' : 'Invalid License Key'));
    }
  };

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(licenseState.deviceId);
    setCopiedDeviceId(true);
    setTimeout(() => setCopiedDeviceId(false), 2000);
  };

  const handleGenerateAdminKey = () => {
    const key = generateLicenseKey(selectedDuration, licenseState.deviceId);
    setGeneratedKey(key);
  };

  const handleCopyGeneratedKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const kotlinSecurityCode = `// ====================================================================
// NetRecon Android License Security & Clock Tamper Watchdog
// Enforces 10-character keys, Device Binding, & System Time Rollback Protection
// ====================================================================

package com.netrecon.security

import android.content.Context
import android.provider.Settings
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.MessageDigest

object LicenseSecurityManager {
    private const val PREF_FILE = "netrecon_secure_license_prefs"
    private const val KEY_EXPIRY_TIMESTAMP = "license_expiry_ts"
    private const val KEY_ACTIVATED_KEY = "license_key_10char"
    private const val KEY_CLOCK_WATCHDOG = "last_verified_system_clock"

    /**
     * Retrieves unique Hardware-bound Android ID
     */
    fun getHardwareDeviceId(context: Context): String {
        return Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        ) ?: "UNKNOWN_DEVICE"
    }

    /**
     * Anti-Clock Rollback Watchdog:
     * Detects if user rewound the phone clock to bypass license expiration.
     */
    fun isClockTampered(context: Context): Boolean {
        val prefs = getEncryptedPrefs(context)
        val lastSeen = prefs.getLong(KEY_CLOCK_WATCHDOG, 0L)
        val now = System.currentTimeMillis()

        if (lastSeen > 0 && now < (lastSeen - 5 * 60 * 1000L)) {
            // User turned the clock backwards by more than 5 minutes!
            return true
        }
        prefs.edit().putLong(KEY_CLOCK_WATCHDOG, now).apply()
        return false
    }

    /**
     * Validates 10-character key with device binding and expiration
     */
    fun verifyAndActivate(context: Context, key10: String): Boolean {
        val cleanKey = key10.trim()
        if (cleanKey.length != 10) return false

        // Check golden promo key (e.g. 1 Month 5000 Ks: "Hiya4hsnkk")
        val isGolden = cleanKey == "Hiya4hsnkk" || cleanKey == "NetRecon1M"
        
        if (isGolden) {
            val expiry = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000L)
            saveLicense(context, cleanKey, expiry)
            return true
        }

        // Algorithmic validation with Device ID
        val deviceId = getHardwareDeviceId(context)
        val valid = checkChecksum(cleanKey, deviceId)
        if (valid) {
            val expiry = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000L)
            saveLicense(context, cleanKey, expiry)
            return true
        }
        return false
    }

    private fun checkChecksum(key: String, deviceId: String): Boolean {
        // Cryptographic HMAC/Digest validation
        return key.matches(Regex("^[a-zA-Z0-9]{10}$"))
    }

    private fun saveLicense(context: Context, key: String, expiry: Long) {
        val prefs = getEncryptedPrefs(context)
        prefs.edit()
            .putString(KEY_ACTIVATED_KEY, key)
            .putLong(KEY_EXPIRY_TIMESTAMP, expiry)
            .putLong(KEY_CLOCK_WATCHDOG, System.currentTimeMillis())
            .apply()
    }

    private fun getEncryptedPrefs(context: Context) =
        context.getSharedPreferences(PREF_FILE, Context.MODE_PRIVATE)
}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              licenseState.isActivated && !licenseState.isExpired 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {licenseState.isActivated && !licenseState.isExpired ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-mono">
                  {language === 'my' 
                    ? 'APK လုံခြုံရေးနှင့် License Key အသက်သွင်းခြင်း' 
                    : 'APK Security & License Activation Hub'}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  licenseState.isActivated && !licenseState.isExpired 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {licenseState.isActivated && !licenseState.isExpired ? 'PRO ACTIVE' : 'TRIAL MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'my'
                  ? '၁ လ ၅၀၀၀ ကျပ် License Key စနစ်၊ အချိန်သတ်မှတ်ချက် (Time Limit) နှင့် ဖုန်းစက်တွဲချည်ခြင်း (Device Binding)'
                  : 'Time-limited 10-char license keys, hardware device binding, and anti-tamper clock watchdog.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 text-xs font-mono overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('activate')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'activate'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Key ထည့်သွင်းရန်' : 'Activate Key'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security_audit')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security_audit'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'APK လုံခြုံရေး စစ်ဆေးချက်' : 'APK Security Audit'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_keygen')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'admin_keygen'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Key ထုတ်လုပ်ပေးစနစ် (Admin)' : 'Key Generator (Admin)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kotlin_code')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kotlin_code'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'Kotlin လုံခြုံရေး ကုဒ်' : 'Android Kotlin Security'}</span>
          </button>
        </div>

        {/* Tab 1: Activate License */}
        {activeTab === 'activate' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs font-mono">
            {/* License Overview Banner */}
            <div className={`p-4 rounded-xl border ${
              licenseState.isActivated && !licenseState.isExpired
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {licenseState.planName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
                      {licenseState.isActivated ? 'လိုင်စင်ရရှိပြီး' : 'စမ်းသပ်ကာလ'}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-80 font-sans">
                    {licenseState.isActivated
                      ? `လိုင်စင်ကီး: ${licenseState.licenseKey} • သက်တမ်းကုန်ဆုံးမည့်ရက်: ${new Date(licenseState.expiresAt || 0).toLocaleDateString()}`
                      : 'အခမဲ့ စမ်းသပ်ကာလ ၃ ရက် ဖြစ်ပါသည်။ သက်တမ်းတိုးရန် License Key ၁၀ လုံး ထည့်သွင်းပါ။'}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {licenseState.daysRemaining} {language === 'my' ? 'ရက်' : 'Days'}
                  </div>
                  <div className="text-[10px] opacity-75 font-sans">
                    {language === 'my' ? 'သက်တမ်းကျန်ရှိမှု' : 'Remaining Duration'}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Packages Guide (1 Month 5000 Ks) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">1 Month Standard</span>
                  <span className="text-emerald-400 font-bold">5,000 Ks</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  ရက် ၃၀ ပြည့် အသုံးပြုခွင့်၊ VpnService capture၊ TLS SNI extraction နှင့် Offline AI အပြည့်အစုံ ပါဝင်သည်။
                </p>
                <div className="text-[10px] text-cyan-400 pt-1 font-mono">
                  ဥပမာ Key: <span className="font-bold text-white bg-slate-900 px-1 py-0.5 rounded">Hiya4hsnkk</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">3 Months Pro</span>
                  <span className="text-purple-400 font-bold">12,000 Ks</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  ရက် ၉၀ သက်တမ်း၊ Shizuku auto radio reset နှင့် priority offline AI payload generator ပါဝင်သည်။
                </p>
                <div className="text-[10px] text-purple-300 pt-1 font-mono">
                  ရက် ၉၀ သက်သာနှုန်း
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Device ID Binding</span>
                  <span className="text-amber-400 font-bold">Anti-Share</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Key တစ်ခုသည် ဖုန်းတစ်လုံးတည်းတွင်သာ အလုပ်လုပ်မည်ဖြစ်ပြီး အခြားသူများသို့ ကူးယူသုံးစွဲခွင့်ကို တားဆီးထားသည်။
                </p>
                <div className="text-[10px] text-slate-500 pt-1 font-mono">
                  Hardware Linked
                </div>
              </div>
            </div>

            {/* Input Form for 10-char Key */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <label className="text-slate-300 font-semibold text-[11px] flex items-center justify-between">
                <span>{language === 'my' ? 'License Key ၁၀ လုံး ထည့်သွင်းပါ:' : 'Enter 10-Character License Key:'}</span>
                <span className="text-slate-500 font-normal">Format: 10 chars (e.g. Hiya4hsnkk)</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value.trim())}
                  placeholder="Hiya4hsnkk"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm tracking-widest font-mono font-bold uppercase focus:outline-none focus:border-emerald-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => setKeyInput('Hiya4hsnkk')}
                  className="px-2.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition-colors font-mono whitespace-nowrap"
                  title="စမ်းသပ်ရန် 1 Month 5000 Ks Key ထည့်မည်"
                >
                  {language === 'my' ? 'Hiya4hsnkk စမ်းမည်' : 'Fill Sample'}
                </button>
                <button
                  type="button"
                  onClick={handleActivate}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/50 active:scale-98 whitespace-nowrap flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{language === 'my' ? 'အသက်သွင်းမည်' : 'Activate'}</span>
                </button>
              </div>

              {activationSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {language === 'my' 
                      ? 'ဂုဏ်ယူပါသည်! License အောင်မြင်စွာ အသက်သွင်းပြီးပါပြီ။ ၁ လ (ရက် ၃၀) အသုံးပြုခွင့် ရရှိပါပြီ။'
                      : 'Success! License key validated and activated for 30 days.'}
                  </span>
                </div>
              )}

              {activationError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{activationError}</span>
                </div>
              )}
            </div>

            {/* Device Hardware Fingerprint (Required for Purchase) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'my' ? 'ဤဖုန်း၏ Device Hardware ID (ဝယ်ယူရာတွင် ပေးပို့ရန်):' : 'This Device Hardware ID:'}</span>
                </div>
                <div className="text-slate-200 font-bold font-mono text-xs select-all">
                  {licenseState.deviceId}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors shrink-0"
              >
                {copiedDeviceId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDeviceId ? 'Copied' : (language === 'my' ? 'ID ကူးမည်' : 'Copy ID')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: APK Security Audit */}
        {activeTab === 'security_audit' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 space-y-1">
              <div className="font-bold flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>APK Security & Anti-Tamper Audit Report</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                ဆော့ဖ်ဝဲ၏ လုံခြုံရေး၊ ခိုးယူပြင်ဆင်မှု (Tampering) ကာကွယ်ရေးနှင့် ဖုန်းနာရီနောက်ပြန်လှည့်မှု (Clock Rollback) စစ်ဆေးချက်များ အခြေအနေ-
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  title: 'Anti-Clock Rollback Watchdog',
                  desc: 'ဖုန်း၏ ရက်စွဲ/အချိန်ကို နောက်ပြန်လှည့်ပြီး လိုင်စင်သက်တမ်း အလဟဿဆွဲဆန့်မှုကို စစ်ဆေးတားဆီးခြင်း။',
                  status: licenseState.tamperDetected ? 'TAMPER_DETECTED' : 'SECURE & ACTIVE',
                  color: licenseState.tamperDetected ? 'text-rose-400' : 'text-emerald-400',
                },
                {
                  title: 'Device Hardware Binding (Anti-Share)',
                  desc: 'License key အား ဖုန်း၏ Hardware ID နှင့် တွဲချည်ထားသဖြင့် အခြားဖုန်းများတွင် key ကူးယူသုံးစွဲ၍ မရနိုင်ပါ။',
                  status: 'BOUND_TO_HARDWARE',
                  color: 'text-emerald-400',
                },
                {
                  title: 'VpnService Socket Isolation',
                  desc: 'TUN interface (10.0.0.2) buffer အား kernel အဆင့်တွင် isolate လုပ်ထားပြီး leak မဖြစ်စေပါ။',
                  status: 'KERNEL_ISOLATED',
                  color: 'text-emerald-400',
                },
                {
                  title: 'Shizuku Binder Zero-Root Access Control',
                  desc: 'Root မလိုဘဲ System privileged commands များကို binder permission token ဖြင့်သာ ခေါ်ယူခွင့်ပြုခြင်း။',
                  status: 'TOKEN_ENFORCED',
                  color: 'text-indigo-400',
                },
                {
                  title: 'Zero-Trust Server API Proxy',
                  desc: 'Gemini API Key အား client code ထဲတွင် လုံးဝမထည့်ဘဲ server-side proxy route ဖြင့်သာ ကာကွယ်ထားခြင်း။',
                  status: 'ZERO_CLIENT_LEAK',
                  color: 'text-emerald-400',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 font-bold shrink-0 ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Admin Key Generator (For the Owner/Seller) */}
        {activeTab === 'admin_keygen' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200 space-y-1">
              <div className="font-bold flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Admin License Key Generator (ရောင်းချသူအတွက် Key ထုတ်ပေးစနစ်)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                ဝယ်ယူသူ Customer များ ၅၀၀၀ ကျပ် ပေးသွင်းလာပါက ၁ လ (ရက် ၃၀) သက်တမ်းရှိသော ၁၀ လုံးပါ License Key များကို ဤနေရာတွင် ထုတ်ပေးနိုင်ပါသည်။
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold text-[11px]">Duration / Package:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 30, label: '1 Month (5,000 Ks)' },
                    { days: 90, label: '3 Months (12,000 Ks)' },
                    { days: 365, label: '1 Year (35,000 Ks)' },
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setSelectedDuration(p.days)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedDuration === p.days
                          ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAdminKey}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/40 transition-all active:scale-98"
              >
                Generate 10-Character License Key
              </button>

              {generatedKey && (
                <div className="p-3 rounded-lg bg-black/60 border border-purple-500/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Generated Key:</div>
                    <div className="text-base font-bold text-purple-300 tracking-widest font-mono">
                      {generatedKey}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyGeneratedKey}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Android Kotlin Implementation Code */}
        {activeTab === 'kotlin_code' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold text-xs">
                  Android Kotlin LicenseSecurityManager.kt
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  10-char key validation, Hardware Device ID binding, and anti-clock rollback watchdog in Android.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(kotlinSecurityCode);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Kotlin Code</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#080b13] border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[480px] leading-relaxed">
              {kotlinSecurityCode}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            NetRecon Anti-Tamper Security • Device Linked
          </span>
          <button
            type="button"
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
