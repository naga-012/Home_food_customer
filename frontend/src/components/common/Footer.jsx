import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, ShieldCheck, Clock, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">100% Homestyle</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cooked in certified home kitchens with motherly care</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Zero Preservatives</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cold-pressed oils, pure spices & farm-fresh produce</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Made to Order</h4>
                <p className="text-xs text-slate-400 mt-0.5">Prepared fresh right after you place your order</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Waste Reduction</h4>
                <p className="text-xs text-slate-400 mt-0.5">Evening flash deals prevent food wastage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-2xl font-bold font-serif bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Inti Ruchi
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Inti Ruchi (ఇంటి రుచి / Home Taste) celebrates authentic Indian culinary traditions. We empower talented local home cooks to share wholesome, heartwarming home-cooked meals with food lovers in their neighborhood.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> Hyderabad, Telangana</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-orange-500" /> +91 98765 43210</span>
            </div>
          </div>

          {/* Explore Food */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/foods?category=Biryani" className="hover:text-orange-400 transition-colors">Hyderabadi Biryani</Link></li>
              <li><Link to="/foods?category=Breakfast" className="hover:text-orange-400 transition-colors">South Indian Breakfast</Link></li>
              <li><Link to="/foods?category=Lunch" className="hover:text-orange-400 transition-colors">Homestyle Thalis</Link></li>
              <li><Link to="/foods?category=Healthy%20Food" className="hover:text-orange-400 transition-colors">Millet & Detox Bowls</Link></li>
              <li><Link to="/foods?category=Desserts" className="hover:text-orange-400 transition-colors">Traditional Sweets</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/foods" className="hover:text-orange-400 transition-colors">Browse Foods</Link></li>
              <li><Link to="/customer/orders" className="hover:text-orange-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/customer/favorites" className="hover:text-orange-400 transition-colors">My Favorites</Link></li>
              <li><Link to="/cart" className="hover:text-orange-400 transition-colors">View Cart</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Trust & Safety</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-400">FSSAI Certified Kitchens</span></li>
              <li><span className="text-slate-400">Contactless Delivery</span></li>
              <li><span className="text-slate-400">Hygiene Audited Chefs</span></li>
              <li><span className="text-slate-400">Eco-friendly Packaging</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Inti Ruchi Inc. All rights reserved. Crafted with passion for homemade food.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">FSSAI Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
