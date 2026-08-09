import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';

export default function CommandCenter() {
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
        console.error("CommandCenter fetch error:", err);
        setError(err.message || 'Failed to load report data');
        setLoading(false);
      });
  }, []);

  const totalReports = reports.length;
  const criticalHazards = reports.filter(
    r => r.ai?.priority === 'P0' || r.ai?.priority === 'P1' || r.ai?.severity === 'CRITICAL' || r.ai?.severity === 'HIGH'
  ).length;
  const aiVerifiedCount = reports.filter(r => r.status === 'AI_VERIFIED').length;
  const aiVerifyRate = totalReports > 0 ? Math.round((aiVerifiedCount / totalReports) * 100) : 0;
  const potholesDetected = reports.filter(r => r.ai?.detection?.pothole_detected).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Command Center</h2>
          <p className="text-slate-500">Live operational overview and AI intelligence analytics.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-500 shadow-sm">
          Loading live system data...
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-lg border border-red-200 bg-red-50 text-center text-red-600 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{totalReports}</span>
                <span className="text-xs font-medium text-slate-500">Reports</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">P0 / P1 Hazards</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-600">{criticalHazards}</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Action Needed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Verification Rate</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-600">{aiVerifyRate}%</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{aiVerifiedCount} Verified</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potholes Confirmed</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-indigo-600">{potholesDetected}</span>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">AI Verified</span>
              </div>
            </div>
          </div>

          {/* Map & Recent Alerts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Live Location Coordinates Distribution */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Geographical Distribution</h3>
                  <span className="text-xs font-medium text-slate-500">{reports.length} Active Coordinates</span>
                </div>
                {reports.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No GPS report coordinates recorded yet.</div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {reports.map((report) => (
                      <div key={report.report_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            📍
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{report.location?.road_name || 'Road Location Unspecified'}</p>
                            <p className="text-xs font-mono text-slate-500">
                              Lat: {report.location?.latitude ?? 'N/A'}, Long: {report.location?.longitude ?? 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                            report.ai?.severity === 'CRITICAL' || report.ai?.priority === 'P0' ? 'bg-red-100 text-red-700' :
                            report.ai?.severity === 'HIGH' || report.ai?.priority === 'P1' ? 'bg-orange-100 text-orange-700' :
                            report.ai?.severity === 'MEDIUM' || report.ai?.priority === 'P2' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {report.ai?.priority || report.ai?.severity || report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Live Alerts */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Alerts</h3>
                  <Link to="/admin/reports" className="text-xs text-blue-600 hover:underline font-semibold">View All →</Link>
                </div>
                {reports.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No recent report alerts.</div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.report_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-semibold text-slate-700">{report.report_id}</span>
                          <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{report.location?.road_name || 'Location N/A'}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-semibold text-slate-500">
                            {report.ai?.repair_recommendation || 'AI Processing Pending'}
                          </span>
                          <Link to={`/admin/reports/${report.report_id}`} className="text-xs font-bold text-blue-600 hover:underline">
                            Inspect
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
