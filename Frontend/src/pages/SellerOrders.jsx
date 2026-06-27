import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SellerLayout from './SellerLayout';

const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLES = {
    Pending:   { badge: 'border border-outline-variant/40 bg-surface-container text-on-surface-variant' },
    Shipped:   { badge: 'border border-outline-variant/40 bg-surface-container text-on-surface-variant' },
    Delivered: { badge: 'border border-outline-variant/40 bg-surface-container text-on-surface-variant' },
    Cancelled: { badge: 'border border-outline-variant/40 bg-surface-container text-on-surface-variant' },
};

export default function SellerOrders() {
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Track which items are having their status updated
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order/seller/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch seller orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, prodId, newStatus) => {
        const itemKey = `${orderId}-${prodId}`;
        setUpdatingId(itemKey);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/order/seller/orders/${orderId}/${prodId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update state locally to avoid a full refetch
            setOrders(prev =>
                prev.map(item =>
                    item.orderId.toString() === orderId && item.prodId.toString() === prodId
                        ? { ...item, status: newStatus }
                        : item
                )
            );
        } catch (err) {
            console.error('Failed to update status:', err);
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const tabs = ['All', ...STATUSES];

    const filteredOrders = activeTab === 'All'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const countByStatus = (status) => orders.filter(o => o.status === status).length;

    const formatAddress = (addr) => {
        if (!addr) return 'No address on file';
        const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <SellerLayout>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-2">Order Fulfillment</h2>
                    <p className="font-body-lg text-[16px] text-on-surface-variant">Manage and process your recent customer orders.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="relative border-b border-outline-variant/20 mb-8">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 font-title-md text-[14px] font-bold transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                                activeTab === tab
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
                            }`}
                        >
                            {tab}
                            {tab !== 'All' && countByStatus(tab) > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-surface-container-highest text-on-surface">
                                    {countByStatus(tab)}
                                </span>
                            )}
                            {tab === 'All' && orders.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-surface-container-highest text-on-surface">
                                    {orders.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {error && (
                <div className="bg-error/10 text-error p-4 rounded-xl mb-6 font-label-md flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-on-surface-variant py-16">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center text-on-surface-variant py-16 bg-surface-container-lowest/60 rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[48px] mb-3 block text-outline-variant">inbox</span>
                    <p className="font-title-md text-[16px]">No {activeTab !== 'All' ? activeTab : ''} orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map((item) => {
                        const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.Pending;
                        const itemKey = `${item.orderId}-${item.prodId}`;
                        const isUpdating = updatingId === itemKey;

                        return (
                            <div key={item._id} className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-outline-variant/20 border-l-2 border-l-primary">

                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Product Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-lg bg-white border border-outline-variant/10 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="material-symbols-outlined text-outline-variant text-[30px]">image</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body-md text-[15px] font-bold text-on-surface truncate">{item.productName}</p>
                                            <p className="font-label-sm text-[12px] text-on-surface-variant mt-0.5">
                                                Qty: {item.quantity} &bull; ₹{Number(item.price).toFixed(2)}
                                            </p>
                                            <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                                                Order ID: <span className="font-mono">{item.orderId?.toString().slice(-8).toUpperCase()}</span>
                                            </p>
                                            {item.orderedAt && (
                                                <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                                                    Ordered: {new Date(item.orderedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="flex-1">
                                        <p className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Ship To</p>
                                        <p className="font-body-md text-[13px] text-on-surface flex items-start gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5 flex-shrink-0">location_on</span>
                                            {formatAddress(item.address)}
                                        </p>
                                    </div>

                                    {/* Status + Update */}
                                    <div className="w-full lg:w-52 flex flex-col justify-center gap-3">
                                        <div>
                                            <p className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1 block">Update Status</label>
                                            <div className="relative">
                                                <select
                                                    disabled={isUpdating}
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.orderId.toString(), item.prodId.toString(), e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[13px] text-on-surface appearance-none disabled:opacity-50"
                                                >
                                                    {STATUSES.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                                                    {isUpdating ? 'sync' : 'expand_more'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SellerLayout>
    );
}
