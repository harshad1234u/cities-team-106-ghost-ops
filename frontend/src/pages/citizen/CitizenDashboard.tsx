import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { api, type ReportDetail } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Shield, PlusCircle, LogOut, RefreshCw, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load citizen reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Light & Friendly Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">CivoAI Citizen</h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block -mt-0.5">
                CIVIC ROAD SAFETY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Friendly Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-sky-950/10 border border-sky-800/40">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Active City Infrastructure Monitoring
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Keep your roads safer.
            </h2>
            <p className="text-sky-100/90 text-sm leading-relaxed">
              Report potholes and hazardous road defects directly to municipal engineering teams for automated AI inspection, severity scoring, and priority repair.
            </p>
            <div className="pt-2">
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report a Pothole Now</span>
              </Link>
            </div>
          </div>

          {/* Decorative background visual element */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <div className="w-full h-full bg-gradient-to-l from-sky-400 to-transparent rounded-full blur-3xl transform translate-x-12" />
          </div>
        </div>

        {/* User Submitted Reports List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Your Reported Hazards</h3>
              <p className="text-xs text-slate-500">Track real-time AI processing & repair lifecycle</p>
            </div>
            <button
              onClick={fetchUserReports}
              disabled={loading}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" rows={2} />
          ) : reports.length === 0 ? (
            <EmptyState
              title="No Reports Submitted Yet"
              description="Help improve municipal road safety by submitting your first road hazard report."
              actionLabel="Report a Pothole"
              onAction={() => window.location.href = '/citizen/report'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.report_id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-indigo-700 text-xs block">{report.report_id}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusBadge status={report.status} size="sm" />
                    </div>

                    {/* Image Preview */}
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {report.image?.url ? (
                        <img
                          src={report.image.url}
                          alt="Hazard evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                          No Photo Attached
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        {report.location?.road_name || 'Location recorded'}
                      </p>
                      {report.location?.landmark && (
                        <p className="text-[11px] text-slate-500 pl-5">Near {report.location.landmark}</p>
                      )}
                    </div>

                    {report.ai?.severity && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">AI Severity:</span>
                        <SeverityBadge severity={report.ai.severity} size="sm" />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Track lifecycle</span>
                    <Link
                      to={`/citizen/status/${report.report_id}`}
                      className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      View Status <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
