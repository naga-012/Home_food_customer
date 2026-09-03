import React from 'react';
import { Filter, RotateCcw, Flame, Sparkles } from 'lucide-react';
import VegBadge from '../common/VegBadge';

const CATEGORIES = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Biryani',
  'Snacks',
  'Desserts',
  'Healthy Food',
];

const FoodFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-orange-600" />
          <h3 className="font-bold text-slate-800 text-sm">Filter Food</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Food Type (Veg / Non-Veg) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Dietary Preference
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['ALL', 'VEG', 'NON_VEG'].map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange('food_type', type)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                filters.food_type === type
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type !== 'ALL' && <VegBadge type={type} />}
              <span>{type === 'ALL' ? 'All' : type === 'VEG' ? 'Veg Only' : 'Non-Veg'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special Highlights */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Highlights
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onFilterChange('is_evening_offer', !filters.is_evening_offer)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
              filters.is_evening_offer
                ? 'bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame size={15} className="text-orange-600" />
              Evening Flash Deals
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-200/60 font-extrabold text-orange-800">
              Save Up to 40%
            </span>
          </button>

          <button
            onClick={() => onFilterChange('is_today_menu', !filters.is_today_menu)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
              filters.is_today_menu
                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={15} className="text-amber-600" />
              Today's Cook Specials
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 font-extrabold text-amber-800">
              Fresh Batches
            </span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange('category', cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filters.category === cat
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <span>Max Price: ₹{filters.max_price || 350}</span>
        </div>
        <input
          type="range"
          min="80"
          max="350"
          step="10"
          value={filters.max_price || 350}
          onChange={(e) => onFilterChange('max_price', Number(e.target.value))}
          className="w-full accent-orange-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>₹80</span>
          <span>₹200</span>
          <span>₹350</span>
        </div>
      </div>
    </div>
  );
};

export default FoodFilter;
