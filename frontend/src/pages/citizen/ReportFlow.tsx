import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import LocationPicker from '../../components/location/LocationPicker';
import { Camera, MapPin, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Droplets, AlertTriangle } from 'lucide-react';

export default function ReportFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [roadName, setRoadName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [perceivedDanger, setPerceivedDanger] = useState(false);
  const [waterPresent, setWaterPresent] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState('Low');
  const [description, setDescription] = useState('');

  // Location Auto-Detect State
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState<string | null>(null);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocateMe = () => {
    setError(null);
    setLocating(true);
    setLocateMsg('Acquiring precise GPS coordinates...');

    if (!navigator.geolocation) {
      setLocateMsg('Geolocation not supported. Please select location manually on the map.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lon);
        setLocateMsg('📍 GPS coordinates captured!');

        // Geocoding Fallback Workflow:
        // GPS selected -> Reverse geocoding -> Road name if available -> Landmark if available -> Manual correction
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
            const lmark = data.address?.neighbourhood || data.address?.city_district || data.address?.city || '';
            if (road && !roadName) setRoadName(road);
            if (lmark && !landmark) setLandmark(`Near ${lmark}`);
          }
        } catch (err) {
          console.error('Reverse geocoding exception:', err);
        } finally {
          setLocating(false);
          setTimeout(() => setLocateMsg(null), 3500);
        }
      },
      (err) => {
        console.warn('Geolocation permission denied:', err);
        setLocateMsg('Location permission denied. Please select location manually on map.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const isLocationValid = () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    return !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lon) && lon >= -180 && lon <= 180;
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please select a photo before submitting.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const cleanLat = parseFloat(latitude) || 13.0827;
      const cleanLon = parseFloat(longitude) || 80.2707;
      formData.append('latitude', String(cleanLat));
      formData.append('longitude', String(cleanLon));
      formData.append('road_name', roadName || 'Recorded Road');
      if (description) formData.append('description', description);
      formData.append('citizen_danger', perceivedDanger ? 'true' : 'false');
      formData.append('water_visible', waterPresent ? 'true' : 'false');

      const response = await api.createReport(formData);
      if (response && response.report_id) {
        navigate('/citizen/success', { state: { reportId: response.report_id } });
      } else {
        throw new Error("Server did not return a valid report ID");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || 'Failed to submit report. Please check server connection.');
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: '01 Photo' },
    { num: 2, label: '02 Location' },
    { num: 3, label: '03 Details' },
    { num: 4, label: '04 Review' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 font-sans text-slate-900">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Link to="/citizen" className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Citizen Dashboard
        </Link>
        <span className="text-[11px] font-mono text-slate-500">CivoAI Hazard Ingestion</span>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Attractively Styled 5-Step Stepper */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-5">
          {stepsList.map(s => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : isDone
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: PHOTO */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Pothole Photo</h2>
              <p className="text-xs text-slate-500 mt-1">Capture or attach a clear photo of the road hazard for machine vision ingestion.</p>
            </div>

            <div className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 rounded-2xl p-8 text-center transition-all relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageChange(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-md border border-slate-200 object-cover" />
                  <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Photo Loaded: {image?.name}
                  </p>
                  <p className="text-[11px] text-slate-400">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-600/10 text-sky-600 flex items-center justify-center mx-auto ring-1 ring-sky-500/30">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Take Photo or Choose File</p>
                    <p className="text-xs text-slate-500 mt-0.5">Drag & Drop image here (JPG, PNG, WEBP)</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={nextStep}
              disabled={!image}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Location Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Location Details</h2>
              <p className="text-xs text-slate-500 mt-1">Specify coordinates or click on map to position the hazard pin.</p>
            </div>

            {/* GPS Auto-Locate Button */}
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-900">Automatic GPS Position</span>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
                </button>
              </div>
              {locateMsg && <p className="text-xs text-sky-800 font-medium animate-pulse">{locateMsg}</p>}
            </div>

            {/* Interactive Map Picker */}
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChangeCoordinates={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />

            {/* Location Fields - Editable by Citizen */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">LATITUDE</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    placeholder="13.0827"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">LONGITUDE</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    placeholder="80.2707"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Road Name / Street (Editable)</label>
                <input
                  type="text"
                  value={roadName}
                  onChange={e => setRoadName(e.target.value)}
                  placeholder="e.g. Grand Southern Trunk Road"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark / District (Editable)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Central Bus Stand"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="w-1/2 py-3 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50">
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isLocationValid()}
                className="w-1/2 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 shadow-sm cursor-pointer"
              >
                Next: Additional Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hazard Indicators</h2>
              <p className="text-xs text-slate-500 mt-1">Use visual toggles to indicate environmental risk factors.</p>
            </div>

            {/* Visual Chip Toggle: Perceived Danger */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">PERCEIVED DANGER LEVEL</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPerceivedDanger(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    !perceivedDanger
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>Normal Hazard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPerceivedDanger(true)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    perceivedDanger
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>High Danger</span>
                </button>
              </div>
            </div>

            {/* Visual Chip Toggle: Water Present */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">WATER VISIBILITY</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWaterPresent(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    !waterPresent
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>No Standing Water</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWaterPresent(true)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    waterPresent
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/20'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Droplets className="w-4 h-4 text-cyan-200" />
                  <span>Water Visible</span>
                </button>
              </div>
            </div>

            {/* Traffic Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Traffic Volume Level</label>
              <select
                value={trafficLevel}
                onChange={e => setTrafficLevel(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
              >
                <option value="Low">Low (Quiet Residential Street)</option>
                <option value="Medium">Medium (Collector / Business District)</option>
                <option value="High">High (Major Arterial / Highway)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Description & Context</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="E.g. Deep hole near bus stop edge..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="w-1/2 py-3 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50">
                ← Back
              </button>
              <button onClick={nextStep} className="w-1/2 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm">
                Next: Review Evidence →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Evidence Card</h2>
              <p className="text-xs text-slate-500 mt-1">Ready to submit? Verify details before AI pipeline ingestion.</p>
            </div>

            {/* Evidence Card Summary */}
            <div className="p-5 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-4">
              {imagePreview && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={imagePreview} alt="Hazard preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">ROAD LOCATION</span>
                  <span className="font-bold text-slate-800">{roadName || 'Recorded Road'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">GPS COORDINATES</span>
                  <span className="font-mono text-slate-800 font-semibold">{latitude}, {longitude}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">DANGER LEVEL</span>
                  <span className={`font-bold ${perceivedDanger ? 'text-red-600' : 'text-slate-700'}`}>
                    {perceivedDanger ? '⚡ High Danger' : 'Normal'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">WATER VISIBLE</span>
                  <span className={`font-bold ${waterPresent ? 'text-cyan-600' : 'text-slate-700'}`}>
                    {waterPresent ? '💧 Yes' : 'No'}
                  </span>
                </div>
              </div>

              {description && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">NOTES</span>
                  <p className="text-slate-700 italic">"{description}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} disabled={loading} className="w-1/2 py-3.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 disabled:opacity-50">
                ← Edit Details
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-1/2 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl disabled:opacity-50 shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting Report...' : 'Ready to Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
