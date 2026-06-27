import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TopNavBar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        
        localStorage.removeItem('token');
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/logout`)
            .then(response => {
                window.location.href = '/'; 
            })
            .catch(error => {
                console.log("Logout API failed, but token cleared locally", error);
                window.location.href = '/';
            });
    };

    const navLink = (to, label) => {
        const active = pathname === to;
        return (
            <Link
                to={to}
                className={`nav-link font-label-md text-label-md transition-colors duration-200 ${
                    active ? 'text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
                {label}
            </Link>
        );
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-2xl border-b border-outline-variant/25 shadow-sm">
            <div className="flex justify-between items-center h-[76px] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

                {/* Left: Brand + Nav links */}
                <div className="flex items-center gap-12">
                    {/* Wordmark */}
                    <Link to="/" className="flex items-center gap-1 group">
                        <span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">shopping_cart</span>
                        <span className="font-display-sm text-[28px] font-bold tracking-[-0.04em] text-on-surface leading-none select-none">
                            GoKart
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLink('/', 'Shop')}
                        {navLink('/collections', 'Collections')}
                        {navLink('/seller-dashboard/inventory', 'Seller Portal')}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">

                    {/* Account — simple link when logged out, dropdown when logged in */}
                    {isLoggedIn ? (
                        <div className="relative" ref={dropdownRef}>
                            {/* Trigger */}
                            <button
                                id="nav-account"
                                aria-label="My Account"
                                aria-expanded={dropdownOpen}
                                onClick={() => setDropdownOpen(v => !v)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                                    dropdownOpen
                                        ? 'bg-on-surface text-surface'
                                        : 'text-on-surface-variant hover:text-primary hover:bg-primary/8'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                            </button>

                            {/* Dropdown panel */}
                            <div
                                className={`absolute right-0 top-[calc(100%+10px)] w-48 bg-white rounded-xl border border-outline-variant/25 shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                                    dropdownOpen
                                        ? 'opacity-100 scale-100 translate-y-0'
                                        : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                                }`}
                            >
                                {/* Small arrow indicator */}
                                <div className="absolute -top-[5px] right-[14px] w-[10px] h-[10px] bg-white border-l border-t border-outline-variant/25 rotate-45" />

                                <div className="py-1.5">
                                    {/* Profile link */}
                                    <Link
                                        to="/profile"
                                        id="nav-dropdown-profile"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-on-surface hover:bg-[#F8F7F5] transition-colors duration-150"
                                    >
                                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">manage_accounts</span>
                                        My Profile
                                    </Link>

                                    {/* Divider */}
                                    <div className="my-1 mx-4 h-px bg-outline-variant/25" />

                                    {/* Logout */}
                                    <button
                                        id="nav-dropdown-logout"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-error hover:bg-error/5 transition-colors duration-150"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            id="nav-account"
                            aria-label="Sign In"
                            title="Sign In"
                            className="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all duration-200"
                        >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                        </Link>
                    )}

                    {/* Cart */}
                    <Link
                        to="/checkout"
                        id="nav-cart"
                        aria-label="Cart"
                        className="relative flex items-center gap-2 pl-4 pr-5 py-2 rounded-full bg-primary text-on-primary shadow-sm hover:shadow-md hover:bg-primary/90 transition-all duration-200"
                    >
                        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        <span className="font-label-md text-label-md hidden sm:inline leading-none">Cart</span>
                    </Link>
                </div>

            </div>
        </header>
    );
}
