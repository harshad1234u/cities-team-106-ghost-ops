import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Eye, FileText, History } from 'lucide-react';

type TabView = 'active' | 'audit';

interface AuditRecord {
  report_id: string;
  status: string;
  deletion_reason?: string;
  deletion_note?: string;
  deleted_by?: string;
  deleted_at?: string;
  created_at?: string;
  road_name?: string;
  description?: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsData, auditData] = await Promise.all([
        api.getReports(),
        api.getAuditHistory(),
      ]);
      setReports(reportsData || []);
      setAuditRecords(auditData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      r =>
        (r.report_id || '').toLowerCase().includes(q) ||
        (r.location?.road_name || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const filteredAudit = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return auditRecords;
    return auditRecords.filter(
      a =>
        (a.report_id || '').toLowerCase().includes(q) ||
        (a.road_name || '').toLowerCase().includes(q) ||
        (a.deletion_reason || '').toLowerCase().includes(q)
    );
  }, [auditRecords, searchQuery]);

  const reasonLabel = (reason?: string) => {
    const map: Record<string, string> = {
      DUPLICATE: 'Duplicate Report',
      SPAM: 'Fake / Spam',
      INVALID_IMAGE: 'Invalid Image',
      INCORRECT_SUBMISSION: 'Incorrect Submission',
      OTHER: 'Other',
    };
    return reason ? map[reason] || reason : 'N/A';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Reports Command Table</h1>
          <p className="text-xs text-slate-400 mt-1">Ingested municipal road hazard submissions and audit record history.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ID, road, or status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/40'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Active Reports Stream
          <span className="ml-1.5 px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-mono rounded-full border border-indigo-800">
            {reports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-red-950/80 text-red-200 border border-red-800/80 ring-1 ring-red-500/40'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-red-400" /> Audit Log Preserved
          {auditRecords.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 bg-red-900/60 text-red-300 text-[10px] font-mono rounded-full border border-red-800">
              {auditRecords.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-8"><LoadingSkeleton type="table" rows={5} /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm font-mono">{error}</div>
        ) : activeTab === 'active' ? (
          filteredReports.length === 0 ? (
            <EmptyState title="No Active Reports" description="No active road hazard reports match your search query." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Thumb</th>
                    <th className="p-4">Report ID</th>
                    <th className="p-4">Ingest Date</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Severity / Priority</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReports.map((report) => (
                    <tr key={report.report_id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                          {report.image?.url ? (
                            <img src={report.image.url} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">N/A</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-400 group-hover:text-cyan-300 transition-colors">
                        {report.report_id}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {report.location?.road_name || 'Unmapped Location'}
                        {report.location?.landmark && <span className="block text-[10px] text-slate-400">{report.location.landmark}</span>}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={report.status} size="sm" />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <SeverityBadge severity={report.ai?.severity || 'MEDIUM'} size="sm" />
                          <PriorityBadge priority={report.ai?.priority || 'P2'} size="sm" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/reports/${report.report_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-semibold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Workspace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Audit History Table */
          filteredAudit.length === 0 ? (
            <EmptyState title="No Audit Records" description="No removed report audit records exist." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-950/40 border-b border-red-900/60 text-red-300 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Report ID</th>
                    <th className="p-4">Removal Reason</th>
                    <th className="p-4">Audit Notes</th>
                    <th className="p-4">Removed At</th>
                    <th className="p-4">Original Date</th>
                    <th className="p-4 text-right">Audit Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAudit.map((rec) => (
                    <tr key={rec.report_id} className="hover:bg-red-950/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-red-400">{rec.report_id}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full font-semibold text-[10px]">
                          {reasonLabel(rec.deletion_reason)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">{rec.deletion_note || '—'}</td>
                      <td className="p-4 font-mono text-slate-400">
                        {rec.deleted_at ? new Date(rec.deleted_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/reports/${rec.report_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
