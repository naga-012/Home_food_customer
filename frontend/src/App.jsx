import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Public storefront pages
import Home from './pages/Home';
import Foods from './pages/Foods';
import FoodDetails from './pages/FoodDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer pages
import MyOrders from './pages/customer/MyOrders';
import Favorites from './pages/customer/Favorites';
import Profile from './pages/customer/Profile';

function App() {
  return (
    <Routes>
      {/* Customer Storefront Layout (Swiggy style unified layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/foods/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirects from removed dashboard and legacy routes */}
      <Route path="/dashboard" element={<Navigate to="/orders" replace />} />
      <Route path="/customer/*" element={<Navigate to="/orders" replace />} />
      <Route path="/cook/*" element={<Navigate to="/orders" replace />} />
      <Route path="/register-cook" element={<Navigate to="/" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
