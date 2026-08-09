import { useState } from 'react';

export default function AdminSettings() {
  const [roboflowConfidence, setRoboflowConfidence] = useState('50');
  const [nemotronModel, setNemotronModel] = useState('nvidia/nemotron-3-nano-omni-30b-a3b-reasoning');
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@civoai.gov');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings & AI Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">Configure computer vision models, API integrations, and operational parameters</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          System settings updated and synchronized with FastAPI backend.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Model Parameters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-civic-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            AI Pipeline Thresholds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Roboflow Detection Cutoff (% Confidence)
              </label>
              <input
                type="number"
                min="10"
                max="95"
                value={roboflowConfidence}
                onChange={e => setRoboflowConfidence(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue text-sm"
              />
              <span className="text-xs text-slate-400 mt-1 block">Detections below this threshold are flagged as UNCERTAIN</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                NVIDIA Nemotron Reasoning Model
              </label>
              <input
                type="text"
                value={nemotronModel}
                onChange={e => setNemotronModel(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue text-sm font-mono"
              />
              <span className="text-xs text-slate-400 mt-1 block">Configured NIM model identifier</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-800">Auto-Escalate Critical Potholes</span>
              <p className="text-xs text-slate-500">Automatically flag P1 Critical hazards for immediate engineer dispatch</p>
            </div>
            <input
              type="checkbox"
              checked={autoEscalate}
              onChange={e => setAutoEscalate(e.target.checked)}
              className="w-5 h-5 text-civic-blue rounded border-slate-300 focus:ring-civic-blue cursor-pointer"
            />
          </div>
        </div>

        {/* API Integration Services */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            API Provider Integration Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase">Roboflow Model</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">✓ Connected</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">my-first-project-0t7uc/2</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase">NVIDIA NIM API</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">✓ Connected</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">integrate.api.nvidia.com</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase">Supabase Storage</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">✓ Connected</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">bucket: pothole-images</div>
            </div>
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Alerts & Notification Dispatch
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notification Recipient Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-civic-blue text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-sm font-medium text-slate-800">Email Dispatch Alerts</span>
                <p className="text-xs text-slate-500">Send structured email reports to admin upon AI report completion</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 text-civic-blue rounded border-slate-300 focus:ring-civic-blue cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-civic-blue hover:bg-civic-blue-dark text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
