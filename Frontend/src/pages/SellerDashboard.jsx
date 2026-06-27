import React, { useState, useEffect } from 'react';
import SellerLayout from './SellerLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/seller/my-products`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Seller Dashboard Data:', response.data);
                setIsChecking(false);
            } catch (error) {
                console.error('Failed to fetch seller dashboard:', error);
                if (error.response && error.response.status === 401) {
                    alert("Please create or log in using a seller account to view the seller's portal.");
                    navigate("/auth"); // redirect to login
                }
                else if (error.response && error.response.status === 403) {
                    alert("You do not have permission to access the seller's portal.");
                    navigate("/auth"); 
                }
                else {
                    navigate("/");
                }
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (isChecking) {
        return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">Loading...</div>;
    }

    return (
        <SellerLayout>
            {/* Welcome Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back, Seller.</h2>
                    <p className="font-body-lg text-[18px] text-on-surface-variant">Here is a summary of your performance today.</p>
                </div>
                <button className="bg-primary text-on-primary font-label-sm text-[12px] font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 w-max">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Report
                </button>
            </div>

            {/* Stats Grid (Glassmorphic) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between h-40 shadow-sm relative overflow-hidden group hover:border-outline-variant/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Total Revenue</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">account_balance_wallet</span>
                    </div>
                    <div>
                        <div className="font-display-lg text-[40px] font-bold text-on-surface leading-none">$48,250</div>
                        <div className="flex items-center gap-1 text-primary mt-2">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                            <span className="font-body-md text-[14px] font-medium">+12% from last week</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between h-40 shadow-sm relative overflow-hidden group hover:border-outline-variant/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Active Orders</span>
                        <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">local_shipping</span>
                    </div>
                    <div>
                        <div className="font-display-lg text-[40px] font-bold text-on-surface leading-none">24</div>
                        <div className="flex items-center gap-1 text-on-surface-variant mt-2">
                            <span className="font-body-md text-[14px] font-medium">4 pending fulfillment</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between h-40 shadow-sm relative overflow-hidden group hover:border-outline-variant/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="font-label-sm text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Low Stock Alerts</span>
                        <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">warning</span>
                    </div>
                    <div>
                        <div className="font-display-lg text-[40px] font-bold text-on-surface leading-none">3</div>
                        <div className="flex items-center gap-1 text-error mt-2">
                            <span className="font-body-md text-[14px] font-medium">Requires immediate action</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Body: Chart & Table Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl p-8 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-title-md text-[20px] font-bold text-on-surface">Revenue Over Time</h3>
                        <span className="font-label-sm text-[12px] font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">Last 7 Days</span>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-2 h-64 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                            <div className="border-t border-outline-variant w-full h-0"></div>
                            <div className="border-t border-outline-variant w-full h-0"></div>
                            <div className="border-t border-outline-variant w-full h-0"></div>
                            <div className="border-t border-outline-variant w-full h-0"></div>
                        </div>
                        {/* Bars */}
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[40%] chart-bar-animate" style={{ animationDelay: '0.1s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Mon</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[65%] chart-bar-animate" style={{ animationDelay: '0.2s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Tue</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[45%] chart-bar-animate" style={{ animationDelay: '0.3s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Wed</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[80%] chart-bar-animate" style={{ animationDelay: '0.4s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Thu</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t-sm h-[95%] chart-bar-animate relative" style={{ animationDelay: '0.5s' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    ₹12,400
                                </div>
                            </div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface">Fri</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[60%] chart-bar-animate" style={{ animationDelay: '0.6s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Sat</span>
                        </div>
                        <div className="w-full flex flex-col items-center gap-2 z-10 group">
                            <div className="w-full bg-surface-container hover:bg-primary/20 transition-colors rounded-t-sm h-[50%] chart-bar-animate" style={{ animationDelay: '0.7s' }}></div>
                            <span className="font-label-sm text-[12px] font-bold text-on-surface-variant">Sun</span>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="lg:col-span-1 bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl p-8 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-md text-[20px] font-bold text-on-surface">Recent Orders</h3>
                        <button className="text-primary hover:text-primary/80 font-label-sm text-[12px] font-bold">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="font-label-sm text-[12px] font-bold text-on-surface-variant py-3 border-b border-outline-variant/20">Order ID</th>
                                    <th className="font-label-sm text-[12px] font-bold text-on-surface-variant py-3 border-b border-outline-variant/20">Status</th>
                                    <th className="font-label-sm text-[12px] font-bold text-on-surface-variant py-3 border-b border-outline-variant/20 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-[14px]">
                                <tr className="group hover:bg-surface-container/30 transition-colors">
                                    <td className="py-4 border-b border-outline-variant/10 text-on-surface">#LM-842</td>
                                    <td className="py-4 border-b border-outline-variant/10">
                                        <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wide">Delivered</span>
                                    </td>
                                    <td className="py-4 border-b border-outline-variant/10 text-right text-on-surface font-medium">₹1,240.00</td>
                                </tr>
                                <tr className="group hover:bg-surface-container/30 transition-colors">
                                    <td className="py-4 border-b border-outline-variant/10 text-on-surface">#LM-843</td>
                                    <td className="py-4 border-b border-outline-variant/10">
                                        <span className="inline-block px-2 py-1 rounded bg-tertiary/10 text-tertiary font-bold text-[10px] uppercase tracking-wide">Pending</span>
                                    </td>
                                    <td className="py-4 border-b border-outline-variant/10 text-right text-on-surface font-medium">₹850.50</td>
                                </tr>
                                <tr className="group hover:bg-surface-container/30 transition-colors">
                                    <td className="py-4 border-b border-outline-variant/10 text-on-surface">#LM-844</td>
                                    <td className="py-4 border-b border-outline-variant/10">
                                        <span className="inline-block px-2 py-1 rounded bg-secondary/10 text-secondary font-bold text-[10px] uppercase tracking-wide">Shipped</span>
                                    </td>
                                    <td className="py-4 border-b border-outline-variant/10 text-right text-on-surface font-medium">₹420.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
