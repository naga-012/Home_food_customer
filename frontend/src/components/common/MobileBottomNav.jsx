import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Search, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = () => {
  const { isAuthenticated, isCook } = useAuth();
  const { totalItemsCount } = useCart();
  const location = useLocation();

  // Hide bottom nav on checkout to avoid distraction, similar to Swiggy
  if (location.pathname === '/checkout') {
    return null;
  }

  const getAccountLink = () => {
    if (!isAuthenticated) return '/login';
    return '/orders';
  };

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: UtensilsCrossed,
      exact: true,
    },
    {
      label: 'Browse',
      to: '/foods',
      icon: Search,
    },
    {
      label: 'Cart',
      to: '/cart',
      icon: ShoppingBag,
      badge: totalItemsCount,
    },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      to: getAccountLink(),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/';

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90 relative ${
                isActive ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
