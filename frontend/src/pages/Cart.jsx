import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import VegBadge from '../components/common/VegBadge';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ChefHat,
  Sparkles,
} from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 mx-auto">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore homemade dishes freshly cooked by passionate local chefs and add them to your feast!
        </p>
        <Link
          to="/foods"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-orange-600/20 transition-all"
        >
          <span>Browse Today's Menu</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900">Your Food Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} selected for fresh home delivery
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const food = item.food;
            if (!food) return null;
            const effectivePrice = food.is_evening_offer && food.discount_price ? food.discount_price : food.price;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all"
              >
                {/* Food Image */}
                <img
                  src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80'}
                  alt={food.name}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80';
                  }}
                  className="w-full sm:w-24 h-24 rounded-2xl object-cover shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <VegBadge type={food.food_type} />
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                      {food.category}
                    </span>
                  </div>

                  <Link to={`/foods/${food.id}`} className="hover:text-orange-600 transition-colors">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{food.name}</h3>
                  </Link>

                  <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-400 mt-0.5">
                    <ChefHat size={12} className="text-orange-500" />
                    <span>{food.cook?.kitchen_name || "Amma's Kitchen"}</span>
                  </div>

                  <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{effectivePrice.toFixed(0)}
                    </span>
                    {food.is_evening_offer && food.discount_price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{food.price.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${food.name}`}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${food.name}`}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-black text-slate-900 w-16 text-right">
                    ₹{(effectivePrice * item.quantity).toFixed(0)}
                  </span>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${food.name} from cart`}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 sticky top-28">
          <h2 className="font-bold font-serif text-lg text-slate-900">Order Summary</h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-800">₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-800">₹{cart.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Homestyle Hygiene & Packaging</span>
              <span>FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-orange-600 text-lg">₹{cart.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/50 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              Prepared fresh in small batches after you confirm your order. Safe & contactless home delivery.
            </p>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={15} />
          </button>

          <Link
            to="/foods"
            className="block text-center text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
          >
            + Add more homemade items
          </Link>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden z-30 shadow-lg">
        <button
          onClick={handleCheckoutRedirect}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-between px-5 active:scale-[0.98]"
        >
          <div className="text-left">
            <span className="block text-[10px] text-orange-200 uppercase font-semibold">Total Amount</span>
            <span className="text-sm font-black text-white">₹{cart.total_amount.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>Proceed to Checkout</span>
            <ArrowRight size={15} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Cart;
