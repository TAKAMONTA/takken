const fs = require('fs');
const path = require('path');

// SVGアイコンのテンプレート
const createSvgIcon = (size) => {
  const fontSize = Math.floor(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#9333ea"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">宅</text>
</svg>`;
};

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// アイコンディレクトリが存在することを確認
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 各サイズのSVGアイコンを生成
const sizes = [16, 32, 144, 192, 512];

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  const svgContent = createSvgIcon(size);
  fs.writeFileSync(filepath, svgContent);
  console.log(`Created ${filename}`);
});

// favicon用のSVGも生成
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
fs.writeFileSync(faviconPath, createSvgIcon(32));
console.log('Created favicon.svg');

console.log('All SVG icons generated successfully!');
console.log('Note: SVG icons are used as fallback. For better compatibility, convert these to PNG format.');
