import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, type ReportDetail } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Filter, RefreshCw } from 'lucide-react';

// Custom Leaflet DivIcons for severity-pulsing map markers
const createCustomIcon = (severity?: string) => {
  const norm = (severity || 'MEDIUM').toUpperCase();
  let colorClass = 'bg-amber-500 border-amber-300 marker-pulse-medium';

  if (norm === 'CRITICAL' || norm === 'EXTREME') {
    colorClass = 'bg-red-500 border-red-300 marker-pulse-critical';
  } else if (norm === 'HIGH') {
    colorClass = 'bg-orange-500 border-orange-300 marker-pulse-high';
  } else if (norm === 'LOW') {
    colorClass = 'bg-emerald-500 border-emerald-300 marker-pulse-low';
  } else if (norm === 'NONE') {
    colorClass = 'bg-slate-500 border-slate-400';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="w-6 h-6 rounded-full border-2 ${colorClass} flex items-center justify-center text-white shadow-lg text-[10px] font-bold">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function AdminMap() {
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchReports = () => {
    setLoading(true);
    setError(null);
    api.getReports()
      .then(data => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("AdminMap fetch error:", err);
        setError(err.message || 'Failed to load report map data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports with valid numeric coordinates and active filter matching
  const mappedReports = useMemo(() => {
    return reports.filter(r => {
      const hasCoords = typeof r.location?.latitude === 'number' && typeof r.location?.longitude === 'number';
      if (!hasCoords) return false;

      const severityMatch = severityFilter === 'ALL' || (r.ai?.severity || 'UNKNOWN').toUpperCase() === severityFilter;
      const statusMatch = statusFilter === 'ALL' || (r.status || '').toLowerCase() === statusFilter.toLowerCase();

      return severityMatch && statusMatch;
    });
  }, [reports, severityFilter, statusFilter]);

  const centerLat = mappedReports.length > 0 ? mappedReports[0].location.latitude! : 13.0827;
  const centerLng = mappedReports.length > 0 ? mappedReports[0].location.longitude! : 80.2707;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">GIS Command Map</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              LEAFLET + OSM TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Spatial hazard positioning with severity pulse markers & instant report inspect.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Pins
          </button>
          <span className="px-3.5 py-1.5 bg-indigo-950/60 text-indigo-300 border border-indigo-800 rounded-xl text-xs font-mono font-semibold">
            {mappedReports.length} Mapped Hazards
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <Filter className="w-4 h-4 text-cyan-400" /> FILTER GIS STREAM:
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[11px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
              <option value="NONE">None Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="ai_processing">AI Processing</option>
              <option value="ai_verified">AI Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Marker Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden min-h-[600px] relative">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading GIS map telemetry...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-[600px] z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappedReports.map((report) => (
              <Marker
                key={report.report_id}
                position={[report.location.latitude!, report.location.longitude!]}
                icon={createCustomIcon(report.ai?.severity)}
              >
                <Popup>
                  <div className="p-2 min-w-[240px] text-slate-900 space-y-2">
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
                      <span className="font-mono text-xs font-bold text-indigo-700">{report.report_id}</span>
                      <StatusBadge status={report.status} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {report.location.road_name || 'Road Name Unspecified'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Lat: {report.location.latitude?.toFixed(4)}, Lng: {report.location.longitude?.toFixed(4)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <SeverityBadge severity={report.ai?.severity || 'MEDIUM'} size="sm" />
                      <PriorityBadge priority={report.ai?.priority || 'P2'} size="sm" />
                    </div>

                    <Link
                      to={`/admin/reports/${report.report_id}`}
                      className="mt-2 block text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Inspect Report Evidence Workspace →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
