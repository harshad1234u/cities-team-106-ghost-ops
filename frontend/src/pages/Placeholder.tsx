export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{name}</h1>
        <p className="text-slate-500 text-sm mt-1">Operational view and system management module</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-civic-blue rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{name} Module Active</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This system module is connected to the CivoAI core pipeline and will dynamically populate as live telemetry data is received.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase font-mono">
          <span>Status: Configured & Ready</span>
        </div>
      </div>
    </div>
  );
}
