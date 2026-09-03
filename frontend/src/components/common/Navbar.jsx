import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingCart,
  ShoppingBag,
  Heart,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  Flame,
  LogOut,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isCustomer, isCook } = useAuth();
  const { totalItemsCount } = useCart();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/foods?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/foods');
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-bold font-serif bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 bg-clip-text text-transparent leading-none block">
                  Inti Ruchi
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-0.5">
                  Homemade Food
                </span>
              </div>
            </Link>

            {/* Location selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/60 border border-orange-200/60 text-xs font-medium text-slate-700">
              <MapPin size={14} className="text-orange-600 shrink-0" />
              <select
                aria-label="Select Delivery Location"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-orange-950 cursor-pointer text-xs pr-2"
              >
                <option value="Hyderabad">Hyderabad (All)</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Kondapur">Kondapur</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search dishes (Biryani, Paratha, Sambar...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200/50 transition-all placeholder:text-slate-400"
            />
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/foods"
              className={`hover:text-orange-600 transition-colors ${
                location.pathname === '/foods' ? 'text-orange-600 font-semibold' : ''
              }`}
            >
              Browse Food
            </Link>

            <Link
              to="/foods?evening_deals=true"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 font-semibold border border-orange-500/20 transition-all"
            >
              <Flame size={14} className="text-orange-600 animate-bounce" />
              Evening Deals
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {showUserMenu && (
                  <div
                    onMouseLeave={() => setShowUserMenu(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <ShoppingBag size={15} />
                        My Orders
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Heart size={15} />
                        Favorite Foods
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <User size={15} />
                        Profile & Addresses
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-bold rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-500/20 transition-all hover:scale-105"
                >
                  Join Inti Ruchi
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-orange-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search homemade dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
              />
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>

            <div className="flex flex-col gap-2 font-medium text-sm text-slate-700">
              <Link
                to="/foods"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600"
              >
                Browse All Foods
              </Link>
              <Link
                to="/foods?evening_deals=true"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
              >
                <Flame size={16} className="text-orange-600" />
                Special Evening Deals
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
