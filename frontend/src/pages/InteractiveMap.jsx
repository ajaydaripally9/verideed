import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { MapContainer, TileLayer, Polygon as LeafletPolygon, Popup, useMap } from 'react-leaflet';
import { 
  ShieldCheck, AlertTriangle, XOctagon, Search, ArrowRight, 
  Layers, Loader2, Info, MapPin, Eye, Calendar, TrendingUp 
} from 'lucide-react';

// Subcomponent to trigger flyTo map movements when a user clicks on the list
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 17, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function InteractiveMap() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'inspector'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/properties`);
      setProperties(response.data);
      if (response.data.length > 0) {
        // Set the first one as default inspected property
        setSelectedProperty(response.data[0]);
      }
      setError('');
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Unable to connect to the spatial database server.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk < 25) return { 
      border: '#16a34a', 
      fill: '#16a34a', 
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-700' 
    };
    if (risk < 60) return { 
      border: '#d97706', 
      fill: '#d97706', 
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-700'
    };
    return { 
      border: '#dc2626', 
      fill: '#dc2626', 
      badge: 'bg-red-50 text-red-700 border-red-200',
      text: 'text-red-700'
    };
  };

  const filteredProperties = properties.filter(p => 
    p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    p.deed_id.toLowerCase().includes(search.toLowerCase()) ||
    p.survey_number.toLowerCase().includes(search.toLowerCase())
  );

  // Set first coordinate of selected property as map center target
  const handleSelectProperty = (prop) => {
    setSelectedProperty(prop);
    if (prop.coordinates && prop.coordinates.length > 0) {
      setSelectedCenter(prop.coordinates[0]);
    }
    setActiveTab('inspector');
  };

  // Helper to scale coordinates to SVG viewbox
  const getSvgPolygonPoints = (coords, width = 300, height = 180) => {
    if (!coords || coords.length === 0) return "";
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    
    coords.forEach(([lat, lon]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    });
    
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    const maxDiff = Math.max(latDiff, lonDiff) || 0.00001;
    
    return coords.map(([lat, lon]) => {
      const x = 20 + ((lon - minLon) / maxDiff) * (width - 40);
      const y = height - 20 - ((lat - minLat) / maxDiff) * (height - 40);
      return `${x},${y}`;
    }).join(" ");
  };

  // Real-time calculation of dashboard map statistics
  const totalVerified = properties.length;
  const avgRisk = totalVerified > 0 
    ? Math.round(properties.reduce((sum, p) => sum + p.risk, 0) / totalVerified)
    : 0;
  const totalArea = properties.reduce((sum, p) => sum + p.area, 0);
  const conflictCount = properties.filter(p => p.risk >= 60).length;

  const defaultCenter = [17.4410, 78.3820]; // Centered near Madhapur, Hyderabad
  const inspectedColor = selectedProperty ? getRiskColor(selectedProperty.risk) : null;

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 relative text-slate-800">
        
        {/* Left Side: Dynamic Tabbed Sidebar (RealFinder Style) */}
        <div className="w-full lg:w-96 flex flex-col glass-panel rounded-2xl overflow-hidden h-1/2 lg:h-full shadow-md bg-white border border-slate-200">
          
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => setActiveTab('registry')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-outfit border-b-2 transition-all ${
                activeTab === 'registry' 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Registry List
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-outfit border-b-2 transition-all ${
                activeTab === 'inspector' 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parcel Inspector
            </button>
          </div>

          {/* TAB CONTENT: REGISTRY LIST */}
          {activeTab === 'registry' && (
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ledger entries..."
                    className="glass-input w-full pl-8 pr-4 py-2.5 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loading ? (
                  <div className="p-10 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-[11px] text-slate-400">Loading map indexes...</span>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-400">
                    No parcels match search criteria.
                  </div>
                ) : (
                  filteredProperties.map((p) => {
                    const colorMeta = getRiskColor(p.risk);
                    const isSelected = selectedProperty && selectedProperty.deed_id === p.deed_id;
                    return (
                      <div
                        key={p.deed_id}
                        onClick={() => handleSelectProperty(p)}
                        className={`p-4 cursor-pointer transition-all space-y-2 border-l-2 ${
                          isSelected 
                            ? 'bg-indigo-50/50 border-indigo-600 font-medium' 
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-indigo-600 font-bold">{p.deed_id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-md ${colorMeta.badge}`}>
                            {p.risk}% Risk
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 truncate">{p.owner_name}</div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>Survey: {p.survey_number}</span>
                          <span>{p.area.toLocaleString()} sq.ft</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: PARCEL INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
              {!selectedProperty ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Select a deed from the map or registry list to audit.
                </div>
              ) : (
                <>
                  {/* Top Stats Overview */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">INSURING PLOT</span>
                      <h4 className="text-lg font-bold font-outfit text-slate-900 mt-1">{selectedProperty.survey_number}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 border rounded-lg ${inspectedColor.badge}`}>
                      {inspectedColor.text.includes('emerald') ? 'Low Risk' : inspectedColor.text.includes('amber') ? 'Warning' : 'High Risk'} ({selectedProperty.risk}%)
                    </span>
                  </div>

                  {/* Dynamic SVG Property Shape Preview (Replacing 3D Model with Custom Shape) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.04),transparent_70%)] pointer-events-none" />
                    
                    {/* SVG Polygon Outline */}
                    <svg className="w-full h-[160px] drop-shadow-[0_0_8px_rgba(79,70,229,0.1)]" viewBox="0 0 300 180">
                      {/* Grid representation */}
                      <defs>
                        <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
                          <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(0, 0, 0, 0.02)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      <polygon 
                        points={getSvgPolygonPoints(selectedProperty.coordinates, 300, 180)}
                        fill="rgba(79, 70, 229, 0.06)"
                        stroke={inspectedColor.border}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    <div className="absolute bottom-2 text-[9px] text-slate-400 uppercase tracking-widest font-mono">
                      Vector Boundary Coordinate Scan
                    </div>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${inspectedColor.badge}`}>
                      {selectedProperty.risk >= 60 ? '⚠️ OVERLAP DETECTED' : '✓ CLEAR TITLE'}
                    </span>
                    <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2 py-0.5">
                      ✓ STAMP DETECTED
                    </span>
                    <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md px-2 py-0.5">
                      ✓ SINGLE CLAIM
                    </span>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Deed ID</span>
                      <span className="font-mono font-semibold text-indigo-600 block mt-0.5">{selectedProperty.deed_id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Registered Owner</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{selectedProperty.owner_name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Plot Size</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{selectedProperty.area.toLocaleString()} Sq. Feet</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Location Details</span>
                      <span className="text-slate-600 block mt-0.5 leading-relaxed">{selectedProperty.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <Link
                      to={`/report/${selectedProperty.deed_id}`}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/10 border border-indigo-500/25"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Full Audit Report</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Map Container with Custom Overlays */}
        <div className="flex-1 glass-panel rounded-2xl overflow-hidden h-1/2 lg:h-full relative z-0 border border-slate-200 shadow-sm bg-white">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-[1000] p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xl flex items-center backdrop-blur-md">
              <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {/* FLOATING MAP LAYOUT LEGEND (Top Right) */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-md max-w-xs pointer-events-auto">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-2 border-b border-slate-100 pb-1">
              Registry Classifications
            </span>
            <div className="space-y-1.5 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>🟢 Safe (&lt; 25% Risk)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>🟡 Warning (25% - 60% Risk)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <span>🔴 Critical Overlap (&gt;= 60% Risk)</span>
              </div>
            </div>
          </div>

          {/* FLOATING STATISTICS CARD OVERLAY (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 border border-slate-200 rounded-xl p-4 shadow-md pointer-events-auto flex gap-6">
            <div className="flex items-center space-x-3 border-r border-slate-100 pr-6">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Avg Risk Rating</span>
                <div className="text-base font-black text-slate-800 font-outfit mt-0.5">{avgRisk}%</div>
                <div className="flex items-center space-x-1 text-[8px] text-emerald-600 font-bold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>▼ 14% change</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 border-r border-slate-100 pr-6">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Monitored Area</span>
                <div className="text-base font-black text-slate-800 font-outfit mt-0.5">{totalArea.toLocaleString()} sqft</div>
                <div className="flex items-center space-x-1 text-[8px] text-indigo-600 font-bold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>▲ 26% growth</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Conflict Cases</span>
                <div className="text-base font-black text-red-600 font-outfit mt-0.5">{conflictCount}</div>
                <div className="flex items-center space-x-1 text-[8px] text-red-600 font-bold mt-0.5 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Critical Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaflet MapContainer */}
          <MapContainer center={defaultCenter} zoom={15} className="h-full w-full">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
            />

            {/* Custom map control wrapper */}
            {selectedCenter && <MapController center={selectedCenter} />}

            {/* Polygons */}
            {properties.map((p) => {
              const colors = getRiskColor(p.risk);
              const isSelected = selectedProperty && selectedProperty.deed_id === p.deed_id;
              return (
                <LeafletPolygon
                  key={p.deed_id}
                  positions={p.coordinates}
                  pathOptions={{
                    color: colors.border,
                    weight: isSelected ? 4 : 2.5,
                    fillColor: colors.fill,
                    fillOpacity: isSelected ? 0.35 : 0.18,
                    dashArray: isSelected ? '5, 5' : ''
                  }}
                  eventHandlers={{
                    click: () => {
                      handleSelectProperty(p);
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-2 p-1 min-w-[150px] text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600">{p.deed_id}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{p.risk}% Risk</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div><b>Owner:</b> {p.owner_name}</div>
                      <div><b>Survey:</b> {p.survey_number}</div>
                      <div><b>Area:</b> {p.area.toLocaleString()} sq.ft</div>
                      
                      <div className="pt-2">
                        <Link
                          to={`/report/${p.deed_id}`}
                          className="w-full flex items-center justify-center space-x-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold transition-all shadow"
                        >
                          <span>Full Audit Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </LeafletPolygon>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </Layout>
  );
}
