import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, deleteAddress } from '../store/slices/addressSlice';

/* ── status helpers ──────────────────────────────────── */
const STATUS_PRIORITY = ['Cancelled', 'Pending', 'Shipped', 'Delivered'];

function overallStatus(items) {
    if (!items?.length) return 'Pending';
    let worst = 'Delivered';
    for (const item of items) {
        if (STATUS_PRIORITY.indexOf(item.status) < STATUS_PRIORITY.indexOf(worst)) {
            worst = item.status;
        }
    }
    return worst;
}

const STATUS_STYLE = {
    Delivered:  { badge: 'bg-emerald-50 text-emerald-700',  dot: 'bg-emerald-500' },
    Shipped:    { badge: 'bg-blue-50 text-blue-700',        dot: 'bg-blue-500' },
    Pending:    { badge: 'bg-amber-50 text-amber-700',      dot: 'bg-amber-500' },
    Cancelled:  { badge: 'bg-red-50 text-red-600',          dot: 'bg-red-500' },
};

import { useLocation } from 'react-router-dom';

export default function Profile() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'orders'); // 'orders' or 'addresses'
    
    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [expanded, setExpanded] = useState(null); // expanded order id

    // Addresses State (Redux)
    const dispatch = useDispatch();
    const { list: addresses, status: addressStatus } = useSelector((state) => state.addresses);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', country: '', postalCode: '' });

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order/customer/orders`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

    // Fetch Addresses when tab changes to addresses
    useEffect(() => {
        if (activeTab === 'addresses' && addressStatus === 'idle') {
            dispatch(fetchAddresses());
        }
    }, [activeTab, addressStatus, dispatch]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        await dispatch(addAddress(newAddress));
        setIsAddingAddress(false);
        setNewAddress({ street: '', city: '', state: '', country: '', postalCode: '' });
    };

    const handleDeleteAddress = (id) => {
        dispatch(deleteAddress(id));
    };

    return (
        <div className="min-h-screen bg-[#F8F7F5] font-body-md">

            {/* ── Minimal top bar ──────────────────────────── */}
            <header className="fixed top-0 w-full z-50 bg-[#F8F7F5]/90 backdrop-blur-xl border-b border-black/[0.07]">
                <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <Link to="/" className="flex items-center gap-1 group">
                        <span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">shopping_cart_checkout</span>
                        <span className="font-display-sm text-[28px] font-bold tracking-[-0.04em] text-on-surface leading-none select-none">
                            GoKart
                        </span>
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                        Back to Shop
                    </Link>
                </div>
            </header>

            <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

                {/* ── Page heading & Tabs ──────────────────────────── */}
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant mb-2">Your Account</p>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <h1 className="font-display-sm text-[36px] font-bold tracking-[-0.03em] text-on-surface">
                            {activeTab === 'orders' ? 'Order History' : 'Saved Addresses'}
                        </h1>
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-surface-container/50 p-1 rounded-lg">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`px-5 py-2 text-[13px] font-semibold rounded-md transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Orders
                            </button>
                            <button 
                                onClick={() => setActiveTab('addresses')}
                                className={`px-5 py-2 text-[13px] font-semibold rounded-md transition-all ${activeTab === 'addresses' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Addresses
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TAB: ORDERS ──────────────── */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden animate-fade-in">
                        <div className="px-8 pt-8 pb-6 border-b border-outline-variant/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-[18px] font-bold text-on-surface tracking-[-0.02em]">Order History</h2>
                                    <p className="text-[13px] text-on-surface-variant mt-0.5">Your recent purchases and their status</p>
                                </div>
                                <span className="text-[11px] font-bold bg-on-surface text-surface px-3 py-1 rounded-full">{orders.length} orders</span>
                            </div>
                        </div>

                        <div className="divide-y divide-outline-variant/20">
                            {loadingOrders ? (
                                <div className="px-8 py-10 text-center text-[14px] text-on-surface-variant">
                                    Loading orders…
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="px-8 py-10 text-center text-[14px] text-on-surface-variant">
                                    No orders yet. Start shopping!
                                </div>
                            ) : (
                                orders.map((order) => {
                                    const status = overallStatus(order.items);
                                    const style = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
                                    const isOpen = expanded === order._id;
                                    const itemCount = order.items?.length ?? 0;
                                    const date = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                    const addr = order.address;

                                    return (
                                        <div key={order._id} className="divide-y divide-outline-variant/10">
                                            {/* Order summary row */}
                                            <div
                                                className="px-8 py-5 hover:bg-[#F8F7F5] transition-colors duration-150 cursor-pointer"
                                                onClick={() => setExpanded(isOpen ? null : order._id)}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                            <span className="text-[13px] font-bold text-on-surface font-mono">
                                                                #{order._id.slice(-8).toUpperCase()}
                                                            </span>
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-outline-variant/40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                                                {status}
                                                            </span>
                                                        </div>

                                                        <p className="text-[12px] text-on-surface-variant">
                                                            {date} &nbsp;·&nbsp; {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                        </p>

                                                        {addr && (
                                                            <p className="text-[11px] text-on-surface-variant/60 mt-0.5 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[13px]">location_on</span>
                                                                {addr.city}, {addr.state}, {addr.country}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-[15px] font-bold text-on-surface">
                                                                ₹{order.totalPrice?.toFixed(2) ?? '—'}
                                                            </p>
                                                            <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
                                                                {order.paymentId ? `ID: ${order.paymentId.slice(-8)}` : ''}
                                                            </p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                            expand_more
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded: item list */}
                                            {isOpen && (
                                                <div className="px-8 py-4 bg-[#F8F7F5] space-y-3">
                                                    {addr && (
                                                        <div className="text-[12px] text-on-surface-variant bg-white rounded-xl px-4 py-3 border border-outline-variant/20">
                                                            <p className="font-semibold text-on-surface mb-0.5">Delivery Address</p>
                                                            <p>{addr.street}, {addr.city}, {addr.state} – {addr.postalCode}, {addr.country}</p>
                                                        </div>
                                                    )}

                                                    {order.paymentId && (
                                                        <div className="text-[11px] text-on-surface-variant/70 flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[13px]">receipt</span>
                                                            Payment ID: <span className="font-mono text-on-surface-variant">{order.paymentId}</span>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        {order.items.map((item, i) => {
                                                            const itemStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.Pending;
                                                            return (
                                                                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-outline-variant/20">
                                                                    {item.productImage && (
                                                                        <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[13px] font-semibold text-on-surface truncate">{item.productName ?? 'Product'}</p>
                                                                        <p className="text-[11px] text-on-surface-variant">
                                                                            Qty: {item.quantity}
                                                                            {item.productPrice != null && <> &nbsp;·&nbsp; ₹{item.productPrice.toFixed(2)} each</>}
                                                                        </p>
                                                                    </div>
                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-outline-variant/40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex-shrink-0">
                                                                        {item.status}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div className="px-8 py-5 border-t border-outline-variant/20 bg-[#F8F7F5]">
                            <Link to="/collections" className="flex items-center justify-center gap-2 text-[13px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}


                {/* ── TAB: ADDRESSES ──────────────── */}
                {activeTab === 'addresses' && (
                    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden animate-fade-in">
                        <div className="px-8 pt-8 pb-6 border-b border-outline-variant/20 flex items-center justify-between">
                            <div>
                                <h2 className="text-[18px] font-bold text-on-surface tracking-[-0.02em]">Saved Addresses</h2>
                                <p className="text-[13px] text-on-surface-variant mt-0.5">Manage your shipping addresses</p>
                            </div>
                            <button 
                                onClick={() => setIsAddingAddress(!isAddingAddress)}
                                className="btn-primary text-on-primary text-[12px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">{isAddingAddress ? 'close' : 'add'}</span>
                                {isAddingAddress ? 'Cancel' : 'Add New'}
                            </button>
                        </div>

                        <div className="divide-y divide-outline-variant/20">
                            
                            {/* Add Address Form */}
                            {isAddingAddress && (
                                <div className="px-8 py-6 bg-surface-container-lowest">
                                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Street Address</label>
                                            <input required value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 123 Main St" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">City</label>
                                            <input required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">State / Province</label>
                                            <input required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Postal Code</label>
                                            <input required value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Country</label>
                                            <input required value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end mt-2">
                                            <button type="submit" className="btn-primary text-on-primary px-6 py-2.5 rounded-lg text-[13px] font-bold">Save Address</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Addresses List */}
                            {addressStatus === 'loading' ? (
                                <div className="px-8 py-10 text-center text-[14px] text-on-surface-variant">Loading addresses…</div>
                            ) : addresses.length === 0 ? (
                                <div className="px-8 py-10 text-center text-[14px] text-on-surface-variant flex flex-col items-center gap-3">
                                    <span className="material-symbols-outlined text-[40px] opacity-50">location_off</span>
                                    <p>No addresses saved yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                    {addresses.map((addr) => (
                                        <div key={addr._id} className="border border-outline-variant/30 rounded-xl p-5 hover:border-primary/50 transition-colors relative group bg-white">
                                            <div className="flex items-start gap-3">
                                                <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                                                <div>
                                                    <p className="font-semibold text-[14px] text-on-surface mb-1">{addr.street}</p>
                                                    <p className="text-[13px] text-on-surface-variant">{addr.city}, {addr.state} {addr.postalCode}</p>
                                                    <p className="text-[13px] text-on-surface-variant">{addr.country}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container/20 opacity-0 group-hover:opacity-100"
                                                title="Delete Address"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
