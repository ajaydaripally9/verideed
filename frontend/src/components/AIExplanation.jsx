import React from 'react';
import { Eye, ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export default function AIExplanation() {
  const flags = [
    {
      title: "Different Font Pattern Detected",
      description: "Text in Section 3 uses a modified Arial variant, mismatching the primary Times New Roman typography.",
      severity: "High"
    },
    {
      title: "Stamp Position Mismatch",
      description: "Sub-registrar digital stamp is offset by 15.4px compared to historical verification seals.",
      severity: "Medium"
    },
    {
      title: "Survey Number Inconsistency",
      description: "Extracted survey code TS-402/A does not match the geographic coordinate boundary index TS-402/B.",
      severity: "Critical"
    }
  ];

  return (
    <section className="py-24 border-t border-slate-200 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Flags Card */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl border border-slate-200 p-6 md:p-8 bg-white relative overflow-hidden shadow-md">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-red-55 border border-red-100 text-red-600 rounded-lg">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-outfit">
                    AI Forensic Flags
                  </h3>
                  <p className="text-[10px] text-slate-500">Why AI flagged this deed</p>
                </div>
              </div>

              {/* Flags list */}
              <div className="space-y-4">
                {flags.map((flag, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-red-200 transition-all flex items-start space-x-3.5 group">
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-outfit flex items-center space-x-2">
                        <span>{flag.title}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                          flag.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                          flag.severity === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {flag.severity}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{flag.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Text & Confidence Meter */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
              Explainable AI (XAI)
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 leading-tight">
              Explainable Forgery Flagging
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We believe machine learning models shouldn't be a black box. VeriDeed exposes the precise criteria that triggered a low confidence or mismatch rating, with pixel-level highlights in our portal.
            </p>

            {/* Confidence Display */}
            <div className="bg-slate-100/55 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Model Confidence</span>
                  <span className="text-2xl font-bold text-slate-800 font-outfit mt-1 block">91% Accuracy</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-r-transparent animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
