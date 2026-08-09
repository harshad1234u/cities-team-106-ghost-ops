import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';

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
      setReports(reportsData);
      setAuditRecords(auditData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-slate-500">Manage citizen submissions and audit history.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Reports
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{reports.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Audit History
          {auditRecords.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">{auditRecords.length}</span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading reports...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : activeTab === 'active' ? (
          /* Active Reports Table */
          reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No active reports found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">AI Sev/Pri</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map(report => (
                  <tr key={report.report_id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs">{report.report_id}</td>
                    <td className="p-4 text-slate-600">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-800">{report.location?.road_name || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {report.ai?.severity || '-'} / {report.ai?.priority || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/reports/${report.report_id}`} className="text-civic-blue hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* Audit History Table */
          auditRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No removed reports found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-red-50/50 border-b border-red-100 text-slate-600 font-medium">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Note</th>
                  <th className="p-4">Removed At</th>
                  <th className="p-4">Original Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditRecords.map(rec => (
                  <tr key={rec.report_id} className="hover:bg-red-50/30">
                    <td className="p-4 font-mono text-xs">{rec.report_id}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        {reasonLabel(rec.deletion_reason)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-xs max-w-[200px] truncate">{rec.deletion_note || '-'}</td>
                    <td className="p-4 text-slate-600 text-xs">{rec.deleted_at ? new Date(rec.deleted_at).toLocaleString() : 'N/A'}</td>
                    <td className="p-4 text-slate-600 text-xs">{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/reports/${rec.report_id}`} className="text-slate-500 hover:underline text-xs">
                        View Record
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
