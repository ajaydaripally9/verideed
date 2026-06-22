import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { FileText, ShieldCheck, AlertTriangle, XOctagon, Search, FileSignature, ArrowRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/properties`);
      setProperties(response.data);
      setError('');
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError('Unable to reach the backend Spring Boot API. Make sure it is running on port 8085.');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalVerified = properties.length;
  const safeCount = properties.filter(p => p.risk < 25).length;
  const warningCount = properties.filter(p => p.risk >= 25 && p.risk < 60).length;
  const dangerCount = properties.filter(p => p.risk >= 60).length;

  const filteredProperties = properties.filter(p => 
    p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    p.deed_id.toLowerCase().includes(search.toLowerCase()) ||
    p.survey_number.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskBadge = (risk) => {
    if (risk < 25) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Safe ({risk}%)
        </span>
      );
    } else if (risk < 60) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          Warning ({risk}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <XOctagon className="w-3.5 h-3.5 mr-1" />
          Danger ({risk}%)
        </span>
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Verification Ledger</h1>
            <p className="text-slate-500 text-sm mt-1">Audit log of analyzed property conveyances and forensic assessments.</p>
          </div>
          <Link to="/upload-deed" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition-all border border-indigo-400/20 hover:scale-[1.02] text-center">
            Upload New Deed
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Backend Disconnected</p>
              <p className="mt-1 text-xs opacity-90">{error}</p>
              <button onClick={fetchProperties} className="mt-3 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200 transition-all text-xs font-semibold text-amber-900">
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-outfit text-slate-900">{totalVerified}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total Documents</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-outfit text-slate-900">{safeCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">Verified Properties</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <XOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-outfit text-slate-900">{dangerCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">Risk Detected</div>
            </div>
          </div>
        </div>

        {/* Search and Table Grid */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold font-outfit text-slate-800 flex items-center space-x-2">
              <FileSignature className="w-5 h-5 text-slate-500" />
              <span>Deed Archives</span>
            </h3>
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by owner, ID, or survey number..."
                className="glass-input w-full pl-9 pr-4 py-2 text-xs rounded-xl"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-sm text-slate-500">Loading spatial ledger...</span>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-20 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-base font-semibold text-slate-600 font-outfit">No Deeds Found</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">Upload a Sale Deed PDF or try searching another survey/owner term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Deed ID</th>
                    <th className="px-6 py-4">Owner Name</th>
                    <th className="px-6 py-4">Survey Code</th>
                    <th className="px-6 py-4">Plot Size</th>
                    <th className="px-6 py-4">Geographic Location</th>
                    <th className="px-6 py-4">Risk Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProperties.map((prop) => (
                    <tr key={prop.deed_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-semibold">{prop.deed_id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{prop.owner_name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">{prop.survey_number}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{prop.area.toLocaleString()} sq.ft</td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{prop.location}</td>
                      <td className="px-6 py-4">{getRiskBadge(prop.risk)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/report/${prop.deed_id}`} className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-all">
                          <span>Forensic Report</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
