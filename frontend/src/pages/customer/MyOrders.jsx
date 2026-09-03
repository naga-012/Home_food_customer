import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import ReviewModal from '../../components/food/ReviewModal';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Flame,
  ChefHat,
  Star,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const ORDER_STAGES = ['PENDING', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewFood, setReviewFood] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Live poll updates every 10s
    return () => clearInterval(interval);
  }, []);

  const getStageIndex = (status) => {
    return ORDER_STAGES.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">My Orders & Live Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your orders from chef’s stove to your doorstep</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
          <ShoppingBag size={40} className="mx-auto text-slate-300 stroke-1 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No orders yet</h3>
          <p className="text-xs text-slate-500 mt-1">Ready to taste authentic home-cooked meals?</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStageIdx = getStageIndex(order.order_status);
            const isDelivered = order.order_status === 'DELIVERED';
            const isCancelled = order.order_status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6"
              >
                {/* Top summary row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">#{order.order_number}</h3>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-orange-500" />
                      {order.delivery_address}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                    <span className="text-base font-black text-slate-900">₹{order.total_amount.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-500">
                      {order.payment_method} ({order.payment_status})
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Visual Order Timeline) */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                      {/* Connecting Line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0"></div>
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 transition-all duration-500 z-0"
                        style={{
                          width: `${(Math.max(0, currentStageIdx) / (ORDER_STAGES.length - 1)) * 100}%`,
                        }}
                      ></div>

                      {ORDER_STAGES.map((stage, idx) => {
                        const isCompleted = currentStageIdx >= idx;
                        const isCurrent = currentStageIdx === idx;
                        return (
                          <div key={stage} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                isCompleted
                                  ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'animate-bounce' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${
                                isCompleted ? 'text-orange-700' : 'text-slate-400'
                              }`}
                            >
                              {stage.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold text-center">
                    This order was cancelled.
                  </div>
                )}

                {/* Order Items & Review Action */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
                    Ordered Dishes
                  </h4>
                  <div className="divide-y divide-slate-200/60 text-xs">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-slate-800">{item.food_name}</span>
                          <span className="text-slate-500 ml-2">Qty: {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </span>
                          {isDelivered && item.food_id && (
                            <button
                              onClick={() => setReviewFood({ id: item.food_id, name: item.food_name })}
                              className="px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <Star size={12} className="text-amber-500 fill-amber-400" /> Rate Dish
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewFood && (
        <ReviewModal
          food={reviewFood}
          isOpen={!!reviewFood}
          onClose={() => setReviewFood(null)}
          onReviewSubmitted={() => {
            setReviewFood(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default MyOrders;
