const fs = require('fs');
const path = require('path');

const files = {
  'index.html': 'Home',
  'collections.html': 'Collections',
  'product_details.html': 'ProductDetails',
  'checkout.html': 'Checkout'
};

const componentsDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

Object.entries(files).forEach(([filename, componentName]) => {
  const htmlPath = path.join(__dirname, 'backup', filename);
  if (!fs.existsSync(htmlPath)) return;
  
  let content = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract the body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return;
  
  let bodyContent = bodyMatch[1];
  
  // Convert class= to className=
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  // Convert for= to htmlFor=
  bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
  // Self close tags
  bodyContent = bodyContent.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
  bodyContent = bodyContent.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
  bodyContent = bodyContent.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
  bodyContent = bodyContent.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');
  
  // Replace HTML comments
  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  // Convert inline style string to object
  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, p1) => {
    if (p1.includes('background-image')) {
      const urlMatch = p1.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch) {
         return `style={{ backgroundImage: "url('${urlMatch[1]}')" }}`;
      }
    }
    return ''; // remove other styles
  });

  const reactCode = `import React from 'react';

export default function ${componentName}() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      ${bodyContent}
    </div>
  );
}
`;

  fs.writeFileSync(path.join(componentsDir, `${componentName}.jsx`), reactCode);
});

console.log('Conversion complete.');
