import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { foodService, reviewService, favoriteService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import VegBadge from '../components/common/VegBadge';
import ReviewModal from '../components/food/ReviewModal';
import {
  Clock,
  ChefHat,
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  ShieldCheck,
  CheckCircle2,
  MessageSquarePlus,
  ArrowLeft,
} from 'lucide-react';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const fetchFoodData = async () => {
    try {
      setLoading(true);
      const [foodRes, reviewsRes] = await Promise.all([
        foodService.getFoodById(id),
        reviewService.getFoodReviews(id),
      ]);
      setFood(foodRes.data);
      setReviews(reviewsRes.data);

      if (isAuthenticated) {
        try {
          const favRes = await favoriteService.checkFavorite(id);
          setIsFavorited(favRes.data.is_favorite);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching food details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodData();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Dish not found</h2>
        <Link to="/foods" className="mt-4 inline-block px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold">
          Back to Foods
        </Link>
      </div>
    );
  }

  const effectivePrice = food.is_evening_offer && food.discount_price ? food.discount_price : food.price;
  const isSoldOut = !food.is_available || food.quantity <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(food, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(food, quantity);
    navigate('/checkout');
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isFavorited) {
      await favoriteService.removeFavorite(food.id);
      setIsFavorited(false);
    } else {
      await favoriteService.addFavorite(food.id);
      setIsFavorited(true);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : (food.cook?.rating || 4.8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <Link
        to="/foods"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Food Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/80 aspect-[4/3]">
            <img
              src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
              alt={food.name}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
              }}
              className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-125' : ''}`}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <VegBadge
                type={food.food_type}
                showText={true}
                className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md"
              />
              {food.is_evening_offer && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold shadow-md animate-deal">
                  <Flame size={14} /> Flash Evening Offer
                </span>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteToggle}
              aria-label={isFavorited ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-md transition-all hover:scale-110"
            >
              <Heart
                size={20}
                className={isFavorited ? 'fill-rose-500 text-rose-500' : ''}
              />
            </button>
          </div>

          {/* Cooking Guarantee highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <Clock size={18} className="mx-auto text-orange-600 mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Preparation Time</p>
              <p className="text-xs font-bold text-slate-800">{food.preparation_time || '25 mins'}</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <ShieldCheck size={18} className="mx-auto text-emerald-600 mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Hygiene Standards</p>
              <p className="text-xs font-bold text-slate-800">FSSAI Certified</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <CheckCircle2 size={18} className="mx-auto text-blue-600 mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Batch Status</p>
              <p className="text-xs font-bold text-slate-800">{isSoldOut ? 'Sold Out' : `${food.quantity} Left`}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Dish Details & Order Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                {food.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{averageRating}</span>
                <span className="text-slate-400">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold font-serif text-slate-900 leading-tight">
              {food.name}
            </h1>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/60 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{effectivePrice.toFixed(0)}
            </span>
            {food.is_evening_offer && food.discount_price && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{food.price.toFixed(0)}
                </span>
                <span className="text-xs font-extrabold text-orange-700 bg-orange-200 px-2 py-0.5 rounded-md">
                  {Math.round(((food.price - food.discount_price) / food.price) * 100)}% Discount Applied
                </span>
              </>
            )}
          </div>

          {/* Ingredients Section */}
          {food.ingredients && (
            <div className="p-4 bg-white rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Fresh Homestyle Ingredients
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {food.ingredients}
              </p>
            </div>
          )}

          {/* Home Cook Information */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                <ChefHat size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {food.cook?.kitchen_name || "Amma's Traditional Kitchen"}
                </h4>
                <p className="text-xs text-slate-400">
                  {food.cook?.specialization || 'Authentic Regional Homestyle Meals'}
                </p>
              </div>
            </div>
            <Link
              to={`/foods?cook_id=${food.cook_id}`}
              className="px-3 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              Other Dishes
            </Link>
          </div>

          {/* Action Box: Quantity & Buttons */}
          <div className="space-y-3 pt-2">
            {!isSoldOut ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(food.quantity, quantity + 1))}
                      aria-label="Increase quantity"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Subtotal: <strong className="text-slate-900 text-sm">₹{(effectivePrice * quantity).toFixed(0)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="py-3 px-4 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
                  >
                    Buy Now ➔
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-bold text-sm">
                This item is currently sold out for today. Please check back tomorrow!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <section className="pt-8 border-t border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Foodie Reviews & Ratings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified customer experiences on this homemade dish</p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) navigate('/login');
              else setShowReviewModal(true);
            }}
            className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <MessageSquarePlus size={15} /> Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-700">No customer reviews yet</p>
            <p className="text-xs text-slate-400 mt-1">Be the first food lover to review this home-cooked dish!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{r.customer_name || 'Food Lover'}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{r.comment}"
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      <ReviewModal
        food={food}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={fetchFoodData}
      />
    </div>
  );
};

export default FoodDetails;
