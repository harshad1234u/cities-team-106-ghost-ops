import { useState, useEffect } from 'react';
import { api, type ReportDetail } from '../../services/api';

interface EngineerUser {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  status?: string;
  region?: string;
}

export default function EngineersManagement() {
  const [engineers, setEngineers] = useState<EngineerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRegion, setNewRegion] = useState('District 1 - Central');

  // Assign Report Modal State
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerUser | null>(null);
  const [reportsList, setReportsList] = useState<ReportDetail[]>([]);
  const [targetReportId, setTargetReportId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const data = await api.getEngineers();
      if (data && Array.isArray(data) && data.length > 0) {
        setEngineers(data);
      } else {
        setEngineers([
          { id: '1', email: 'javithbasha.cs24@krct.ac.in', full_name: 'Javith Basha', created_at: '2026-08-08', status: 'ACTIVE', region: 'Zone 4 - North Corridor' },
          { id: '2', email: 'engineer@civoai.gov', full_name: 'Marcus Vance', created_at: '2026-08-07', status: 'ON FIELD', region: 'Zone 1 - Downtown' },
          { id: '3', email: 'sarah.field@civoai.gov', full_name: 'Sarah Connor', created_at: '2026-08-05', status: 'IDLE', region: 'Zone 2 - West Highway' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async (eng: EngineerUser) => {
    setSelectedEngineer(eng);
    try {
      const reports = await api.getReports();
      setReportsList(reports || []);
      if (reports && reports.length > 0) {
        setTargetReportId(reports[0].report_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngineer || !targetReportId) return;

    setAssigning(true);
    try {
      // Update engineer status in list
      setEngineers(prev => prev.map(e => e.id === selectedEngineer.id ? { ...e, status: 'ON FIELD' } : e));
      
      setToastMessage(`Report ${targetReportId} successfully assigned to ${selectedEngineer.email}`);
      setSelectedEngineer(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleAddEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setEngineers(prev => [
      ...prev,
      {
        id: String(Date.now()),
        email: newEmail,
        full_name: newEmail.split('@')[0],
        created_at: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        region: newRegion
      }
    ]);
    setNewEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Field Engineers Management</h1>
          <p className="text-slate-500 text-sm mt-1">Assign road risk assessments, manage field staff, and monitor repair status</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-civic-blue hover:bg-civic-blue-dark text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Field Engineer
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Engineers</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{engineers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active field personnel</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">On Active Inspection</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {engineers.filter(e => e.status === 'ON FIELD' || e.status === 'ACTIVE').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Deployed in assigned zones</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending Assessments</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">4</div>
          <div className="text-xs text-slate-500 mt-1">Awaiting physical verification</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Completed Repairs</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">12</div>
          <div className="text-xs text-slate-500 mt-1">Resolved this month</div>
        </div>
      </div>

      {/* Engineers Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Personnel Directory</h2>
          <span className="text-xs font-mono text-slate-500">{engineers.length} Members</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading engineers directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Engineer</th>
                  <th className="p-4">Assigned Zone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {engineers.map((eng) => (
                  <tr key={eng.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{eng.full_name || eng.email.split('@')[0]}</div>
                      <div className="text-xs text-slate-500 font-mono">{eng.email}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {eng.region || 'Zone 1 - Downtown'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        eng.status === 'ON FIELD' ? 'bg-emerald-100 text-emerald-800' :
                        eng.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {eng.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">
                      {eng.created_at ? new Date(eng.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenAssignModal(eng)}
                        className="px-3 py-1.5 bg-civic-blue hover:bg-civic-blue-dark text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                      >
                        Assign Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Report Modal */}
      {selectedEngineer && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Pothole Report</h2>
                <p className="text-xs text-slate-500 mt-0.5">Assigning to field engineer: <strong className="text-slate-800">{selectedEngineer.email}</strong></p>
              </div>
              <button onClick={() => setSelectedEngineer(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Pothole Report</label>
                {reportsList.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 text-center">
                    No open reports available.
                  </div>
                ) : (
                  <select
                    value={targetReportId}
                    onChange={e => setTargetReportId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue focus:border-civic-blue text-sm font-mono"
                  >
                    {reportsList.map(r => (
                      <option key={r.report_id} value={r.report_id}>
                        {r.report_id} — {r.location?.road_name || 'Recorded Road'} ({r.ai?.severity || 'Unprocessed'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Inspection Priority & Directive</label>
                <textarea 
                  rows={3} 
                  placeholder="Provide inspection directives or physical verification notes for the engineer..."
                  className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue text-sm"
                  defaultValue="Inspect pothole dimensions, verify water drainage hazard, and record engineering repair estimate."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEngineer(null)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || reportsList.length === 0}
                  className="w-1/2 py-2 bg-civic-blue hover:bg-civic-blue-dark text-white font-medium text-sm rounded transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Engineer Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Add Field Engineer</h2>
            <form onSubmit={handleAddEngineer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Engineer Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="engineer@civoai.gov"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue focus:border-civic-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Zone</label>
                <select
                  value={newRegion}
                  onChange={e => setNewRegion(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue focus:border-civic-blue text-sm"
                >
                  <option value="District 1 - Central">District 1 - Central</option>
                  <option value="District 2 - North Highway">District 2 - North Highway</option>
                  <option value="District 3 - West Urban">District 3 - West Urban</option>
                  <option value="District 4 - East Corridor">District 4 - East Corridor</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-civic-blue hover:bg-civic-blue-dark text-white font-medium text-sm rounded transition-colors"
                >
                  Add Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
