import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/api';
import { Star, MessageSquare, ChefHat } from 'lucide-react';

const CookReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const cookId = user?.cook_id || 1;
        const res = await reviewService.getCookReviews(cookId);
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Foodie Feedback & Reviews</h1>
        <p className="text-xs text-slate-500 mt-0.5">Read ratings and heartfelt comments from customers who tasted your food</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
          <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No reviews yet</h3>
          <p className="text-xs text-slate-400 mt-1">Customer feedback on completed orders will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{r.customer_name || 'Customer'}</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "{r.comment || 'Delicious meal, very authentic homestyle flavor!'}"
              </p>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-50">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CookReviews;
