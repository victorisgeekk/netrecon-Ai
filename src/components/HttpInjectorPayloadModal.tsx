import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  FileText, 
  Sliders, 
  Sparkles, 
  Terminal, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { PacketLog } from '../types/traffic';

interface HttpInjectorPayloadModalProps {
  language?: 'my' | 'en';
  isOpen: boolean;
  onClose: () => void;
  packet?: PacketLog | null;
}

export const HttpInjectorPayloadModal: React.FC<HttpInjectorPayloadModalProps> = ({
  language = 'my',
  isOpen,
  onClose,
  packet,
}) => {
  const [method, setMethod] = useState<'CONNECT' | 'GET' | 'POST' | 'HEAD'>('CONNECT');
  const [payloadType, setPayloadType] = useState<'normal' | 'front_inject' | 'back_inject' | 'websocket' | 'split'>('normal');
  const [targetHost, setTargetHost] = useState(packet?.sni || 'api.google.com');
  const [rawHexInput, setRawHexInput] = useState(packet?.rawHexSample || '');
  const [copiedInjector, setCopiedInjector] = useState(false);
  const [copiedCustom, setCopiedCustom] = useState(false);

  if (!isOpen) return null;

  // Convert raw hex sample to decoded ASCII with [crlf] formatting
  const decodeHexToAscii = (hex: string): string => {
    try {
      const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
      let ascii = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const byte = parseInt(cleanHex.substr(i, 2), 16);
        if (byte === 13 && cleanHex.substr(i + 2, 2).toLowerCase() === '0a') {
          ascii += '[crlf]';
          i += 2;
        } else if (byte >= 32 && byte <= 126) {
          ascii += String.fromCharCode(byte);
        } else {
          ascii += '.';
        }
      }
      return ascii;
    } catch {
      return '';
    }
  };

  // Generate HTTP Injector format payload string
  const generatePayload = (): string => {
    const host = targetHost.trim() || '[host]';

    switch (payloadType) {
      case 'front_inject':
        return `GET http://${host}/ HTTP/1.1[crlf]Host: ${host}[crlf]X-Online-Host: ${host}[crlf]Connection: Keep-Alive[crlf][crlf]CONNECT [host_port] [protocol][crlf][crlf]`;
      case 'back_inject':
        return `CONNECT [host_port] [protocol][crlf][crlf]GET http://${host}/ HTTP/1.1[crlf]Host: ${host}[crlf]X-Online-Host: ${host}[crlf]Connection: Keep-Alive[crlf][crlf]`;
      case 'websocket':
        return `GET / HTTP/1.1[crlf]Host: ${host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]X-Forwarded-For: [host][crlf][crlf]`;
      case 'split':
        return `CONNECT [host_port]@127.0.0.1 [protocol][crlf]Host: ${host}[crlf][split]GET / HTTP/1.1[crlf]Host: ${host}[crlf]Connection: Keep-Alive[crlf][crlf]`;
      case 'normal':
      default:
        if (method === 'CONNECT') {
          return `CONNECT [host_port] [protocol][crlf]Host: ${host}[crlf]X-Online-Host: ${host}[crlf]X-Forwarded-For: ${host}[crlf]Connection: Keep-Alive[crlf][crlf]`;
        } else {
          return `${method} / HTTP/1.1[crlf]Host: ${host}[crlf]X-Online-Host: ${host}[crlf]Connection: Keep-Alive[crlf][crlf]`;
        }
    }
  };

  const payloadString = generatePayload();
  const decodedAscii = rawHexInput ? decodeHexToAscii(rawHexInput) : '';

  const handleCopyInjector = () => {
    navigator.clipboard.writeText(payloadString);
    setCopiedInjector(true);
    setTimeout(() => setCopiedInjector(false), 2000);
  };

  const handleCopyCustom = () => {
    // HTTP Custom format often pairs payload with SNI and SSH host
    const customConfig = `[Payload]\n${payloadString}\n\n[SNI / Server Name]\n${targetHost}\n\n[Notes]\nGenerated from NetRecon TLS packet analyzer.`;
    navigator.clipboard.writeText(customConfig);
    setCopiedCustom(true);
    setTimeout(() => setCopiedCustom(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-mono">
                  HTTP Injector / HTTP Custom Payload Generator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  v7.x Syntax
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'my'
                  ? 'Packet payload hexcode နှင့် SNI အား HTTP Injector / Custom တွင် အသုံးပြုနိုင်သော format ဖြင့် ထုတ်လုပ်ခြင်း'
                  : 'Convert captured packet hex, headers, & TLS SNI into standard HTTP Injector / Custom macro payload syntax.'}
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

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Controls: Target Host & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px] font-semibold">
                Target SNI / Bug Host ([host]):
              </label>
              <input
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                placeholder="e.g. api.google.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[11px] font-semibold">
                HTTP Method:
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="CONNECT">CONNECT (SSL / TLS Proxy)</option>
                <option value="GET">GET (Standard / CDN)</option>
                <option value="POST">POST (Data Push)</option>
                <option value="HEAD">HEAD (Lightweight Ping)</option>
              </select>
            </div>
          </div>

          {/* Payload Type Presets */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[11px] font-semibold">
              Payload Injection Mode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'front_inject', label: 'Front-Inject' },
                { id: 'back_inject', label: 'Back-Inject' },
                { id: 'websocket', label: 'WebSocket' },
                { id: 'split', label: 'Split Tunnel' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPayloadType(t.id as any)}
                  className={`p-2 rounded-lg border text-center transition-all text-[11px] ${
                    payloadType === t.id
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 font-semibold shadow'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Payload Box */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Formatted Payload (HTTP Injector / Custom):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyInjector}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] transition-colors"
                >
                  {copiedInjector ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedInjector ? 'Copied' : 'Copy Payload'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCustom}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[11px] transition-colors"
                >
                  {copiedCustom ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCustom ? 'Copied' : 'Copy Custom Full'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-[#23293e] text-slate-200 leading-relaxed break-all select-all font-mono font-medium text-xs">
              {payloadString}
            </div>
          </div>

          {/* Decoded Hex Section */}
          {decodedAscii && (
            <div className="space-y-1.5 pt-2 border-t border-[#23293e]">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Hex Byte ASCII Reconstruction ([crlf] Tagged):</span>
                <span className="text-slate-500">Auto-extracted from raw packet</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080b13] border border-slate-800/80 text-amber-300/90 text-[11px] break-all max-h-24 overflow-y-auto leading-relaxed">
                {decodedAscii}
              </div>
            </div>
          )}

          {/* Quick Macro Cheat Sheet */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
            <span className="text-slate-300 font-semibold font-mono">Macro Tag Reference:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] pt-1">
              <div><span className="text-cyan-400">[crlf]</span>: Return & Line feed (\r\n)</div>
              <div><span className="text-purple-400">[host_port]</span>: Remote SSH/VPN target</div>
              <div><span className="text-amber-400">[protocol]</span>: HTTP/1.1 or 2.0</div>
              <div><span className="text-emerald-400">[split]</span>: Dual payload delimiter</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Directly compatible with HTTP Injector &amp; HTTP Custom on Android
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
