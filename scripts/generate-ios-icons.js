/**
 * iOS用アプリアイコン生成スクリプト
 * 1024x1024の基本アイコンから必要なサイズを自動生成
 */

const fs = require("fs");
const path = require("path");

// Canvas APIを使用するためのNode.js用ライブラリが必要
// npm install canvas を実行してからこのスクリプトを実行

function generateAppIcon() {
  console.log("🎨 iOSアプリアイコンを生成しています...\n");

  const Canvas = require("canvas");
  const { createCanvas } = Canvas;

  // 1024x1024のマスターアイコンを生成
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext("2d");

  // 背景グラデーション（紫）
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, "#a855f7");
  gradient.addColorStop(1, "#7c3aed");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // 白い円形の背景（装飾）
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0, Math.PI * 2);
  ctx.fill();

  // 建物のアイコン（シンプルな家）
  ctx.fillStyle = "#ffffff";

  // 屋根
  ctx.beginPath();
  ctx.moveTo(312, 380);
  ctx.lineTo(512, 250);
  ctx.lineTo(712, 380);
  ctx.closePath();
  ctx.fill();

  // 建物本体
  ctx.fillRect(362, 380, 300, 280);

  // ドア
  ctx.fillStyle = "#9333ea";
  ctx.fillRect(437, 520, 150, 140);

  // 窓（左）
  ctx.fillStyle = "#e0e7ff";
  ctx.fillRect(382, 420, 80, 80);

  // 窓（右）
  ctx.fillRect(562, 420, 80, 80);

  // テキスト「宅建」
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 120px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("宅建", 512, 750);

  // マスターアイコンを保存
  const outputDir = path.join(
    __dirname,
    "..",
    "ios",
    "App",
    "App",
    "Assets.xcassets",
    "AppIcon.appiconset"
  );

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1024x1024のマスターアイコンを保存
  const buffer = canvas.toBuffer("image/png");
  const masterPath = path.join(outputDir, "app-icon-1024.png");
  fs.writeFileSync(masterPath, buffer);
  console.log("✓ マスターアイコン生成: app-icon-1024.png");

  // iOSで必要な各サイズのアイコンを生成
  const sizes = [
    { size: 20, scales: [2, 3], idiom: "iphone" },
    { size: 29, scales: [2, 3], idiom: "iphone" },
    { size: 40, scales: [2, 3], idiom: "iphone" },
    { size: 60, scales: [2, 3], idiom: "iphone" },
    { size: 20, scales: [1, 2], idiom: "ipad" },
    { size: 29, scales: [1, 2], idiom: "ipad" },
    { size: 40, scales: [1, 2], idiom: "ipad" },
    { size: 76, scales: [1, 2], idiom: "ipad" },
    { size: 83.5, scales: [2], idiom: "ipad" },
  ];

  const contentsJson = {
    images: [],
    info: {
      author: "xcode",
      version: 1,
    },
  };

  sizes.forEach(({ size, scales, idiom }) => {
    scales.forEach((scale) => {
      const pixelSize = Math.round(size * scale);
      const filename = `icon-${size}@${scale}x.png`;

      // リサイズしてアイコンを生成
      const resizedCanvas = createCanvas(pixelSize, pixelSize);
      const resizedCtx = resizedCanvas.getContext("2d");

      // 元のキャンバスをリサイズ
      resizedCtx.drawImage(canvas, 0, 0, pixelSize, pixelSize);

      // ファイルに保存
      const resizedBuffer = resizedCanvas.toBuffer("image/png");
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, resizedBuffer);

      console.log(`✓ ${filename} (${pixelSize}x${pixelSize})`);

      // Contents.jsonにエントリを追加
      contentsJson.images.push({
        size: `${size}x${size}`,
        idiom: idiom,
        filename: filename,
        scale: `${scale}x`,
      });
    });
  });

  // 1024x1024のApp Store用アイコン
  contentsJson.images.push({
    size: "1024x1024",
    idiom: "ios-marketing",
    filename: "app-icon-1024.png",
    scale: "1x",
  });

  // Contents.jsonを保存
  const contentsPath = path.join(outputDir, "Contents.json");
  fs.writeFileSync(contentsPath, JSON.stringify(contentsJson, null, 2));
  console.log("✓ Contents.json生成完了");

  console.log("\n🎉 アプリアイコンの生成が完了しました！");
  console.log(`📁 出力先: ${outputDir}\n`);
}

// スクリプトの実行
try {
  generateAppIcon();
} catch (error) {
  console.error("❌ エラーが発生しました:", error.message);
  console.log("\n💡 ヒント: canvas パッケージをインストールしてください");
  console.log("   npm install canvas\n");
  process.exit(1);
}
