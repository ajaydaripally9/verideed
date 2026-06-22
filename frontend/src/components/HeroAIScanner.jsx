import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function HeroAIScanner() {
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setScanStep(1), 1500); // OCR Complete
    const timer2 = setTimeout(() => setScanStep(2), 3000); // Ownership Check Complete
    const timer3 = setTimeout(() => setScanStep(3), 4500); // Map Overlap Complete
    const timer4 = setTimeout(() => setScanStep(4), 5500); // Risk score complete

    // Reset loop every 12 seconds
    const interval = setInterval(() => {
      setScanStep(0);
      setTimeout(() => setScanStep(1), 1500);
      setTimeout(() => setScanStep(2), 3000);
      setTimeout(() => setScanStep(3), 4500);
      setTimeout(() => setScanStep(4), 5500);
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 p-6 max-w-sm w-full mx-auto relative overflow-hidden shadow-md bg-white">
      {/* Laser Scanning Effect */}
      {scanStep < 4 && (
        <div className="absolute left-0 right-0 h-0.5 bg-indigo-600/80 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse pointer-events-none"
             style={{
               animation: 'scan 2s linear infinite',
               top: '0%'
             }}
         />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${scanStep < 4 ? 'bg-indigo-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${scanStep < 4 ? 'bg-indigo-600' : 'bg-amber-500'}`}></span>
          </span>
          VeriDeed AI Scanner
        </span>
        <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-mono font-semibold">
          {scanStep === 4 ? 'Completed' : 'Scanning...'}
        </span>
      </div>

      {/* PDF Mock */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">Sale_Deed.pdf</p>
          <p className="text-[10px] text-slate-400">2.4 MB • PDF Document</p>
        </div>
        {scanStep < 4 && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />}
      </div>

      {/* Analysis Tasks */}
      <div className="space-y-4 mb-6">
        {/* OCR Analysis */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">OCR Analysis</span>
          {scanStep >= 1 ? (
            <span className="flex items-center text-emerald-600 font-semibold gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ready
            </span>
          ) : (
            <span className="text-slate-400 animate-pulse">Analyzing...</span>
          )}
        </div>

        {/* Ownership Check */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Ownership Check</span>
          {scanStep >= 2 ? (
            <span className="flex items-center text-emerald-600 font-semibold gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Clear
            </span>
          ) : scanStep >= 1 ? (
            <span className="text-indigo-600 animate-pulse flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Matching...
            </span>
          ) : (
            <span className="text-slate-400">Pending</span>
          )}
        </div>

        {/* Map Overlap */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Map Overlap Check</span>
          {scanStep >= 3 ? (
            <span className="flex items-center text-amber-600 font-semibold gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Overlap Detected (12%)
            </span>
          ) : scanStep >= 2 ? (
            <span className="text-indigo-600 animate-pulse flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
            </span>
          ) : (
            <span className="text-slate-400">Pending</span>
          )}
        </div>
      </div>

      {/* Risk / Trust Score Banner */}
      <div className={`mt-6 pt-6 border-t border-slate-100 transition-all duration-500 transform ${scanStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-2 pointer-events-none'}`}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Deed Risk Score</div>
            <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">87 / 100</div>
          </div>
          <div className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
