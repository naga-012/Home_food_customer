import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, authService } from '../services/api';
import VegBadge from '../components/common/VegBadge';
import {
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ChefHat,
  ShoppingBag,
  Check,
  AlertCircle,
} from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated, login, logout } = useAuth();

  // Swiggy In-line Auth states
  const [authTab, setAuthTab] = useState('LOGIN'); // 'LOGIN' or 'SIGNUP'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: 'Hyderabad',
    pincode: '500081',
  });

  // Delivery & Order states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500081');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // COD, UPI, CARD
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Sync address with user when user logs in
  useEffect(() => {
    if (user) {
      if (user.address) setAddress(user.address);
      if (user.city) setCity(user.city);
      if (user.pincode) setPincode(user.pincode);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Handle In-line Login
  const handleInlineLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthError('');
      await login(loginEmail, loginPassword);
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle In-line Sign Up
  const handleInlineSignup = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthError('');
      await authService.registerCustomer(signupData);
      
      // Auto-prompt: Switch to login tab and prefill email with guidance
      setLoginEmail(signupData.email);
      setAuthSuccessMsg('Account created successfully! Please enter your password to sign in.');
      setAuthTab('LOGIN');
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Registration failed. Please check details.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthError('Please log in with your customer account to place order.');
      return;
    }

    try {
      setSubmitting(true);
      setOrderError('');

      const orderData = {
        delivery_address: address || 'Hyderabad',
        city: city || 'Hyderabad',
        pincode: pincode || '500081',
        phone: phone || user?.phone || '9876543210',
        payment_method: paymentMethod,
        special_instructions: instructions,
      };

      const res = await orderService.createOrder(orderData);
      setOrderSuccess(res.data);
      await clearCart();
    } catch (err) {
      setOrderError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen (Swiggy confirmation style)
  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900">Order Confirmed!</h1>
          <p className="text-xs text-slate-500 mt-1">
            Order #{orderSuccess.order_number} has been assigned to your local home chef
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left max-w-md mx-auto space-y-3.5 text-xs">
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Total Amount Paid</span>
            <span className="font-extrabold text-slate-900 text-sm">₹{orderSuccess.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Payment Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {orderSuccess.payment_method} ({orderSuccess.payment_status})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivering To</span>
            <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
              {orderSuccess.delivery_address}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/customer/orders"
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all text-center"
          >
            Track Order Live ➔
          </Link>
          <Link
            to="/foods"
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all text-center"
          >
            Browse More Homemade Food
          </Link>
        </div>
      </div>
    );
  }

  // Empty Cart Screen
  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag size={30} />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-800">Your basket is empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add fresh homestyle delicacies to your cart to proceed with checkout.
        </p>
        <Link
          to="/foods"
          className="inline-block px-6 py-3 bg-orange-600 text-white font-bold text-xs rounded-2xl shadow-md"
        >
          Explore Today's Menu ➔
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">Swiggy-style fast, contactless homemade delivery</p>
        </div>
        <Link
          to="/cart"
          className="text-xs text-orange-600 font-bold hover:underline hidden sm:inline"
        >
          ← Modify Cart ({cart.items.length} items)
        </Link>
      </div>

      {orderError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Swiggy Multi-step Workflow */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* STEP 1: ACCOUNT (Swiggy In-line Login / Signup) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isAuthenticated
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {isAuthenticated ? <Check size={16} /> : '1'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Account Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAuthenticated ? 'Logged in securely' : 'Sign in or sign up to place your order'}
                  </p>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-800"
                >
                  CHANGE ACCOUNT
                </button>
              )}
            </div>

            {isAuthenticated ? (
              /* Authenticated User View */
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{user?.name}</h4>
                    <p className="text-[11px] text-slate-600">{user?.email} • {user?.phone || 'Customer'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
            ) : (
              /* Unauthenticated Swiggy Dual-Tab Card */
              <div className="space-y-4">
                {/* Dual Tabs */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('LOGIN');
                      setAuthError('');
                    }}
                    className={`py-2.5 rounded-xl transition-all ${
                      authTab === 'LOGIN'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HAVE AN ACCOUNT? LOG IN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('SIGNUP');
                      setAuthError('');
                    }}
                    className={`py-2.5 rounded-xl transition-all ${
                      authTab === 'SIGNUP'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    NEW USER? SIGN UP
                  </button>
                </div>

                {authSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                    {authError}
                  </div>
                )}

                {authTab === 'LOGIN' ? (
                  /* Swiggy In-line Login Form */
                  <form onSubmit={handleInlineLogin} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Registered Customer Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. customer@intiruchi.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      {authLoading ? <Loader2 size={16} className="animate-spin" /> : 'SIGN IN & PROCEED ➔'}
                    </button>
                  </form>
                ) : (
                  /* Swiggy In-line Sign Up Form */
                  <form onSubmit={handleInlineSignup} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          placeholder="e.g. Ramesh Reddy"
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          placeholder="10-digit mobile"
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          placeholder="e.g. ramesh@example.com"
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Street Address</label>
                      <input
                        type="text"
                        required
                        value={signupData.address}
                        onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                        placeholder="Flat no., Building name, Landmark"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      {authLoading ? <Loader2 size={16} className="animate-spin" /> : 'CREATE ACCOUNT & CONTINUE ➔'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: DELIVERY ADDRESS */}
          <div
            className={`bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 transition-all ${
              !isAuthenticated ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isAuthenticated ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Delivery Address
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAuthenticated ? 'Confirm home delivery location' : 'Log in to select address'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Street Address & Flat Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Green Meadows, Hitec City"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone for Delivery</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cooking / Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Mild spice please, leave with security at gate"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div
            className={`bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 transition-all ${
              !isAuthenticated ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isAuthenticated ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Payment Method
                  </h3>
                  <p className="text-[11px] text-slate-400">Choose your preferred payment mode</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                <Lock size={11} /> 100% Secure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <QrCode size={20} className={paymentMethod === 'UPI' ? 'text-orange-600' : 'text-slate-500'} />
                <h4 className="font-bold text-xs text-slate-800 mt-2">UPI / GPay</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Instant simulated payment</p>
              </div>

              {/* COD */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <Banknote size={20} className={paymentMethod === 'COD' ? 'text-orange-600' : 'text-slate-500'} />
                <h4 className="font-bold text-xs text-slate-800 mt-2">Cash on Delivery</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Pay when food arrives</p>
              </div>

              {/* CARD */}
              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <CreditCard size={20} className={paymentMethod === 'CARD' ? 'text-orange-600' : 'text-slate-500'} />
                <h4 className="font-bold text-xs text-slate-800 mt-2">Debit / Credit Card</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Visa, Mastercard, RuPay</p>
              </div>
            </div>

            {/* Desktop / Inline Place Order Button */}
            {isAuthenticated && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Confirming Fresh Order...
                    </>
                  ) : (
                    <>
                      PAY ₹{cart.total_amount.toFixed(0)} & PLACE ORDER ➔
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Swiggy Order Summary Card */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ChefHat size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Order Summary</h3>
              <p className="text-[10px] text-slate-400">Fresh from local home kitchens</p>
            </div>
          </div>

          {/* Dish items list */}
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 text-xs">
            {cart.items.map((item) => {
              const price = item.food?.discount_price || item.food?.price || 0;
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <VegBadge type={item.food?.food_type} />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{item.food?.name}</p>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{price.toFixed(0)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(price * item.quantity).toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bill details */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-semibold text-slate-800">₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span className="font-semibold text-slate-800">₹{cart.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Eco Packaging & Hygiene</span>
              <span>FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-2.5 flex justify-between text-base font-black text-slate-900">
              <span>TO PAY</span>
              <span className="text-orange-600 text-lg">₹{cart.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Swiggy hygiene pledge */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/50 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-950 leading-relaxed">
              Every dish is cooked fresh after your order confirmation in hygienic home kitchens.
            </p>
          </div>

          {/* Bottom order button for mobile */}
          <div className="lg:hidden pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    PAY ₹{cart.total_amount.toFixed(0)} & PLACE ORDER ➔
                  </>
                )}
              </button>
            ) : (
              <p className="text-center text-xs text-orange-700 font-semibold bg-orange-50 p-2.5 rounded-xl border border-orange-200">
                👆 Please sign in or create an account in Step 1 to place order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
