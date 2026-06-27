import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SellerLayout from './SellerLayout';

export default function SellerInventory() {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(null);

    // Derived: filter client-side so no extra API call needed
    const products = filter ? allProducts.filter(p => p.category === filter) : allProducts;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/seller/my-products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllProducts(response.data);  // always store the full list
            setError(null);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Failed to load inventory.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/product/seller/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Re-fetch products after successful delete
            fetchProducts();
        } catch (err) {
            console.error("Failed to delete product:", err);
            alert("Failed to delete product. Please try again.");
        }
    };

    return (
        <SellerLayout>
            {/* Page Header & Global Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="font-display-lg text-[32px] font-bold text-on-surface tracking-tight mb-2">Inventory Management</h2>
                    <p className="font-body-md text-[16px] text-on-surface-variant max-w-2xl">Manage your active product listings, update stock levels, and monitor catalog performance across all categories.</p>
                </div>
                <button 
                    onClick={() => navigate('/seller-dashboard/inventory/new')}
                    className="bg-primary text-on-primary font-body-md text-[14px] font-medium py-3 px-6 rounded-lg whitespace-nowrap hover:bg-primary/90 transition-colors flex items-center gap-2 h-fit self-start md:self-auto shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add New Product
                </button>
            </div>

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-xl mb-6 font-label-md flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* Contextual Filters & Category Chips */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mr-2">Filter By Category:</span>
                <button onClick={() => setFilter("Tech")} className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 text-on-surface font-label-sm text-[12px] font-medium py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">devices</span>
                    Tech
                </button>
                <button onClick={() => setFilter("Food")} className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 text-on-surface font-label-sm text-[12px] font-medium py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">restaurant</span>
                    Food
                </button>
                <button onClick={() => setFilter("Clothing")} className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 text-on-surface font-label-sm text-[12px] font-medium py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">apparel</span>
                    Clothing
                </button>
                <div className="w-[1px] h-6 bg-outline-variant/20 mx-2"></div>
                <button onClick={()=> {setFilter(null)}} className="text-primary font-label-sm text-[12px] font-bold hover:underline transition-all">Clear Filters</button>
            </div>

            {/* Glassmorphism Data Table Container */}
            <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl overflow-hidden w-full shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-outline-variant/20 bg-surface-container-lowest/50">
                                <th className="font-label-sm text-[12px] text-on-surface-variant font-bold py-4 px-6 w-24">Image</th>
                                <th className="font-label-sm text-[12px] text-on-surface-variant font-bold py-4 px-6">Product Name</th>
                                <th className="font-label-sm text-[12px] text-on-surface-variant font-bold py-4 px-6">Category</th>
                                <th className="font-label-sm text-[12px] text-on-surface-variant font-bold py-4 px-6">Price</th>
                                <th className="font-label-sm text-[12px] text-on-surface-variant font-bold py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-[14px] text-on-surface">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                                        You have no active products. Click "Add New Product" to get started!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors group">
                                        <td className="py-4 px-6 align-middle">
                                            <div className="w-14 h-14 rounded-lg bg-white border border-outline-variant/10 overflow-hidden flex items-center justify-center p-1">
                                                {product.images ? (
                                                    <img alt={product.name} className="max-w-full max-h-full object-contain" src={product.images} />
                                                ) : (
                                                    <span className="material-symbols-outlined text-outline-variant">image</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-middle font-medium">{product.name}</td>
                                        <td className="py-4 px-6 align-middle text-on-surface-variant">{product.category}</td>
                                        <td className="py-4 px-6 align-middle">₹{Number(product.price).toFixed(2)}</td>
                                        <td className="py-4 px-6 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/seller-dashboard/inventory/edit/${product._id}`)}
                                                    className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors" title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination Minimalist */}
                {!loading && products.length > 0 && (
                    <div className="border-t border-outline-variant/10 bg-surface-container/20 p-4 flex items-center justify-between">
                        <p className="font-label-sm text-[12px] text-on-surface-variant font-medium">Showing {products.length} products</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-50 font-label-sm text-[12px] font-bold" disabled>Previous</button>
                            <button className="px-3 py-1.5 rounded text-on-surface border border-outline-variant/20 hover:bg-surface-container transition-colors font-label-sm text-[12px] font-bold bg-white" disabled>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
