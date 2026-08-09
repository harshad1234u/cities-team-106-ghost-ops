import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ArrowLeft, Cpu, MapPin, AlertCircle, Sparkles, XCircle } from 'lucide-react';

export default function ReportStatus() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fetchReport = async () => {
      try {
        const data = await api.getReport(id);
        if (!isMounted) return;
        setReport(data);
        setLoading(false);

        // Smart Polling Performance Rule:
        // Poll ONLY while report status is in active processing state.
        // Stop polling when report reaches terminal states (ai_verified, engineer_verified, resolved, etc.)
        const st = (data?.status || '').toLowerCase();
        const isActiveProcessing = st === 'submitted' || st === 'ai_processing' || st === 'processing';
        
        if (isActiveProcessing) {
          timer = setTimeout(fetchReport, 4000);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load report status details');
        setLoading(false);
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto"><LoadingSkeleton type="detail" /></div>;
  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl max-w-md shadow-lg space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Report Status Unavailable</h3>
          <p className="text-xs text-slate-500">{error || 'Report not found'}</p>
          <Link to="/citizen" className="inline-block mt-2 text-xs font-semibold text-sky-700 hover:underline">
            ← Return to Citizen Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isNoPothole =
    report.ai?.no_pothole === true ||
    report.ai?.severity === 'NONE' ||
    (report.ai?.detection && report.ai.detection.count === 0);

  const statusStr = (report.status || '').toLowerCase();
  
  // Stages definition
  const stages = [
    { label: 'Submitted', key: 'submitted', done: true },
    { label: 'AI Processing', key: 'ai_processing', done: statusStr !== 'submitted' },
    { label: 'AI Verified', key: 'ai_verified', done: statusStr === 'ai_verified' || statusStr === 'engineer_verified' || statusStr === 'in_progress' || statusStr === 'resolved' },
    { label: 'Engineer Review', key: 'engineer_verified', done: statusStr === 'engineer_verified' || statusStr === 'in_progress' || statusStr === 'resolved' },
    { label: 'Repair & Resolution', key: 'resolved', done: statusStr === 'resolved' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-900">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Nav */}
        <div className="flex justify-between items-center">
          <Link to="/citizen" className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <span className="text-[11px] font-mono text-slate-400">Lifecycle Monitor</span>
        </div>

        {/* Main Status Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hazard Report Status</h1>
                <StatusBadge status={report.status} size="md" />
              </div>
              <p className="font-mono text-xs font-bold text-sky-700 mt-1">ID: {report.report_id}</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Submitted: {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Lifecycle Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Lifecycle Stages</h3>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {stages.map((stg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    stg.done
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[9px] font-mono text-slate-400 mb-0.5">0{idx + 1}</div>
                  <div>{stg.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence & AI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            {/* Left: Image Evidence */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Submitted Photo Evidence</h4>
              <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
                {report.image?.url ? (
                  <img src={report.image.url} alt="Reported Pothole" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                    <span>No Photo Attached</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">LOCATION METADATA</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  {report.location?.road_name || 'Location Recorded'}
                </p>
                {report.location?.landmark && (
                  <p className="text-slate-500 pl-4 text-[11px]">Landmark: {report.location.landmark}</p>
                )}
                {report.location?.latitude && (
                  <p className="font-mono text-[10px] text-slate-400 pl-4">
                    GPS: {report.location.latitude.toFixed(4)}, {report.location.longitude?.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Right: AI Intelligence Assessment */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Intelligence Assessment</h4>

              {isNoPothole ? (
                /* NO POTHOLE STATE */
                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-slate-500" />
                    <span>No Pothole Detected</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 font-mono">
                    <p>Severity: <strong className="text-slate-800">NONE</strong></p>
                    <p>Priority: <strong className="text-slate-800">NONE</strong></p>
                    <p>Estimated Cost: <strong className="text-slate-800">₹0</strong></p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] block">RECOMMENDATION</span>
                    <span className="font-medium text-slate-800">No Pothole Detected — No Repair Needed</span>
                  </div>
                </div>
              ) : report.ai ? (
                /* REGULAR AI RESULT */
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/50 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs">Roboflow + Nemotron</span>
                    </div>
                    <SeverityBadge severity={report.ai.severity || 'HIGH'} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-indigo-200">
                      <span>Detection Status:</span>
                      <span className="font-semibold text-emerald-400">Pothole Confirmed</span>
                    </div>
                    <div className="flex justify-between text-indigo-200">
                      <span>Estimated Repair Cost:</span>
                      <span className="font-mono font-bold text-white">
                        {typeof report.ai.estimated_cost === 'number' ? `₹${report.ai.estimated_cost.toLocaleString('en-IN')}` : (report.ai.estimated_cost || '₹12,500')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-indigo-800/80">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase block mb-1">REPAIR RECOMMENDATION</span>
                      <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                        {report.ai.repair_recommendation || report.ai.ai_summary || 'Standard asphalt patching with road sealing.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Cpu className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>AI Analysis In Progress</span>
                  </div>
                  <p className="text-amber-800">
                    Your report image is currently queued for Roboflow detection & Nemotron vision reasoning. Status will update automatically.
                  </p>
                </div>
              )}

              {/* Citizen Danger Flags */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">SUBMITTED RISK FLAGS</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {report.citizen_danger && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full font-semibold text-[11px]">
                      ⚡ High Danger Flag
                    </span>
                  )}
                  {report.water_visible && (
                    <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full font-semibold text-[11px]">
                      💧 Standing Water Present
                    </span>
                  )}
                  {!report.citizen_danger && !report.water_visible && (
                    <span className="text-slate-500 font-mono text-[11px]">Standard risk report</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
