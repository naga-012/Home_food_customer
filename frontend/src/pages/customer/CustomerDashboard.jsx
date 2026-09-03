import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Heart,
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await userService.getCustomerDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px] animate-pulse">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Customer Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Welcome back, {user?.name || 'Foodie'}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-50/90 leading-relaxed">
            Fresh homemade delicacies from your favorite home kitchens are just an order away.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.total_orders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Orders</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.active_orders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Delivered</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.completed_orders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Favorite Foods</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.favorites_count || 0}</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold font-serif text-lg text-slate-900">Recent Orders</h3>
          <Link to="/customer/orders" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {data?.recent_orders?.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No orders yet. Discover delicious homestyle dishes today!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data?.recent_orders?.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">#{ord.order_number}</span>
                    {getStatusBadge(ord.order_status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {ord.items?.map((it) => `${it.food_name} (×${it.quantity})`).join(', ') || 'Homemade Meal'}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Placed on {new Date(ord.created_at).toLocaleDateString()} at{' '}
                    {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="font-extrabold text-sm text-slate-900">₹{ord.total_amount.toFixed(0)}</span>
                  <Link
                    to="/customer/orders"
                    className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold transition-colors"
                  >
                    Track ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
