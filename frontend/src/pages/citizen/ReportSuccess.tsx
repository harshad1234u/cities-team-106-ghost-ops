import { useLocation, Link } from 'react-router-dom';

export default function ReportSuccess() {
  const location = useLocation();
  const reportId = location.state?.reportId;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-semantic-success/20 text-semantic-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800">Report Submitted</h2>
        <p className="text-slate-600">Thank you for helping improve our city. Your report has been successfully recorded.</p>
        
        {reportId && (
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mt-4">
            <p className="text-sm text-slate-500 mb-1">Your Tracking ID</p>
            <p className="font-mono font-bold text-lg text-civic-blue">{reportId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-8">
          {reportId && (
            <Link to={`/citizen/status/${reportId}`} className="w-full py-2 bg-civic-blue text-white rounded hover:bg-civic-blue-dark transition-colors">
              Track Status
            </Link>
          )}
          <Link to="/citizen" className="w-full py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
