import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

// Validação Estática de Injeção de Dependência (NestJS DI Check)
// Objetivo: Diagnosticar e prevenir o erro 500 histórico de DI (decorators ausentes / providers não registrados)
// Uso: npm run agent:check-di

const ROOT = existsSync(join(process.cwd(), 'src')) ? process.cwd() : resolve(__dirname, '../..');
const PRES_HTTP = join(ROOT, 'src', 'Presentation', 'http');
const APP_DIR = join(ROOT, 'src', 'Application');

interface DiIssue {
  location: string;
  target: string;
  rule: string;
  suggestion: string;
}

const errors: DiIssue[] = [];
const warnings: DiIssue[] = [];
const pendingWiring: string[] = [];

function walkFiles(dir: string, suffix: string): string[] {
  const result: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        result.push(...walkFiles(full, suffix));
      } else if (entry.endsWith(suffix)) {
        result.push(full);
      }
    }
  } catch {}
  return result;
}

// Mapeamento de quais módulos de Infraestrutura exportam quais tokens
const INFRA_EXPORTS: Record<string, string[]> = {
  PrismaModule: ['PrismaService'],
  InfrastructureModule: [
    'ClientesRepository',
    'VeiculosRepository',
    'ServicosRepository',
    'ProdutosRepository',
    'ConsumosInsumoServicoRepository',
    'OrcamentosRepository',
    'OrdensServicoRepository',
    'TitulosReceberRepository',
    'EstoqueInternoRepository',
    'PrismaService',
  ],
  ClientesInfrastructureModule: ['ClientesRepository'],
  VeiculosInfrastructureModule: ['VeiculosRepository'],
  CatalogoInfrastructureModule: ['ServicosRepository', 'ProdutosRepository', 'ConsumosInsumoServicoRepository'],
  ComercialInfrastructureModule: ['OrcamentosRepository'],
  OperacaoInfrastructureModule: ['OrdensServicoRepository'],
  FinanceiroInfrastructureModule: ['TitulosReceberRepository'],
  EstoqueInternoInfrastructureModule: ['EstoqueInternoRepository'],
};

// 1. Inspecionar Módulos HTTP
const moduleFiles = walkFiles(PRES_HTTP, '.module.ts');
const registeredProviders = new Set<string>();
const registeredUseCases = new Set<string>();

