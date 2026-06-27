const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^>]*><\/script>/i, '');
html = html.replace(/<script id="tailwind-config">[\s\S]*?<\/script>/i, '');
html = html.replace(/<style>[\s\S]*?<\/style>/i, '');
fs.writeFileSync('index.html', html);
console.log('Cleaned index.html');
