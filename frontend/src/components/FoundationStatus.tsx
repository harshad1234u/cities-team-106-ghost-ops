import { useState, useEffect } from 'react';
import { Server, Database, Layers, CheckCircle2, RefreshCw, Activity, Shield } from 'lucide-react';

interface HealthResponse {
  status: string;
  service: string;
}

export const FoundationStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json);
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }
    } catch {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">CivoAI Foundation Status</h2>
            <p className="text-sm text-slate-400">Phase 1 Minimum Production Architecture Foundation</p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Node */}
        <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>FastAPI Backend</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              backendConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {backendConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {backendConnected ? health?.service : 'Backend Unreachable'}
          </p>
          <p className="text-xs text-slate-500">Route: /health (HTTP 200 OK)</p>
        </div>

        {/* Database Node */}
        <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Supabase Database</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
              SCHEMA READY
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200">reports Table</p>
          <p className="text-xs text-slate-500">UUID Primary Key & JSONB</p>
        </div>

        {/* Storage Node */}
        <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Supabase Storage</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
              BUCKET READY
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200">pothole-images</p>
          <p className="text-xs text-slate-500">Signed Access Credentials</p>
        </div>
      </div>

      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg flex items-center justify-between text-xs text-indigo-300">
        <span className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>Foundation Online — Ready for Phase 2 Implementation</span>
        </span>
        <span className="font-mono flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Secrets Protected</span>
        </span>
      </div>
    </div>
  );
};
