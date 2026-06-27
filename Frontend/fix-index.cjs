const fs = require('fs');
const viteHtml = fs.readFileSync('index.html', 'utf8');
const backupHtml = fs.readFileSync('backup/index.html', 'utf8');
const headMatch = backupHtml.match(/<head>([\s\S]*?)<\/head>/i);
if(headMatch) {
  const newViteHtml = viteHtml.replace(/<head>[\s\S]*?<\/head>/i, '<head>' + headMatch[1] + '</head>');
  fs.writeFileSync('index.html', newViteHtml);
  console.log('Fixed index.html');
}
