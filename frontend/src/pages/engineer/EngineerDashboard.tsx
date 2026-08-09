import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { api, type ReportDetail } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { MetricCard } from '../../components/common/MetricCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Wrench, ShieldAlert, LogOut, RefreshCw, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

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

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filterPriority === 'ALL') return true;
      const pri = (r.ai?.priority || 'P4').toUpperCase();
      return pri === filterPriority || (filterPriority === 'P1' && pri === 'IMMEDIATE');
    });
  }, [reports, filterPriority]);

  const p1Count = reports.filter(r => r.ai?.priority === 'P1' || r.ai?.priority === 'P0' || r.ai?.severity === 'CRITICAL').length;
  const p2Count = reports.filter(r => r.ai?.priority === 'P2' || r.ai?.severity === 'HIGH').length;
  const pendingCount = reports.filter(r => r.status === 'submitted' || r.status === 'ai_processing' || r.status === 'ai_verified').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Technical Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">CivoAI Field Operations</h1>
            <span className="text-[10px] font-mono text-indigo-300 font-semibold uppercase block -mt-0.5">
              TECHNICAL INSPECTION & REPAIR QUEUE
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inspection & Verification Queue</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                P1 - P4 HIERARCHY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Field engineering assessment, measurement inputs, and repair dispatch synchronization.
            </p>
          </div>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
          </button>
        </div>

        {/* Technical Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Assigned"
            value={reports.length}
            subtitle="Field queue items"
            icon={Wrench}
            variant="navy"
            loading={loading}
          />
          <MetricCard
            title="P1 Critical"
            value={p1Count}
            subtitle="Immediate action needed"
            icon={AlertTriangle}
            variant="red"
            loading={loading}
          />
          <MetricCard
            title="P2 High Priority"
            value={p2Count}
            subtitle="Prioritized for crew"
            icon={ShieldAlert}
            variant="orange"
            loading={loading}
          />
          <MetricCard
            title="Pending Verification"
            value={pendingCount}
            subtitle="Requires field metrics"
            icon={UserCheck}
            variant="indigo"
            loading={loading}
          />
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-2">PRIORITY HIERARCHY:</span>
          {['ALL', 'P1', 'P2', 'P3', 'P4'].map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                filterPriority === pri
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {pri === 'ALL' ? 'All Priorities' : pri}
            </button>
          ))}
        </div>

        {/* Queue Table */}
        {loading ? (
          <LoadingSkeleton type="table" rows={4} />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="No Inspection Reports Found"
            description="There are no road hazard reports matching the selected priority filter."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Assigned Road Hazard Telemetry Stream</h3>
              <span className="text-xs font-mono font-bold text-slate-500">{filteredReports.length} Active Items</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <div key={report.report_id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {report.image?.url ? (
                        <img src={report.image.url} alt="Hazard evidence" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">No Image</div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-700 text-base">{report.report_id}</span>
                        <PriorityBadge priority={report.ai?.priority || 'P2'} size="sm" />
                        <SeverityBadge severity={report.ai?.severity || 'MEDIUM'} size="sm" />
                        <StatusBadge status={report.status} size="sm" />
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        📍 {report.location?.road_name || 'Recorded Location'}
                        {report.location?.landmark ? ` (Near ${report.location.landmark})` : ''}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                        {report.ai?.detection?.confidence && (
                          <span className="text-indigo-600 font-bold">
                            AI Conf: {Math.round(report.ai.detection.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/engineer/reports/${report.report_id}`}
                    className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <span>Start Field Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
