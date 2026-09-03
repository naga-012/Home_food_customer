import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { favoriteService } from '../../services/api';
import VegBadge from '../common/VegBadge';
import { Star, Clock, ChefHat, Heart, ShoppingBag, Flame, Plus, Check } from 'lucide-react';

const FoodCard = ({ food, isFavorited = false, onFavoriteToggle }) => {
  const { addToCart, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [favorited, setFavorited] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Check if item is already in cart
  const cartItem = cart.items.find((item) => item.food_id === food.id);
  const isSoldOut = !food.is_available || food.quantity <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    addToCart(food, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setFavLoading(true);
      if (favorited) {
        await favoriteService.removeFavorite(food.id);
        setFavorited(false);
      } else {
        await favoriteService.addFavorite(food.id);
        setFavorited(true);
      }
      if (onFavoriteToggle) {
        onFavoriteToggle(food.id, !favorited);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const effectivePrice = food.is_evening_offer && food.discount_price ? food.discount_price : food.price;
  const discountPercent =
    food.is_evening_offer && food.discount_price && food.price > 0
      ? Math.round(((food.price - food.discount_price) / food.price) * 100)
      : null;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Link to={`/foods/${food.id}`}>
          <img
            src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
            alt={food.name}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isSoldOut ? 'grayscale contrast-125 opacity-75' : ''
            }`}
          />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 items-center">
          <VegBadge type={food.food_type} className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-sm" />
          
          {food.is_evening_offer && !isSoldOut && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold shadow-md animate-deal">
              <Flame size={12} className="fill-white" />
              {discountPercent}% OFF Flash Deal
            </span>
          )}

          {food.is_today_menu && !food.is_evening_offer && !isSoldOut && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
              Chef Special
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label={favorited ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-md transition-all hover:scale-110 z-10"
        >
          <Heart
            size={16}
            className={`${favorited ? 'fill-rose-500 text-rose-500' : ''} transition-colors`}
          />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              Sold Out Today
            </span>
          </div>
        )}

        {/* Prep time pill */}
        <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock size={12} className="text-amber-400" />
          <span>{food.preparation_time || '25 mins'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Kitchen name & Category */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1.5">
            <div className="flex items-center gap-1 truncate text-slate-600 font-medium">
              <ChefHat size={13} className="text-orange-600 shrink-0" />
              <span className="truncate">{food.cook?.kitchen_name || "Amma's Kitchen"}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase shrink-0">
              {food.category}
            </span>
          </div>

          {/* Dish Name */}
          <Link to={`/foods/${food.id}`} className="block group-hover:text-orange-600 transition-colors">
            <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">
              {food.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {food.description || 'Freshly prepared homestyle dish using traditional recipes.'}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{effectivePrice.toFixed(0)}
              </span>
              {food.is_evening_offer && food.discount_price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{food.price.toFixed(0)}
                </span>
              )}
            </div>
            {food.quantity > 0 && food.quantity <= 5 && !isSoldOut && (
              <p className="text-[10px] text-amber-700 font-semibold">
                Only {food.quantity} left!
              </p>
            )}
          </div>

          {/* Add To Cart Button */}
          {isSoldOut ? (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                addedAnimation
                  ? 'bg-emerald-600 text-white scale-105'
                  : cartItem
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                  : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-md'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check size={14} /> Added!
                </>
              ) : cartItem ? (
                <>
                  <ShoppingBag size={13} /> {cartItem.quantity} in cart
                </>
              ) : (
                <>
                  <Plus size={14} /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
