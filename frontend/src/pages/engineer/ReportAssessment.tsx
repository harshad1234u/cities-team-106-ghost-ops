import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type ReportDetail } from '../../services/api';
import { AIPipelineVisualizer } from '../../components/AIPipelineVisualizer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ArrowLeft, CheckCircle2, AlertTriangle, MapPin, Send } from 'lucide-react';

export default function ReportAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field Inputs State
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
      }, 1800);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-100 p-6 max-w-5xl mx-auto"><LoadingSkeleton type="detail" /></div>;
  if (error || !report) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-red-600 font-bold">{error || 'Report not found'}</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-900">
      <div className="w-full max-w-6xl space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex justify-between items-center">
          <Link to="/engineer" className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inspection Queue
          </Link>
          <span className="text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Live Engineering Assessment Form
          </span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Field Engineering Assessment</h1>
              <StatusBadge status={report.status} size="md" />
            </div>
            <p className="font-mono text-xs font-bold text-indigo-700 mt-1">ID: {report.report_id}</p>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={report.ai?.severity || 'MEDIUM'} size="md" />
            <PriorityBadge priority={report.ai?.priority || 'P2'} size="md" />
          </div>
        </div>

        {submitSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Field Assessment submitted successfully with backend status synchronization! Returning to queue...</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 3-Column Inspection Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Citizen Evidence & AI Visualizer (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Citizen Evidence */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-2 h-2 rounded-full bg-sky-600" /> Citizen Field Evidence
              </h3>

              {report.image?.url ? (
                <img src={report.image.url} alt="Field Evidence" className="w-full h-52 object-cover rounded-2xl border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-full h-52 bg-slate-100 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-400 font-mono text-xs">
                  No Image
                </div>
              )}

              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <p className="font-semibold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  {report.location?.road_name || 'N/A'}
                </p>
                {report.location?.landmark && <p className="text-slate-500 text-[11px] pl-4">Landmark: {report.location.landmark}</p>}
                {report.description && <p className="text-slate-700 italic pt-1 border-t border-slate-200">"{report.description}"</p>}
              </div>
            </div>

            {/* AI Visualizer */}
            <AIPipelineVisualizer report={report} />
          </div>

          {/* Right Column: Engineering Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Physical Measurement & Inspection Form</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live engineering assessment form with backend status synchronization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Coordinates</label>
                  <input
                    type="text"
                    readOnly
                    value={report.location?.latitude ? `${report.location.latitude}, ${report.location.longitude}` : '13.0827, 80.2707'}
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pothole Report ID</label>
                  <input
                    type="text"
                    readOnly
                    value={report.report_id}
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Road Category</label>
                  <select
                    value={roadCategory}
                    onChange={e => setRoadCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  >
                    <option value="Arterial">Arterial Major Highway</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local">Local Residential Street</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Road Environment</label>
                  <select
                    value={roadEnvironment}
                    onChange={e => setRoadEnvironment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  >
                    <option value="Urban">Urban Zone</option>
                    <option value="Suburban">Suburban</option>
                    <option value="Rural">Rural Highway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approx. Length (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={approxLength}
                    onChange={e => setApproxLength(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approx. Width (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={approxWidth}
                    onChange={e => setApproxWidth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apparent Depth</label>
                  <select
                    value={apparentDepth}
                    onChange={e => setApparentDepth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Shallow">Shallow (&lt; 2 cm)</option>
                    <option value="Moderate">Moderate (2 - 5 cm)</option>
                    <option value="Deep">Deep (&gt; 5 cm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Surrounding Damage</label>
                  <select
                    value={surroundingDamage}
                    onChange={e => setSurroundingDamage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Minimal">Minimal Wear</option>
                    <option value="Cracking">Cracking Asphalt</option>
                    <option value="Severe">Severe Sub-base Structural Loss</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Water Drainage Condition</label>
                  <select
                    value={waterDrainage}
                    onChange={e => setWaterDrainage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Good">Good Drainage</option>
                    <option value="Ponding">Water Accumulating / Ponding</option>
                    <option value="Blocked">Culvert / Drain Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Traffic Impact Level</label>
                  <select
                    value={trafficLevel}
                    onChange={e => setTrafficLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Low">Low Density</option>
                    <option value="Medium">Medium Flow</option>
                    <option value="High">High Density Traffic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safety Risk Level</label>
                  <select
                    value={safetyRisk}
                    onChange={e => setSafetyRisk(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Hazard</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nearby Landmark Hazard Location</label>
                  <input
                    type="text"
                    value={nearbyRiskLocation}
                    onChange={e => setNearbyRiskLocation(e.target.value)}
                    placeholder="e.g. School zone, bus stand"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Engineering Observation & Field Directive</label>
                <textarea
                  rows={3}
                  value={engineeringObservation}
                  onChange={e => setEngineeringObservation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Repair Urgency</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  <option value="Routine">Routine Schedule (Within 7 days)</option>
                  <option value="Priority">Priority Dispatch (Within 48 hours)</option>
                  <option value="Emergency">Emergency Dispatch (Immediate)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Assessment...' : 'Submit Engineering Assessment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
