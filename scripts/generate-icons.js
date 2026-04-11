const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = '/Users/taka/takken-main/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
const targetDir = '/Users/taka/takken-main/ios/App/App/Assets.xcassets/AppIcon.appiconset';

const icons = [
    { size: 20, scales: [2, 3] },
    { size: 29, scales: [2, 3] },
    { size: 40, scales: [2, 3] },
    { size: 60, scales: [2, 3] },
    { size: 20, scales: [1, 2], idiom: 'ipad' },
    { size: 29, scales: [1, 2], idiom: 'ipad' },
    { size: 40, scales: [1, 2], idiom: 'ipad' },
    { size: 76, scales: [1, 2], idiom: 'ipad' },
    { size: 83.5, scales: [2], idiom: 'ipad' },
    { size: 1024, scales: [1], idiom: 'ios-marketing' }
];

async function generateIcons() {
    const images = [];

    for (const icon of icons) {
        for (const scale of icon.scales) {
            const actualSize = Math.floor(icon.size * scale);
            const filename = `AppIcon-${icon.size}x${icon.size}@${scale}x.png`;
            const filepath = path.join(targetDir, filename);

            console.log(`Generating ${filename} (${actualSize}x${actualSize})...`);

            await sharp(sourceIcon)
                .resize(actualSize, actualSize)
                .toFile(filepath);

            images.push({
                size: `${icon.size}x${icon.size}`,
                idiom: icon.idiom || 'iphone',
                filename: filename,
                scale: `${scale}x`
            });
        }
    }

    const contents = {
        images: images,
        info: {
            version: 1,
            author: 'xcode'
        }
    };

    fs.writeFileSync(path.join(targetDir, 'Contents.json'), JSON.stringify(contents, null, 2));
    console.log('Contents.json updated.');
}

generateIcons().catch(err => console.error(err));
