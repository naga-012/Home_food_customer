import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { foodService } from '../services/api';
import FoodCard from '../components/food/FoodCard';
import FoodFilter from '../components/food/FoodFilter';
import { Search, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';

const Foods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    food_type: searchParams.get('food_type') || 'ALL',
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 350,
    is_evening_offer: searchParams.get('evening_deals') === 'true',
    is_today_menu: searchParams.get('today_menu') === 'true',
    cook_id: searchParams.get('cook_id') ? Number(searchParams.get('cook_id')) : null,
  });

  // Keep filters in sync whenever searchParams in URL change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    const urlFoodType = searchParams.get('food_type') || 'ALL';
    const urlEvening = searchParams.get('evening_deals') === 'true';
    const urlTodayMenu = searchParams.get('today_menu') === 'true';
    const urlCookId = searchParams.get('cook_id') ? Number(searchParams.get('cook_id')) : null;

    setFilters((prev) => ({
      ...prev,
      search: urlSearch,
      category: urlCategory,
      food_type: urlFoodType,
      is_evening_offer: urlEvening,
      is_today_menu: urlTodayMenu,
      cook_id: urlCookId,
    }));
  }, [searchParams]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.food_type && filters.food_type !== 'ALL') params.food_type = filters.food_type;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.is_evening_offer) params.is_evening_offer = true;
      if (filters.is_today_menu) params.is_today_menu = true;
      if (filters.cook_id) params.cook_id = filters.cook_id;

      const res = await foodService.getFoods(params);
      let list = res.data;

      // Local sorting
      if (sortBy === 'price_asc') {
        list.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      } else if (sortBy === 'price_desc') {
        list.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      } else if (sortBy === 'prep_time') {
        list.sort((a, b) => parseInt(a.preparation_time) - parseInt(b.preparation_time));
      }

      setFoods(list);
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'search') {
      const nextParams = new URLSearchParams(searchParams);
      if (value.trim()) {
        nextParams.set('search', value.trim());
      } else {
        nextParams.delete('search');
      }
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoods();
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setFilters({
      search: '',
      category: 'All',
      food_type: 'ALL',
      max_price: 350,
      is_evening_offer: false,
      is_today_menu: false,
      cook_id: null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900">
            Browse Authentic Homemade Food
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {foods.length} delicious homemade dishes cooked by neighborhood home chefs
            {filters.search && <span className="font-semibold text-orange-600"> matching "{filters.search}"</span>}
          </p>
        </div>

        {/* Search & Sort controls */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72 flex items-center">
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-16 py-2 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
            >
              <Search size={15} />
            </button>
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-sm"
            >
              Search
            </button>
          </form>

          <select
            aria-label="Sort dishes by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="popular">Sort: Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="prep_time">Fastest Preparation</option>
          </select>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-28">
          <FoodFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            ></div>
            <div className="relative z-10 w-80 bg-white p-5 h-full overflow-y-auto">
              <FoodFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Foods Grid */}
        <div className="md:col-span-8 lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : foods.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
              <UtensilsCrossed size={48} className="mx-auto text-slate-300 stroke-1 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No dishes match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Try resetting some filters or searching for different ingredients or dishes.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Foods;
