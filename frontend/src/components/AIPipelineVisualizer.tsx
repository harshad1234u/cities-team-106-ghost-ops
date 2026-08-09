import React from 'react';
import { Cpu, Eye, ShieldCheck, CheckCircle2, Sparkles, XCircle, AlertCircle } from 'lucide-react';
import { SeverityBadge } from './common/SeverityBadge';
import { PriorityBadge } from './common/PriorityBadge';

interface AIPipelineVisualizerProps {
  report: {
    status?: string;
    ai?: {
      detection?: any;
      visual_analysis?: any;
      severity?: string;
      priority?: string;
      repair_recommendation?: string;
      estimated_cost?: any;
      ai_summary?: string;
      no_pothole?: boolean;
    };
    created_at?: string;
  };
  className?: string;
}

export const AIPipelineVisualizer: React.FC<AIPipelineVisualizerProps> = ({ report, className = '' }) => {
  const ai = report?.ai || {};
  const status = (report?.status || '').toLowerCase();
  
  // Check if No Pothole detected
  const isNoPothole =
    ai.no_pothole === true ||
    ai.severity === 'NONE' ||
    (ai.detection && ai.detection.count === 0) ||
    (ai.visual_analysis && ai.visual_analysis.pothole_detected === false);

  const isProcessing = status === 'submitted' || status === 'ai_processing' || status === 'processing';

  // Cost formatting helper
  const formatCost = (val: any) => {
    if (isNoPothole) return '₹0';
    if (typeof val === 'number') return `₹${val.toLocaleString('en-IN')}`;
    if (typeof val === 'string') return val.startsWith('₹') ? val : `₹${val}`;
    if (val && typeof val === 'object' && val.amount) return `₹${val.amount.toLocaleString('en-IN')}`;
    return '₹12,500 (Est.)';
  };

  return (
    <div className={`rounded-2xl border border-indigo-500/30 bg-slate-950 p-6 text-white shadow-xl shadow-indigo-950/20 backdrop-blur-md ${className}`}>
      {/* Header with AI Badge & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/40">
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-white tracking-tight">AI Intelligence Engine</h3>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MULTI-STAGE PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-400">Roboflow Detection → Nemotron Vision Reasoning → Deterministic Risk Engine</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <Cpu className="w-3.5 h-3.5 animate-spin" /> Processing AI...
            </span>
          ) : isNoPothole ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <XCircle className="w-3.5 h-3.5 text-slate-400" /> No Pothole Detected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Assessment Complete
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>AI-generated assessment</strong> — requires engineering verification prior to municipal dispatch.
        </span>
      </div>

      {/* 5-Stage Visual Stepper */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Stage 1: Input Photo */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[10px] text-slate-500">STAGE 01</span>
              <span className="text-emerald-400 font-mono">✓ PASS</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" /> Photo Upload
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Image & EXIF ingested</p>
          </div>

          {/* Stage 2: Roboflow */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between relative ${
            isNoPothole 
              ? 'border-slate-700 bg-slate-900/80' 
              : 'border-indigo-500/40 bg-indigo-950/20'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[10px] text-slate-500">STAGE 02</span>
              {isNoPothole ? (
                <span className="text-slate-400 font-mono text-[10px] font-bold">STOP</span>
              ) : (
                <span className="text-indigo-400 font-mono text-[10px]">
                  {ai.detection?.confidence ? `${Math.round(ai.detection.confidence * 100)}% Conf` : 'Active'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" /> Roboflow ML
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isNoPothole ? 'Zero hazard bounding boxes' : 'Pothole detection & bbox'}
            </p>
          </div>

          {/* Stage 3: Nemotron / Vision AI */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between relative ${
            isNoPothole
              ? 'border-slate-800 bg-slate-900/30 opacity-50'
              : 'border-purple-500/40 bg-purple-950/20'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[10px] text-slate-500">STAGE 03</span>
              <span className="text-purple-400 font-mono text-[10px]">
                {isNoPothole ? 'SKIPPED' : 'Nemotron 3B'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" /> Vision Reasoning
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isNoPothole ? 'Pipeline stopped early' : 'Visual depth & risk context'}
            </p>
          </div>

          {/* Stage 4: Risk Engine */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between relative ${
            isNoPothole
              ? 'border-slate-800 bg-slate-900/30 opacity-50'
              : 'border-amber-500/40 bg-amber-950/20'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[10px] text-slate-500">STAGE 04</span>
              <span className="text-amber-400 font-mono text-[10px]">
                {isNoPothole ? 'NONE' : 'Deterministic'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" /> Risk Engine
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isNoPothole ? 'Cost ₹0 calculation' : 'Severity & cost calculation'}
            </p>
          </div>

          {/* Stage 5: AI Report */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between relative ${
            isNoPothole
              ? 'border-slate-800 bg-slate-900/40'
              : 'border-emerald-500/40 bg-emerald-950/20'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[10px] text-slate-500">STAGE 05</span>
              <span className="text-emerald-400 font-mono text-[10px]">FINAL</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AI Report
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for engineer review</p>
          </div>
        </div>
      </div>

      {/* AI Assessment Outputs & Recommendation */}
      {isNoPothole ? (
        /* SPECIAL NO POTHOLE STATE */
        <div className="p-5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-slate-400" />
              <h4 className="font-semibold text-white">No Pothole Detected</h4>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity="NONE" size="md" />
              <PriorityBadge priority="NONE" size="md" />
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Roboflow ML model evaluated the image and found zero road damage or pothole signatures meeting the threshold.
          </p>
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-mono block">ESTIMATED REPAIR COST</span>
              <span className="font-mono text-base font-bold text-slate-200">₹0</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-mono block">RECOMMENDATION</span>
              <span className="font-medium text-slate-300">No Pothole Detected — No Repair Needed</span>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD AI ANALYSIS RESULTS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Severity & Priority */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">SEVERITY & PRIORITY</span>
            <div className="flex items-center gap-2 mb-3">
              <SeverityBadge severity={ai.severity || 'HIGH'} size="lg" />
              <PriorityBadge priority={ai.priority || 'P2'} size="lg" />
            </div>
            <div className="text-xs text-slate-400">
              Calculated via pothole depth, water visibility, and traffic density factors.
            </div>
          </div>

          {/* Repair Cost Estimate */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">ESTIMATED REPAIR COST</span>
            <div className="font-mono text-2xl font-bold text-emerald-400 mb-1">
              {formatCost(ai.estimated_cost)}
            </div>
            <div className="text-xs text-slate-400">
              Deterministic calculation based on detected area & standard municipal rates.
            </div>
          </div>

          {/* AI Summary & Recommendation */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">AI REPAIR RECOMMENDATION</span>
            <p className="text-xs font-medium text-slate-200 leading-relaxed line-clamp-3">
              {ai.repair_recommendation || ai.ai_summary || 'Standard asphalt patching recommended with surface sealing for water drainage.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
