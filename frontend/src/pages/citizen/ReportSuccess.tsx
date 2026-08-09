import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReportSuccess() {
  const location = useLocation();
  const reportId = location.state?.reportId;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">✓ Report Submitted</h2>
          <p className="text-xs text-slate-500 mt-1">Thank you for reporting. Your hazard evidence has been queued for automated AI analysis.</p>
        </div>

        {reportId && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-wider block mb-1">
              OFFICIAL REPORT TRACKING ID
            </span>
            <p className="font-mono font-black text-xl text-sky-700 tracking-wide">{reportId}</p>
          </div>
        )}

        {/* Processing Lifecycle Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">LIVE PROCESSING LIFECYCLE</span>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 1. Submitted to Ingestion Queue
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> 2. Roboflow & Nemotron AI Assessment
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> 3. Field Engineering Review
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> 4. Repair Action & Resolution
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {reportId && (
            <Link
              to={`/citizen/status/${reportId}`}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            to="/citizen"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
