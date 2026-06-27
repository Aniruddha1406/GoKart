const fs = require('fs');
const path = require('path');

const newColors = {
    "tertiary": "#D4A74B",
    "surface-tint": "#8A6BBF",
    "on-primary-fixed": "#2B1751",
    "primary-fixed-dim": "#D0BCFF",
    "on-tertiary-container": "#422F00",
    "surface-dim": "#DEDEDE",
    "surface-container": "#F3EDF7",
    "on-secondary": "#ffffff",
    "on-error-container": "#410002",
    "secondary-fixed": "#E8DEF8",
    "primary": "#8A6BBF",
    "on-secondary-fixed": "#1D192B",
    "tertiary-fixed-dim": "#EFB8C8",
    "secondary-fixed-dim": "#CCC2DC",
    "on-tertiary-fixed-variant": "#31111D",
    "secondary-container": "#E8DEF8",
    "surface-container-lowest": "#FFFFFF",
    "on-tertiary": "#FFFFFF",
    "tertiary-container": "#FFD8E4",
    "surface-container-low": "#F7F2FA",
    "error-container": "#F9DEDC",
    "background": "#FEFDFE",
    "primary-fixed": "#EADDFF",
    "outline": "#79747E",
    "on-primary": "#FFFFFF",
    "on-surface": "#1C1B1F",
    "inverse-surface": "#313033",
    "on-tertiary-fixed": "#31111D",
    "primary-container": "#EADDFF",
    "on-secondary-fixed-variant": "#4A4458",
    "tertiary-fixed": "#FFD8E4",
    "inverse-primary": "#D0BCFF",
    "on-primary-fixed-variant": "#4F378B",
    "surface-container-high": "#ECE6F0",
    "on-surface-variant": "#49454F",
    "on-error": "#FFFFFF",
    "surface-container-highest": "#E6E0E9",
    "on-secondary-container": "#1D192B",
    "inverse-on-surface": "#F4EFF4",
    "secondary": "#625B71",
    "error": "#B3261E",
    "on-background": "#1C1B1F",
    "on-primary-container": "#21005D",
    "surface-bright": "#FEFDFE",
    "outline-variant": "#CAC4D0",
    "surface": "#FEFDFE",
    "surface-variant": "#E7E0EC"
};

let html = fs.readFileSync('index.html', 'utf8');

// Replace the colors object inside tailwind.config
const colorsRegex = /"colors":\s*\{[\s\S]*?\}(?=\s*,\s*"borderRadius")/i;
html = html.replace(colorsRegex, '"colors": ' + JSON.stringify(newColors, null, 8));

// Also update the btn-primary gradient to match the new primary color
html = html.replace(/background: linear-gradient\(135deg, #[a-f0-9]+, #[a-f0-9]+\);/g, 'background: linear-gradient(135deg, #8A6BBF, #D0BCFF);');

fs.writeFileSync('index.html', html);
console.log('Colors updated successfully in index.html!');
