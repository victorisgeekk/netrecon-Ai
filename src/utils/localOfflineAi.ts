import { GeneratedRoutingConfig } from '../types/traffic';

/**
 * Local Offline AI Rule Engine
 * Operates 100% on-device without internet or API calls.
 * Used automatically when network drops, timeout occurs, or user is offline.
 */
export function generateLocalOfflineAnalysis(
  snis: string[],
  customDirective?: string,
  language: 'my' | 'en' = 'my'
): GeneratedRoutingConfig & { isOfflineLocal: boolean } {
  const targetSnis = snis.length > 0 ? snis : ['api.google.com', 'connectivitycheck.gstatic.com'];
  const domainCategories: Record<string, string> = {};
  const directDomains: string[] = [];
  const proxyDomains: string[] = [];
  const blockDomains: string[] = [];

  targetSnis.forEach((host) => {
    const lower = host.toLowerCase();

    // Captive portal & network detection
    if (
      lower.includes('connectivitycheck') ||
      lower.includes('captive') ||
      lower.includes('detectportal') ||
      lower.includes('msftconnecttest')
    ) {
      domainCategories[host] = language === 'my' ? 'System Network Probe' : 'Captive Portal / Probe';
      directDomains.push(`domain:${host}`);
    }
    // Telemetry & trackers
    else if (
      lower.includes('telemetry') ||
      lower.includes('analytics') ||
      lower.includes('crashlytics') ||
      lower.includes('metrics') ||
      lower.includes('app-measurement')
    ) {
      domainCategories[host] = language === 'my' ? 'Telemetry & Analytics' : 'Analytics & Telemetry';
      directDomains.push(`domain:${host}`);
    }
    // CDN & Static Media
    else if (
      lower.includes('cdn') ||
      lower.includes('static') ||
      lower.includes('akamai') ||
      lower.includes('fastly') ||
      lower.includes('cloudflare')
    ) {
      domainCategories[host] = language === 'my' ? 'CDN & Static Delivery' : 'CDN Content';
      directDomains.push(`domain:${host}`);
    }
    // High-priority API & Tunnel targets
    else if (
      lower.includes('api') ||
      lower.includes('gateway') ||
      lower.includes('auth') ||
      lower.includes('account') ||
      lower.includes('secure')
    ) {
      domainCategories[host] = language === 'my' ? 'API Gateway / Secure Tunnel' : 'API Endpoint';
      proxyDomains.push(`domain:${host}`);
    }
    // General web traffic
    else {
      domainCategories[host] = language === 'my' ? 'General Internet' : 'General Traffic';
      proxyDomains.push(`domain:${host}`);
    }
  });

  const summary = language === 'my'
    ? `[Local Offline AI Engine] Network မရှိသော်လည်း ဖုန်းတွင်း Local Engine မှ SNI (${targetSnis.length}) ခုအား အလိုအလျောက် စစ်ဆေးပြီး Split-Tunneling စည်းမျဉ်းများကို ထုတ်ပေးထားပါသည်။ Captive portal များကို direct လွှဲပေးထားပြီး secure API များကို proxy tunnel ထဲသို့ ထည့်သွင်းထားပါသည်။`
    : `[Local Offline AI Engine] Operating in 100% offline mode without cloud dependencies. Analyzed ${targetSnis.length} hostnames and partitioned captive portal reachability vs. secure proxy egress routes.`;

  const nextStepSuggestions = language === 'my'
    ? [
        '⚡ Local Offline Engine မှ ထုတ်ပေးထားသော Routing စည်းမျဉ်းဖြစ်၍ အင်တာနက်မရှိဘဲ ချက်ချင်း အသုံးပြုနိုင်ပါသည်။',
        'Captive portal စစ်ဆေးမှု (gstatic) အား Direct ထားရှိသဖြင့် Android Wi-Fi / SIM login ပြဿနာ မဖြစ်ပေါ်နိုင်ပါ။',
        'Shizuku Radio Reset ကို အသုံးပြု၍ ဖုန်းအင်တာနက် လိုင်းကျပါက ပြန်လည်နိုးကြားစေနိုင်ပါသည်။',
        'ထုတ်ယူရရှိသော JSON template အား Xray-core / Sing-box သို့ ကူးယူထည့်သွင်းပါ။'
      ]
    : [
        '⚡ Synthesized locally on-device without remote cloud API dependencies.',
        'Captive portal bypass prevents Android VpnService false offline loops.',
        'Toggle cellular baseband via Shizuku radio if connection needs refreshing.',
        'Deploy the generated split-tunneling JSON configuration directly.'
      ];

  return {
    isOfflineLocal: true,
    summary,
    domainCategories,
    recommendedRouting: {
      routing: {
        domainStrategy: 'IPIfNonMatch',
        rules: [
          {
            type: 'field',
            outboundTag: 'direct',
            domain: directDomains.length > 0 ? directDomains : ['domain:connectivitycheck.gstatic.com'],
          },
          {
            type: 'field',
            outboundTag: 'proxy',
            domain: proxyDomains.length > 0 ? proxyDomains : targetSnis.map((s) => `domain:${s}`),
          },
        ],
      },
      outbounds: [
        { protocol: 'freedom', tag: 'direct' },
        { protocol: 'socks', tag: 'proxy' },
      ],
    },
    anomalyFlags: [
      language === 'my' 
        ? 'Offline Mode Active • Local On-Device Synthesis' 
        : 'Offline Mode Active • Local On-Device Synthesis'
    ],
    nextStepSuggestions,
  };
}
