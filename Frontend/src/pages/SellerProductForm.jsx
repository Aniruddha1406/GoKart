import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SellerLayout from './SellerLayout';

export default function SellerProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Tech',
        description: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchProductData();
        }
    }, [id]);

    const fetchProductData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/seller/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const p = response.data;
            setFormData({
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description || '',
            });
            if (p.images) {
                setImagePreview(p.images);
            }
        } catch (err) {
            console.error("Failed to fetch product", err);
            setError("Failed to load product data.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('description', formData.description);
            if (imageFile) {
                data.append('images', imageFile);
            }

            if (isEditMode) {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/product/seller/products/${id}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                if (!imageFile) {
                    setError("Please select an image for the new product.");
                    setLoading(false);
                    return;
                }
                await axios.post(`${import.meta.env.VITE_API_URL}/api/product/seller/products`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            navigate('/seller-dashboard/inventory');
        } catch (err) {
            console.error("Failed to save product", err);
            setError(err.response?.data?.message || "An error occurred while saving the product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SellerLayout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate('/seller-dashboard/inventory')}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container/50 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="font-display-md text-[28px] font-bold text-on-surface tracking-tight leading-none mb-1">
                            {isEditMode ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="font-body-md text-[14px] text-on-surface-variant">
                            {isEditMode ? 'Update your product details and pricing.' : 'Fill out the details to list a new product in your store.'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-error/10 text-error p-4 rounded-xl mb-6 font-label-md flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* Image Upload Area */}
                        <div>
                            <label className="block font-label-md text-[14px] font-bold text-on-surface mb-2">Product Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-outline-variant/30 border-dashed rounded-xl hover:bg-surface-container-low/50 transition-colors">
                                <div className="space-y-2 text-center">
                                    {imagePreview ? (
                                        <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden border border-outline-variant/20 group">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/50 hover:bg-white/20 transition-colors">
                                                    Change Image
                                                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mx-auto h-12 w-12 text-outline-variant mb-4 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[40px]">image</span>
                                            </div>
                                            <div className="flex text-sm text-on-surface-variant justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-on-surface-variant">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Text Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block font-label-md text-[14px] font-bold text-on-surface mb-2">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface placeholder:text-outline"
                                    placeholder="e.g. Minimalist Watch"
                                />
                            </div>

                            <div>
                                <label className="block font-label-md text-[14px] font-bold text-on-surface mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface placeholder:text-outline"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block font-label-md text-[14px] font-bold text-on-surface mb-2">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface appearance-none"
                                    >
                                        <option value="Tech">Tech</option>
                                        <option value="Food">Food</option>
                                        <option value="Clothing">Clothing</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block font-label-md text-[14px] font-bold text-on-surface mb-2">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface placeholder:text-outline resize-y"
                                    placeholder="Describe the product features, materials, and benefits..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-outline-variant/20 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/seller-dashboard/inventory')}
                                className="px-6 py-2.5 rounded-lg text-on-surface-variant font-label-md font-bold hover:bg-surface-container-low transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
