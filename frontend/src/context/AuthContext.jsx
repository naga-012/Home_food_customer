import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force purge any old auto-logged in cook session (e.g. Lakshmi Narayanan)
    if (!localStorage.getItem('auth_cleaned_v2')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.setItem('auth_cleaned_v2', 'true');
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        // If stored user is a cook or old cook account, clear and ask to login
        if (parsed.role === 'HOME_COOK' || parsed.email === 'amma@intiruchi.com') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { access_token, user: userData } = res.data;
    if (userData.role === 'HOME_COOK') {
      throw {
        response: {
          data: { detail: 'This account is registered as a Home Cook. Please log in with your customer account.' },
        },
      };
    }
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const updateCurrentUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isCook = user?.role === 'HOME_COOK';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateCurrentUser,
        isCustomer,
        isCook,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
