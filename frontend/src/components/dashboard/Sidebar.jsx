import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { name: 'Favorites', path: '/customer/favorites', icon: Heart },
    { name: 'Profile & Address', path: '/customer/profile', icon: User },
  ];

  const links = customerLinks;
  const roleTitle = 'Customer Account';
  const roleBadge = 'CUSTOMER';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-screen p-5 flex flex-col justify-between shrink-0 shadow-sm">
      <div>
        {/* Portal Header */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-orange-600 mb-3 font-semibold transition-colors">
            <ArrowLeft size={14} /> Return to Storefront
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-slate-900 text-sm truncate">{roleTitle}</h2>
              <span className="inline-block text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full mt-0.5">
                {roleBadge}
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 bg-slate-50 rounded-2xl mb-5 border border-slate-100">
          <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Customer'}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
