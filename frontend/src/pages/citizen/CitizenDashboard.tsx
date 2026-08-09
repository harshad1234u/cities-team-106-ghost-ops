import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { api, type ReportDetail } from '../../services/api';

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
      console.error("Failed to load user reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-civic-blue text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
            CP
          </div>
          <h1 className="text-xl font-bold tracking-tight">CivoAI Citizen Portal</h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-xs font-mono opacity-80 hidden sm:inline">{user?.email}</span>
          <button 
            onClick={handleLogout} 
            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Banner CTA */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-civic-blue/10 text-civic-blue mb-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Help Improve Your City Infrastructure</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Report potholes and hazardous road conditions directly to municipal road engineering teams for automated AI assessment and priority repair.
          </p>
          <div>
            <Link 
              to="/citizen/report" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-civic-blue text-white font-semibold rounded-lg hover:bg-civic-blue-dark transition-colors shadow-md text-sm"
            >
              <span>Report a Pothole</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* User Reports Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Your Submitted Reports</h3>
            <button 
              onClick={fetchUserReports}
              className="text-xs text-civic-blue hover:underline font-medium flex items-center gap-1"
            >
              🔄 Refresh List
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 animate-pulse">
              Loading your submitted reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center">
              <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-700 font-semibold text-base">No reports submitted yet</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">Click "Report a Pothole" above to submit your first report.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div key={report.report_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm block">{report.report_id}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                        report.status === 'ENGINEER_VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'AI_VERIFIED' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    {report.image?.url ? (
                      <img 
                        src={report.image.url} 
                        alt="Submitted Pothole" 
                        className="w-full h-40 object-cover rounded-lg border border-slate-200" 
                      />
                    ) : (
                      <div className="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-mono">
                        No Image Available
                      </div>
                    )}

                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="font-medium">📍 {report.location?.road_name || 'Location recorded'}</p>
                      {report.location?.landmark && <p className="text-slate-500">Landmark: {report.location.landmark}</p>}
                    </div>

                    {report.ai?.severity && (
                      <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs flex justify-between items-center">
                        <span className="text-indigo-900 font-medium">AI Severity Assessment:</span>
                        <span className="font-bold text-indigo-700">{report.ai.severity}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
                    <Link 
                      to={`/citizen/status/${report.report_id}`}
                      className="text-xs font-semibold text-civic-blue hover:underline inline-flex items-center gap-1"
                    >
                      <span>Track Full Report Status</span>
                      <span>→</span>
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
