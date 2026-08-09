import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { api, type ReportDetail } from '../../services/api';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load engineer inspection queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const filteredReports = reports.filter(r => {
    if (filterSeverity === 'ALL') return true;
    return r.ai?.severity === filterSeverity;
  });

  const criticalCount = reports.filter(r => r.ai?.severity === 'CRITICAL' || r.ai?.priority === 'P1').length;
  const highCount = reports.filter(r => r.ai?.severity === 'HIGH' || r.ai?.priority === 'P2').length;
  const pendingCount = reports.filter(r => r.status === 'NEW' || r.status === 'PROCESSING' || r.status === 'AI_VERIFIED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-civic-blue flex items-center justify-center font-bold text-sm">
            CE
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CivoAI Field Operations Portal</h1>
            <p className="text-xs text-slate-400">Assigned Zone: District 2 - North Highway</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-1 rounded-full uppercase">
              ON FIELD ACTIVE
            </span>
          </div>
          <span className="text-xs text-slate-300 font-mono hidden sm:inline">{user?.email}</span>
          <button 
            onClick={handleLogout} 
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Inspection & Verification Queue</h2>
            <p className="text-slate-500 text-sm mt-0.5">Physical measurement, safety verification, & engineering repair dispatch</p>
          </div>
          <button 
            onClick={fetchQueue}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Queue
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Queue</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{reports.length}</div>
            <div className="text-xs text-slate-500 mt-1">Road hazard reports</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Critical Hazards</div>
            <div className="text-3xl font-bold text-rose-600 mt-2">{criticalCount}</div>
            <div className="text-xs text-rose-500/80 mt-1">Requires emergency inspection</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">High Priority</div>
            <div className="text-3xl font-bold text-amber-600 mt-2">{highCount}</div>
            <div className="text-xs text-slate-500 mt-1">Prioritized for repair</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Pending Verification</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{pendingCount}</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting physical metrics</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NONE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev === 'ALL' ? 'All Severity' : sev}
            </button>
          ))}
        </div>

        {/* Queue Table */}
        {loading ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 animate-pulse">
            Loading inspection queue telemetry...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-700 font-semibold text-base">No inspection reports found</p>
            <p className="text-slate-400 text-xs mt-1">There are no reports matching the selected severity filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Assigned Road Hazard Queue</h3>
              <span className="text-xs font-mono text-slate-500">{filteredReports.length} Reports</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <div key={report.report_id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    {report.image?.url ? (
                      <img 
                        src={report.image.url} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=200&q=80';
                        }}
                        alt="Road Hazard" 
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-sm flex-shrink-0" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono flex-shrink-0">
                        No Image
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-base">{report.report_id}</span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                          report.ai?.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                          report.ai?.severity === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          report.ai?.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {report.ai?.severity || 'UNPROCESSED'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-xs rounded border border-slate-200">
                          {report.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        📍 {report.location?.road_name || 'Recorded Road'} {report.location?.landmark ? `(Near ${report.location.landmark})` : ''}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                        <span>Reported: {new Date(report.created_at).toLocaleDateString()}</span>
                        {report.citizen_danger && (
                          <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            ⚠ High Citizen Danger
                          </span>
                        )}
                        {report.water_visible && (
                          <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            💧 Water Present
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                    <Link
                      to={`/engineer/reports/${report.report_id}`}
                      className="px-4 py-2 bg-civic-blue hover:bg-civic-blue-dark text-white font-medium rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span>Start Field Assessment</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
