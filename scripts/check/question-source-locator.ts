import fs from "node:fs";
import path from "node:path";

export interface QuestionSourceLocation {
  category: string;
  id: number;
  file: string;
  line: number;
  questionText?: string;
}

export interface QuestionSourceIndexOptions {
  activeOnly?: boolean;
}

type QuestionSourceIndex = Map<string, QuestionSourceLocation[]>;

const DEFAULT_QUESTION_ROOT = path.join(
  process.cwd(),
  "lib",
  "data",
  "questions"
);

function normalizeQuestionText(text: string): string {
  return text.replace(/\u3000/g, " ").trim().replace(/\s+/g, " ");
}

function sourceKey(category: string, id: number, questionText?: string): string {
  const baseKey = category + ":" + id;
  return questionText ? baseKey + ":" + normalizeQuestionText(questionText) : baseKey;
}

function shouldSkipDirectory(name: string): boolean {
  return name.startsWith("_") || name === "utils";
}

function hasSkippedPathSegment(root: string, filePath: string): boolean {
  const relative = path.relative(root, filePath);
  return relative.split(path.sep).some((segment) => shouldSkipDirectory(segment));
}

function collectQuestionFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(entry.name)) {
        files.push(...collectQuestionFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function resolveRelativeImport(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;

  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [base + ".ts", path.join(base, "index.ts")];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function collectImports(file: string): string[] {
  const content = fs.readFileSync(file, "utf8");
  const importPattern = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  const imports: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(content))) {
    imports.push(match[1]);
  }

  return imports;
}

function collectActiveQuestionFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];

  const activeFiles = new Set<string>();

  function visit(file: string): void {
    const normalizedFile = path.resolve(file);
    if (activeFiles.has(normalizedFile)) return;
    if (!normalizedFile.startsWith(path.resolve(root) + path.sep)) return;
    if (hasSkippedPathSegment(root, normalizedFile)) return;
    if (!fs.existsSync(normalizedFile) || !normalizedFile.endsWith(".ts")) return;

    activeFiles.add(normalizedFile);

    for (const specifier of collectImports(normalizedFile)) {
      const importedFile = resolveRelativeImport(normalizedFile, specifier);
      if (importedFile) visit(importedFile);
    }
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || shouldSkipDirectory(entry.name)) continue;

    const categoryIndex = path.join(root, entry.name, "index.ts");
    if (fs.existsSync(categoryIndex)) {
      visit(categoryIndex);
    }
  }

  return Array.from(activeFiles).sort();
}

function categoryFromFile(root: string, filePath: string): string | null {
  const relative = path.relative(root, filePath);
  const [category] = relative.split(path.sep);
  return category && category !== ".." ? category : null;
}

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

function decodeStringLiteral(value: string, quote: string): string {
  if (quote === '"') {
    try {
      return JSON.parse('"' + value.replace(/"/g, '\\"') + '"');
    } catch {
      return value;
    }
  }

  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .replace(/\\'/g, "'")
    .replace(/\\`/g, "`");
}

function extractQuestionText(segment: string): string | undefined {
  const match = segment.match(
    /["']?question["']?\s*:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`)/s
  );

  if (!match) return undefined;
  if (typeof match[1] === "string") return normalizeQuestionText(decodeStringLiteral(match[1], '"'));
  if (typeof match[2] === "string") return normalizeQuestionText(decodeStringLiteral(match[2], "'"));
  return normalizeQuestionText(decodeStringLiteral(match[3], "`"));
}

function segmentForQuestion(content: string, idMatchEnd: number): string {
  const remaining = content.slice(idMatchEnd);
  const nextIdOffset = remaining.search(/(?:^|[\n,{])\s*["']?id["']?\s*:/);
  const end = nextIdOffset === -1 ? content.length : idMatchEnd + nextIdOffset;
  return content.slice(idMatchEnd, Math.min(end, idMatchEnd + 12000));
}

function addLocation(
  index: QuestionSourceIndex,
  key: string,
  location: QuestionSourceLocation
): void {
  const existing = index.get(key);
  if (existing) {
    existing.push(location);
  } else {
    index.set(key, [location]);
  }
}

export function buildQuestionSourceIndex(
  root = DEFAULT_QUESTION_ROOT,
  options: QuestionSourceIndexOptions = {}
): QuestionSourceIndex {
  const index: QuestionSourceIndex = new Map();
  const files = options.activeOnly
    ? collectActiveQuestionFiles(root)
    : collectQuestionFiles(root);

  for (const file of files) {
    const category = categoryFromFile(root, file);
    if (!category) continue;

    const content = fs.readFileSync(file, "utf8");
    const idPattern = /["'\x60]?id["'\x60]?\s*:\s*(\d+)/g;
    let match: RegExpExecArray | null;

    while ((match = idPattern.exec(content))) {
      const id = Number(match[1]);
      const questionText = extractQuestionText(segmentForQuestion(content, idPattern.lastIndex));
      const location: QuestionSourceLocation = {
        category,
        id,
        file: path.relative(process.cwd(), file),
        line: lineNumberAt(content, match.index),
        questionText,
      };

      addLocation(index, sourceKey(category, id), location);
      if (questionText) {
        addLocation(index, sourceKey(category, id, questionText), location);
      }
    }
  }

  return index;
}

export function findQuestionSourceLocations(
  index: QuestionSourceIndex,
  category: string,
  id: number,
  questionText?: string
): QuestionSourceLocation[] {
  const idLocations = index.get(sourceKey(category, id)) ?? [];

  if (questionText) {
    const exactLocations = index.get(sourceKey(category, id, questionText));
    if (exactLocations) return exactLocations;

    if (idLocations.some((location) => location.questionText)) {
      return [];
    }
  }

  return idLocations;
}

export function formatQuestionSourceLocations(
  locations: QuestionSourceLocation[],
  maxLocations = locations.length
): string {
  if (locations.length === 0) return "source unknown";

  const visibleLocations = locations.slice(0, maxLocations);
  const formatted = visibleLocations
    .map((location) => location.file + ":" + location.line)
    .join(", ");
  const hiddenCount = locations.length - visibleLocations.length;

  return hiddenCount > 0 ? formatted + ", +" + hiddenCount + " more" : formatted;
}
