import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import {
  ShoppingBag,
  Check,
  X,
  Clock,
  Flame,
  Truck,
  CheckCircle2,
  RefreshCw,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';

const CookOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load cook orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Kitchen Incoming Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept, prepare, and update status of orders placed for your kitchen
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Orders
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
          <ShoppingBag size={40} className="mx-auto text-slate-300 stroke-1 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No incoming orders right now</h3>
          <p className="text-xs text-slate-400 mt-1">New customer orders will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.order_status === 'PENDING';
            const isAccepted = order.order_status === 'ACCEPTED';
            const isPreparing = order.order_status === 'PREPARING';
            const isOut = order.order_status === 'OUT_FOR_DELIVERY';
            const isDelivered = order.order_status === 'DELIVERED';
            const isCancelled = order.order_status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-base">#{order.order_number}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        isPending
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : isAccepted
                          ? 'bg-blue-100 text-blue-900'
                          : isPreparing
                          ? 'bg-orange-100 text-orange-900'
                          : isOut
                          ? 'bg-purple-100 text-purple-900'
                          : isDelivered
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">₹{order.total_amount.toFixed(0)}</span>
                    <span className="text-xs text-slate-500 block">
                      {order.payment_method} ({order.payment_status})
                    </span>
                  </div>
                </div>

                {/* Customer Details & Special Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Delivery To</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin size={13} className="text-orange-600" />
                      {order.delivery_address}
                    </p>
                    <p className="text-slate-600 flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" /> {order.phone}
                    </p>
                  </div>

                  {order.special_instructions && (
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-amber-800 block font-semibold text-[10px] uppercase flex items-center gap-1">
                        <FileText size={12} /> Customer Note
                      </span>
                      <p className="text-amber-900 font-medium italic">
                        "{order.special_instructions}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Items in order */}
                <div className="divide-y divide-slate-100 text-xs">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {item.food_name} <span className="text-orange-600">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-slate-700">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Action Buttons */}
                {!isDelivered && !isCancelled && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          disabled={updatingId === order.id}
                          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X size={14} /> Reject Order
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                          disabled={updatingId === order.id}
                          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                        >
                          <Check size={14} /> Accept Order
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                        disabled={updatingId === order.id}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Flame size={14} /> Start Cooking (Mark Preparing)
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                        disabled={updatingId === order.id}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Truck size={14} /> Food Packed (Out for Delivery)
                      </button>
                    )}

                    {isOut && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                        disabled={updatingId === order.id}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} /> Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CookOrders;
