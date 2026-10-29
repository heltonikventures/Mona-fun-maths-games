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
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

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

  if (!isOpen) return null;

  // Compute canonical app URL for client installation
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://ais-pre-5jzdup6t74f36v6htzl2nd-43240112854.europe-west2.run.app'
      : 'https://ais-pre-5jzdup6t74f36v6htzl2nd-43240112854.europe-west2.run.app';

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

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📚 Install *Maths Quest* on your Android phone! Master mathematics with Teacher Helton. Play games, earn Naira coins & level up: ${appUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenDirect = () => {
    window.open(appUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 text-white p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 shrink-0">
            <Smartphone className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Android APK & Web App
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Zero Install Fees
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Install on Android Phone
            </h2>
          </div>
        </div>

        {/* Status Message */}
        {isInstalled && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-300">App Already Installed!</p>
              <p className="text-xs text-emerald-200/80">
                Maths Quest is installed and ready in your Android app drawer.
              </p>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="space-y-3 mb-6">
          {hasNativePrompt ? (
            <button
              onClick={handleNativeInstall}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-6 h-6 stroke-[2.5]" />
              <span>Tap to Install on This Phone Now</span>
            </button>
          ) : (
            <button
              onClick={handleOpenDirect}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <ExternalLink className="w-6 h-6 stroke-[2.5]" />
              <span>Open in Phone Browser / Install</span>
            </button>
          )}

          {installStatus === 'dismissed' && (
            <p className="text-center text-xs text-amber-300">
              Install prompt was closed. You can also install manually using the steps below.
            </p>
          )}
        </div>

        {/* 3 Step Visual Android Guide */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            How to Install on Any Android Device (Chrome / Samsung):
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                1
              </span>
              <p className="text-slate-300">
                Open <span className="text-white font-semibold">Google Chrome</span> or your mobile browser on your Android phone.
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
                Select <span className="text-emerald-300 font-bold">"Install app"</span> or <span className="text-emerald-300 font-bold">"Add to Home screen"</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                4
              </span>
              <p className="text-slate-300">
                Confirm <span className="text-white font-semibold">"Install"</span>. Maths Quest will be added directly to your app screen with the icon!
              </p>
            </div>
          </div>
        </div>

        {/* Share & Copy Link Section */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Send Install Link to Your Phone:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition border border-slate-600 shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-700/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              onClick={handleOpenDirect}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Open Direct Link</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="font-bold text-white">Full Screen</p>
            <p className="text-[10px] text-slate-400">No browser bars</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <WifiOff className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="font-bold text-white">Works Offline</p>
            <p className="text-[10px] text-slate-400">Play anywhere</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <p className="font-bold text-white">Lightweight</p>
            <p className="text-[10px] text-slate-400">&lt; 3MB storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
