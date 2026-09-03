import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    delivery_fee: 35,
    total_amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await cartService.getCart();
        setCart(res.data);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage fallback for guest cart
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch (e) {
          localStorage.removeItem('guest_cart');
        }
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (food, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart(food.id, quantity);
        setCart(res.data);
        showToast(`Added "${food.name}" to cart!`);
      } catch (err) {
        const msg = err.response?.data?.detail || 'Failed to add item to cart';
        showToast(msg);
      }
    } else {
      // Local cart addition
      const effectivePrice = (food.is_evening_offer && food.discount_price) ? food.discount_price : food.price;
      const existingItemIndex = cart.items.findIndex(item => item.food_id === food.id);
      let updatedItems = [...cart.items];

      if (existingItemIndex > -1) {
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        updatedItems.push({
          id: Date.now(),
          food_id: food.id,
          quantity,
          food,
        });
      }

      const subtotal = updatedItems.reduce((acc, item) => {
        const price = (item.food.is_evening_offer && item.food.discount_price) ? item.food.discount_price : item.food.price;
        return acc + price * item.quantity;
      }, 0);
      const delivery_fee = subtotal > 0 ? 35 : 0;
      const newCart = {
        items: updatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        delivery_fee,
        total_amount: Math.round((subtotal + delivery_fee) * 100) / 100,
      };

      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      showToast(`Added "${food.name}" to cart!`);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.updateQuantity(cartItemId, quantity);
        setCart(res.data);
      } catch (err) {
        console.error('Failed to update quantity:', err);
      }
    } else {
      let updatedItems = cart.items
        .map(item => item.id === cartItemId ? { ...item, quantity } : item)
        .filter(item => item.quantity > 0);

      const subtotal = updatedItems.reduce((acc, item) => {
        const price = (item.food.is_evening_offer && item.food.discount_price) ? item.food.discount_price : item.food.price;
        return acc + price * item.quantity;
      }, 0);
      const delivery_fee = subtotal > 0 ? 35 : 0;
      const newCart = {
        items: updatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        delivery_fee,
        total_amount: Math.round((subtotal + delivery_fee) * 100) / 100,
      };
      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.removeItem(cartItemId);
        setCart(res.data);
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    } else {
      const updatedItems = cart.items.filter(item => item.id !== cartItemId);
      const subtotal = updatedItems.reduce((acc, item) => {
        const price = (item.food.is_evening_offer && item.food.discount_price) ? item.food.discount_price : item.food.price;
        return acc + price * item.quantity;
      }, 0);
      const delivery_fee = subtotal > 0 ? 35 : 0;
      const newCart = {
        items: updatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        delivery_fee,
        total_amount: Math.round((subtotal + delivery_fee) * 100) / 100,
      };
      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (e) {}
    }
    const emptyCart = { items: [], subtotal: 0, delivery_fee: 0, total_amount: 0 };
    setCart(emptyCart);
    localStorage.removeItem('guest_cart');
  };

  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
