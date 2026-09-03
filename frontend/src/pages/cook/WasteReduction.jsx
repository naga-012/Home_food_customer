import React, { useState, useEffect } from 'react';
import { foodService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import VegBadge from '../../components/common/VegBadge';
import { Flame, Sparkles, Check, X, Tag, BellRing, Loader2 } from 'lucide-react';

const WasteReduction = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(100);
  const [qtyRemaining, setQtyRemaining] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const cookId = user?.cook_id || 1;
      const res = await foodService.getFoods({ cook_id: cookId, only_available: false });
      setFoods(res.data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleOpenDealModal = (food) => {
    setSelectedFood(food);
    const suggestedDiscount = Math.round(food.price * 0.65); // 35% discount suggested
    setDiscountPrice(food.discount_price || suggestedDiscount);
    setQtyRemaining(food.quantity);
  };

  const handleApplyOffer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await foodService.setEveningOffer(selectedFood.id, {
        discount_price: Number(discountPrice),
        quantity: Number(qtyRemaining),
        is_evening_offer: true,
      });
      setSuccessMsg(`Flash deal applied for "${selectedFood.name}". Active customers have been notified!`);
      setSelectedFood(null);
      fetchFoods();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to set evening offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOffer = async (foodId) => {
    try {
      await foodService.cancelEveningOffer(foodId);
      fetchFoods();
    } catch (err) {
      console.error('Failed to cancel evening offer:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Flame size={14} className="animate-bounce" /> Eco-Friendly Kitchen Initiative
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Food Waste Reduction & Flash Deals
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
            Don't let fresh home-cooked food go to waste at the end of the day. Offer evening discounts to neighborhood foodies. Our system instantly broadcasts flash alerts to interested customers!
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <BellRing size={16} className="text-emerald-600 animate-bounce" /> {successMsg}
        </div>
      )}

      {/* Food items list */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Your Kitchen Dishes & Remaining Batches
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods.map((food) => {
              const hasDeal = food.is_evening_offer && food.discount_price;
              const discountPct = hasDeal ? Math.round(((food.price - food.discount_price) / food.price) * 100) : 0;

              return (
                <div
                  key={food.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    hasDeal
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80'}
                      alt={food.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <VegBadge type={food.food_type} />
                        <h3 className="font-bold text-slate-900 text-sm truncate">{food.name}</h3>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-slate-500">Regular: ₹{food.price}</span>
                        <span className="font-bold text-slate-700">Stock: {food.quantity} left</span>
                      </div>

                      {hasDeal && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-600 text-white font-extrabold text-[11px]">
                          <Flame size={12} /> ₹{food.discount_price} ({discountPct}% OFF)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {hasDeal ? (
                      <button
                        onClick={() => handleCancelOffer(food.id)}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Remove Flash Deal
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No active deal</span>
                    )}

                    <button
                      onClick={() => handleOpenDealModal(food)}
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                    >
                      <Tag size={13} /> {hasDeal ? 'Update Offer' : 'Apply Evening Deal'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deal Application Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedFood(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1 text-orange-600">
              <Flame size={20} />
              <h3 className="text-lg font-bold text-slate-900">Create Evening Flash Offer</h3>
            </div>
            <p className="text-xs text-slate-500">{selectedFood.name} (Regular Price: ₹{selectedFood.price})</p>

            <form onSubmit={handleApplyOffer} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discounted Evening Price (₹)
                </label>
                <input
                  type="number"
                  required
                  max={selectedFood.price - 5}
                  min="20"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  Foodies will save ₹{selectedFood.price - discountPrice} (
                  {Math.round(((selectedFood.price - discountPrice) / selectedFood.price) * 100)}% discount)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Remaining Available Portions
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qtyRemaining}
                  onChange={(e) => setQtyRemaining(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                📢 When confirmed, this deal will be highlighted on the homepage banner: <strong>"Limited Food Available – Special Evening Offer"</strong> and notifications will be sent to registered foodies.
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Broadcast Flash Deal ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteReduction;
