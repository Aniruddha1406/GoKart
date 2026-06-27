const fs = require('fs');
const path = require('path');

const pagesDir = path.join('src', 'pages');
const pages = ['Home.jsx', 'Collections.jsx', 'ProductDetails.jsx', 'Checkout.jsx'];

pages.forEach(page => {
    let content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
    
    // Add imports
    if (!content.includes('TopNavBar')) {
        content = content.replace(/import React[^;]*;/, "import React from 'react';\nimport TopNavBar from '../components/TopNavBar';\nimport Footer from '../components/Footer';");
    }

    // Replace nav/header
    content = content.replace(/<(nav|header) className="fixed top-0[\s\S]*?<\/\1>/, '<TopNavBar />');
    
    // Replace footer
    content = content.replace(/<footer[\s\S]*?<\/footer>/, '<Footer />');

    fs.writeFileSync(path.join(pagesDir, page), content);
});

console.log('Pages refactored successfully.');
