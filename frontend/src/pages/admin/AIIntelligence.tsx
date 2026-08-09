import { useEffect, useState } from 'react';
import { api, type ReportDetail } from '../../services/api';

export default function AIIntelligence() {
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then(data => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalDetections = reports.filter(r => r.ai?.severity && r.ai?.severity !== 'NONE').length;
  const criticalCount = reports.filter(r => r.ai?.severity === 'CRITICAL' || r.ai?.priority === 'P1').length;
  const highCount = reports.filter(r => r.ai?.severity === 'HIGH' || r.ai?.priority === 'P2').length;
  const mediumCount = reports.filter(r => r.ai?.severity === 'MEDIUM' || r.ai?.priority === 'P3').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Intelligence & Anomaly Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time Roboflow vision detection, Nemotron reasoning, & risk engine metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            AI Pipeline Active
          </span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potholes Detected</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{totalDetections}</div>
          <div className="text-xs text-slate-500 mt-1">Verified by Roboflow Model v2</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Critical Road Risks</div>
          <div className="text-3xl font-bold text-rose-600 mt-2">{criticalCount}</div>
          <div className="text-xs text-rose-400 mt-1">Requires Immediate Repair</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">High Priority</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{highCount}</div>
          <div className="text-xs text-slate-500 mt-1">Scheduled for inspection</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Moderate Risks</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{mediumCount}</div>
          <div className="text-xs text-slate-500 mt-1">Monitored by Risk Engine</div>
        </div>
      </div>

      {/* AI Pipeline Health Status */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Multi-Stage AI Pipeline Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">1. Roboflow Vision API</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">Classifies potholes and bounding box coordinates</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">2. NVIDIA Nemotron AI</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">Generates visual depth analysis & structural hazard summary</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">3. Deterministic Risk Engine</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">Computes non-hallucinated severity, priority & cost estimates</p>
          </div>
        </div>
      </div>

      {/* AI Analysis List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">AI Intelligence Reports</h2>
          <span className="text-xs text-slate-500 font-mono">{reports.length} Reports Analyzed</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading AI intelligence telemetry...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No reports analyzed yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.report_id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                <div className="flex gap-4 items-center">
                  {report.image?.url ? (
                    <img src={report.image.url} alt="Pothole" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">No image</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{report.report_id}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        report.ai?.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        report.ai?.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        report.ai?.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {report.ai?.severity || 'UNPROCESSED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {report.location?.road_name || 'Location recorded'} • {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    {report.ai?.ai_summary && (
                      <p className="text-xs text-slate-600 italic mt-1 max-w-xl line-clamp-1">"{report.ai.ai_summary}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {report.ai?.estimated_cost && (
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase font-semibold">Est. Cost</span>
                      <span className="font-bold text-slate-800 font-mono">{typeof report.ai.estimated_cost === 'string' ? report.ai.estimated_cost : JSON.stringify(report.ai.estimated_cost)}</span>
                    </div>
                  )}
                  <a href={`/admin/reports/${report.report_id}`} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors">
                    View Intelligence
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
