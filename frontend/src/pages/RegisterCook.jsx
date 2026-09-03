import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { ChefHat, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

const RegisterCook = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    kitchen_name: '',
    specialization: 'South Indian & Andhra Meals',
    description: '',
    address: '',
    city: 'Hyderabad',
    pincode: '500081',
    banner_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredPending, setRegisteredPending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.registerCook(formData);
      // Automatic login removed
      setRegisteredPending(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Kitchen registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registeredPending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ChefHat size={44} />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          Kitchen Registered – Pending Approval!
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Your home kitchen <strong>"{formData.kitchen_name}"</strong> has been registered with status <span className="text-amber-600 font-bold">PENDING APPROVAL</span>. Our onboarding team will review and verify your home kitchen details shortly. Once approved, you can log in to your kitchen dashboard.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs shadow-md"
          >
            Sign In to Kitchen Account ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-2xl w-full border border-slate-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ChefHat size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Register as a Home Cook
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Turn your passion for homestyle cooking into an empowering business. Reach thousands of food lovers near your home.
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
              <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Radhika Sharma"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
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
                placeholder="10-digit phone"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. radhika@example.com"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Password</label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a password"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kitchen Name</label>
              <input
                type="text"
                required
                name="kitchen_name"
                value={formData.kitchen_name}
                onChange={handleChange}
                placeholder="e.g. Radhika's Rasoi"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cuisine Specialization</label>
              <input
                type="text"
                required
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Gujarati & Marwari Thalis"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kitchen Story & Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell foodies about your cooking background, family recipes, or pure ingredients..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kitchen / Home Address</label>
            <input
              type="text"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full street address for pickup/delivery"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
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
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
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
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Kitchen Application ➔'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Sign In to Kitchen
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterCook;
