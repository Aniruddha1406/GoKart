const fs = require('fs');
const path = require('path');

// 1. Update index.html colors
const newColors = {
    "tertiary": "#D4A74B",
    "surface-tint": "#8A6BBF",
    "on-primary-fixed": "#2B1751",
    "primary-fixed-dim": "#D0BCFF",
    "on-tertiary-container": "#422F00",
    "surface-dim": "#F3F4F6",
    "surface-container": "#F3F4F6",
    "on-secondary": "#ffffff",
    "on-error-container": "#410002",
    "secondary-fixed": "#E8DEF8",
    "primary": "#8A6BBF",
    "on-secondary-fixed": "#1D192B",
    "tertiary-fixed-dim": "#EFB8C8",
    "secondary-fixed-dim": "#CCC2DC",
    "on-tertiary-fixed-variant": "#31111D",
    "secondary-container": "#F3F4F6",
    "surface-container-lowest": "#FFFFFF",
    "on-tertiary": "#FFFFFF",
    "tertiary-container": "#FEF3C7",
    "surface-container-low": "#F9FAFB",
    "error-container": "#F9DEDC",
    "background": "#FFFFFF",
    "primary-fixed": "#EADDFF",
    "outline": "#9CA3AF",
    "on-primary": "#FFFFFF",
    "on-surface": "#111827",
    "inverse-surface": "#1F2937",
    "on-tertiary-fixed": "#31111D",
    "primary-container": "#F3F4F6",
    "on-secondary-fixed-variant": "#4A4458",
    "tertiary-fixed": "#FFD8E4",
    "inverse-primary": "#D0BCFF",
    "on-primary-fixed-variant": "#4F378B",
    "surface-container-high": "#E5E7EB",
    "on-surface-variant": "#4B5563",
    "on-error": "#FFFFFF",
    "surface-container-highest": "#D1D5DB",
    "on-secondary-container": "#111827",
    "inverse-on-surface": "#F9FAFB",
    "secondary": "#6B7280",
    "error": "#B3261E",
    "on-background": "#111827",
    "on-primary-container": "#111827",
    "surface-bright": "#FFFFFF",
    "outline-variant": "#D1D5DB",
    "surface": "#FFFFFF",
    "surface-variant": "#F3F4F6"
};

let html = fs.readFileSync('index.html', 'utf8');
const colorsRegex = /"colors":\s*\{[\s\S]*?\}(?=\s*,\s*"borderRadius")/i;
html = html.replace(colorsRegex, '"colors": ' + JSON.stringify(newColors, null, 8));
// Ensure html tag has class="light" just in case
html = html.replace(/<html[^>]*>/i, '<html lang="en" class="light">');
fs.writeFileSync('index.html', html);

// 2. Strip dark classes from all JSX files
const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir);

files.forEach(file => {
    if (file.endsWith('.jsx')) {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove dark: classes
        content = content.replace(/\bdark:[^\s"']+/g, '');
        // Clean up multiple spaces
        content = content.replace(/\s{2,}/g, ' ');
        // Ensure background is bg-white
        content = content.replace(/className="bg-background/, 'className="bg-white');

        fs.writeFileSync(filePath, content);
    }
});

console.log('Successfully enforced pure light mode and white backgrounds.');
