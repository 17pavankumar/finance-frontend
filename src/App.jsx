import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FinanceRecords from './pages/FinanceRecords';

// Protect routes — redirect to /login if no token
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access');
    return token ? children : <Navigate to="/login" />;
};

// ──────────────────────────────────────────────────────────────
// Currency Context
// ──────────────────────────────────────────────────────────────
export const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

// Global Formatter function generator
export const formatCurrency = (amount, currencyCode) => {
    // Basic mapping for locales
    const locales = {
        'USD': 'en-US',
        'INR': 'en-IN',
        'EUR': 'de-DE',
        'GBP': 'en-GB'
    };
    return new Intl.NumberFormat(locales[currencyCode] || 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// ──────────────────────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────────────────────
const Sidebar = ({ open, onClose }) => {
    const { currency, setCurrency } = useCurrency();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Backdrop overlay (mobile only) */}
            <div
                className={`sidebar-backdrop ${open ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <span className="brand-name">FinanceApp</span>
                </div>

                {/* Currency Selector */}
                <div style={{ padding: '0 20px 10px', marginTop: '14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-muted)', marginBottom: 6, letterSpacing: 0.8 }}>
                        Currency
                    </div>
                    <select 
                        className="select" 
                        style={{ backgroundColor: 'transparent', border: '1px solid var(--sidebar-border)', color: '#fff' }}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="USD" style={{color:'#000'}}>🇺🇸 USD ($)</option>
                        <option value="INR" style={{color:'#000'}}>🇮🇳 INR (₹)</option>
                        <option value="EUR" style={{color:'#000'}}>🇪🇺 EUR (€)</option>
                        <option value="GBP" style={{color:'#000'}}>🇬🇧 GBP (£)</option>
                    </select>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-label">Overview</span>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <i className="bi bi-grid-1x2-fill"></i>
                            Dashboard
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <span className="nav-section-label">Finance</span>
                        <NavLink
                            to="/records"
                            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <i className="bi bi-table"></i>
                            Data Management
                        </NavLink>
                    </div>
                </nav>

                {/* Footer / user area */}
                <div className="sidebar-footer">
                    <div className="avatar">A</div>
                    <span className="footer-name">Admin</span>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </aside>
        </>
    );
};

// ──────────────────────────────────────────────────────────────
// Mobile top bar
// ──────────────────────────────────────────────────────────────
const Topbar = ({ onMenu }) => (
    <div className="topbar">
        <button className="hamburger" onClick={onMenu} aria-label="Open menu">
            <i className="bi bi-list"></i>
        </button>
        <span className="brand-name">FinanceApp</span>
    </div>
);

// ──────────────────────────────────────────────────────────────
// Inner app (needs router context for useLocation)
// ──────────────────────────────────────────────────────────────
function AppInner() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { pathname } = useLocation();

    // Default to USD or localStorage
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const isLogin = pathname === '/login';

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            <div className="layout">
                {!isLogin && (
                    <>
                        <Topbar onMenu={() => setSidebarOpen(true)} />
                        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    </>
                )}

                <div className={isLogin ? '' : 'page-body'}>
                    <div className={isLogin ? '' : 'main'}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/records" element={<PrivateRoute><FinanceRecords /></PrivateRoute>} />
                        </Routes>
                    </div>
                </div>
            </div>
        </CurrencyContext.Provider>
    );
}

export default function App() {
    return (
        <Router>
            <AppInner />
        </Router>
    );
}
