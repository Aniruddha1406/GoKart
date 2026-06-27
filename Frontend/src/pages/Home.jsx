import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';

/* ─── helpers ─────────────────────────────────────────────── */
function SectionHeading({ eyebrow, title, subtitle, align = 'left' }) {
    const textAlign = align === 'center' ? 'text-center' : 'text-left';
    const mx = align === 'center' ? 'mx-auto' : '';
    return (
        <div className={`space-y-3 ${textAlign}`}>
            {eyebrow && <span className="section-label">{eyebrow}</span>}
            <h2 className={`font-display-sm text-display-sm tracking-tight text-on-surface ${mx} ${align === 'center' ? 'inline-block' : ''}`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-xl ${mx}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

function ProductCard({ product }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/product?id=${product._id}`)}
            className="group product-card rounded-3xl overflow-hidden glass-panel border border-outline-variant/30 shadow-sm cursor-pointer"
        >
            <div className="aspect-[4/5] overflow-hidden bg-surface-container">
                {product.images ? (
                    <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={product.name}
                        src={product.images}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[64px] text-outline-variant">image</span>
                    </div>
                )}
            </div>
            <div className="p-5 space-y-1">
                <p className="font-caption text-caption text-on-surface-variant uppercase tracking-widest">{product.category}</p>
                <h4 className="font-title-md text-title-md text-on-surface leading-snug">{product.name}</h4>
                <div className="pt-3 flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">₹{Number(product.price).toFixed(2)}</span>
                    <button className="font-label-md text-label-md text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                        Shop
                        <span className="material-symbols-outlined text-[15px] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function CategorySection({ eyebrow, title, desc, products, category }) {
    if (products.length === 0) return null;
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-2">
                    <span className="section-label">{eyebrow}</span>
                    <h3 className="font-display-sm text-[28px] leading-[34px] font-bold tracking-tight text-on-surface">{title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{desc}</p>
                </div>
                <Link
                    to={`/collections?category=${category}`}
                    className="nav-link font-label-md text-label-md text-primary hover:text-primary/80 shrink-0 flex items-center gap-1"
                >
                    View all
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
        </div>
    );
}

const CATEGORY_META = {
    Tech:     { eyebrow: 'Tech',     title: 'Gear Up',          desc: 'Cutting-edge gadgets and electronics for the modern lifestyle.' },
    Food:     { eyebrow: 'Food',     title: 'Taste the Best',   desc: 'Artisan food products and gourmet essentials, delivered fresh.' },
    Clothing: { eyebrow: 'Clothing', title: 'Style Defined',    desc: 'Explore our wide selection of everyday essentials and trendy styles.' },
};

/* ─── page ─────────────────────────────────────────────────── */
export default function Home() {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/products`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAllProducts(res.data);
            } catch (err) {
                console.error('Home: failed to fetch products', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const byCategory = (cat) => allProducts.filter(p => p.category === cat);

    return (
        <div className="bg-white text-on-background font-body-md min-h-screen flex flex-col">
            <TopNavBar />
            <main className="flex-grow">
                {!isLoggedIn ? (
                    <div className="flex justify-center items-center h-[70vh]">
                        <div className="bg-surface-container-low/50 border border-outline-variant/20 p-12 rounded-2xl flex flex-col items-center justify-center text-center my-10 max-w-md">
                            <span className="material-symbols-outlined text-[48px] text-primary mb-4">lock</span>
                            <h3 className="font-display-sm text-[24px] font-bold text-on-surface mb-2">Please login to view Home.</h3>
                            <p className="font-body-md text-on-surface-variant mb-6">You need an account to browse our catalog.</p>
                            <button onClick={() => navigate('/auth')} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md hover:bg-primary/90 transition-colors shadow-sm">
                                Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Hero ──────────────────────────────────── */}
                <section className="pt-[96px] px-margin-mobile md:px-margin-desktop bg-white border-b border-outline-variant/15">
                    <div className="max-w-container-max mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[480px]">

                            {/* Left — headline */}
                            <div className="flex flex-col justify-center py-16 pr-0 lg:pr-16 border-r-0 lg:border-r border-outline-variant/15">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">GoKart — Your Global Marketplace</p>
                                <h1 className="text-[52px] sm:text-[64px] md:text-[72px] leading-[1.02] tracking-[-0.03em] font-black text-on-surface">
                                    The brands<br />
                                    you trust.<br />
                                    All in one <span className="text-primary">place.</span>
                                </h1>
                            </div>

                            {/* Right — tagline + CTA + stats */}
                            <div className="flex flex-col justify-center py-16 pl-0 lg:pl-16">
                                <div className="mx-auto flex flex-col items-center text-center">
                                    <p className="text-[17px] leading-relaxed text-on-surface-variant max-w-sm mb-8 font-normal">
                                        Find tech, food, and clothing from top sellers with fast shipping and easy returns.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                                        <Link
                                            to="/collections"
                                            className="btn-primary text-on-primary px-7 py-3 rounded-lg font-semibold text-[14px] flex items-center gap-2"
                                        >
                                            Shop now
                                            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                                        </Link>
                                        <Link
                                            to="/auth?role=seller"
                                            className="px-7 py-3 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-[14px] hover:bg-surface-container-low transition-colors"
                                        >
                                            Sell on GoKart
                                        </Link>
                                    </div>
                                </div>
                                {/* Trust stats */}
                                <div className="flex items-center justify-center gap-8 pt-8 border-t border-outline-variant/20 w-full">
                                    <div className="text-center">
                                        <p className="text-[22px] font-black text-on-surface tracking-tight">3 categories</p>
                                        <p className="text-[12px] text-on-surface-variant mt-0.5">Tech, Food & Clothing</p>
                                    </div>
                                    <div className="w-px h-8 bg-outline-variant/30" />
                                    <div className="text-center">
                                        <p className="text-[22px] font-black text-on-surface tracking-tight">100% verified</p>
                                        <p className="text-[12px] text-on-surface-variant mt-0.5">Seller products</p>
                                    </div>
                                    <div className="w-px h-8 bg-outline-variant/30" />
                                    <div className="text-center">
                                        <p className="text-[22px] font-black text-on-surface tracking-tight">Fast delivery</p>
                                        <p className="text-[12px] text-on-surface-variant mt-0.5">Across India</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent" />

                {/* ── Featured heading ─────────────────────── */}
                <section className="pt-24 pb-4 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <SectionHeading
                        align="center"
                        title="Featured Products"
                        subtitle="Explore our newest arrivals across Tech, Food, and Clothing."
                    />
                </section>

                {/* ── Category Sections ─────────────────────── */}
                <section className="pt-16 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-20">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse rounded-3xl overflow-hidden glass-panel border border-outline-variant/30">
                                    <div className="aspect-[4/5] bg-surface-container-low" />
                                    <div className="p-5 space-y-2">
                                        <div className="h-2 bg-surface-container-low rounded w-1/3" />
                                        <div className="h-4 bg-surface-container-low rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <CategorySection
                                category="Tech"
                                eyebrow={CATEGORY_META.Tech.eyebrow}
                                title={CATEGORY_META.Tech.title}
                                desc={CATEGORY_META.Tech.desc}
                                products={byCategory('Tech')}
                            />
                            {byCategory('Tech').length > 0 && <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />}

                            <CategorySection
                                category="Food"
                                eyebrow={CATEGORY_META.Food.eyebrow}
                                title={CATEGORY_META.Food.title}
                                desc={CATEGORY_META.Food.desc}
                                products={byCategory('Food')}
                            />
                            {byCategory('Food').length > 0 && <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />}

                            <CategorySection
                                category="Clothing"
                                eyebrow={CATEGORY_META.Clothing.eyebrow}
                                title={CATEGORY_META.Clothing.title}
                                desc={CATEGORY_META.Clothing.desc}
                                products={byCategory('Clothing')}
                            />

                            {allProducts.length === 0 && (
                                <div className="text-center py-12 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[56px] block mb-3 text-outline-variant">
                                        {isLoggedIn ? 'inventory_2' : 'lock'}
                                    </span>
                                    <p className="font-title-md text-[18px]">
                                        {isLoggedIn ? 'No products available yet.' : 'Please login to view products.'}
                                    </p>
                                    <p className="font-body-md text-[14px] mt-1">
                                        {isLoggedIn ? 'Sellers will start listing soon!' : 'Sign in to explore the global marketplace.'}
                                    </p>
                                    {!isLoggedIn && (
                                        <Link to="/auth?role=buyer" className="mt-6 inline-block btn-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold text-[14px]">
                                            Login
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ── Bottom CTA banner ─────────────────────── */}
                <section className="mx-margin-mobile md:mx-margin-desktop mb-24 rounded-3xl overflow-hidden relative">
                    <div className="bg-gradient-to-br from-[#8A6BBF] via-[#7055a8] to-[#4F378B] px-12 py-16 text-center space-y-6">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                            }}
                        />
                        <div className="relative z-10 space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 font-caption text-caption text-white/90 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[13px]">sell</span>
                                Become a Seller
                            </span>
                            <h2 className="font-display-sm text-display-sm text-white tracking-tight">
                                Start Selling on GoKart
                            </h2>
                            <p className="font-body-lg text-body-lg text-white/75 max-w-lg mx-auto leading-relaxed">
                                Join thousands of artisans and brands reaching customers who appreciate quality. Your storefront is one click away.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                                <Link
                                    to="/auth?role=seller"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-primary font-label-md text-label-md shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-200"
                                >
                                    Open your store
                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                </Link>
                                <Link
                                    to="/collections"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/40 text-white font-label-md text-label-md hover:bg-white/10 transition-all duration-200"
                                >
                                    Learn more
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                    </>
                )}
            </main>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="w-full pt-12 pb-10 bg-surface-container-lowest border-t border-outline-variant/30">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-1 group">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">shopping_cart</span>
                                <div className="font-display-sm text-[28px] font-bold text-primary tracking-[-0.03em]">GoKart</div>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
                                Tech, food &amp; clothing — all in one place.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-16 gap-y-6">
                            <div className="space-y-3">
                                <p className="font-label-md text-label-md text-on-surface">Shop</p>
                                {['Tech', 'Food', 'Clothing'].map((l) => (
                                    <p key={l}>
                                        <Link to={`/collections?category=${l}`} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">{l}</Link>
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <p className="font-label-md text-label-md text-on-surface">Support</p>
                                {['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Contact Us'].map((l) => (
                                    <p key={l}><a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">{l}</a></p>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </footer>
        </div>
    );
}
