#!/usr/bin/env ts-node
/**
 * prediction/ を既存 index.ts に安全にマージする（上書きしない）
 * 呼び出し: package.json の integrate:prediction:merge → 本スクリプト
 * 既存同目的: integrate-prediction-questions.ts は index 丸ごと上書き（用途が異なる）
 * 読み書き: lib/data/questions 配下の prediction フォルダと各 index.ts（Question の id/question/options 等。日付フィールドなし）
 * 指示: B — 著作権は並行で、まずAI問題の増強実装に進む
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "../../lib/data/questions");

const CATEGORIES = [
  { key: "hourei", exportName: "houreiQuestions" },
  { key: "zeihou", exportName: "zeihouQuestions" },
  { key: "takkengyouhou", exportName: "takkengyouhouQuestions" },
  { key: "minpou", exportName: "minpouQuestions" },
] as const;

function mergeCategory(cat: (typeof CATEGORIES)[number]): void {
  const predictionDir = path.join(ROOT, cat.key, "prediction");
  const indexPath = path.join(ROOT, cat.key, "index.ts");
  if (!fs.existsSync(predictionDir) || !fs.existsSync(indexPath)) {
    console.log(`skip ${cat.key}`);
    return;
  }

  const files = fs
    .readdirSync(predictionDir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts");
  if (files.length === 0) {
    console.log(`skip ${cat.key}: empty`);
    return;
  }

  let index = fs.readFileSync(indexPath, "utf-8");
  const importLines: string[] = [];
  const spreadLines: string[] = [];

  for (const file of files) {
    const base = file.replace(/\.ts$/, "");
    const content = fs.readFileSync(path.join(predictionDir, file), "utf-8");
    const m = content.match(/export const (\w+)/);
    if (!m) continue;
    const actualExport = m[1];
    const importLine = `import { ${actualExport} } from "./prediction/${base}";`;
    const spread = `  ...${actualExport},`;
    if (!index.includes(`./prediction/${base}`)) {
      importLines.push(importLine);
    }
    if (!index.includes(`...${actualExport}`)) {
      spreadLines.push(spread);
    }
  }

  if (importLines.length === 0 && spreadLines.length === 0) {
    console.log(`${cat.key}: already merged`);
    return;
  }

  // Insert imports after the last existing import line
  if (importLines.length > 0) {
    const lines = index.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImport = i;
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, ...importLines);
      index = lines.join("\n");
    } else {
      index = importLines.join("\n") + "\n" + index;
    }
  }

  if (spreadLines.length > 0) {
    if (index.includes("]).questions")) {
      index = index.replace("]).questions", `${spreadLines.join("\n")}\n]).questions`);
    } else {
      const re = new RegExp(`(export const ${cat.exportName}[\\s\\S]*?)(\\];)`);
      index = index.replace(re, `$1${spreadLines.join("\n")}\n$2`);
    }
  }

  fs.writeFileSync(indexPath, index, "utf-8");
  console.log(
    `merged ${cat.key}: +${importLines.length} imports, +${spreadLines.length} spreads`
  );
}

function main() {
  console.log("prediction → index merge (non-destructive)");
  CATEGORIES.forEach(mergeCategory);
}

main();
