import React, { useState } from 'react';
import { ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, MapPin, Eye, Info } from 'lucide-react';

export default function InteractiveMapPreview() {
  const [selectedPlot, setSelectedPlot] = useState('conflict'); // 'plot-a', 'plot-b', 'conflict'
  const [zoomLevel, setZoomLevel] = useState(1);

  const plots = {
    'plot-a': {
      title: "Plot A (Survey TS-402/A)",
      owner: "Raj Kumar",
      history: ["Raj Kumar (2020 - Present)", "Sunita Devi (2012 - 2020)", "Vijay Mall (2004 - 2012)"],
      status: "Safe",
      color: "text-emerald-700"
    },
    'plot-b': {
      title: "Plot B (Survey TS-402/B)",
      owner: "Suresh Reddy",
      history: ["Suresh Reddy (2022 - Present)", "Pratap Rao (2018 - 2022)"],
      status: "Safe",
      color: "text-emerald-700"
    },
    'conflict': {
      title: "Boundary Overlap Region",
      owner: "Disputed Claim",
      history: ["Conflict detected at south-east coordinates", "Requires manual survey validation"],
      status: "12% Overlap Danger",
      color: "text-red-700 font-bold animate-pulse"
    }
  };

  return (
    <section className="py-24 border-t border-slate-200 bg-white relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
            Spatial Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 mt-4">
            Interactive Spatial Map Verification
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2">
            Click plots and conflict regions to inspect owner deeds and trace historical land transfers.
          </p>
        </div>

        {/* Map and Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
          
          {/* Left Column: Simulated Satellite Map */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl h-[450px] relative overflow-hidden flex items-center justify-center">
            
            {/* Topography & Sat grid simulation background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-200/30 via-transparent to-transparent pointer-events-none" />

            {/* Map Graphics Wrapper */}
            <div 
              className="relative transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Plot A */}
              <button 
                onClick={() => setSelectedPlot('plot-a')}
                className={`absolute left-[-110px] top-[-90px] w-[180px] h-[120px] rounded-lg border-2 transition-all focus:outline-none flex flex-col items-center justify-center ${selectedPlot === 'plot-a' ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-100/50 scale-[1.03] shadow-md' : 'border-emerald-500/35 hover:border-emerald-500 bg-emerald-50/40'}`}
              >
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider">PLOT A</span>
                <span className="text-[8px] text-slate-500">Raj Kumar</span>
              </button>

              {/* Overlapping Intersection Area */}
              <button 
                onClick={() => setSelectedPlot('conflict')}
                className={`absolute left-[50px] top-[-30px] w-[60px] h-[60px] rounded-md border-2 border-dashed z-20 cursor-pointer transition-all flex flex-col items-center justify-center ${selectedPlot === 'conflict' ? 'border-red-500 ring-2 ring-red-100 bg-red-100/50 scale-[1.03] shadow-md' : 'border-red-500/40 hover:border-red-500 bg-red-50/50 animate-pulse'}`}
              >
                <AlertTriangle className="w-5.5 h-5.5 text-red-500" />
                <span className="text-[7px] font-bold text-red-700 mt-0.5">CONFLICT</span>
              </button>

              {/* Plot B */}
              <button 
                onClick={() => setSelectedPlot('plot-b')}
                className={`absolute left-[90px] top-[-10px] w-[180px] h-[120px] rounded-lg border-2 transition-all focus:outline-none flex flex-col items-center justify-center ${selectedPlot === 'plot-b' ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-100/50 scale-[1.03] shadow-md' : 'border-indigo-500/35 hover:border-indigo-500 bg-indigo-50/40'}`}
              >
                <span className="text-[10px] font-bold text-indigo-700 tracking-wider">PLOT B</span>
                <span className="text-[8px] text-slate-500">Suresh Reddy</span>
              </button>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-5 left-5 flex space-x-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm z-30">
              <button 
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 2))}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-800 transition-all border border-slate-200/60 focus:outline-none"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 0.75))}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-800 transition-all border border-slate-200/60 focus:outline-none"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-5 left-5 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-sm z-30">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-700 font-outfit">⚠ 12% overlap detected</span>
            </div>
          </div>

          {/* Right Column: Properties Details Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold font-outfit text-slate-900">Spatial Inspector</h3>
                <p className="text-xs text-slate-500 mt-1">Select a plot/region on the map to audit ownership chain.</p>
              </div>

              {/* Selected plot data display */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Selected Component</span>
                  <span className="text-sm font-bold text-slate-800 block mt-1 font-outfit">{plots[selectedPlot].title}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Owner / Claimant</span>
                  <span className="text-sm font-semibold text-slate-700 block mt-1">{plots[selectedPlot].owner}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">History / Log</span>
                  <div className="space-y-2">
                    {plots[selectedPlot].history.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50/50 border border-slate-200/60 px-3 py-2 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Button */}
            <div className="pt-6 border-t border-slate-200 mt-6">
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex items-start space-x-3 text-xs">
                <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 leading-relaxed">
                  Verify the alignment by comparing original deeds directly inside the portal interface.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
