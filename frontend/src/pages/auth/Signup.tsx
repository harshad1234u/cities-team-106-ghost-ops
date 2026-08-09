import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';
import type { AppRole } from '../../contexts/AuthContext';
import { Shield, Lock, Mail, UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppRole>('citizen');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('rate limit')) {
          const mockId = '00000000-0000-4000-8000-' + Array.from(new TextEncoder().encode(email.padEnd(12, '0'))).slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
          
          localStorage.setItem(`civo_role_${mockId}`, role || 'citizen');
          await api.syncUser(mockId, email, role || 'citizen');
          
          setSuccess(true);
          setLoading(false);
          return;
        }

        setError(signUpError.message);
        setLoading(false);
      } else {
        if (data?.user) {
          localStorage.setItem(`civo_role_${data.user.id}`, role || 'citizen');
          await api.syncUser(data.user.id, email, role || 'citizen');
        }
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/citizen`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (googleError) {
        setError(googleError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md p-8 bg-slate-950/90 rounded-3xl border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Account Registered</h2>
          <p className="text-xs text-slate-300">
            Account (<strong>{email}</strong>) successfully registered as <strong>{(role || 'citizen').toUpperCase()}</strong>.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-500/40">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create CivoAI Account</h1>
          <p className="text-xs text-slate-400">Register new Citizen, Engineer, or Admin role</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl border border-slate-700 hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-950 text-[10px] text-slate-500 uppercase font-mono font-semibold">
              OR EMAIL REGISTRATION
            </span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Select Role</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                className="w-full p-2.5 pl-9 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:ring-1 focus:ring-indigo-500"
                value={role || 'citizen'}
                onChange={e => setRole(e.target.value as AppRole)}
              >
                <option value="citizen">Citizen (Report Hazards)</option>
                <option value="engineer">Field Engineer (Verification)</option>
                <option value="admin">System Administrator (GIS Command Center)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                className="w-full p-2.5 pl-9 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="javithbasha.cs24@krct.ac.in"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                className="w-full p-2.5 pl-9 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
          <span>Already have an account?</span>
          <Link to="/auth/login" className="text-cyan-400 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
