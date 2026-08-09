import { useState, useEffect } from 'react';
import { 
  Scan, 
  Layers, 
  Brain, 
  Eye, 
  Database, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Server
} from 'lucide-react';

interface ProviderStatus {
  roboflow_detection: string;
  roboflow_segmentation: string;
  nemotron: string;
  llama_vision: string;
  supabase: string;
  email: string;
}

interface PreflightResponse {
  status: 'ready' | 'blocked';
  providers: ProviderStatus;
}

export const PreflightDashboard: React.FC = () => {
  const [data, setData] = useState<PreflightResponse>({
    status: 'blocked',
    providers: {
      roboflow_detection: 'BLOCKED',
      roboflow_segmentation: 'BLOCKED',
      nemotron: 'BLOCKED',
      llama_vision: 'BLOCKED',
      supabase: 'BLOCKED',
      email: 'BLOCKED'
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchPreflightStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/preflight');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.log('Preflight endpoint unreachable locally or offline:', e);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchPreflightStatus();
  }, []);

  const cards = [
    {
      id: 'roboflow_detection',
      title: 'Roboflow Detection',
      desc: 'Bounding boxes & pothole detection regions',
      icon: Scan,
      status: data.providers.roboflow_detection,
    },
    {
      id: 'roboflow_segmentation',
      title: 'Roboflow Segmentation',
      desc: 'Pixel-level masks & pothole geometry region',
      icon: Layers,
      status: data.providers.roboflow_segmentation,
    },
    {
      id: 'nemotron',
      title: 'NVIDIA Nemotron',
      desc: 'Multimodal visual analysis & hazard observation',
      icon: Brain,
      status: data.providers.nemotron,
    },
    {
      id: 'llama_vision',
      title: 'NVIDIA Llama 3.2 Vision',
      desc: 'Executive synthesis & report writer',
      icon: Eye,
      status: data.providers.llama_vision,
    },
    {
      id: 'supabase',
      title: 'Supabase DB & Storage',
      desc: 'PostgreSQL database & secure pothole images bucket',
      icon: Database,
      status: data.providers.supabase,
    },
    {
      id: 'email',
      title: 'Email Provider',
      desc: 'Transactional admin alert notification service',
      icon: Mail,
      status: data.providers.email,
    },
  ];

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FAIL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">CivoAI Phase 0 Pre-Flight Gate</h1>
                <p className="text-sm text-slate-400">External dependency verification dashboard & model status control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPreflightStatus}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Verifying...' : 'Re-verify'}</span>
            </button>

            <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center space-x-2 ${
              data.status === 'ready' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <Server className="w-4 h-4" />
              <span>PRE-FLIGHT STATUS: {data.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Verification Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.id}
                className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-800 text-indigo-400 rounded-lg border border-slate-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 text-xs font-mono font-medium rounded-full border flex items-center space-x-1.5 ${getBadgeStyle(card.status)}`}>
                      {getStatusIcon(card.status)}
                      <span>{card.status}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-4">{card.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Provider Target</span>
                  <span className="text-slate-300">Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Grounding: CivoAI PRD v3.1 & AI Agent Governance</span>
          <span>Last checked: {lastChecked || 'Initial'}</span>
        </div>

      </div>
    </div>
  );
};
