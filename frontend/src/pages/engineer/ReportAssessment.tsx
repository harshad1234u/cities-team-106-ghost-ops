import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';

export default function ReportAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [roadCategory, setRoadCategory] = useState('Arterial');
  const [roadEnvironment, setRoadEnvironment] = useState('Urban');
  const [approxLength, setApproxLength] = useState('1.5');
  const [approxWidth, setApproxWidth] = useState('1.0');
  const [apparentDepth, setApparentDepth] = useState('Moderate');
  const [surroundingDamage, setSurroundingDamage] = useState('Cracking');
  const [waterDrainage, setWaterDrainage] = useState('Good');
  const [trafficLevel, setTrafficLevel] = useState('High');
  const [safetyRisk, setSafetyRisk] = useState('High');
  const [nearbyRiskLocation, setNearbyRiskLocation] = useState('School Zone');
  const [engineeringObservation, setEngineeringObservation] = useState('Surface asphalt deterioration observed. Immediate patch repair recommended.');
  const [urgency, setUrgency] = useState('Emergency');

  useEffect(() => {
    if (!id) return;
    api.getReport(id)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load report');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      road_category: roadCategory,
      road_environment: roadEnvironment,
      approx_length: parseFloat(approxLength) || 0,
      approx_width: parseFloat(approxWidth) || 0,
      apparent_depth: apparentDepth,
      surrounding_damage: surroundingDamage,
      water_drainage: waterDrainage,
      traffic_level: trafficLevel,
      safety_risk: safetyRisk,
      nearby_risk_location: nearbyRiskLocation,
      engineering_observation: engineeringObservation,
      urgency: urgency,
    };

    try {
      await api.updateEngineerAssessment(id!, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/engineer');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading inspection report...</div>;
  if (error || !report) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600 font-medium">{error || 'Report not found'}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-5xl space-y-6">
        <Link to="/engineer" className="text-civic-blue hover:underline text-sm font-medium flex items-center gap-1">
          ← Back to Queue
        </Link>
        
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Field Engineering Assessment</h1>
            <p className="font-mono text-slate-500 text-sm mt-1">Report ID: {report.report_id}</p>
          </div>
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-full text-xs uppercase tracking-wider">
            {report.status}
          </span>
        </div>

        {submitSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Field Assessment submitted successfully! Returning to inspection queue...
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {submitError}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Evidence */}
          <div className="space-y-6">
            
            {/* Citizen Evidence Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Citizen Evidence & Photo</span>
                <span className="text-xs font-mono text-slate-500">{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              <div className="p-4 space-y-4 text-sm">
                {report.image?.url ? (
                  <img src={report.image.url} alt="Reported issue" className="w-full h-64 object-cover rounded-lg border border-slate-200 shadow-sm" />
                ) : (
                  <div className="aspect-video bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 font-mono">No Image Available</div>
                )}
                <div className="grid grid-cols-2 gap-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-semibold">Location</span> 
                    <span className="font-medium text-slate-800 text-xs">{report.location?.road_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-semibold">Landmark</span> 
                    <span className="font-medium text-slate-800 text-xs">{report.location?.landmark || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-semibold">Water Visible</span> 
                    <span className="font-medium text-slate-800 text-xs">{report.water_visible ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-semibold">Danger Level</span> 
                    <span className="font-medium text-slate-800 text-xs">{report.citizen_danger ? 'High Danger' : 'Normal'}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="block text-slate-400 text-xs uppercase font-semibold">Citizen Description</span> 
                    <p className="text-slate-800 text-xs italic mt-0.5">{report.description || 'No description provided.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Evidence Card */}
            <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
               <div className="bg-indigo-100/60 px-4 py-3 border-b border-indigo-200 flex items-center justify-between">
                <span className="font-bold text-indigo-900 text-sm">AI Computer Vision Telemetry</span>
                <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {report.ai?.severity || 'AI VERIFIED'}
                </span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                {report.ai?.detection ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div>
                       <span className="block text-indigo-400 font-semibold uppercase">Detection Result</span> 
                       <span className="font-bold text-indigo-900">{report.ai.detection.pothole_detected ? 'Pothole Confirmed' : 'No Pothole'}</span>
                     </div>
                     <div>
                       <span className="block text-indigo-400 font-semibold uppercase">Model Confidence</span> 
                       <span className="font-bold text-indigo-900">{Math.round((report.ai.detection.confidence || 0) * 100)}%</span>
                     </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs">No AI detection telemetry data.</p>
                )}
                {report.ai?.ai_summary && (
                  <div className="pt-2 border-t border-indigo-100 text-xs text-indigo-950">
                    <span className="font-semibold block text-indigo-700 mb-0.5">AI Summary</span>
                    <p className="italic">"{report.ai.ai_summary}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Physical Measurement Form</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">GPS Coordinates</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono" 
                    defaultValue={report.location?.latitude ? `${report.location.latitude}, ${report.location.longitude}` : '13.0827, 80.2707'} 
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pothole Number (ID)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold" 
                    readOnly 
                    value={report.report_id} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Road Category</label>
                  <select 
                    value={roadCategory} 
                    onChange={e => setRoadCategory(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Arterial">Arterial Road</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local">Local Street</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Road Environment</label>
                  <select 
                    value={roadEnvironment} 
                    onChange={e => setRoadEnvironment(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Urban">Urban Zone</option>
                    <option value="Suburban">Suburban</option>
                    <option value="Rural">Rural Highway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Approx. Length (m)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={approxLength}
                    onChange={e => setApproxLength(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Approx. Width (m)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={approxWidth}
                    onChange={e => setApproxWidth(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Apparent Depth</label>
                  <select 
                    value={apparentDepth} 
                    onChange={e => setApparentDepth(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Shallow">Shallow (&lt; 2 cm)</option>
                    <option value="Moderate">Moderate (2 - 5 cm)</option>
                    <option value="Deep">Deep (&gt; 5 cm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Surrounding Damage</label>
                  <select 
                    value={surroundingDamage} 
                    onChange={e => setSurroundingDamage(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Minimal">Minimal</option>
                    <option value="Cracking">Cracking Asphalt</option>
                    <option value="Severe">Severe Structural Loss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Water Drainage</label>
                  <select 
                    value={waterDrainage} 
                    onChange={e => setWaterDrainage(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Good">Good Drainage</option>
                    <option value="Ponding">Water Ponding</option>
                    <option value="Blocked">Blocked Drain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Traffic Volume</label>
                  <select 
                    value={trafficLevel} 
                    onChange={e => setTrafficLevel(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Low">Low Volume</option>
                    <option value="Medium">Medium Volume</option>
                    <option value="High">High Density</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Safety Risk</label>
                  <select 
                    value={safetyRisk} 
                    onChange={e => setSafetyRisk(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Hazard</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nearby Landmark Hazard</label>
                  <input 
                    type="text" 
                    value={nearbyRiskLocation}
                    onChange={e => setNearbyRiskLocation(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue" 
                    placeholder="e.g. School zone, intersection" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Engineering Field Observation</label>
                <textarea 
                  rows={3}
                  value={engineeringObservation}
                  onChange={e => setEngineeringObservation(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Repair Urgency</label>
                <select 
                  value={urgency} 
                  onChange={e => setUrgency(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue font-bold text-slate-800"
                >
                  <option value="Routine">Routine Schedule (Within 7 days)</option>
                  <option value="Priority">Priority Repair (Within 48 hours)</option>
                  <option value="Emergency">Emergency Dispatch (Immediate)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3 bg-civic-blue hover:bg-civic-blue-dark text-white font-bold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting Assessment...' : 'Submit Assessment'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
