import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

// Inventário mecânico de Use Cases da camada Application
// Suporta módulos com convenção kebab-case (use-cases/*.use-case.ts) e PascalCase (usecases/*UseCase.ts)
// Uso: npm run agent:inventory [modulo]

const ROOT = existsSync(join(process.cwd(), 'src')) ? process.cwd() : resolve(__dirname, '../..');
const APP_DIR = join(ROOT, 'src', 'Application');

// Captura argumento de filtro opcional
const args = process.argv.slice(2).filter((a) => !a.endsWith('.ts') && !a.endsWith('.js') && !a.startsWith('-'));
const targetModule = args[0]?.toLowerCase();

interface UseCaseInfo {
  module: string;
  className: string;
  file: string;
  repositories: string[];
  hasSpec: boolean;
}

function findUseCaseFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        files.push(...findUseCaseFiles(full));
      } else if (
        /(usecases|use-cases)/i.test(full) &&
        entry.endsWith('.ts') &&
        !entry.endsWith('.spec.ts') &&
        !entry.endsWith('index.ts')
      ) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

const allUseCaseFiles = findUseCaseFiles(APP_DIR).sort();
const inventory: UseCaseInfo[] = [];

for (const file of allUseCaseFiles) {
  const rel = relative(ROOT, file);
  const relApp = relative(APP_DIR, file);
  const moduleName = relApp.split(/[/|\\]/)[0];

  if (targetModule && moduleName.toLowerCase() !== targetModule) {
    continue;
  }

  const content = readFileSync(file, 'utf8');

  // Extrair nome da classe
  const classMatch = content.match(/export\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : basename(file, '.ts');

  // Extrair repositórios do construtor
  const repos: string[] = [];
  const ctorMatch = content.match(/constructor\s*\(([^)]*)\)/s);
  if (ctorMatch) {
    const ctorBody = ctorMatch[1];
    const repoMatches = ctorBody.matchAll(/:\s*([A-Z]\w*Repository)/g);
    for (const m of repoMatches) {
      if (!repos.includes(m[1])) repos.push(m[1]);
    }
  }

  // Spec correspondente (mesmo nome terminando em .spec.ts)
  const specFile = file.replace(/\.ts$/, '.spec.ts');
  const hasSpec = existsSync(specFile);

  inventory.push({
    module: moduleName,
    className,
    file: rel,
    repositories: repos,
    hasSpec,
  });
}

// Agrupar por módulo
const byModule = new Map<string, UseCaseInfo[]>();
for (const item of inventory) {
  const list = byModule.get(item.module) ?? [];
  list.push(item);
  byModule.set(item.module, list);
}

console.log('========================================================================');
console.log(' GestCorp Auto — Inventário Mecânico de Use Cases (Application)');
console.log('========================================================================');

let totalSpec = 0;

for (const [mod, items] of byModule.entries()) {
  const specCount = items.filter((i) => i.hasSpec).length;
  console.log(`\n📦 Módulo: ${mod.toUpperCase()} (${items.length} use cases | ${specCount} c/ spec)`);
  console.log('─'.repeat(72));
  for (const uc of items) {
    const specTag = uc.hasSpec ? '✓ [spec]' : '✗ [sem spec]';
    if (uc.hasSpec) totalSpec++;
    const reposTag = uc.repositories.length > 0 ? uc.repositories.join(', ') : '(nenhum / stubs)';
    console.log(`  • ${uc.className.padEnd(45)} ${specTag}`);
    console.log(`    Arquivo:   ${uc.file}`);
    console.log(`    Contratos: ${reposTag}`);
  }
}

console.log('\n========================================================================');
console.log(
  `Total: ${inventory.length} Use Cases | Com Spec: ${totalSpec} | Sem Spec: ${inventory.length - totalSpec}`
);
console.log('========================================================================');
