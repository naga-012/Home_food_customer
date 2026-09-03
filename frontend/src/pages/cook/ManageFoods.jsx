import React, { useState, useEffect } from 'react';
import { foodService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import VegBadge from '../../components/common/VegBadge';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Snacks', 'Desserts', 'Healthy Food'];

const ManageFoods = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Lunch',
    price: 150,
    quantity: 15,
    ingredients: '',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    food_type: 'VEG',
    preparation_time: '25 mins',
    is_available: true,
    is_today_menu: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const cookId = user?.cook_id || 1;
      const res = await foodService.getFoods({ cook_id: cookId, only_available: false });
      setFoods(res.data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleOpenAdd = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      category: 'Lunch',
      price: 150,
      quantity: 15,
      ingredients: '',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      food_type: 'VEG',
      preparation_time: '25 mins',
      is_available: true,
      is_today_menu: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      category: food.category,
      price: food.price,
      quantity: food.quantity,
      ingredients: food.ingredients || '',
      image_url: food.image_url || '',
      food_type: food.food_type,
      preparation_time: food.preparation_time,
      is_available: food.is_available,
      is_today_menu: food.is_today_menu,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingFood) {
        await foodService.updateFood(editingFood.id, formData);
      } else {
        await foodService.createFood(formData);
      }
      setModalOpen(false);
      fetchFoods();
    } catch (err) {
      console.error('Error saving food item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish from your kitchen menu?')) {
      try {
        await foodService.deleteFood(id);
        fetchFoods();
      } catch (err) {
        console.error('Failed to delete food:', err);
      }
    }
  };

  const toggleAvailability = async (food) => {
    try {
      await foodService.updateFood(food.id, { is_available: !food.is_available });
      fetchFoods();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Manage Kitchen Dishes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new homemade recipes, update ingredients, quantities, and availability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus size={16} /> Add New Dish
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-700">No dishes listed yet</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Add Your First Dish
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Dish</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Available Qty</th>
                  <th className="p-4">Prep Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {foods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=150&q=80'}
                        alt={food.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <VegBadge type={food.food_type} />
                          <span className="font-bold text-slate-900 text-sm">{food.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{food.description}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 font-semibold text-[11px]">
                        {food.category}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹{food.price}
                    </td>

                    <td className="p-4">
                      <span className={`font-bold ${food.quantity <= 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {food.quantity} Portions
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 font-medium">
                      {food.preparation_time}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(food)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          food.is_available
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {food.is_available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {food.is_available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(food)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold font-serif text-slate-900">
              {editingFood ? 'Edit Dish Details' : 'Add New Homemade Dish'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Gongura Chicken Curry"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dietary Type</label>
                  <select
                    value={formData.food_type}
                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe recipe nuances, spice blend, and aroma..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ingredients List</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g. Sona Masoori Rice, Pure Ghee, Cumin, Mustard, Curry Leaves"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preparation Time</label>
                  <input
                    type="text"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    placeholder="e.g. 25 mins"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dish Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_today_menu}
                    onChange={(e) => setFormData({ ...formData, is_today_menu: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-slate-800">Feature on Today's Menu</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-slate-800">Available to Order</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFoods;
