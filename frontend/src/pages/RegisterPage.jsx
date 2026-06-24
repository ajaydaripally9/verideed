import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Field validations
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      setSuccess(true);
      
      // Auto login user upon registration
      setTimeout(() => {
        const userData = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        };
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Registration error', err);
      const errorMsg = err.response?.data?.error || 'Registration failed. Please check your inputs or try again later.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 overflow-hidden text-slate-800">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 bg-white border border-slate-200 shadow-lg transition-all duration-300">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-outfit">Create Inspector Account</h2>
          <p className="text-slate-500 text-xs mt-1">Register to access VeriDeed forensic map</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3.5 mb-6 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl animate-pulse">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-full animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registration Successful!</h3>
            <p className="text-sm text-slate-500">Decrypting your dashboard access tokens...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Inspector Name"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@corporate.com"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Encrypting profile...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign In here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
