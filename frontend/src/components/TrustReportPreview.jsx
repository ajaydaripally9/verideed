import React from 'react';
import { AlertTriangle, ShieldCheck, FileCheck, ShieldAlert, Award } from 'lucide-react';

export default function TrustReportPreview() {
  return (
    <section className="py-24 border-t border-slate-200 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full">
              Trust & Transparency
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 leading-tight">
              Instantly Audited Forensic Reports
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every analyzed deed generates a standardized property verification report. Verify layout integrity, coordinate boundaries, ownership records, and overlap data at a glance.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Standardized forensic checks for complete buyer clarity.</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <FileCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>Layout modeling detects stamp & font manipulations.</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Single Overall Trust Score based on spatial & legal checks.</span>
              </div>
            </div>
          </div>

          {/* Right Dashboard Mockup */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl border border-slate-200 p-6 md:p-8 bg-white relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
              
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest font-outfit">
                    PROPERTY VERIFICATION REPORT
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Report ID: V-REPORT-402A_09</p>
                </div>
                <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit">
                  <AlertTriangle className="w-3.5 h-3.5" /> Overlap Alert
                </div>
              </div>

              {/* Owner and Survey No */}
              <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Owner Name</span>
                  <span className="text-base font-bold text-slate-900 font-outfit mt-1 block">Raj Kumar</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Survey Number</span>
                  <span className="text-base font-bold text-slate-900 font-outfit mt-1 block">TS-402/A</span>
                </div>
              </div>

              {/* Metrics Progress bars */}
              <div className="space-y-5 py-6 border-b border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-500 font-medium">Document Authenticity</span>
                    <span className="text-slate-700 font-semibold font-mono">82%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-500 font-medium">Boundary Verification</span>
                    <span className="text-slate-700 font-semibold font-mono">61%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '61%' }}></div>
                  </div>
                </div>
              </div>

              {/* Overall trust score section */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    OVERALL TRUST SCORE
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900 font-outfit">74%</span>
                    <span className="text-xs text-amber-700 font-medium">Moderate Confidence</span>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start space-x-2.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Attention Required</span>
                    <span className="text-[10px] leading-relaxed opacity-85 block mt-0.5 text-amber-700">
                      Possible physical boundary overlap detected with adjacent Survey TS-402/B.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
