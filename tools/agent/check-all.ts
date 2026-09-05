import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Validação consolidada de verificações mecânicas do GestCorp Auto
// Executa:
//   1. Validação de fronteiras arquiteturais (agent:check-layers)
//   2. Typecheck rápido (tsc --noEmit)
//   3. Validação de DI NestJS (agent:check-di) quando disponível
// Uso: npm run agent:check

const ROOT = existsSync(join(process.cwd(), 'src')) ? process.cwd() : resolve(__dirname, '../..');

console.log('====================================================');
console.log(' GestCorp Auto — Suite Consolidada de Checagens');
console.log('====================================================');

let allPassed = true;

function runStep(label: string, command: string, args: string[]): boolean {
  console.log(`\n▶ [Passo] ${label}...`);
  const start = Date.now();
  const res = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  if (res.status === 0) {
    console.log(`✓ ${label} passou (${duration}s)`);
    return true;
  } else {
    console.log(`✗ ${label} FALHOU com código ${res.status} (${duration}s)`);
    allPassed = false;
    return false;
  }
}

// 1. Checagem de camadas
const layersPassed = runStep(
  'Validação de Camadas (Clean Architecture)',
  'npx',
  ['tsx', 'tools/agent/check-layers.ts']
);

// 2. Typecheck estrito
const typecheckPassed = runStep(
  'TypeScript Typecheck (tsc --noEmit)',
  'npx',
  ['tsc', '--noEmit', '-p', 'tsconfig.json']
);

// 3. Checagem de DI (se existir)
const checkDiScript = join(ROOT, 'tools', 'agent', 'check-di.ts');
if (existsSync(checkDiScript)) {
  runStep('Validação Estática de DI NestJS', 'npx', ['tsx', 'tools/agent/check-di.ts']);
}

console.log('\n====================================================');
if (allPassed) {
  console.log(' STATUS CONSOLIDADO: TODOS OS CHECKS PASSARAM ✓');
  console.log('====================================================');
  process.exit(0);
} else {
  console.log(' STATUS CONSOLIDADO: ENCONTRADAS FALHAS ✗');
  console.log('====================================================');
  process.exit(1);
}
