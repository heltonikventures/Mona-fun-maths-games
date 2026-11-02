import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck,
  Send,
  QrCode,
  Chrome,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const CANONICAL_INSTALL_URL =
  'https://ais-pre-5jzdup6t74f36v6htzl2nd-43240112854.europe-west2.run.app';

interface InstallAndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAndroidModal: React.FC<InstallAndroidModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { hasNativePrompt, isInstalled, triggerInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'chrome' | 'samsung'>('chrome');

  if (!isOpen) return null;

  // Always use the canonical public installation URL
  const appUrl = CANONICAL_INSTALL_URL;

  // Android Chrome Intent URL to force open in Google Chrome directly on Android
  const chromeIntentUrl = `intent://ais-pre-5jzdup6t74f36v6htzl2nd-43240112854.europe-west2.run.app#Intent;scheme=https;package=com.android.chrome;end`;

  const handleNativeInstall = async () => {
    setInstallStatus('prompting');
    const result = await triggerInstall();
    if (result === 'accepted') {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else if (result === 'dismissed') {
      setInstallStatus('dismissed');
    } else {
      setInstallStatus('manual');
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        // Fallback for older webviews
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Maths Quest - Install on Android",
          text: "Play and master maths with Mona and Teacher Helton! Install on your Android phone:",
          url: appUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleWhatsAppShare();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📚 *Install Maths Quest on Your Android Phone!*\n\nMaster mathematics through interactive games with Mona & Teacher Helton.\n\n✨ Direct Installation Link:\n${appUrl}\n\n👉 Tap link in Google Chrome, then tap 'Install app' or 'Add to Home screen'!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenChrome = () => {
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');
    if (isAndroid) {
      // Attempt opening directly in Chrome via Android Intent
      window.location.href = chromeIntentUrl;
      // Fallback timeout to open canonical URL if intent fails
      setTimeout(() => {
        window.open(appUrl, '_blank', 'noopener,noreferrer');
      }, 700);
    } else {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // High-contrast QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0f172a&color=10b981&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-950/70 text-white p-5 sm:p-7 custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 shrink-0">
            <Smartphone className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Android APK / Web App
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                No Store Needed • 100% Free
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 leading-tight">
              Install on Android Phone
            </h2>
          </div>
        </div>

        {/* Status Message if already installed */}
        {isInstalled && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-300">App Installed & Ready!</p>
              <p className="text-xs text-emerald-200/80">
                Maths Quest is installed on this device. You can launch it directly from your app drawer or home screen anytime.
              </p>
            </div>
          </div>
        )}

        {/* Direct Action Buttons */}
        <div className="space-y-2.5 mb-5">
          {hasNativePrompt ? (
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Install Directly to This Phone Now</span>
            </button>
          ) : (
            <button
              onClick={handleOpenChrome}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Chrome className="w-5 h-5 stroke-[2.5]" />
              <span>Open in Google Chrome to Install</span>
            </button>
          )}

          {installStatus === 'dismissed' && (
            <p className="text-center text-xs text-amber-300">
              Install prompt was dismissed. Follow the 3 easy steps below to install manually in Chrome!
            </p>
          )}

          {/* Direct Link Anchor for 100% Reliability */}
          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            <span className="text-slate-400">Direct installation link:</span>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
            >
              <span>Open Installation URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Verified URL Copy Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔗</span> Official Android Installation Link:
            </p>
            <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Verified Link
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-mono truncate focus:outline-none focus:border-emerald-500 transition select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-700/30 shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-green-700/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={handleShareNative}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition border border-indigo-700/40 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQR ? 'Hide QR' : 'Scan QR Code'}</span>
            </button>
          </div>

          {/* QR Code Section for Scanning on Another Device */}
          {showQR && (
            <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs text-slate-300 mb-2">
                Point your Android camera or QR scanner at the code below to open and install instantly:
              </p>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/40 shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Maths Quest Android Installation"
                  className="w-40 h-40 rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] font-mono text-emerald-400 mt-2 truncate max-w-full px-2">
                {appUrl}
              </p>
            </div>
          )}
        </div>

        {/* Step-by-Step Android Installation Guide */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              How to Install on Android Phone:
            </h3>

            {/* Browser Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-[11px]">
              <button
                onClick={() => setActiveTab('chrome')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'chrome'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chrome
              </button>
              <button
                onClick={() => setActiveTab('samsung')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'samsung'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Samsung / Other
              </button>
            </div>
          </div>

          {activeTab === 'chrome' ? (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  1
                </span>
                <p className="text-slate-300">
                  Open <span className="text-white font-semibold">{appUrl}</span> in <span className="text-amber-300 font-semibold">Google Chrome</span> on your Android phone.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  2
                </span>
                <p className="text-slate-300">
                  Tap the <span className="text-amber-300 font-bold">three vertical dots (⋮)</span> in the top-right corner of Chrome.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  3
                </span>
                <p className="text-slate-300">
                  Select <span className="text-emerald-300 font-bold">"Install app"</span> or <span className="text-emerald-300 font-bold">"Add to Home screen"</span> from the menu.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  4
                </span>
                <p className="text-slate-300">
                  Tap <span className="text-white font-bold">"Install"</span>. In seconds, Maths Quest appears on your phone home screen with the app icon!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  1
                </span>
                <p className="text-slate-300">
                  Open the installation link in <span className="text-amber-300 font-semibold">Samsung Internet</span> or your preferred Android browser.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  2
                </span>
                <p className="text-slate-300">
                  Tap the <span className="text-amber-300 font-bold">three horizontal lines (☰)</span> or the download arrow on the address bar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                  3
                </span>
                <p className="text-slate-300">
                  Tap <span className="text-emerald-300 font-bold">+ Add page to</span> &rarr; select <span className="text-emerald-300 font-bold">"Home screen"</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="font-bold text-white text-xs">Full Screen</p>
            <p className="text-[10px] text-slate-400">No URL bars</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <WifiOff className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="font-bold text-white text-xs">Works Offline</p>
            <p className="text-[10px] text-slate-400">Play anywhere</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <p className="font-bold text-white text-xs">Under 3MB</p>
            <p className="text-[10px] text-slate-400">Saves data storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
