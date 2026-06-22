import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { UploadCloud, File, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function UploadDeed() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

  const processingSteps = [
    "Reading uploaded file streams...",
    "Converting PDF pages to raw images...",
    "Running OCR engine character extractions...",
    "Executing LayoutLMv3 document structure analysis...",
    "Scanning word layout coordinates for anomalies...",
    "Resolving property boundary coordinates & compiling polygons...",
    "Checking spatial intersections via PostGIS engines...",
    "Calculating ownership cross-checks and final trust index...",
    "Saving report files into the spatial ledger..."
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith('.pdf')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError("Only PDF files are supported for deed verification.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgressStep(0);
    setError('');

    // Simulated progress timer to transition through steps
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/deeds/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(stepInterval);
      
      if (response.data && response.data.id) {
        navigate(`/report/${response.data.id}`);
      } else {
        setError("Invalid response received from the backend.");
        setLoading(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || 
        "Deed verification failed. Ensure both Spring Boot and FastAPI AI containers are running."
      );
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">Verify Property Deed</h1>
          <p className="text-slate-500 text-sm mt-1">Submit a registered Sale Deed PDF to evaluate boundaries and check layout forgery risks.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-sm text-red-800 animate-pulse-slow">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          /* Processing Loader View */
          <div className="glass-panel-glow p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5.5 h-5.5 text-indigo-600 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-outfit animate-pulse">Running Forensic Scan...</h3>
              <p className="text-slate-600 text-xs font-mono bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl inline-block max-w-md">
                {processingSteps[progressStep]}
              </p>
            </div>

            <div className="w-full max-w-md bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${((progressStep + 1) / processingSteps.length) * 100}%` }}
              />
            </div>
            
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Phase {progressStep + 1} of {processingSteps.length} &bull; Do not refresh
            </span>
          </div>
        ) : (
          /* Drag and drop view */
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`glass-panel p-16 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px] ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-10 h-10" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 font-outfit">Upload sale deed document</h3>
              <p className="text-slate-500 text-xs mt-1.5 max-w-xs">Drag and drop your PDF deed file here, or click to browse local files.</p>
              <span className="text-[10px] text-slate-400 mt-4 font-semibold uppercase tracking-wider">Supports PDF up to 10MB</span>
            </div>

            {/* Selected File Details */}
            {file && (
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-indigo-100 bg-indigo-50/20">
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-800 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>
                
                <button
                  onClick={handleUpload}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/20 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10"
                >
                  Analyze Document
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
