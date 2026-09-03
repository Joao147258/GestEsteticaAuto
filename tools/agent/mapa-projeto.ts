import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Mapa do projeto — listagem enxuta dos arquivos relevantes.
// Ignora: node_modules, dist, coverage, src/generated, *.log, *.tmp.
// Uso: npm run agent:map  (executa via tsx, sem dependência nova)
// Rodar SEMPRE do root do projeto (process.cwd()) — por isso não usa
// import.meta (projeto compila CommonJS e import.meta quebraria o tsc).

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.next',
  'generated',
  '.git',
  '.vscode',
]);

const IGNORE_EXT = new Set(['.log', '.tmp', '.tsbuildinfo', '.map']);

// Arquivos .md fora de docs/ são notas locais não versionadas — não listar
// (a árvore 'docs' é impressa separadamente abaixo).
function ignoreMd(name: string, relPath: string): boolean {
  return name.endsWith('.md') && !relPath.startsWith('docs');
}

const TREE = ['src', 'prisma', 'docs', 'test', 'tools', 'scripts', 'Milestones'];

function ignoreDir(name: string, relPath: string): boolean {
  if (IGNORE_DIRS.has(name)) return true;
  if (name === 'generated' && relPath.startsWith('src')) return true;
  return false;
}

function walk(dir: string, depth = 0): string[] {
  const lines: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir).sort();
  } catch {
    return lines;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (statSync(full).isDirectory()) {
      if (ignoreDir(entry, rel)) continue;
      lines.push(`${'  '.repeat(depth)}${entry}/`);
      lines.push(...walk(full, depth + 1));
    } else {
      const ext = entry.slice(entry.lastIndexOf('.'));
      if (IGNORE_EXT.has(ext)) continue;
      if (ignoreMd(entry, rel)) continue;
      if (entry === '.gitignore') continue;
      lines.push(`${'  '.repeat(depth)}${entry}`);
    }
  }
  return lines;
}

function printTree(label: string, root: string): void {
  console.log(`\n${label}`);
  console.log('─'.repeat(label.length));
  for (const line of walk(root)) console.log(line);
}

for (const dir of TREE) {
  const full = join(ROOT, dir);
  try {
    if (statSync(full).isDirectory()) printTree(dir, full);
  } catch {
    // pasta ausente — ignora
  }
}

console.log('\nEsquema');
console.log('─'.repeat(7));
try {
  const schema = readdirSync(join(ROOT, 'prisma'));
  for (const entry of schema) if (entry.endsWith('.prisma')) console.log(`prisma/${entry}`);
} catch {
  // sem schema — ignora
}
