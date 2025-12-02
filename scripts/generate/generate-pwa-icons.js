const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// 生成するアイコンサイズ
const iconSizes = [
  { size: 16, name: "icon-16x16.png" },
  { size: 32, name: "icon-32x32.png" },
  { size: 72, name: "icon-72x72.png" },
  { size: 96, name: "icon-96x96.png" },
  { size: 128, name: "icon-128x128.png" },
  { size: 152, name: "icon-152x152.png" },
  { size: 192, name: "icon-192x192.png" },
  { size: 384, name: "icon-384x384.png" },
  { size: 512, name: "icon-512x512.png" },
];

// ソースアイコンファイル（144x144）
const sourceIcon = path.join(__dirname, "../../public/icons/icon-144x144.png");
const outputDir = path.join(__dirname, "../../public/icons");

async function generateIcons() {
  try {
    console.log("🎨 PWAアイコンを生成中...");

    // ソースファイルの存在確認
    if (!fs.existsSync(sourceIcon)) {
      throw new Error(`ソースアイコンファイルが見つかりません: ${sourceIcon}`);
    }

    // 各サイズのアイコンを生成
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);

      console.log(`📱 ${icon.name} (${icon.size}x${icon.size}) を生成中...`);

      await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${icon.name} を生成しました`);
    }

    console.log("🎉 すべてのPWAアイコンが正常に生成されました！");

    // 生成されたファイルの確認
    console.log("\n📋 生成されたアイコンファイル:");
    for (const icon of iconSizes) {
      const filePath = path.join(outputDir, icon.name);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${icon.name} (${stats.size} bytes)`);
      } else {
        console.log(`  ❌ ${icon.name} (生成失敗)`);
      }
    }
  } catch (error) {
    console.error("❌ アイコン生成中にエラーが発生しました:", error.message);
    process.exit(1);
  }
}

// スクリプト実行
generateIcons();
