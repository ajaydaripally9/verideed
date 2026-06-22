import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { MapContainer, TileLayer, Polygon as LeafletPolygon, Popup } from 'react-leaflet';
import { 
  FileText, ShieldCheck, AlertTriangle, XOctagon, 
  Map as MapIcon, Landmark, User, FileSignature, 
  Calendar, Layers, CheckCircle2, ChevronRight, Loader2 
} from 'lucide-react';

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch report details
      const reportRes = await axios.get(`${API_URL}/api/deeds/${id}/report`);
      setReport(reportRes.data);

      // Fetch all properties to show surrounding borders on the map
      const propertiesRes = await axios.get(`${API_URL}/api/properties`);
      setAllProperties(propertiesRes.data);
      
      setError('');
    } catch (err) {
      console.error("Error fetching report details:", err);
      setError("Failed to retrieve forensic audit data. Verify backend server connections.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <span className="text-sm text-slate-500">Loading document forensic analysis...</span>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-xl mx-auto space-y-4 text-slate-800">
          <XOctagon className="w-12 h-12 text-red-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Failed to Load Report</h3>
          <p className="text-slate-600 text-sm">{error || "The requested deed report could not be found."}</p>
          <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  // Get risk categories
  const getRiskColor = (risk) => {
    if (risk < 25) return { text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50', hex: '#16a34a', label: 'SAFE' };
    if (risk < 60) return { text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50', hex: '#d97706', label: 'WARNING' };
    return { text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50', hex: '#dc2626', label: 'DANGER' };
  };

  const riskMeta = getRiskColor(report.final_risk);
  const layoutAnalysis = report.details?.layout_analysis || {};
  const spatialAnalysis = report.details?.spatial_analysis || {};
  const ownershipAnalysis = report.details?.ownership_analysis || {};
  const deedCoords = spatialAnalysis.coordinates || [];

  // Center coordinate for the map
  const mapCenter = deedCoords.length > 0 ? deedCoords[0] : [17.4410, 78.3820];

  return (
    <Layout>
      <div className="space-y-8 text-slate-800">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 font-mono">{report.id}</span>
        </div>

        {/* Title and Overall Risk Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Metadata info */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Property Trust Report</h1>
            <p className="text-slate-500 text-sm">Forensic audit findings and spatial overlay analysis for the deed registry entry.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Reported Owner</span>
                  <div className="text-sm font-bold text-slate-800">{report.owner_name}</div>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
                <Landmark className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Survey Number</span>
                  <div className="text-sm font-bold text-slate-800">{report.survey_number}</div>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
                <Layers className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Calculated Plot Size</span>
                  <div className="text-sm font-bold text-slate-800">{report.area.toLocaleString()} sq.ft</div>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Verification Date</span>
                  <div className="text-sm font-bold text-slate-800">
                    {new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Dial Card */}
          <div className={`glass-panel p-6 rounded-2xl border ${riskMeta.border} ${riskMeta.bg} text-center space-y-4`}>
            <span className="text-xs font-bold tracking-widest uppercase opacity-85 text-slate-600">Final Risk Assessment</span>
            <div className="relative flex items-center justify-center py-2">
              <div className="text-5xl font-extrabold font-outfit text-slate-900 tracking-tight">
                {report.final_risk}%
              </div>
            </div>
            <div className={`inline-block px-4 py-1.5 rounded-lg border font-bold text-xs ${riskMeta.text} ${riskMeta.border} bg-white/60 shadow-sm`}>
              RISK STATE: {riskMeta.label}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed px-2">
              {report.final_risk < 25 
                ? "This document exhibits standard layout formatting and does not overlap registered land boundaries." 
                : report.final_risk < 60
                ? "Warnings detected. Layout mismatch flags or slight coordinates overlaps require further legal review."
                : "Danger flags raised. Evidence suggests document modification, layout tampering, or land parcel overlaps."}
            </p>
          </div>
        </div>

        {/* Diagnostic Report Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel: Checks checklist */}
          <div className="space-y-6">
            {/* 1. Layout Integrity AI */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold font-outfit text-slate-800 flex items-center space-x-2">
                  <FileSignature className="w-5 h-5 text-indigo-600" />
                  <span>Document Layout Analysis</span>
                </h3>
                <span className={`text-xs font-mono font-bold ${layoutAnalysis.score >= 80 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Score: {layoutAnalysis.score}%
                </span>
              </div>
              
              {layoutAnalysis.issues?.length === 0 ? (
                <div className="flex items-center space-x-2.5 text-sm text-emerald-700 py-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>No layout anomalies or copy-paste font overlays detected.</span>
                </div>
              ) : (
                <ul className="space-y-2.5 py-1">
                  {layoutAnalysis.issues?.map((issue, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 2. Boundary Overlap Check */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold font-outfit text-slate-800 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Boundary Overlap Statistics</span>
                </h3>
                <span className={`text-xs font-mono font-bold ${report.overlap_score === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Overlap: {spatialAnalysis.max_overlap_percentage || 0}%
                </span>
              </div>

              {spatialAnalysis.overlaps?.length === 0 ? (
                <div className="flex items-center space-x-2.5 text-sm text-emerald-700 py-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Zero geographic overlaps calculated. Boundary limits are vacant.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-red-600 font-semibold flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    Conflict detected with existing deeds:
                  </p>
                  <ul className="space-y-2 divide-y divide-slate-100">
                    {spatialAnalysis.overlaps?.map((ov, idx) => (
                      <li key={idx} className="flex items-center justify-between pt-2 first:pt-0 text-xs text-slate-600">
                        <span className="font-mono text-slate-500">{ov.deed_id} ({ov.owner_name})</span>
                        <span className="font-bold text-red-600">{ov.overlap_percentage}% Overlap</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 3. Ownership Validation */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold font-outfit text-slate-800 flex items-center space-x-2">
                  <Landmark className="w-5 h-5 text-purple-600" />
                  <span>Ownership Mismatch Checks</span>
                </h3>
                <span className={`text-xs font-mono font-bold ${ownershipAnalysis.conflict_score === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Conflicts: {ownershipAnalysis.conflict_score > 0 ? '1' : '0'}
                </span>
              </div>

              {ownershipAnalysis.issues?.length === 0 ? (
                <div className="flex items-center space-x-2.5 text-sm text-emerald-700 py-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>No survey registry double-claims found for '{report.owner_name}'.</span>
                </div>
              ) : (
                <ul className="space-y-2.5 py-1">
                  {ownershipAnalysis.issues?.map((issue, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                      <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right panel: Map */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[520px] relative">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold font-outfit text-slate-800 flex items-center space-x-2">
                <MapIcon className="w-4.5 h-4.5 text-slate-500" />
                <span>Boundary Polygon Map</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Madhapur Area View</span>
            </div>

            <div className="flex-1 z-0 relative">
              {deedCoords.length > 0 ? (
                <MapContainer center={mapCenter} zoom={16} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
                  />
                  
                  {/* Surrounding registered properties */}
                  {allProperties
                    .filter(p => p.deed_id !== report.id)
                    .map((p) => (
                      <LeafletPolygon
                        key={p.deed_id}
                        positions={p.coordinates}
                        pathOptions={{ color: '#16a34a', weight: 1.5, fillColor: '#16a34a', fillOpacity: 0.15 }}
                      >
                        <Popup>
                          <div className="text-xs space-y-1 text-slate-800">
                            <div className="font-bold text-slate-900">{p.deed_id}</div>
                            <div>Owner: {p.owner_name}</div>
                            <div>Survey: {p.survey_number}</div>
                          </div>
                        </Popup>
                      </LeafletPolygon>
                    ))}

                  {/* Highlighting Overlapping Properties (re-draw in red if they intersect) */}
                  {spatialAnalysis.overlaps?.map((ov) => {
                    const matchedProp = allProperties.find(p => p.deed_id === ov.deed_id);
                    if (!matchedProp) return null;
                    return (
                      <LeafletPolygon
                        key={`overlap-${ov.deed_id}`}
                        positions={matchedProp.coordinates}
                        pathOptions={{ color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.3 }}
                      >
                        <Popup>
                          <div className="text-xs text-red-700 space-y-1">
                            <div className="font-bold">CONFLICT: {matchedProp.deed_id}</div>
                            <div>Owner: {matchedProp.owner_name}</div>
                            <div>Overlap: {ov.overlap_percentage}%</div>
                          </div>
                        </Popup>
                      </LeafletPolygon>
                    );
                  })}

                  {/* Current Analyzed Deed Boundary */}
                  <LeafletPolygon
                    positions={deedCoords}
                    pathOptions={{ 
                      color: report.final_risk >= 60 ? '#dc2626' : report.final_risk >= 25 ? '#d97706' : '#4f46e5', 
                      weight: 3, 
                      fillColor: report.final_risk >= 60 ? '#dc2626' : report.final_risk >= 25 ? '#d97706' : '#4f46e5', 
                      fillOpacity: 0.35 
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1 text-slate-800">
                        <div className="font-bold text-indigo-600">ANALYZING: {report.id}</div>
                        <div>Survey: {report.survey_number}</div>
                        <div>Owner: {report.owner_name}</div>
                      </div>
                    </Popup>
                  </LeafletPolygon>
                </MapContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                  Coordinate arrays absent. Map unavailable.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 font-semibold flex items-center justify-center space-x-4">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-600 mr-1.5" /> Checked Deed</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1.5" /> Spatial Overlap</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5" /> Registered Land</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
