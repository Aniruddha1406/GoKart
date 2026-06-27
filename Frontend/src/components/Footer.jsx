import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full pt-section-gap pb-12 bg-surface-container-lowest border-t border-outline-variant/30">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-1 group">
                    <span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">shopping_cart</span>
                    <div className="font-headline-lg text-headline-lg font-bold text-on-surface">GoKart</div>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Privacy Policy</a>
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Contact Us</a>
                </div>
            </div>
        </footer>
    );
}
