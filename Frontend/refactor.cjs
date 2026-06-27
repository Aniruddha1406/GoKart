const fs = require('fs');
const path = require('path');

// 1. Create components folder
const componentsDir = path.join('src', 'components');
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

// 2. Create TopNavBar.jsx
const navBarCode = import React from 'react';
import { Link } from 'react-router-dom';

export default function TopNavBar() {
    return (
        <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-2xl border-b border-white/20 shadow-sm">
            <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div className="flex items-center gap-8">
                    <Link to="/" className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface ">AURA</Link>
                    <div className="hidden md:flex items-center gap-8 font-label-md text-label-md">
                        <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">Shop</Link>
                        <Link to="/collections" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">Collections</Link>
                        <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">New Arrivals</Link>
                        <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">About</Link>
                    </div>
                </div>
                <div className="flex items-center space-x-6 text-primary font-label-md text-label-md">
                    <button className="hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </button>
                    <button className="hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">
                        <span className="material-symbols-outlined text-[24px]">person</span>
                    </button>
                    <Link to="/checkout" className="hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200 relative text-primary">
                        <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                        <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};
fs.writeFileSync(path.join(componentsDir, 'TopNavBar.jsx'), navBarCode);

// 3. Create Footer.jsx
const footerCode = import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full pt-section-gap pb-12 bg-surface-container-lowest border-t border-outline-variant/30">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="font-headline-lg text-headline-lg font-bold text-on-surface">AURA</div>
                <div className="flex flex-wrap justify-center gap-6">
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Privacy Policy</a>
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Terms of Service</a>
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Shipping & Returns</a>
                    <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-70 transition-opacity" href="#">Contact Us</a>
                </div>
                <div className="font-caption text-caption text-primary "> © 2024 AURA Prismatic Precision. All rights reserved. </div>
            </div>
        </footer>
    );
};
fs.writeFileSync(path.join(componentsDir, 'Footer.jsx'), footerCode);

// 4. Update Pages
const pagesDir = path.join('src', 'pages');
const pages = ['Home.jsx', 'Collections.jsx', 'ProductDetails.jsx', 'Checkout.jsx'];

pages.forEach(page => {
    let content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
    
    // Add imports
    if (!content.includes('TopNavBar')) {
        content = content.replace(/import React.*?;/, "import React from 'react';\nimport TopNavBar from '../components/TopNavBar';\nimport Footer from '../components/Footer';");
    }

    // Replace nav/header
    content = content.replace(/<(nav|header) className="fixed top-0[\s\S]*?<\/\1>/, '<TopNavBar />');
    
    // Replace footer
    content = content.replace(/<footer[\s\S]*?<\/footer>/, '<Footer />');

    fs.writeFileSync(path.join(pagesDir, page), content);
});

// 5. Move scripts
const scriptsDir = path.join('scripts');
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir);
}
const filesToMove = ['convert.js', 'convert.cjs', 'clean-index.cjs', 'enforce-light-mode.cjs', 'replace-colors.cjs'];
filesToMove.forEach(file => {
    if (fs.existsSync(file)) {
        fs.renameSync(file, path.join(scriptsDir, file));
    }
});

console.log('Refactor complete!');
