import React from 'react';
import { Upload, Cpu, UserCheck, Map, Sparkles } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Upload Deed",
      description: "Upload your Sale Deed or Land Conveyance PDF in seconds.",
      color: "from-indigo-50/50 to-indigo-50/10",
      borderColor: "border-indigo-100",
      textColor: "text-indigo-600"
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "AI Reads Deed",
      description: "Custom layout models parse text and extract surveyor coordinates.",
      color: "from-blue-50/50 to-blue-50/10",
      borderColor: "border-blue-100",
      textColor: "text-blue-600"
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "Checks Ownership",
      description: "Cross-checks records with government databases for multi-claims.",
      color: "from-purple-50/50 to-purple-50/10",
      borderColor: "border-purple-100",
      textColor: "text-purple-600"
    },
    {
      icon: <Map className="w-5 h-5" />,
      title: "Maps Property",
      description: "Draws boundaries on interactive satellite maps to spot overlap.",
      color: "from-pink-50/50 to-pink-50/10",
      borderColor: "border-pink-100",
      textColor: "text-pink-600"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Trust Score",
      description: "Generate a comprehensive, ready-to-download risk report.",
      color: "from-emerald-50/50 to-emerald-50/10",
      borderColor: "border-emerald-100",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <section id="workflow" className="relative py-24 border-t border-slate-200">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
        <div className="mb-16">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
            Transparent Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 mt-4">
            How VeriDeed Secures Your Investment
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2">
            Automated boundary checks and forensic scans operating in real-time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connector line (Desktop only) */}
              {idx < 4 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-[1px] bg-gradient-to-r from-slate-200 to-transparent z-0 pointer-events-none" />
              )}

              {/* Step Card */}
              <div className={`relative z-10 glass-panel p-6 rounded-2xl border ${step.borderColor} bg-gradient-to-b ${step.color} hover:scale-[1.03] transition-all duration-300 text-left h-full flex flex-col bg-white`}>
                <div className={`p-3 bg-white border border-slate-200 ${step.textColor} rounded-xl w-fit mb-6 group-hover:scale-110 transition-all`}>
                  {step.icon}
                </div>
                
                <div className="text-[10px] font-mono text-slate-500 font-bold uppercase mb-1">
                  Step 0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-800 font-outfit mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
