import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { User, Lock, CheckCircle2, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Hyderabad',
    pincode: user?.pincode || '500081',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      setError('');
      const res = await authService.updateProfile(profileData);
      updateCurrentUser(res.data);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingPass(true);
      setError('');
      await authService.changePassword(passwordData);
      setPassSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '' });
      setTimeout(() => setPassSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal contact info and delivery preferences</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Personal Info Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <User size={18} className="text-orange-600" /> Personal & Delivery Information
        </h2>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} /> {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Default Delivery Address</label>
            <input
              type="text"
              required
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                value={profileData.pincode}
                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingProfile}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              {loadingProfile ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock size={18} className="text-orange-600" /> Security & Password
        </h2>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} /> {passSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingPass}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              {loadingPass ? <Loader2 size={14} className="animate-spin" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
