import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';
import Footer from '../components/Footer';

const CATEGORIES = ['Tech', 'Food', 'Clothing'];

export default function Collections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('auth_required');
                    return;
                }
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/products`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAllProducts(res.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                if (err.response && err.response.status === 401) {
                    setError('auth_required');
                } else {
                    setError('Failed to load products. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = (activeCategory === 'All'
        ? allProducts
        : allProducts.filter(p => p.category === activeCategory)
    );

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        if (cat === 'All') setSearchParams({});
        else setSearchParams({ category: cat });
    };

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/order/cart`,
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Failed to add to cart:', err);
        }
    };

    return (
        <div className="bg-white text-on-background font-body-md min-h-screen flex flex-col">
            <TopNavBar />
            <main className="flex-grow pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-gutter">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-56 flex-shrink-0 mb-8 md:mb-0">
                    <div className="glass-panel rounded-xl p-6 sticky top-28">
                        <h2 className="font-title-md text-title-md text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Filters</h2>

                        {/* Category */}
                        <div className="mb-6">
                            <h3 className="font-label-md text-label-md text-on-surface mb-3">Category</h3>
                            <div className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                                {['All', ...CATEGORIES].map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={activeCategory === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                            className="accent-primary"
                                        />
                                        <span className={`group-hover:text-primary transition-colors ${activeCategory === cat ? 'text-primary font-medium' : ''}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                
                    </div>
                </aside>

                {/* Product Area */}
                <div className="flex-grow flex flex-col">
                    {/* Header & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6 gap-4">
                        <div>
                            <h1 className="font-display-sm text-display-sm md:font-display-lg md:text-display-lg text-on-surface">Collections</h1>
                            {!loading && (
                                <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
                                    {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                                    {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {['All', ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-1.5 rounded-full font-label-md text-[13px] font-medium transition-all border ${
                                    activeCategory === cat
                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-surface-container-low text-on-surface border-outline-variant/20 hover:border-primary/50 hover:text-primary'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {error === 'auth_required' ? (
                        <div className="bg-surface-container-low/50 border border-outline-variant/20 p-12 rounded-2xl flex flex-col items-center justify-center text-center my-10">
                            <span className="material-symbols-outlined text-[48px] text-primary mb-4">lock</span>
                            <h3 className="font-display-sm text-[24px] font-bold text-on-surface mb-2">Please login to view products.</h3>
                            <p className="font-body-md text-on-surface-variant mb-6">You need an account to browse our catalog.</p>
                            <button onClick={() => navigate('/auth')} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md hover:bg-primary/90 transition-colors shadow-sm">
                                Login
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-error/10 text-error p-4 rounded-xl mb-6 flex items-center gap-3 font-label-md">
                                    <span className="material-symbols-outlined">error</span> {error}
                                </div>
                            )}

                            {/* Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                                            <div className="aspect-[3/4] bg-surface-container-low rounded-xl mb-4" />
                                            <div className="h-3 bg-surface-container-low rounded w-1/3 mb-2" />
                                            <div className="h-4 bg-surface-container-low rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-20 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[56px] block mb-3 text-outline-variant">inventory_2</span>
                                    <p className="font-title-md text-[18px]">No products found{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filtered.map(product => (
                                        <div
                                            key={product._id}
                                            className="group product-card relative flex flex-col hover-lift cursor-pointer"
                                            onClick={() => navigate(`/product?id=${product._id}`)}
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low mb-4">
                                                {product.images ? (
                                                    <img
                                                        className="w-full h-full object-cover product-image-zoom"
                                                        src={product.images}
                                                        alt={product.name}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[64px] text-outline-variant">image</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleAddToCart(product._id); }}
                                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 glass-panel px-6 py-2 rounded-full font-label-md text-label-md text-on-surface hover:bg-white hover:text-primary"
                                                >
                                                    Quick Add
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-caption text-caption text-on-surface-variant mb-1 uppercase tracking-wider">{product.category}</p>
                                                    <h3 className="font-title-md text-title-md text-on-surface">{product.name}</h3>
                                                </div>
                                                <span className="font-body-md text-body-md text-primary font-medium">₹{Number(product.price).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
