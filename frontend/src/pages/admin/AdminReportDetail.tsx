import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
  const [processResult, setProcessResult] = useState<any>(null);

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
      setProcessResult({ success: true, message: result.message || "AI Analysis Pipeline started." });
      setTimeout(() => {
        fetchReport();
        setProcessing(false);
      }, 4500);
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
      setProcessResult({ success: true, message: `Report status updated to ${newStatus}` });
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
      setProcessResult({ success: true, message: `Report ${id} was removed from the active workflow.` });
      setTimeout(() => navigate('/admin/reports'), 2000);
    } catch (err: any) {
      setProcessResult({ success: false, message: err.message || "Failed to remove report" });
      setShowRemoveModal(false);
    } finally {
      setRemoving(false);
    }
  };

  const isRemoveValid = removeReason && (removeReason !== 'OTHER' || removeNote.trim().length > 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading report...</div>;
  if (error || !report) return <div className="flex items-center justify-center py-20 text-semantic-critical">{error || 'Report not found'}</div>;

  const isRemoved = report.is_deleted || report.status === 'REMOVED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <Link to="/admin/reports" className="text-civic-blue hover:underline text-sm font-medium">← Back to Reports</Link>
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Audit Record Preserved
        </span>
      </div>

      {/* REMOVED banner */}
      {isRemoved && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div>
              <h3 className="font-bold text-red-800 text-sm uppercase tracking-wider">Removed Report</h3>
              <div className="mt-2 text-sm text-red-700 space-y-1">
                <p><span className="font-medium">Reason:</span> {report.deletion_reason || 'N/A'}</p>
                {report.deletion_note && <p><span className="font-medium">Note:</span> {report.deletion_note}</p>}
                {report.deleted_at && <p><span className="font-medium">Removed at:</span> {new Date(report.deleted_at).toLocaleString()}</p>}
              </div>
              <p className="mt-2 text-xs text-red-500">This report has been removed from the active workflow. Original evidence is preserved for audit purposes.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with actions */}
      <div className="flex flex-wrap justify-between items-start gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Report Details</h1>
          <p className="font-mono text-slate-500 mt-1">{report.report_id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1.5 font-bold rounded-md text-xs uppercase border tracking-wider ${
            isRemoved ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            Status: {report.status}
          </span>

          {!isRemoved && (
            <>
              <button 
                onClick={handleProcessAI}
                disabled={processing || report.status === 'PROCESSING'}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold disabled:opacity-50 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {processing ? 'Processing AI...' : report.status === 'AI_VERIFIED' ? 'Re-run AI Analysis' : 'Run AI Analysis'}
              </button>

              {report.status !== 'IN_PROGRESS' && report.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={processing}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold disabled:opacity-50 shadow-sm transition-colors cursor-pointer"
                >
                  Mark Under Repair
                </button>
              )}

              {report.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={processing}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold disabled:opacity-50 shadow-sm transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}

              <Link
                to="/admin/engineers"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                Assign Engineer
              </Link>
            </>
          )}
        </div>
      </div>

      {processResult && (
        <div className={`p-4 rounded border text-sm ${processResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {processResult.message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
           <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-4">
             <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Citizen Evidence</h3>
             {report.image?.url ? (
                <img src={report.image.url} alt="Reported issue" className="w-full rounded border border-slate-200 mb-4" />
              ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center rounded border border-slate-200 text-slate-400 mb-4">No Image</div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Date</span> <span className="font-medium text-slate-800">{new Date(report.created_at).toLocaleString()}</span></div>
                <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Location</span> <span className="font-medium text-slate-800">{report.location?.road_name || 'N/A'}</span></div>
                <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Water Visible</span> <span className="font-medium text-slate-800">{report.water_visible ? 'Yes' : 'No'}</span></div>
                <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Danger</span> <span className="font-medium text-slate-800">{report.citizen_danger ? 'High' : 'Normal'}</span></div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-ai-surface rounded-lg border border-ai-indigo-light/30 shadow-sm overflow-hidden p-4">
             <h3 className="font-bold text-ai-indigo-dark mb-4 pb-2 border-b border-ai-indigo/20 flex items-center gap-2">AI Intelligence</h3>
             
             {report.ai?.detection ? (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Detection</span> <span className="font-medium text-slate-800">{report.ai.detection.pothole_detected ? 'Pothole Confirmed' : 'No Pothole'}</span></div>
                    <div><span className="block text-slate-500 text-xs uppercase tracking-wider">Confidence</span> <span className="font-medium text-slate-800">{Math.round((report.ai.detection.confidence || 0) * 100)}%</span></div>
                  </div>
                  {report.ai?.visual_analysis && (
                    <div className="pt-4 border-t border-ai-indigo/10 space-y-2">
                      <p className="text-slate-800"><span className="font-medium">Depth Analysis:</span> {report.ai.visual_analysis.apparent_depth}</p>
                      <p className="text-slate-800"><span className="font-medium">Surrounding Damage:</span> {report.ai.visual_analysis.surrounding_damage}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <p>No AI analysis has been performed on this report yet.</p>
                  {!isRemoved && <p className="mt-2 text-xs">Click "Run AI Analysis" to trigger processing.</p>}
                </div>
              )}
           </div>

           {/* Engineering Assessment Status */}
           <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-4">
             <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Engineering Assessment</h3>
             <div className="text-center py-6">
                <p className="text-sm text-slate-600 font-medium">Pending Engineering Field Verification</p>
                <p className="mt-2 text-xs text-slate-400">Assigned field engineer will complete site measurement upon dispatch.</p>
             </div>
           </div>
        </div>
      </div>

      {/* Danger Zone - Remove Report (Admin only, not already removed) */}
      {role === 'admin' && !isRemoved && (
        <div className="mt-8 border border-red-200 rounded-lg bg-red-50/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-red-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Report Management
              </h3>
              <p className="text-xs text-red-600 mt-1">Remove fake, duplicate, spam, or invalid reports from the active workflow. The original record and evidence will be retained for audit purposes.</p>
            </div>
            <button
              onClick={() => { setShowRemoveModal(true); setRemoveReason(''); setRemoveNote(''); }}
              disabled={processing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              Remove Report
            </button>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Remove Report</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{report.report_id}</p>
              </div>
              <button onClick={() => setShowRemoveModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">×</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                {REMOVAL_REASONS.map(r => (
                  <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="removal_reason"
                      value={r.value}
                      checked={removeReason === r.value}
                      onChange={() => setRemoveReason(r.value)}
                      className="w-4 h-4 text-red-600 accent-red-600"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional note {removeReason === 'OTHER' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={removeNote}
                onChange={e => setRemoveNote(e.target.value)}
                placeholder={removeReason === 'OTHER' ? 'Required — explain why this report is being removed...' : 'Optional — e.g. "Duplicate of CIV-2026-000118"'}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveReport}
                disabled={removing || !isRemoveValid}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing ? 'Removing...' : 'Remove Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
