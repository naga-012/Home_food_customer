import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { UtensilsCrossed, User, Mail, Phone, Lock, MapPin, Loader2, ChefHat, CheckCircle2, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    city: 'Hyderabad',
    pincode: '500081',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
      });

      // Automatic login removed - explicitly ask customer to log in
      setRegisteredSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    const loginTarget = redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login';

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-100 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} className="stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-serif text-slate-900">
              Account Created Successfully!
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Welcome to Inti Ruchi, <strong className="text-slate-800">{formData.name}</strong>! Your account has been registered. Please sign in with your email and password to proceed.
            </p>
          </div>

          <div className="p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl text-left space-y-1 text-xs">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Registered Customer Email:</span>
            <p className="font-semibold text-slate-800 break-all">{formData.email}</p>
          </div>

          <button
            onClick={() =>
              navigate(loginTarget, {
                state: {
                  registeredEmail: formData.email,
                  message: 'Registration successful! Please enter your password to sign in.',
                },
              })
            }
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>Sign In to Your Customer Account</span>
            <ArrowRight size={15} />
          </button>

          <div className="pt-2 border-t border-slate-100">
            <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-orange-600 transition-colors">
              ← Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <UtensilsCrossed size={22} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Create Foodie Account
          </h1>
          <p className="text-xs text-slate-500">
            Join Inti Ruchi to order fresh, authentic home-cooked food in your neighborhood
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Reddy"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@example.com"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat no., Apartment name, Street"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account ➔'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
