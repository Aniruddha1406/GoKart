import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SellerLayout({ children }) {
    const { pathname } = useLocation();

    const handleSwitchToBuyer = async () => {
        alert("Login as a customer")
        window.location.href = "/auth"; 
    };

    const isActive = (path) => pathname === path || (path !== '/seller-dashboard' && pathname.startsWith(path));

    return (
        <div className="bg-background text-on-surface font-body-md antialiased min-h-screen relative overflow-x-hidden">
            {/* SideNavBar */}
            <nav className="fixed left-0 top-0 h-full z-40 hidden md:flex flex-col w-64 border-r border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm">
                <div className="p-gutter h-16 flex items-center border-b border-outline-variant/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                            <span className="material-symbols-outlined text-[20px]">storefront</span>
                        </div>
                        <div>
                            <h1 className="font-headline-lg-mobile text-[20px] font-bold text-primary leading-none">GoKart Vendors</h1>
                            <p className="font-label-sm text-[12px] text-on-surface-variant">Seller Portal</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 py-6 px-4 flex flex-col gap-2">

                    <Link to="/seller-dashboard/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-title-md text-[16px] transition-all duration-200 ${isActive('/seller-dashboard/inventory') ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high/30' : 'text-on-surface-variant hover:bg-surface-container-high/50 font-normal'}`}>
                        <span className={`material-symbols-outlined ${isActive('/seller-dashboard/inventory') ? 'fill' : ''}`}>inventory_2</span>
                        Inventory
                    </Link>
                    <Link to="/seller-dashboard/orders" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-title-md text-[16px] transition-all duration-200 ${isActive('/seller-dashboard/orders') ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high/30' : 'text-on-surface-variant hover:bg-surface-container-high/50 font-normal'}`}>
                        <span className={`material-symbols-outlined ${isActive('/seller-dashboard/orders') ? 'fill' : ''}`}>shopping_cart</span>
                        Orders
                    </Link>

                </div>
                <div className="p-4 border-t border-outline-variant/10">
                    <button onClick={handleSwitchToBuyer} className="w-full py-2 px-4 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant font-label-sm text-[12px] hover:bg-surface-container/50 transition-colors">
                        Switch to Buyer
                    </button>
                </div>
            </nav>

            {/* TopNavBar */}
            <header className="fixed top-0 right-0 md:left-64 left-0 h-16 z-30 bg-surface-bright/70 backdrop-blur-2xl border-b border-outline-variant/10" />

            {/* Main Canvas */}
            <main className="md:ml-64 pt-16 min-h-screen">
                <div className="p-8 max-w-[1280px] mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
