import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';
import Footer from '../components/Footer';

const API_PRODUCT = `${import.meta.env.VITE_API_URL}/api/product/products`;
const API_CART    = `${import.meta.env.VITE_API_URL}/api/order/cart`;

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

/* ── Star display ─────────────────────────────────────── */
function Stars({ rating, size = 'text-[14px]' }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
                <span key={s} className={`material-symbols-outlined ${size} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
                    style={{ fontVariationSettings: s <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                </span>
            ))}
        </div>
    );
}

/* ── AI Summary card ─────────────────────────────────── */
function AISummaryCard({ summary, loading }) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 animate-pulse">
                <div className="h-4 bg-outline-variant/20 rounded w-1/3 mb-3" />
                <div className="h-3 bg-outline-variant/20 rounded mb-2" />
                <div className="h-3 bg-outline-variant/20 rounded w-3/4" />
            </div>
        );
    }
    if (!summary) return null;
    return (
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface">summarize</span>
                <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface">Review Summary</span>
            </div>
            <p className="text-[14px] leading-relaxed text-on-surface-variant">{summary}</p>
        </div>
    );
}

/* ── Review card ─────────────────────────────────────── */
function ReviewCard({ review, onDelete, currentUserId }) {
    const isOwn = String(review.userId) === String(currentUserId);
    return (
        <div className="border border-outline-variant/40 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="text-[13px] font-semibold text-on-surface">{review.username}</p>
                    <Stars rating={review.rating} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-on-surface-variant">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                    {isOwn && (
                        <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors" title="Delete your review">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    )}
                </div>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">{review.comment}</p>
        </div>
    );
}

/* ── Review form ─────────────────────────────────────── */
function ReviewForm({ productId, onSuccess }) {
    const [rating, setRating]   = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover]     = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg]         = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setLoading(true);
        try {
            await axios.post(
                `${API_PRODUCT}/${productId}/reviews`,
                { rating, comment },
                { headers: authHeaders() }
            );
            setMsg('Review submitted! AI summary updating in background…');
            setComment('');
            setRating(5);
            setTimeout(() => { setMsg(''); onSuccess(); }, 1800);
        } catch (err) {
            setMsg(err?.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border border-outline-variant/40 rounded-xl p-5 bg-surface-container-low/40">
            <h3 className="text-[14px] font-bold text-on-surface mb-4">Write a Review</h3>
            {/* Star picker */}
            <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(s)}
                        className="focus:outline-none">
                        <span className="material-symbols-outlined text-[24px] transition-colors"
                            style={{
                                color: s <= (hover || rating) ? '#f59e0b' : '#e5e7eb',
                                fontVariationSettings: s <= (hover || rating) ? "'FILL' 1" : "'FILL' 0"
                            }}>star</span>
                    </button>
                ))}
                <span className="text-[12px] text-on-surface-variant ml-2">{rating}/5</span>
            </div>
            {/* Comment */}
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this product…"
                rows={3}
                className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/40 resize-none mb-3"
            />
            {msg && (
                <p className={`text-[12px] mb-3 ${msg.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>
            )}
            <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="btn-primary text-on-primary px-6 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
}

