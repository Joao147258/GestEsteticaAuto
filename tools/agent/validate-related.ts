import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Execução segura de testes relacionados aos arquivos modificados ou informados
// Uso:
//   npm run validate:related                      (detecta arquivos modificados via git)
//   npm run validate:related -- src/Domain/...    (usa arquivos passados explicitamente)

const ROOT = existsSync(join(process.cwd(), 'src')) ? process.cwd() : resolve(__dirname, '../..');

let targetFiles: string[] = process.argv.slice(2).filter((a) => !a.startsWith('-') && !a.endsWith('.ts') && existsSync(resolve(ROOT, a)));

// Se não passou arquivos explicitamente, buscar arquivos modificados via git
if (targetFiles.length === 0) {
  try {
    const gitDiff = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' });
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, encoding: 'utf8' });
    const all = [...gitDiff.split('\n'), ...untracked.split('\n')]
      .map((f) => f.trim())
      .filter((f) => f.endsWith('.ts') && existsSync(resolve(ROOT, f)));
    targetFiles = [...new Set(all)];
  } catch {
    // git indisponível
  }
}

if (targetFiles.length === 0) {
  console.log('ℹ Nenhum arquivo modificado detectado no Git ou especificado nos argumentos.');
  console.log('  Uso: npm run validate:related -- <caminho/do/arquivo.ts>');
  process.exit(0);
}

console.log(`▶ Executando testes relacionados a ${targetFiles.length} arquivo(s):`);
for (const f of targetFiles.slice(0, 10)) {
  console.log(`  - ${f}`);
}
if (targetFiles.length > 10) {
  console.log(`  ... e mais ${targetFiles.length - 10} arquivo(s)`);
}

const res = spawnSync('npx', ['jest', '--findRelatedTests', '--passWithNoTests', ...targetFiles], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
});

process.exit(res.status ?? 0);
