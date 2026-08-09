import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import LocationPicker from '../../components/location/LocationPicker';

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
  const [noticedAt, setNoticedAt] = useState('');
  const [perceivedDanger, setPerceivedDanger] = useState(false);
  const [waterPresent, setWaterPresent] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState('Low');
  const [description, setDescription] = useState('');

  // Location Auto-Detect State
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState<string | null>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocateMe = () => {
    setError(null);
    setLocating(true);
    setLocateMsg('Acquiring precise GPS coordinates...');

    if (!navigator.geolocation) {
      setLocateMsg('Geolocation is not supported by your browser. Please select location manually on the map.');
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
        console.warn('Geolocation permission denied or error:', err);
        setLocateMsg('Location permission was denied. You can select the location manually on the map.');
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
      
      // Clean numeric parsing for latitude and longitude
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        {/* Stepper Header */}
        <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
          <span className={step >= 1 ? 'text-civic-blue border-b-2 border-civic-blue pb-1' : ''}>1. Photo</span>
          <span className={step >= 2 ? 'text-civic-blue border-b-2 border-civic-blue pb-1' : ''}>2. Location</span>
          <span className={step >= 3 ? 'text-civic-blue border-b-2 border-civic-blue pb-1' : ''}>3. Details</span>
          <span className={step >= 4 ? 'text-civic-blue border-b-2 border-civic-blue pb-1' : ''}>4. Review</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Pothole Photo</h2>
              <p className="text-slate-500 text-xs mt-0.5">Capture or select a clear image of the road damage for AI analysis</p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm border border-slate-200" />
                  <p className="text-xs text-emerald-600 font-semibold">✓ Selected: {image?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-civic-blue/10 text-civic-blue flex items-center justify-center mx-auto">
                    📷
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Click or Drag & Drop Image Here</p>
                  <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP (Up to 10MB)</p>
                </div>
              )}
            </div>

            <button 
              onClick={nextStep} 
              disabled={!image}
              className="w-full py-3 bg-civic-blue text-white font-semibold text-sm rounded-lg hover:bg-civic-blue-dark disabled:opacity-50 transition-colors shadow-sm"
            >
              Next: Location Details →
            </button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Location Details</h2>
              <p className="text-slate-500 text-xs mt-0.5">Specify where the road hazard is located</p>
            </div>

            {/* Locate Me Button */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-900">GPS Auto-Location</span>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="px-3 py-1.5 bg-civic-blue hover:bg-civic-blue-dark text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>📍</span>
                  <span>{locating ? 'Locating...' : 'Locate Me (Auto-Fill)'}</span>
                </button>
              </div>
              {locateMsg && (
                <p className="text-xs text-blue-700 font-medium animate-pulse">{locateMsg}</p>
              )}
            </div>

            {/* Interactive OpenStreetMap Picker */}
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChangeCoordinates={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />

            {/* Selected Location Details Card Header */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Selected Location Coordinates</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue font-mono" 
                    value={latitude} 
                    onChange={e => setLatitude(e.target.value)} 
                    placeholder="13.0827"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue font-mono" 
                    value={longitude} 
                    onChange={e => setLongitude(e.target.value)} 
                    placeholder="80.2707"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Road Name / Street</label>
              <input 
                type="text" 
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue" 
                value={roadName} 
                onChange={e => setRoadName(e.target.value)} 
                placeholder="e.g. Grand Southern Trunk Road"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark / Reference Point</label>
              <input 
                type="text" 
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-blue" 
                value={landmark} 
                onChange={e => setLandmark(e.target.value)} 
                placeholder="e.g. Near Bus Stand, opposite Hospital"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} className="w-1/2 py-2.5 border border-slate-300 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={!isLocationValid()}
                className="w-1/2 py-2.5 bg-civic-blue text-white font-semibold text-xs rounded-lg hover:bg-civic-blue-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                Next: Additional Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Additional Hazard Details</h2>
              <p className="text-slate-500 text-xs mt-0.5">Provide hazard severity metrics to aid municipal priority dispatch</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date First Noticed</label>
              <input type="date" className="w-full p-2 text-xs border border-slate-300 rounded-lg" value={noticedAt} onChange={e => setNoticedAt(e.target.value)} />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="danger" checked={perceivedDanger} onChange={e => setPerceivedDanger(e.target.checked)} className="w-4 h-4 text-civic-blue rounded" />
                <label htmlFor="danger" className="text-xs font-semibold text-slate-800 cursor-pointer">Immediate Traffic Safety Hazard?</label>
              </div>
              <p className="text-xs text-slate-500 pl-6">Check if the pothole is deep enough to cause vehicle damage or accidents.</p>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="water" checked={waterPresent} onChange={e => setWaterPresent(e.target.checked)} className="w-4 h-4 text-civic-blue rounded" />
                <label htmlFor="water" className="text-xs font-semibold text-slate-800 cursor-pointer">Is Standing Water Present inside Pothole?</label>
              </div>
              <p className="text-xs text-slate-500 pl-6">Check if water accumulation is obscuring pothole depth.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Traffic Volume</label>
              <select className="w-full p-2 text-xs border border-slate-300 rounded-lg" value={trafficLevel} onChange={e => setTrafficLevel(e.target.value)}>
                <option value="Low">Low (Residential Street)</option>
                <option value="Medium">Medium (Collector Road)</option>
                <option value="High">High (Main Highway / Arterial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Notes (Optional)</label>
              <textarea className="w-full p-2 text-xs border border-slate-300 rounded-lg" rows={3} placeholder="Describe damage size, near risks..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} className="w-1/2 py-2.5 border border-slate-300 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50">← Back</button>
              <button onClick={nextStep} className="w-1/2 py-2.5 bg-civic-blue text-white font-semibold text-xs rounded-lg hover:bg-civic-blue-dark shadow-sm">Review Report →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Review & Submit Report</h2>
              <p className="text-slate-500 text-xs mt-0.5">Please confirm your report details before submitting to municipal AI pipeline</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200">
              <p><strong className="text-slate-700">Photo File:</strong> {image?.name}</p>
              <p><strong className="text-slate-700">Road Location:</strong> {roadName || 'Recorded Road'} {latitude ? `(${latitude}, ${longitude})` : ''}</p>
              <p><strong className="text-slate-700">Landmark:</strong> {landmark || 'None'}</p>
              <p><strong className="text-slate-700">Perceived Danger:</strong> {perceivedDanger ? 'High Hazard' : 'Normal'}</p>
              <p><strong className="text-slate-700">Water Present:</strong> {waterPresent ? 'Yes' : 'No'}</p>
              <p><strong className="text-slate-700">Traffic Level:</strong> {trafficLevel}</p>
              <p><strong className="text-slate-700">Description:</strong> {description || 'None'}</p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} disabled={loading} className="w-1/2 py-2.5 border border-slate-300 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 disabled:opacity-50">
                ← Edit Details
              </button>
              <button onClick={handleSubmit} disabled={loading} className="w-1/2 py-2.5 bg-civic-blue text-white font-semibold text-xs rounded-lg hover:bg-civic-blue-dark disabled:opacity-50 shadow-sm">
                {loading ? 'Submitting to AI Pipeline...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
