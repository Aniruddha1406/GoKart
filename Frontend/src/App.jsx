import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import SellerOrders from './pages/SellerOrders';
import SellerInventory from './pages/SellerInventory';
import SellerProductForm from './pages/SellerProductForm';
import Profile from './pages/Profile';

/**
 * SellerRoute — wraps any seller-only page.
 * Checks for a valid seller token by hitting a seller-authenticated endpoint.
 * Redirects to /auth on failure (no token, 401, or 403).
 */
function SellerRoute({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('denied');
      navigate('/auth');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/product/seller/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setStatus('allowed'))
      .catch((err) => {
        setStatus('denied');
        const code = err.response?.status;
        if (code === 401) {
          alert('Please log in using a seller account to access the seller portal.');
        } else if (code === 403) {
          alert('You do not have permission to access the seller portal.');
        }
        navigate('/auth');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-on-surface-variant font-body-md">Verifying access...</span>
      </div>
    );
  }

  return status === 'allowed' ? children : null;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />

        {/* Redirect base seller path to inventory */}
        <Route path="/seller-dashboard" element={<Navigate to="/seller-dashboard/inventory" replace />} />

        {/* Protected seller routes */}
        <Route path="/seller-dashboard/orders" element={<SellerRoute><SellerOrders /></SellerRoute>} />
        <Route path="/seller-dashboard/inventory" element={<SellerRoute><SellerInventory /></SellerRoute>} />
        <Route path="/seller-dashboard/inventory/new" element={<SellerRoute><SellerProductForm /></SellerRoute>} />
        <Route path="/seller-dashboard/inventory/edit/:id" element={<SellerRoute><SellerProductForm /></SellerRoute>} />
      </Routes>
    </Router>
  );
}
