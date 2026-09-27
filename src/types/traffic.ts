export type Protocol = 'TLS (TCP)' | 'TCP' | 'UDP' | 'DNS (UDP)';

export interface PacketLog {
  id: string;
  timestamp: string;
  sourceIP: string;
  sourcePort: number;
  destIP: string;
  destPort: number;
  protocol: Protocol;
  lengthBytes: number;
  sni: string | null;
  flags: string[];
  isTlsClientHello: boolean;
  category?: 'telemetry' | 'cdn' | 'messaging' | 'web' | 'dns' | 'tunnel' | 'suspicious';
  rawHexSample: string;
}

export interface RoutingRule {
  type: string;
  outboundTag: 'direct' | 'proxy' | 'block';
  domain: string[];
}

export interface GeneratedRoutingConfig {
  summary?: string;
  domainCategories?: Record<string, string>;
  recommendedRouting?: {
    routing: {
      domainStrategy: string;
      rules: RoutingRule[];
    };
    outbounds: Array<{ protocol: string; tag: string }>;
  };
  anomalyFlags?: string[];
  nextStepSuggestions?: string[];
  raw?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  hasApiKey: boolean;
  latencyMs?: number;
  model?: string;
  message?: string;
  error?: string;
  timestamp?: string;
}

let packetCounter = 1000;

export function generatePacketId(): string {
  packetCounter += 1;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);
  return `pkt-${time}-${packetCounter}-${rand}`;
}
