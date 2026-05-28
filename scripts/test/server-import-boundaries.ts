import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const serverOnlyRoots = [
  "app/api",
  "lib/firebase-admin-auth.ts",
  "lib/firestore-usage-recorder.ts",
  "lib/server-ai-usage.ts",
  "lib/server-ai-provider.ts",
];

const forbiddenPatterns = [
  {
    pattern: /from\s+["']@\/lib\/logger["']|from\s+["']\.\/logger["']|from\s+["']\.\.\/logger["']/,
    reason: "server code must use lib/server-logger to avoid importing client Firebase",
  },
  {
    pattern: /firebase-client/,
    reason: "server code must not import the client Firebase bundle",
  },
];

function collectFiles(target: string): string[] {
  const absolute = path.join(repoRoot, target);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  const stat = fs.statSync(absolute);
  if (stat.isFile()) {
    return /\.(ts|tsx|js|mjs)$/.test(target) ? [absolute] : [];
  }

  return fs.readdirSync(absolute).flatMap((entry) => {
    const child = path.join(absolute, entry);
    const relative = path.relative(repoRoot, child);
    const childStat = fs.statSync(child);
    if (childStat.isDirectory()) {
      return collectFiles(relative);
    }
    return /\.(ts|tsx|js|mjs)$/.test(child) ? [child] : [];
  });
}

const violations: string[] = [];

for (const file of serverOnlyRoots.flatMap(collectFiles)) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(repoRoot, file);

  for (const { pattern, reason } of forbiddenPatterns) {
    if (pattern.test(source)) {
      violations.push(`${relative}: ${reason}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Server import boundary violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("server import boundary checks passed");
