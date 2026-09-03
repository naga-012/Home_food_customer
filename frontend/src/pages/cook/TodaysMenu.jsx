import React, { useState, useEffect } from 'react';
import { cookService, foodService } from '../../services/api';
import VegBadge from '../../components/common/VegBadge';
import { Sparkles, CheckCircle2, XCircle, Plus, Minus, AlertCircle } from 'lucide-react';

const TodaysMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await cookService.getMyTodaysMenu();
      setFoods(res.data);
    } catch (err) {
      console.error('Error fetching today menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleUpdateQty = async (food, delta) => {
    const newQty = Math.max(0, food.quantity + delta);
    try {
      await foodService.updateFood(food.id, {
        quantity: newQty,
        is_available: newQty > 0,
      });
      fetchMenu();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleToggleMenu = async (foodId) => {
    try {
      await cookService.toggleTodaysMenu(foodId);
      fetchMenu();
    } catch (err) {
      console.error('Failed to toggle today menu:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles size={13} className="text-amber-600" /> Daily Fresh Batch
          </span>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Today's Special Menu</h1>
          <p className="text-xs text-slate-600 max-w-xl mt-1">
            Highlighted for neighborhood foodies browsing today's fresh lunch and dinner offerings. Automatically shows "SOLD OUT" when quantities drop to zero!
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Sparkles size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No dishes featured on Today's Menu</h3>
          <p className="text-xs text-slate-500 mt-1">
            Go to "Manage Foods" and check "Feature on Today's Menu" to showcase your daily specials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => {
            const isSoldOut = food.quantity <= 0 || !food.is_available;

            return (
              <div
                key={food.id}
                className={`bg-white rounded-3xl overflow-hidden border shadow-sm transition-all flex flex-col justify-between ${
                  isSoldOut ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'
                }`}
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'}
                      alt={food.name}
                      className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-125' : ''}`}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <VegBadge type={food.food_type} className="bg-white/90 px-2 py-1 rounded-full shadow-sm" />
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-bold">
                        {food.category}
                      </span>
                    </div>

                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{food.name}</h3>
                        <span className="text-base font-black text-slate-900 mt-1 block">
                          ₹{food.price}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          !isSoldOut ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {!isSoldOut ? 'Active in Today’s Menu' : 'Sold Out'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>
                </div>

                {/* Quick Quantity adjustment */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        Live Portions
                      </span>
                      <span className={`text-sm font-extrabold ${food.quantity <= 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {food.quantity} Left
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => handleUpdateQty(food, -1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-orange-600"
                        title="Decrease portion"
                      >
                        <Minus size={13} />
                      </button>
                      <button
                        onClick={() => handleUpdateQty(food, 5)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-orange-600"
                        title="Add +5 portions"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleMenu(food.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysMenu;
