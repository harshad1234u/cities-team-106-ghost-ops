import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Activity, AlertTriangle, UserCheck, Wrench, CheckCircle2, MapPin, ArrowRight, Eye, RefreshCw } from 'lucide-react';

export default function CommandCenter() {
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    setError(null);
    api.getReports()
      .then(data => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("CommandCenter fetch error:", err);
        setError(err.message || 'Failed to load operational report data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalReports = reports.length;
  const criticalHazards = reports.filter(
    r => r.ai?.priority === 'P0' || r.ai?.priority === 'P1' || r.ai?.severity === 'CRITICAL' || r.ai?.severity === 'HIGH'
  ).length;
  const awaitingEngineer = reports.filter(
    r => r.status === 'ai_verified' || r.status === 'AI_VERIFIED' || r.status === 'submitted' || r.status === 'in_review'
  ).length;
  const inProgress = reports.filter(
    r => r.status === 'in_progress' || r.status === 'repair_scheduled'
  ).length;
  const resolved = reports.filter(
    r => r.status === 'resolved' || r.status === 'completed'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Command Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GIS + AI OPS
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Real-time citywide road hazard telemetry and automated AI assessment stream.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
          <Link
            to="/admin/map"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            Launch GIS Map →
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white">Backend Stream Error</h4>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
          <button onClick={fetchReports} className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-white rounded-lg">
            Retry Connection
          </button>
        </div>
      ) : null}

      {/* Operational Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Active Reports"
          value={totalReports}
          subtitle="Total ingested"
          icon={Activity}
          variant="navy"
          loading={loading}
        />
        <MetricCard
          title="Critical Risks"
          value={criticalHazards}
          subtitle="P1 / Critical severity"
          icon={AlertTriangle}
          variant="red"
          loading={loading}
        />
        <MetricCard
          title="Awaiting Review"
          value={awaitingEngineer}
          subtitle="Ready for engineer"
          icon={UserCheck}
          variant="indigo"
          loading={loading}
        />
        <MetricCard
          title="In Progress"
          value={inProgress}
          subtitle="Repair dispatched"
          icon={Wrench}
          variant="amber"
          loading={loading}
        />
        <MetricCard
          title="Resolved"
          value={resolved}
          subtitle="Completed repairs"
          icon={CheckCircle2}
          variant="emerald"
          loading={loading}
        />
      </div>

      {/* Geographic Coordinates & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Geographic Hazard Distribution</h3>
              <p className="text-xs text-slate-400">Ingested reports mapped to city coordinates</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
              {reports.length} Coordinates Active
            </span>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" rows={4} />
          ) : reports.length === 0 ? (
            <EmptyState
              title="No Ingested Reports"
              description="No active reports are recorded in the system. Use Citizen mode to report a road hazard."
            />
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {reports.map((report) => (
                <div
                  key={report.report_id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/70 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      📍
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {report.location?.road_name || 'Road Location Unspecified'}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500">ID: {report.report_id}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Lat: {report.location?.latitude?.toFixed(4) ?? 'N/A'}, Lng: {report.location?.longitude?.toFixed(4) ?? 'N/A'}
                        {report.location?.landmark ? ` • Near ${report.location.landmark}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={report.ai?.severity || 'MEDIUM'} size="sm" />
                    <Link
                      to={`/admin/reports/${report.report_id}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
                      title="Inspect Report"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Operational Stream */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Recent Ingest Stream</h3>
              <Link to="/admin/reports" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="table" rows={4} />
            ) : reports.length === 0 ? (
              <EmptyState title="Stream Idle" description="Awaiting new incoming hazard telemetry." />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.report_id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-300">{report.report_id}</span>
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate">
                      {report.location?.road_name || 'Unmapped Location'}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <span className="text-[11px] font-mono text-slate-400">
                        {report.ai?.severity ? `Severity: ${report.ai.severity}` : 'Pending AI'}
                      </span>
                      <Link
                        to={`/admin/reports/${report.report_id}`}
                        className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
