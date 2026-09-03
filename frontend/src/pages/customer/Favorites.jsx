import React, { useState, useEffect } from 'react';
import { favoriteService } from '../../services/api';
import FoodCard from '../../components/food/FoodCard';
import { Heart, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getFavorites();
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (foodId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((f) => f.id !== foodId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Your Favorite Foods</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quickly reorder the homemade dishes you love the most</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-200/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto space-y-3">
          <Heart size={40} className="mx-auto text-slate-300 stroke-1" />
          <h3 className="font-bold text-slate-800 text-sm">No favorites saved yet</h3>
          <p className="text-xs text-slate-500">
            Tap the heart icon on any dish while browsing to save it to your favorites list!
          </p>
          <Link
            to="/foods"
            className="inline-block px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-2xl"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              isFavorited={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
