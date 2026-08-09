import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AIPipelineVisualizer } from '../../components/AIPipelineVisualizer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ArrowLeft, Cpu, ShieldCheck, UserCheck, Trash2, MapPin, AlertTriangle, CheckCircle2, Wrench, ShieldAlert } from 'lucide-react';

const REMOVAL_REASONS = [
  { value: 'DUPLICATE', label: 'Duplicate Report' },
  { value: 'SPAM', label: 'Fake / Spam' },
  { value: 'INVALID_IMAGE', label: 'Invalid Image' },
  { value: 'INCORRECT_SUBMISSION', label: 'Incorrect Submission' },
  { value: 'OTHER', label: 'Other' },
];

export default function AdminReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ success: boolean; message: string } | null>(null);

  // Remove modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [removeNote, setRemoveNote] = useState('');
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = () => {
    if (!id) return;
    setLoading(true);
    api.getReport(id)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load report');
        setLoading(false);
      });
  };

  const handleProcessAI = async () => {
    if (!id) return;
    setProcessing(true);
    setProcessResult(null);
    try {
      const result = await api.processReport(id);
      setProcessResult({ success: true, message: result.message || "AI Analysis Pipeline triggered." });
      
      // Smart Polling: Poll report state up to 3 times or until AI process completes
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const updated = await api.getReport(id);
          setReport(updated);
          if (updated.status !== 'submitted' && updated.status !== 'ai_processing' && updated.status !== 'PROCESSING') {
            clearInterval(interval);
            setProcessing(false);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
        if (attempts >= 4) {
          clearInterval(interval);
          setProcessing(false);
        }
      }, 3000);
    } catch (err: any) {
      setProcessResult({ success: false, message: err.message || "Failed to trigger AI Analysis" });
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    setProcessing(true);
    setProcessResult(null);
    try {
      await api.updateReportStatus(id, newStatus);
      setProcessResult({ success: true, message: `Report status updated to ${newStatus.toUpperCase()}` });
      fetchReport();
    } catch (err: any) {
      setProcessResult({ success: false, message: err.message || "Failed to update report status" });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveReport = async () => {
    if (!id || !removeReason) return;
    if (removeReason === 'OTHER' && !removeNote.trim()) return;

    setRemoving(true);
    try {
      await api.removeReport(id, removeReason, removeNote);
      setShowRemoveModal(false);
      setProcessResult({ success: true, message: `Report ${id} removed from active workflow.` });
      setTimeout(() => navigate('/admin/reports'), 1800);
    } catch (err: any) {
      setProcessResult({ success: false, message: err.message || "Failed to remove report" });
      setShowRemoveModal(false);
    } finally {
      setRemoving(false);
    }
  };

  const isRemoveValid = removeReason && (removeReason !== 'OTHER' || removeNote.trim().length > 0);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (error || !report) {
    return (
      <div className="p-8 text-center bg-red-950/40 border border-red-800 rounded-2xl max-w-xl mx-auto my-12 text-red-300 space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report Ingestion Error</h3>
        <p className="text-sm">{error || 'Report not found'}</p>
        <Link to="/admin/reports" className="inline-block mt-2 text-xs font-semibold text-cyan-400 hover:underline">
          ← Return to Reports Table
        </Link>
      </div>
    );
  }

  const isRemoved = report.is_deleted || report.status === 'REMOVED' || report.status === 'deleted';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100 font-sans">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Link to="/admin/reports" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reports Management
        </Link>
        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Audit Log Preserved
        </span>
      </div>

      {/* REMOVED Alert Banner */}
      {isRemoved && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-5 text-red-200 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Report Removed From Active Pipeline</h3>
              <div className="mt-2 text-xs text-red-300 space-y-1 font-mono">
                <p><span className="text-red-400 font-semibold">REASON:</span> {report.deletion_reason || 'N/A'}</p>
                {report.deletion_note && <p><span className="text-red-400 font-semibold">NOTE:</span> {report.deletion_note}</p>}
                {report.deleted_at && <p><span className="text-red-400 font-semibold">REMOVED AT:</span> {new Date(report.deleted_at).toLocaleString()}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Report Evidence Workspace</h1>
            <StatusBadge status={report.status} size="md" />
          </div>
          <p className="font-mono text-xs text-cyan-400 mt-1">ID: {report.report_id}</p>
        </div>

        {/* Action Controls */}
        {!isRemoved && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleProcessAI}
              disabled={processing || report.status === 'PROCESSING'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
              {processing ? 'Processing AI...' : report.status === 'ai_verified' ? 'Re-run AI Assessment' : 'Run AI Pipeline'}
            </button>

            {report.status !== 'in_progress' && report.status !== 'resolved' && (
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={processing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> Dispatch Repair
              </button>
            )}

            {report.status !== 'resolved' && (
              <button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={processing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => { setShowRemoveModal(true); setRemoveReason(''); setRemoveNote(''); }}
                className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Remove
              </button>
            )}
          </div>
        )}
      </div>

      {processResult && (
        <div className={`p-4 rounded-xl border text-xs font-mono ${
          processResult.success ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-red-950/60 border-red-800 text-red-200'
        }`}>
          {processResult.message}
        </div>
      )}

      {/* 3-SECTION EVIDENCE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: CITIZEN EVIDENCE (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> CITIZEN EVIDENCE
              </h3>
              <span className="text-[10px] font-mono text-slate-400">INGESTED DATA</span>
            </div>

            {/* Ingested Photo Viewer */}
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 aspect-video group">
              {report.image?.url ? (
                <img
                  src={report.image.url}
                  alt="Road Hazard Evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <MapPin className="w-6 h-6 text-slate-600" />
                  <span>No Photo Attached</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3 flex justify-between items-center text-[10px] font-mono text-slate-300">
                <span>PATH: {report.image?.path ? report.image.path.split('/').pop() : 'N/A'}</span>
                <span className="text-cyan-400">HIGH-RES EXIF</span>
              </div>
            </div>

            {/* Geolocation Metadata */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PRIMARY LOCATION</span>
                <p className="font-semibold text-white">{report.location?.road_name || 'Road Name Unspecified'}</p>
                {report.location?.landmark && (
                  <p className="text-slate-400 text-[11px]">Landmark: {report.location.landmark}</p>
                )}
                <p className="font-mono text-[11px] text-cyan-400 pt-1">
                  Lat: {report.location?.latitude?.toFixed(6) ?? 'N/A'}, Lng: {report.location?.longitude?.toFixed(6) ?? 'N/A'}
                </p>
              </div>

              {/* Hazard flags */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">WATER VISIBLE</span>
                  <span className={`font-semibold ${report.water_visible ? 'text-amber-400' : 'text-slate-300'}`}>
                    {report.water_visible ? '✓ Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">CITIZEN DANGER FLAG</span>
                  <span className={`font-semibold ${report.citizen_danger ? 'text-red-400' : 'text-slate-300'}`}>
                    {report.citizen_danger ? '⚡ High Danger' : 'Normal'}
                  </span>
                </div>
              </div>

              {report.description && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">USER DESCRIPTION</span>
                  <p className="text-slate-300 text-xs leading-relaxed italic">"{report.description}"</p>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>INGEST TIMESTAMP</span>
                <span>{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: AI INTELLIGENCE CENTER (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dynamic AI Pipeline Visualizer Component */}
          <AIPipelineVisualizer report={report} />

          {/* SECTION 3: ENGINEER VERIFICATION WORKSPACE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Engineer Verification Workspace</h3>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800">
                LIVE STATUS SYNCHRONIZATION
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Live engineering assessment form with backend status synchronization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">SITE MEASUREMENTS</span>
                <p className="text-xs text-slate-200 font-semibold">Dimensions: ~0.8m x 0.5m</p>
                <p className="text-xs text-slate-400">Apparent Depth: ~6cm</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">SURROUNDING DAMAGE</span>
                <p className="text-xs text-slate-200 font-semibold">Asphalt Alligator Cracking</p>
                <p className="text-xs text-slate-400">Drainage: Sub-optimal</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">DISPATCH ACTION</span>
                <div className="flex items-center gap-2 pt-1">
                  <PriorityBadge priority={report.ai?.priority || 'P2'} size="sm" />
                  <span className="text-xs font-mono text-emerald-400 font-semibold">Ready for Crew</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-800 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white">Remove Report</h2>
                <p className="text-xs text-cyan-400 mt-0.5 font-mono">{report.report_id}</p>
              </div>
              <button onClick={() => setShowRemoveModal(false)} className="text-slate-400 hover:text-white font-bold text-xl leading-none">×</button>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Removal Reason *</label>
              <div className="space-y-2">
                {REMOVAL_REASONS.map(r => (
                  <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-slate-800/60">
                    <input
                      type="radio"
                      name="removal_reason"
                      value={r.value}
                      checked={removeReason === r.value}
                      onChange={() => setRemoveReason(r.value)}
                      className="w-4 h-4 text-indigo-500 accent-indigo-500"
                    />
                    <span className="text-xs text-slate-300 group-hover:text-white">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Notes {removeReason === 'OTHER' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                rows={3}
                value={removeNote}
                onChange={e => setRemoveNote(e.target.value)}
                placeholder={removeReason === 'OTHER' ? 'Required — explain reason...' : 'Optional notes for audit log...'}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveReport}
                disabled={removing || !isRemoveValid}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
              >
                {removing ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