for (const modFile of moduleFiles) {
  const modRel = relative(ROOT, modFile);
  const modContent = readFileSync(modFile, 'utf8');

  // Providers declarados diretamente no módulo
  const providersMatch = modContent.match(/providers:\s*\[([\s\S]*?)\]/);
  const localProviders = new Set<string>();
  if (providersMatch) {
    const rawProviders = providersMatch[1];
    // extrair nomes de classes providas
    const classNames = rawProviders.matchAll(/([A-Z]\w+)/g);
    for (const m of classNames) {
      if (m[1] !== 'Class' && m[1] !== 'Value' && m[1] !== 'Token') {
        localProviders.add(m[1]);
        registeredProviders.add(m[1]);
        if (m[1].endsWith('UseCase')) {
          registeredUseCases.add(m[1]);
        }
      }
    }
  }

  // Imports declarados no módulo
  const importsMatch = modContent.match(/imports:\s*\[([\s\S]*?)\]/);
  const importedModules: string[] = [];
  if (importsMatch) {
    const rawImports = importsMatch[1];
    const impNames = rawImports.matchAll(/([A-Z]\w+Module)/g);
    for (const m of impNames) {
      importedModules.push(m[1]);
    }
  }

  // Provedores disponibilizados pelos módulos importados
  const availableExternalProviders = new Set<string>();
  for (const impMod of importedModules) {
    const exportedTokens = INFRA_EXPORTS[impMod] ?? [];
    for (const tok of exportedTokens) {
      availableExternalProviders.add(tok);
    }
  }

  // Controllers do módulo
  const modDir = resolve(modFile, '..');
  const controllerFiles = walkFiles(modDir, '.controller.ts');

  for (const ctrlFile of controllerFiles) {
    const ctrlRel = relative(ROOT, ctrlFile);
    const ctrlContent = readFileSync(ctrlFile, 'utf8');

    // Verificar dependências no construtor
    const ctorMatch = ctrlContent.match(/constructor\s*\(([\s\S]*?)\)\s*\{/);
    if (!ctorMatch) continue;

    const ctorArgs = ctorMatch[1];
    const depMatches = ctorArgs.matchAll(/:\s*([A-Z]\w+)/g);

    for (const dep of depMatches) {
      const depName = dep[1];
      if (['String', 'Number', 'Boolean', 'Object', 'Date'].includes(depName)) continue;

      const isDirectlyProvided = localProviders.has(depName);
      const isExternallyProvided = availableExternalProviders.has(depName);

      if (!isDirectlyProvided && !isExternallyProvided) {
        errors.push({
          location: modRel,
          target: depName,
          rule: `Controller (${basename(ctrlFile)}) injeta '${depName}', mas ele não consta em providers: [...] de ${basename(modFile)} nem nos módulos importados.`,
          suggestion: `Adicione ${depName} aos providers ou importe o módulo que o exporta.`,
        });
      }
    }
  }
}

// 2. Verificar Use Cases registrados em módulos
const allUcFiles = walkFiles(APP_DIR, '.ts').filter(
  (f) => /(usecases|use-cases)/i.test(f) && !f.endsWith('.spec.ts') && !f.endsWith('index.ts')
);

for (const ucFile of allUcFiles) {
  const content = readFileSync(ucFile, 'utf8');
  const classMatch = content.match(/export\s+class\s+(\w+UseCase)/);
  if (!classMatch) continue;

  const ucName = classMatch[1];
  const isRegistered = registeredUseCases.has(ucName);

  if (isRegistered) {
    // Se está registrado em um módulo Nest, @Injectable() é OBRIGATÓRIO!
    if (!content.includes('@Injectable()')) {
      errors.push({
        location: relative(ROOT, ucFile),
        target: ucName,
        rule: `Use Case está registrado como provider NestJS, mas NÃO possui decorator @Injectable()!`,
        suggestion: `Adicione @Injectable() do '@nestjs/common' sobre a classe para que o Nest injete seus construtores sem causar erro 500.`,
      });
    }
  } else {
    // Não registrado em nenhum controller/módulo ainda (módulo esqueleto / Fase 3)
    pendingWiring.push(ucName);
  }
}

// Relatório
console.log('====================================================');
console.log(' GestCorp Auto — Validação Estática de DI (NestJS)');
console.log('====================================================');
console.log(`✓ Módulos HTTP analisados:           ${moduleFiles.length}`);
console.log(`✓ Providers ativos validados:         ${registeredProviders.size}`);
console.log(`✓ Use Cases ativos no Nest DI:        ${registeredUseCases.size}`);
console.log(`ℹ Use Cases em standby (Fase 3 HTTP): ${pendingWiring.length}`);

if (warnings.length > 0) {
  console.log('\n[AVISOS]');
  for (const w of warnings) {
    console.log(`  ⚠ [${w.location}] ${w.target}: ${w.rule}`);
  }
}

if (errors.length > 0) {
  console.log('\n[ERROS CRÍTICOS DE INJEÇÃO DE DEPENDÊNCIA]');
  for (const err of errors) {
    console.log(`  ✗ [${err.location}] ${err.target}`);
    console.log(`    Problema:   ${err.rule}`);
    console.log(`    Solução:    ${err.suggestion}\n`);
  }
  console.log('====================================================');
  console.log(`Status: FALHA (${errors.length} erro(s) de DI detectado(s))`);
  process.exit(1);
} else {
  console.log('====================================================');
  console.log('Status: SUCESSO (Cadeia de DI dos módulos ativos 100% íntegra ✓)');
  process.exit(0);
}
