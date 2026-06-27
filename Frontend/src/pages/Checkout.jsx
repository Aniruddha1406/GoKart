import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../store/slices/addressSlice';

const API = `${import.meta.env.VITE_API_URL}/api/order`;

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

// Helper to dynamically load razorpay script
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const location  = useLocation();

    // ── "Buy Now" mode detection ──────────────────────────────────────────
    const isBuyNow   = location.state?.buyNow === true;
    const buyNowItem = location.state?.buyNowItem ?? null;

    const [cartItems, setCartItems]         = useState([]);   // real cart items (loaded once)
    const [displayItems, setDisplayItems]   = useState([]);   // what we render / charge
    const [loading, setLoading]             = useState(true);
    const [updating, setUpdating]           = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('online');

    // Redux addresses
    const { list: addresses, status: addressStatus } = useSelector((state) => state.addresses);
    const isLoggedIn = !!localStorage.getItem('token');

    /* ── fetch real cart ─────────────────────────────────────────────── */
    const fetchCart = useCallback(async () => {
        try {
            const res  = await axios.get(`${API}/cart`, { headers: authHeaders() });
            const data = res.data;
            const items = Array.isArray(data) ? data : (data.items ?? []);
            setCartItems(items);
            return items;
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            return [];
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const items = await fetchCart();

            if (isBuyNow && buyNowItem) {
                // Buy Now mode: show only the "buy now" item
                setDisplayItems([buyNowItem]);
            } else {
                // Normal cart mode
                setDisplayItems(items);
            }

            setLoading(false);
        };
        init();

        if (addressStatus === 'idle') {
            dispatch(fetchAddresses());
        }
    }, [fetchCart, addressStatus, dispatch, isBuyNow]);

    /* ── auto-select first address ───────────────────────────────────── */
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0]._id);
        }
    }, [addresses, selectedAddress]);

    /* ── adjust qty (normal cart mode only) ─────────────────────────── */
    const adjustQty = async (prodId, delta) => {
        if (isBuyNow) return;
        setUpdating(prodId);
        try {
            await axios.post(`${API}/cart`, { productId: prodId, quantity: delta }, { headers: authHeaders() });
            const updated = await fetchCart();
            setDisplayItems(updated);
        } catch (err) {
            console.error('Failed to update cart:', err);
        } finally {
            setUpdating(null);
        }
    };

    /* ── remove item (normal cart mode only) ────────────────────────── */
    const removeItem = async (prodId) => {
        if (isBuyNow) return;
        setUpdating(prodId);
        try {
            await axios.delete(`${API}/cart/${prodId}`, { headers: authHeaders() });
            const updated = await fetchCart();
            setDisplayItems(updated);
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setUpdating(null);
        }
    };

    /* ── computed totals ─────────────────────────────────────────────── */
    const subtotal   = useMemo(() => displayItems.reduce((s, i) => s + i.price * i.quantity, 0), [displayItems]);
    const totalItems = useMemo(() => displayItems.reduce((s, i) => s + i.quantity, 0), [displayItems]);

    /* ── handle checkout ─────────────────────────────────────────────── */
    const handleCheckout = async () => {
        if (!selectedAddress) {
            alert('Please select a shipping address.');
            return;
        }

        const addressObj = addresses.find(a => a._id === selectedAddress);

        if (paymentMethod === 'cod') {
            try {
                const confirmData = {
                    items: displayItems,
                    totalPrice: subtotal,
                    address: addressObj,
                    buyNow: isBuyNow,
                    paymentMethod: 'COD'
                };
                await axios.post(`${API}/confirm-payment`, confirmData, { headers: authHeaders() });
                alert('Order placed successfully via Cash on Delivery.');
                // Clear the state so "Buy Now" is no longer active if they come back
                navigate('.', { replace: true, state: {} });
                setTimeout(() => navigate('/profile'), 0);
            } catch (err) {
                console.error('Failed to create COD order:', err);
                alert('Failed to place order.');
            }
            return;
        }

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 1. Initialize Payment
            const initRes = await axios.post(
                `${API}/initialize-payment`,
                { totalPrice: subtotal },
                { headers: authHeaders() }
            );
            const { razorpayOrderId, amount, currency } = initRes.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: 'rzp_test_SzrKMtUMqYl2eC',
                amount: amount.toString(),
                currency,
                name: 'GoKart',
                description: 'Purchase Order',
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 3. Confirm Payment — send only displayItems (single item in Buy Now mode)
                        const confirmData = {
                            items:              displayItems,
                            totalPrice:         subtotal,
                            address:            addressObj,
                            razorpayPaymentId:  response.razorpay_payment_id,
                            // tell backend whether this was buy-now (so it doesn't clear the full cart)
                            buyNow:             isBuyNow,
                        };
                        await axios.post(`${API}/confirm-payment`, confirmData, { headers: authHeaders() });

                        alert('Payment successful! Order created.');
                        // Clear the state so "Buy Now" is no longer active if they come back
                        navigate('.', { replace: true, state: {} });
                        setTimeout(() => navigate('/profile'), 0);
                    } catch (err) {
                        console.error('Failed to confirm order:', err);
                        alert('Payment succeeded but order creation failed.');
                    }
                },
                theme: { color: '#000000' },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error('Failed to initialize payment:', err);
            alert('Failed to start payment process.');
        }
    };

    /* ── UI ──────────────────────────────────────────────────────────── */
    return (
        <div className="bg-white text-on-background font-body-md min-h-screen flex flex-col">
            <TopNavBar />

            <main className="flex-grow pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
                {!isLoggedIn ? (
                    <div className="flex justify-center items-center h-[50vh]">
                        <div className="bg-surface-container-low/50 border border-outline-variant/20 p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md w-full">
                            <span className="material-symbols-outlined text-[48px] text-primary mb-4">lock</span>
                            <h3 className="font-display-sm text-[24px] font-bold text-on-surface mb-2">Please login to checkout.</h3>
                            <p className="font-body-md text-on-surface-variant mb-6">You need an account to proceed with your order.</p>
                            <button onClick={() => navigate('/auth')} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md hover:bg-primary/90 transition-colors shadow-sm">
                                Login
                            </button>
                        </div>
                    </div>
                ) : (
                <div className="flex flex-col lg:flex-row gap-gutter">

                    {/* ── Left: Items ──────────────────────────────────── */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">
                                {isBuyNow ? 'Buy Now' : 'Your Cart'}
                            </h1>
                            {isBuyNow && (
                                <span className="mb-4 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-caption text-caption uppercase tracking-wider">
                                    Direct Purchase
                                </span>
                            )}
                        </div>

                        {isBuyNow && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-[13px] text-blue-700 flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                                <span>
                                    You're purchasing this item directly. Your existing cart will remain unchanged.
                                </span>
                            </div>
                        )}

                        {loading ? (
                            <div className="glass-panel rounded-xl p-10 text-center text-on-surface-variant">
                                Loading…
                            </div>
                        ) : displayItems.length === 0 ? (
                            <div className="glass-panel rounded-xl p-10 text-center flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">shopping_cart</span>
                                <p className="text-on-surface-variant font-body-md">Your cart is empty.</p>
                                <a href="/collections" className="btn-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-sm">
                                    Continue Shopping
                                </a>
                            </div>
                        ) : (
                            displayItems.map((item) => (
                                <div
                                    key={item.prodId}
                                    className="glass-panel rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
                                >
                                    <div className="w-28 h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                                        {item.prodImage ? (
                                            <img className="w-full h-full object-cover" src={item.prodImage} alt={item.prodName} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                                                <span className="material-symbols-outlined text-[36px]">image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col gap-2 w-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-title-md text-title-md text-on-surface">
                                                {item.prodName ?? 'Product'}
                                            </h3>
                                            <span className="font-title-md text-title-md text-on-surface shrink-0">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-on-surface-variant">
                                            ₹{item.price.toFixed(2)} each
                                        </p>

                                        {/* Qty controls — hidden in Buy Now mode */}
                                        {!isBuyNow && (
                                            <div className="flex items-center gap-4 mt-auto pt-4">
                                                <div className="flex items-center border border-outline-variant rounded-full bg-surface-container-lowest overflow-hidden">
                                                    <button
                                                        onClick={() => adjustQty(item.prodId, -1)}
                                                        disabled={updating === item.prodId}
                                                        className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-40"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">remove</span>
                                                    </button>
                                                    <span className="w-8 text-center font-label-md text-label-md select-none">
                                                        {updating === item.prodId ? '…' : item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => adjustQty(item.prodId, 1)}
                                                        disabled={updating === item.prodId}
                                                        className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-40"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.prodId)}
                                                    disabled={updating === item.prodId}
                                                    className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/20 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                                                    title="Remove item"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        )}

                                        {/* Qty label in Buy Now mode */}
                                        {isBuyNow && (
                                            <p className="text-[13px] text-on-surface-variant mt-2">
                                                Qty: {item.quantity}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Right: Order Summary ──────────────────────────── */}
                    <div className="w-full lg:w-1/3">
                        <div className="glass-panel rounded-xl p-6 sticky top-28 shadow-md">
                            <h2 className="font-title-md text-title-md text-on-surface mb-6 pb-4 border-b border-outline-variant/30">
                                Order Summary
                            </h2>
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30 mb-6">
                                <span className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Total</span>
                                <span className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Address Selector */}
                            <div className="mb-8 bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/30">
                                <h3 className="text-[13px] font-bold text-on-surface mb-3 uppercase tracking-wide">Shipping Address</h3>
                                {addressStatus === 'loading' ? (
                                    <p className="text-[13px] text-on-surface-variant">Loading addresses...</p>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-2">
                                        <p className="text-[13px] text-on-surface-variant mb-3">No saved addresses found.</p>
                                        <button
                                            onClick={() => navigate('/profile', { state: { tab: 'addresses' } })}
                                            className="btn-primary text-on-primary text-[12px] font-bold px-4 py-2 rounded-lg w-full"
                                        >
                                            Create New Address
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-white border border-outline-variant/50 rounded-lg px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                                        value={selectedAddress}
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                    >
                                        {addresses.map(addr => (
                                            <option key={addr._id} value={addr._id}>
                                                {addr.street}, {addr.city} - {addr.postalCode}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Payment Method Selector */}
                            <div className="mb-8 bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/30">
                                <h3 className="text-[13px] font-bold text-on-surface mb-3 uppercase tracking-wide">Payment Method</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="online" 
                                            checked={paymentMethod === 'online'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-primary focus:ring-primary accent-primary"
                                        />
                                        <span className="text-[14px] text-on-surface">Pay Online (Razorpay)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="cod" 
                                            checked={paymentMethod === 'cod'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-primary focus:ring-primary accent-primary"
                                        />
                                        <span className="text-[14px] text-on-surface">Cash on Delivery (COD)</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                id="checkout-proceed"
                                disabled={displayItems.length === 0 || (!selectedAddress && addresses.length > 0)}
                                onClick={handleCheckout}
                                className="w-full btn-primary text-on-primary py-4 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                            <div className="mt-6 text-center flex items-center justify-center gap-2 text-on-surface-variant font-caption text-caption opacity-70">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Secure Checkout Process
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
