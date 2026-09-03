import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FloatingCartBar = () => {
  const { cart, totalItemsCount } = useCart();
  const location = useLocation();

  // Do not show on Cart or Checkout pages
  if (location.pathname === '/cart' || location.pathname === '/checkout') {
    return null;
  }

  // Do not show if cart is empty
  if (totalItemsCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-30 lg:hidden animate-in slide-in-from-bottom-4 duration-300">
      <Link
        to="/cart"
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all border border-white/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xs">
            <ShoppingBag size={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wide">
                {totalItemsCount} {totalItemsCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className="font-black text-sm">₹{cart.total_amount.toFixed(0)}</span>
            </div>
            <p className="text-[10px] text-orange-100 font-medium">Homemade dishes in cart</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-xs bg-white text-orange-600 px-3 py-1.5 rounded-xl shadow-sm">
          <span>VIEW CART</span>
          <ArrowRight size={14} />
        </div>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
