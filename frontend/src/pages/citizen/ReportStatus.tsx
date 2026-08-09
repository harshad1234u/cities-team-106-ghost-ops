import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';

export default function ReportStatus() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchReport = () => {
      api.getReport(id)
        .then(data => {
          setReport(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to load report details');
          setLoading(false);
        });
    };

    fetchReport();

    // Poll every 5 seconds if not yet verified
    const interval = setInterval(() => {
      if (report?.status !== 'AI_VERIFIED' && report?.status !== 'ENGINEER_VERIFIED') {
        fetchReport();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, report?.status]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading report status telemetry...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600 font-medium">{error}</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Report not found</div>;

  const isPotholeDetected = report.ai?.detection?.pothole_detected !== false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pothole Hazard Report Status</h1>
            <p className="font-mono text-xs text-slate-500 mt-0.5">Report ID: <strong className="text-civic-blue">{report.report_id}</strong></p>
          </div>
          <span className={`px-3 py-1 font-bold rounded-full text-xs uppercase tracking-wider ${
            report.status === 'ENGINEER_VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
            report.status === 'AI_VERIFIED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
            'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {report.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Image & AI Card */}
          <div className="space-y-4">
            {report.image?.url && !imgError ? (
              <img 
                src={report.image.url} 
                onError={() => setImgError(true)}
                alt="Reported Pothole" 
                className="w-full h-56 object-cover rounded-xl border border-slate-200 shadow-sm" 
              />
            ) : (
              <div className="w-full h-56 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-slate-500">Pothole Evidence Image</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{report.image?.path || 'Stored Image'}</span>
              </div>
            )}
            
            {report.ai && (
              <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/70 space-y-3">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <h3 className="text-indigo-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span>
                    <span>AI Computer Vision Analytics</span>
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {report.ai.severity || 'HIGH'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-indigo-950">
                  <div className="flex justify-between">
                    <span className="text-indigo-600 font-medium">Detection Result:</span>
                    <span className="font-bold">{isPotholeDetected ? 'Pothole Confirmed' : 'No Pothole'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600 font-medium">Risk Severity:</span>
                    <span className="font-bold text-rose-700">{report.ai.severity || 'HIGH'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600 font-medium">Repair Priority:</span>
                    <span className="font-bold">{report.ai.priority || 'P2'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600 font-medium">Est. Repair Cost:</span>
                    <span className="font-bold text-emerald-800">{report.ai.estimated_cost || '₹12,000 - ₹24,000'}</span>
                  </div>
                  <div className="pt-2 border-t border-indigo-100">
                    <span className="text-indigo-600 font-medium block mb-0.5">Engineering Directive:</span>
                    <span className="font-medium text-slate-800">{report.ai.repair_recommendation || 'Mill & Heavy Hot-Mix Patching'}</span>
                  </div>
                  {report.ai.ai_summary && (
                    <div className="text-[11px] text-indigo-900 italic pt-2 border-t border-indigo-100">
                      "{report.ai.ai_summary}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Citizen Details */}
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-400 font-semibold uppercase">Reported Timestamp</p>
              <p className="text-slate-800 font-mono text-xs">{new Date(report.created_at).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-400 font-semibold uppercase">Road Location</p>
              <p className="text-slate-800 font-bold text-sm">📍 {report.location?.road_name || 'Recorded Location'}</p>
              {report.location?.landmark && (
                <p className="text-slate-600">Landmark: {report.location.landmark}</p>
              )}
              {(report.location?.latitude && report.location?.longitude) && (
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">GPS: {report.location.latitude}, {report.location.longitude}</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-400 font-semibold uppercase">Citizen Description & Danger Flags</p>
              <p className="text-slate-800 font-medium">{report.description || 'No additional description provided.'}</p>
              <div className="flex gap-2 pt-2 flex-wrap">
                {report.citizen_danger && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px]">
                    ⚠ High Safety Hazard
                  </span>
                )}
                {report.water_visible && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]">
                    💧 Standing Water Present
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Link to="/citizen" className="text-civic-blue hover:underline font-semibold flex items-center gap-1">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
