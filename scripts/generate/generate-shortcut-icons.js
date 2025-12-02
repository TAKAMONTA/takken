const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// 生成するショートカットアイコン
const shortcutIcons = [
  { name: "shortcut-practice.png", label: "過去問演習" },
  { name: "shortcut-quick.png", label: "ミニテスト" },
  { name: "shortcut-weak.png", label: "弱点克服" },
];

// ソースアイコンファイル（144x144）
const sourceIcon = path.join(__dirname, "../../public/icons/icon-144x144.png");
const outputDir = path.join(__dirname, "../../public/icons");

async function generateShortcutIcons() {
  try {
    console.log("🎨 ショートカットアイコンを生成中...");

    // ソースファイルの存在確認
    if (!fs.existsSync(sourceIcon)) {
      throw new Error(`ソースアイコンファイルが見つかりません: ${sourceIcon}`);
    }

    // 各ショートカットアイコンを生成
    for (const icon of shortcutIcons) {
      const outputPath = path.join(outputDir, icon.name);

      console.log(`📱 ${icon.name} (${icon.label}) を生成中...`);

      await sharp(sourceIcon)
        .resize(96, 96, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${icon.name} を生成しました`);
    }

    console.log("🎉 すべてのショートカットアイコンが正常に生成されました！");

    // 生成されたファイルの確認
    console.log("\n📋 生成されたショートカットアイコンファイル:");
    for (const icon of shortcutIcons) {
      const filePath = path.join(outputDir, icon.name);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${icon.name} (${stats.size} bytes)`);
      } else {
        console.log(`  ❌ ${icon.name} (生成失敗)`);
      }
    }
  } catch (error) {
    console.error(
      "❌ ショートカットアイコン生成中にエラーが発生しました:",
      error.message
    );
    process.exit(1);
  }
}

// スクリプト実行
generateShortcutIcons();
