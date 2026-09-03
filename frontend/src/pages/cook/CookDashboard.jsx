import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cookService } from '../../services/api';
import {
  ChefHat,
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  Users,
  Star,
  ArrowRight,
  TrendingUp,
  Flame,
} from 'lucide-react';

const CookDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCookDash = async () => {
      try {
        setLoading(true);
        const res = await cookService.getCookDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch cook dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCookDash();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPending = data?.approval_status === 'PENDING';

  return (
    <div className="space-y-8">
      {/* Approval Status Banner */}
      {isPending ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ChefHat size={26} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                Application Pending Review
              </span>
              <h2 className="text-lg font-bold mt-0.5">{data?.kitchen_name}</h2>
              <p className="text-xs text-amber-800">
                Your home kitchen application is currently being verified by our onboarding team.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Verified Home Chef Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
              {data?.kitchen_name || 'My Home Kitchen'}
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Manage incoming customer orders, update today's fresh batch menu, and control evening flash offers.
            </p>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Today's Orders</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.today_orders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Earnings</p>
            <h3 className="text-2xl font-black text-slate-900">₹{data?.total_earnings?.toFixed(0) || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Dishes</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.total_foods || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Star size={22} className="text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Kitchen Rating</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.rating || 5.0}</h3>
          </div>
        </div>
      </div>

      {/* Monthly Sales Performance Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold font-serif text-lg text-slate-900">Monthly Sales Revenue</h3>
            <p className="text-xs text-slate-400">Monthly revenue trend from homemade food orders</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> +24% vs last month
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4">
          {data?.monthly_sales?.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700">₹{item.sales.toFixed(0)}</span>
              <div
                className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-orange-600 to-amber-400 transition-all duration-500"
                style={{ height: `${Math.max(25, (item.sales / 600) * 120)}px` }}
              ></div>
              <span className="text-xs font-bold text-slate-500">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/cook/foods"
          className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
              Manage Food Menu
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Add dishes, set prices & ingredients</p>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/cook/todays-menu"
          className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
              Today's Menu Specials
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Quickly toggle today's available batches</p>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/cook/waste-reduction"
          className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl border border-orange-200 shadow-sm hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div>
            <span className="flex items-center gap-1 font-bold text-orange-800 text-sm group-hover:text-orange-900">
              <Flame size={14} className="text-orange-600" /> Evening Flash Deals
            </span>
            <p className="text-xs text-orange-700/80 mt-0.5">Reduce food waste with evening offers</p>
          </div>
          <ArrowRight size={16} className="text-orange-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};

export default CookDashboard;
