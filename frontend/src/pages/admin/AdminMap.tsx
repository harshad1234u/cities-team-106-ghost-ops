import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, type ReportDetail } from '../../services/api';

// Fix default Leaflet icon paths in React bundle
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export default function AdminMap() {
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  // Filter reports with valid numeric coordinates
  const mappedReports = reports.filter(
    r => typeof r.location?.latitude === 'number' && typeof r.location?.longitude === 'number'
  );

  // Default center (Chennai) or first valid report coordinate
  const centerLat = mappedReports.length > 0 ? (mappedReports[0].location.latitude || 13.0827) : 13.0827;
  const centerLng = mappedReports.length > 0 ? (mappedReports[0].location.longitude || 80.2707) : 80.2707;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Map View</h1>
          <p className="text-slate-500 text-sm mt-1">Live OpenStreetMap telemetry and spatial hazard distribution.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
            OpenStreetMap Live
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
            {mappedReports.length} Mapped Hazards
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
          Loading OpenStreetMap telemetry...
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-xl border border-red-200 bg-red-50 text-center text-red-600 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Geolocation Reports</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{mappedReports.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Critical & High Priority</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {mappedReports.filter(r => r.ai?.priority === 'P0' || r.ai?.priority === 'P1' || r.ai?.severity === 'CRITICAL' || r.ai?.severity === 'HIGH').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">AI Verified Hazards</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {mappedReports.filter(r => r.status === 'AI_VERIFIED').length}
              </p>
            </div>
          </div>

          {/* Interactive OpenStreetMap Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px] relative">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={12}
              scrollWheelZoom={true}
              className="w-full h-[550px] z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mappedReports.map((report) => (
                <Marker
                  key={report.report_id}
                  position={[report.location.latitude!, report.location.longitude!]}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] text-slate-800">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-200">
                        <span className="font-mono text-xs font-bold text-slate-900">{report.report_id}</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mb-1 text-slate-900">{report.location.road_name || 'Road Name Unspecified'}</p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Lat: {report.location.latitude}, Long: {report.location.longitude}
                      </p>
                      {report.ai && (
                        <div className="bg-slate-50 p-2 rounded text-xs space-y-1 mb-2 border border-slate-200">
                          <div><span className="font-semibold text-slate-600">Severity:</span> <span className="font-bold">{report.ai.severity || 'N/A'}</span></div>
                          <div><span className="font-semibold text-slate-600">Priority:</span> <span className="font-bold">{report.ai.priority || 'N/A'}</span></div>
                          <div><span className="font-semibold text-slate-600">Cost Est:</span> <span>{report.ai.estimated_cost || 'N/A'}</span></div>
                        </div>
                      )}
                      <Link
                        to={`/admin/reports/${report.report_id}`}
                        className="block text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 rounded transition-colors"
                      >
                        Inspect Report Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
