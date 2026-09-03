import React, { useState, useEffect } from 'react';
import { cookService, orderService } from '../../services/api';
import { DollarSign, TrendingUp, Calendar, ArrowDownLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

const CookEarnings = () => {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, ordersRes] = await Promise.all([
          cookService.getCookDashboard(),
          orderService.getOrders(),
        ]);
        setData(dashRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const deliveredOrders = orders.filter((o) => o.order_status === 'DELIVERED');
  const pendingPayout = orders.filter((o) => o.order_status !== 'DELIVERED' && o.order_status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Kitchen Earnings & Payouts</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track your daily income, order commissions, and bank settlements</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Total Lifetime Earnings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹{data?.total_earnings?.toFixed(2) || '0.00'}</h3>
          <span className="text-[11px] text-emerald-600 font-bold mt-2 inline-flex items-center gap-1">
            <CheckCircle2 size={13} /> 100% Direct Payout
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Completed Deliveries</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{deliveredOrders.length} Meals</h3>
          <span className="text-[11px] text-slate-500 font-medium mt-2 block">
            Avg order value: ₹{deliveredOrders.length ? Math.round(data?.total_earnings / deliveredOrders.length) : 0}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Active Kitchen Customers</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.active_customers || 0}</h3>
          <span className="text-[11px] text-amber-600 font-bold mt-2 block">
            ⭐ {data?.rating} Kitchen Rating
          </span>
        </div>
      </div>

      {/* Recent Payout / Order Transactions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold font-serif text-base text-slate-900 pb-3 border-b border-slate-100">
          Order Earnings Breakdown
        </h3>

        {orders.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No order earnings recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Dishes</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Kitchen Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{ord.order_number}</td>
                    <td className="p-3 truncate max-w-xs text-slate-600">
                      {ord.items?.map((it) => `${it.food_name} (×${it.quantity})`).join(', ')}
                    </td>
                    <td className="p-3">{ord.payment_method}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 text-sm">
                      ₹{ord.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookEarnings;
