
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Items from "./pages/Items";
import Categories from "./pages/Categories";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { logout } from "./utils/api";

function Nav() {
  const { isAuthenticated, merchantName, clearAuth } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout(); // Call backend to invalidate session
    clearAuth(); // Clear auth state
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <header className="site-header">
      <div className="brand">
        <Link to="/">pk-web</Link>
      </div>
      <nav className="main-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/items">Items</Link>
        <Link to="/categories">Categories</Link>
        {isAuthenticated ? (
          <>
            {merchantName && <span style={{ marginLeft: '12px', color: '#666' }}>{merchantName}</span>}
            <a href="/logout" onClick={handleLogout} style={{ marginLeft: '12px' }}>Logout</a>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-root">
          <Nav />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
