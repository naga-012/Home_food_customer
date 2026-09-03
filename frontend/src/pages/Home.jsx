import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { foodService, cookService } from '../services/api';
import FoodCard from '../components/food/FoodCard';
import {
  Search,
  MapPin,
  Flame,
  ArrowRight,
  ChefHat,
  Star,
  Clock,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  Heart,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Biryani', icon: '🍚', bg: 'from-amber-500/10 to-orange-500/10' },
  { name: 'Breakfast', icon: '🥞', bg: 'from-yellow-500/10 to-amber-500/10' },
  { name: 'Lunch', icon: '🍛', bg: 'from-orange-500/10 to-rose-500/10' },
  { name: 'Dinner', icon: '🍲', bg: 'from-blue-500/10 to-indigo-500/10' },
  { name: 'Healthy Food', icon: '🥗', bg: 'from-emerald-500/10 to-teal-500/10' },
  { name: 'Snacks', icon: '🥟', bg: 'from-purple-500/10 to-pink-500/10' },
  { name: 'Desserts', icon: '🍨', bg: 'from-rose-500/10 to-red-500/10' },
];

const Home = () => {
  const [popularFoods, setPopularFoods] = useState([]);
  const [eveningOffers, setEveningOffers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cooks, setCooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [foodsRes, eveningRes, recsRes, cooksRes] = await Promise.all([
          foodService.getFoods({ limit: 8 }),
          foodService.getEveningOffers(),
          foodService.getRecommendations(),
          cookService.getApprovedCooks(),
        ]);
        setPopularFoods(foodsRes.data);
        setEveningOffers(eveningRes.data);
        setRecommendations(recsRes.data);
        setCooks(cooksRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/foods?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/foods');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative culinary glow overlays */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-orange-700/30 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-200" />
              100% Authentic Homemade Delicacies
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-[1.15]">
              Fresh Homemade Food, <br className="hidden sm:inline" />
              <span className="text-amber-200">Delivered to Your Doorstep</span>
            </h1>

            <p className="text-base sm:text-lg text-orange-50/90 max-w-xl font-normal leading-relaxed">
              Skip greasy restaurant food. Taste the warmth of motherly love, grandma’s secret spices, and fresh homestyle cooking from verified neighborhood home chefs.
            </p>

            {/* Search Bar & Location Selector */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
            >
              <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-slate-200 text-slate-700">
                <MapPin size={16} className="text-orange-600 shrink-0" />
                <select
                  aria-label="Select Delivery City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-xs font-semibold bg-transparent outline-none cursor-pointer pr-3"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Banjara Hills">Banjara Hills</option>
                  <option value="Gachibowli">Gachibowli</option>
                  <option value="Madhapur">Madhapur</option>
                  <option value="Jubilee Hills">Jubilee Hills</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 w-full flex-1">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search homemade dishes (Dum Biryani, Dal Makhani, Paratha...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl sm:rounded-full transition-all shadow-md shadow-orange-600/30 shrink-0 flex items-center justify-center gap-1.5"
              >
                <Search size={16} />
                <span>Search Dishes</span>
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs font-medium text-orange-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Verified Home Kitchens</span>
              </div>
              <div>• Zero Preservatives & Artificial Colors</div>
              <div>• Freshly Cooked Upon Order</div>
            </div>
          </div>

          {/* Hero Visual Card Carousel */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-md p-4">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80"
                alt="Hyderabadi Dum Biryani"
                className="rounded-2xl w-full h-72 object-cover shadow-md"
              />
              <div className="mt-4 p-4 rounded-2xl bg-white text-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider">
                    Today's Top Chef Special
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star size={14} className="fill-amber-400 text-amber-400" /> 4.9 (62)
                  </div>
                </div>
                <h4 className="font-bold text-base text-slate-900 mt-1">Shahi Hyderabadi Mutton Dum Biryani</h4>
                <p className="text-xs text-slate-500 mt-0.5">By Chef Zubair Khan • Nizami Recipe</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-lg font-black text-slate-900">₹320</span>
                  <Link
                    to="/foods"
                    className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
                  >
                    Order Fresh
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOOD CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Explore Cuisines & Meal Types</h2>
            <p className="text-xs text-slate-500 mt-0.5">Find exactly what your craving desires</p>
          </div>
          <Link to="/foods" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All Dishes <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/foods?category=${encodeURIComponent(cat.name)}`}
              className={`p-4 rounded-3xl bg-gradient-to-b ${cat.bg} border border-slate-100/80 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group`}
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FOOD WASTE REDUCTION FLASH DEALS (FEATURE #22) */}
      {eveningOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Flame size={14} className="animate-bounce" />
                  Limited Food Available – Special Evening Offer
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
                  Food Waste Reduction Flash Deals
                </h2>
                <p className="text-xs sm:text-sm text-orange-100 max-w-xl mt-1">
                  Help local home cooks reduce food waste! Fresh dishes prepared today with special discounts of up to 40% off. Limited quantities left.
                </p>
              </div>

              <Link
                to="/foods?evening_deals=true"
                className="px-5 py-2.5 bg-white text-orange-700 hover:bg-orange-50 rounded-2xl text-xs font-bold shadow-md transition-all self-start md:self-auto shrink-0"
              >
                Browse All Deals
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {eveningOffers.slice(0, 4).map((food) => (
                <div key={food.id} className="text-slate-800">
                  <FoodCard food={food} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SMART RECOMMENDATIONS SECTION (FEATURE #21) */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 uppercase tracking-wider">
                <Sparkles size={14} /> Smart Recommendations
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900 mt-0.5">
                Specially Curated for You
              </h2>
            </div>
            <Link to="/foods" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Explore All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((item) => (
              <div key={item.id} className="flex flex-col">
                {item.recommendation_reason && (
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100/80 px-3 py-1 rounded-t-2xl border-t border-x border-orange-200">
                    ✨ {item.recommendation_reason}
                  </span>
                )}
                <div className="flex-1">
                  <FoodCard food={item} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. POPULAR HOMEMADE FOODS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Popular Foods Right Now</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most ordered homestyle meals this week</p>
          </div>
          <Link to="/foods" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            See More <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200/60 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFoods.slice(0, 8).map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 6. NEARBY HOME COOKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Featured Neighborhood Home Chefs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Certified kitchens cooking authentic regional delicacies</p>
          </div>
          <Link to="/foods" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All Kitchens <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cooks.map((cook) => (
            <div
              key={cook.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-card transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    <ChefHat size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {cook.kitchen_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center text-amber-500 font-bold gap-0.5">
                        <Star size={13} className="fill-amber-400 text-amber-400" /> {cook.rating}
                      </span>
                      <span>({cook.total_reviews} reviews)</span>
                      <span>•</span>
                      <span>{cook.city || 'Hyderabad'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {cook.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[11px] font-semibold">
                    ⭐ {cook.specialization}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    ✓ Verified FSSAI
                  </span>
                </div>
              </div>

              <Link
                to={`/foods?cook_id=${cook.id}`}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-orange-600 hover:text-white text-slate-700 text-xs font-bold text-center border border-slate-200 hover:border-orange-600 transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Kitchen Menu</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Home Cook Partner Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-100 text-xs font-bold">
              <ChefHat size={14} /> Turn Your Cooking Passion Into An Income
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
              Cook From Home, Earn With Pride
            </h2>
            <p className="text-orange-50 text-sm leading-relaxed">
              Join hundreds of homemakers, mothers, and passionate chefs serving authentic regional dishes in your neighborhood. We handle marketing, packaging, and deliveries.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/register-cook"
                className="px-6 py-3 bg-white text-orange-700 hover:bg-orange-50 rounded-2xl font-bold text-xs shadow-lg transition-all"
              >
                Register Your Home Kitchen ➔
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