/* ── Main page ───────────────────────────────────────── */
export default function ProductDetails() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productId = searchParams.get('id');

    const [product, setProduct]         = useState(null);
    const [loading, setLoading]         = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartMsg, setCartMsg]         = useState('');

    // Reviews state
    const [reviews, setReviews]           = useState([]);
    const [avgRating, setAvgRating]       = useState(null);
    const [aiSummary, setAiSummary]       = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Current user id from token
    const currentUserId = (() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch { return null; }
    })();

    useEffect(() => {
        if (!productId) { setLoading(false); return; }
        const token = localStorage.getItem('token');
        if (!token) {
            navigate(`/auth?redirect=/product?id=${productId}`);
            return;
        }
        axios
            .get(`${API_PRODUCT}/${productId}`, { headers: authHeaders() })
            .then(res => setProduct(res.data))
            .catch(err => {
                const status = err.response?.status;
                if (status === 401 || status === 403) navigate('/auth');
                else console.error('Failed to fetch product:', err);
            })
            .finally(() => setLoading(false));
    }, [productId, navigate]);

    const fetchReviews = useCallback(async () => {
        if (!productId) return;
        setReviewsLoading(true);
        try {
            const res = await axios.get(`${API_PRODUCT}/${productId}/reviews`, { headers: authHeaders() });
            setReviews(res.data.reviews);
            setAvgRating(res.data.avgRating);
            setAiSummary(res.data.aiSummary);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDeleteReview = async () => {
        try {
            await axios.delete(`${API_PRODUCT}/${productId}/reviews`, { headers: authHeaders() });
            fetchReviews();
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to delete review');
        }
    };

    /* ── Add to Cart ─────────────────────────────────── */
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/auth'); return; }
        setCartLoading(true);
        setCartMsg('');
        try {
            await axios.post(API_CART, { productId: product._id, quantity: 1 }, { headers: authHeaders() });
            setCartMsg('Added to cart!');
            setTimeout(() => setCartMsg(''), 2500);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            setCartMsg('Failed to add. Try again.');
        } finally {
            setCartLoading(false);
        }
    };

    /* ── Buy Now ─────────────────────────────────────── */
    const handleBuyNow = () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/auth'); return; }
        navigate('/checkout', {
            state: {
                buyNow: true,
                buyNowItem: {
                    prodId: product._id, prodName: product.name,
                    prodImage: product.images, price: product.price, quantity: 1,
                },
            },
        });
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <span className="text-on-surface-variant font-body-md">Loading product…</span>
            </div>
        );
    }
    if (!product) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <span className="text-on-surface-variant font-body-md">Product not found.</span>
            </div>
        );
    }

    return (
        <div className="bg-white text-on-background font-body-md min-h-screen flex flex-col">
            <TopNavBar />
            <main className="flex-grow pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">

                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-on-surface-variant mb-8 font-caption text-caption">
                    <a className="hover:text-primary transition-colors" href="/">Home</a>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <a className="hover:text-primary transition-colors" href="/collections">Shop</a>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-on-surface font-semibold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

                    {/* ── Main Image ───────────────────────────────────── */}
                    <div className="lg:col-span-7">
                        <div className="w-full rounded-2xl overflow-hidden bg-surface-container-low aspect-square relative glass-panel flex items-center justify-center">
                            {product.images ? (
                                <img className="w-full h-full object-cover" src={product.images} alt={product.name} />
                            ) : (
                                <span className="material-symbols-outlined text-[72px] text-on-surface-variant/30">image</span>
                            )}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full font-caption text-caption text-primary border border-white/50 shadow-sm inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">new_releases</span>
                                    New Arrival
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Product Info ─────────────────────────────────── */}
                    <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0 lg:pl-8">

                        {/* Title + Price */}
                        <div className="mb-6">
                            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2 tracking-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-display-sm text-display-sm text-primary">
                                    ₹{Number(product.price).toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="font-label-md text-label-md text-on-surface">
                                        {avgRating ?? '—'}
                                    </span>
                                    <span className="font-caption text-caption text-on-surface-variant ml-1">({reviews.length} Reviews)</span>
                                </div>
                            </div>
                            {product.description && (
                                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        {/* Category pill */}
                        {product.category && (
                            <div className="mb-6">
                                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-caption text-caption uppercase tracking-wider">
                                    {product.category}
                                </span>
                            </div>
                        )}



                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            {cartMsg && (
                                <div className={`text-center text-sm font-medium py-2 px-4 rounded-lg ${cartMsg.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                    {cartMsg}
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartLoading}
                                    className="flex-grow btn-primary text-on-primary rounded-xl font-label-md text-label-md py-4 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                    {cartLoading ? 'Adding…' : 'Add to Cart'}
                                </button>
                            </div>
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-4 rounded-xl glass-btn text-on-surface font-label-md text-label-md hover:bg-surface-variant/50 transition-colors font-semibold"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* ── Reviews Section ──────────────────────────────────── */}
                        <div className="mt-16">
                            <h2 className="text-[20px] font-bold text-on-surface mb-6">Customer Reviews</h2>

                            {/* AI Summary */}
                            <div className="mb-6">
                                <AISummaryCard summary={aiSummary} loading={reviewsLoading && !aiSummary} />
                            </div>

                            {/* Review form */}
                            <div className="mb-8">
                                <ReviewForm productId={productId} onSuccess={fetchReviews} />
                            </div>

                            {/* Reviews list */}
                            {reviewsLoading && reviews.length === 0 ? (
                                <div className="text-center py-8 text-on-surface-variant text-[14px]">Loading reviews…</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-outline-variant/50 rounded-xl">
                                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 block mb-2">rate_review</span>
                                    <p className="text-[14px] text-on-surface-variant">No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {reviews.map(review => (
                                        <ReviewCard
                                            key={review._id}
                                            review={review}
                                            currentUserId={currentUserId}
                                            onDelete={handleDeleteReview}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
