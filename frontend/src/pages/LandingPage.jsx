import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles, Activity } from 'lucide-react';
import ThreeDDocument from '../components/ThreeDDocument';
import HeroAIScanner from '../components/HeroAIScanner';
import WorkflowSection from '../components/WorkflowSection';
import TrustReportPreview from '../components/TrustReportPreview';
import InteractiveMapPreview from '../components/InteractiveMapPreview';
import AIExplanation from '../components/AIExplanation';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-slate-200 md:px-12 backdrop-blur-md bg-white/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Shield className="w-6 h-6 animate-pulse-slow" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-outfit">
            Veri<span className="text-indigo-600">Deed</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-600 font-medium">
          <a href="#workflow" className="hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#maps" className="hover:text-indigo-600 transition-colors">Map Check</a>
          <a href="#tech" className="hover:text-indigo-600 transition-colors">Technology</a>
        </nav>
        <div>
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/10 border border-indigo-500/20 hover:scale-[1.02]">
            Launch Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Info */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Next-Gen Deed Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 font-outfit leading-[1.15]">
              Verify Property Before <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800">
                You Invest Your Life Savings
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
              AI-powered deed verification & property boundary intelligence. Protect your real estate acquisitions from overlaps, fake registries, and document manipulations.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link to="/login" className="group flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xl shadow-indigo-600/10 hover:scale-[1.01]">
                <span>🚀 Upload Deed & Verify</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#workflow" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all text-center">
                View Sample Report
              </a>
            </div>
          </div>

          {/* Hero Right AI Scanner Mock */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroAIScanner />
          </div>
        </div>

        {/* 3D Holographic Deed Feature Showcase */}
        <section className="mt-32 border-y border-slate-200 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Holographic Rendering
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-outfit text-slate-900">
                3D Document Verification
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Interact with the digital twin of your land conveyance. Our engine builds a spatial model of legal boundaries to audit alignments automatically.
              </p>
            </div>
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
              <ThreeDDocument />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <WorkflowSection />

        {/* Trust Dashboard Preview Section */}
        <TrustReportPreview />

        {/* Interactive Satellite Maps Section */}
        <div id="maps">
          <InteractiveMapPreview />
        </div>

        {/* AI Explanations Section */}
        <AIExplanation />

        {/* Technical Architecture */}
        <section id="tech" className="mt-24 border-t border-slate-200 pt-20">
          <div className="glass-panel max-w-5xl mx-auto rounded-3xl p-8 md:p-12 text-left relative overflow-hidden bg-white shadow-md">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/5 blur-[60px] rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3 font-outfit">
                  <Activity className="w-4 h-4" />
                  <span>Architecture</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 font-outfit">Production-Style Tech Stack</h2>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  VeriDeed is engineered with a decoupled service-oriented architecture: React for rich client interaction, Spring Boot REST gateway for transaction storage, Python FastAPI for image-to-text machine learning, and PostGIS for coordinate calculation.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">FRONTEND</div>
                  <div className="text-sm font-bold text-slate-800">React + Leaflet</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">BACKEND</div>
                  <div className="text-sm font-bold text-slate-800">Spring Boot 3</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">SPATIAL DATA</div>
                  <div className="text-sm font-bold text-slate-800">PostgreSQL + PostGIS</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">ML SERVICE</div>
                  <div className="text-sm font-bold text-slate-800">FastAPI + OCR</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 relative z-10 bg-white">
        <p>&copy; 2026 VeriDeed System Inc. All Rights Reserved. Sandbox Mode Active.</p>
      </footer>
    </div>
  );
}
