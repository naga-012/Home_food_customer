import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  User,
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;
  const initialEmail =
    location.state?.registeredEmail ||
    location.state?.email ||
    new URLSearchParams(location.search).get('email') ||
    '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const registrationMsg = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');

    if (!newPassword) {
      // Step 1: Send reset token notification
      try {
        setLoading(true);
        const res = await authService.forgotPassword({ email: email.trim() });
        setForgotMsg(res.data.message || 'Account verified. Now enter your new password below.');
      } catch (err) {
        setError(err.response?.data?.detail || 'Account not found. Please verify your email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        new_password: newPassword,
        reset_token: 'demo-reset-token',
      });
      setForgotMsg(res.data.message || 'Password reset successfully! You can now sign in.');
      setTimeout(() => {
        setForgotMode(false);
        setPassword(newPassword);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-100 shadow-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <UtensilsCrossed size={22} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            {forgotMode ? 'Reset Your Password' : 'Sign in to Inti Ruchi'}
          </h1>
          <p className="text-xs text-slate-500">
            {forgotMode
              ? 'Enter your registered email to receive reset instructions'
              : 'Taste the warmth of pure, healthy, homemade food'}
          </p>
        </div>

        {/* Registration notification message */}
        {registrationMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Successful!</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">{registrationMsg}</p>
            </div>
          </div>
        )}

        {/* Customer instructions note */}
        <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 text-xs text-orange-950 flex items-start gap-2">
          <User size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Please enter your registered customer email and password to sign in and order fresh homemade food.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {forgotMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
            {forgotMsg}
          </div>
        )}

        {!forgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@intiruchi.com"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-[11px] text-orange-600 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In ➔'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter your account email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@intiruchi.com"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-600/20 transition-all"
            >
              {loading ? 'Resetting Password...' : 'Reset Password ➔'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setForgotMsg('');
                setError('');
              }}
              className="w-full py-2 text-slate-500 font-semibold text-xs hover:underline"
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
          <p>
            Don't have a customer account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
