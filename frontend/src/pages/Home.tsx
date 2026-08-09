import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-6 max-w-md w-full bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-civic-blue">CivoAI Portal</h1>
        <p className="text-slate-600 text-sm">AI-Powered Road Risk & Pothole Intelligence System</p>
        
        <div className="space-y-3 pt-2">
          <Link to="/auth/login" className="block w-full py-2 px-4 bg-civic-blue text-white font-medium rounded hover:bg-civic-blue-dark transition-colors">
            Sign In to Portal
          </Link>
          <Link to="/auth/signup" className="block w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-200 transition-colors">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}
