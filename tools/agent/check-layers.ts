import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// Validação de fronteiras arquiteturais (Clean Architecture / 5 Camadas)
// Regras:
//   Domain        -> Puro. Sem @nestjs, sem @prisma, sem Presentation, sem Infrastructure, sem Application.
//   Application   -> UseCases e DTOs. Depende de Domain e Shared. Sem Presentation, sem Prisma Client, sem concrete Infra, sem HTTP decorators.
//   Infrastructure-> Prisma, mappers, repos concretos. Sem Presentation.
//   Presentation  -> HTTP, controllers, DTOs HTTP. Sem Prisma direto (exceto GET /health probe).

const ROOT = existsSync(join(process.cwd(), 'src')) ? process.cwd() : resolve(__dirname, '../..');
const SRC = join(ROOT, 'src');

interface Violation {
  file: string;
  line: number;
  importPath: string;
  rule: string;
}

const errors: Violation[] = [];
const warnings: Violation[] = [];

function walkTsFiles(dir: string): string[] {
  const result: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (entry === 'generated' || entry === 'node_modules') continue;
        result.push(...walkTsFiles(full));
      } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        result.push(full);
      }
    }
  } catch {
    // diretório inexistente
  }
  return result;
}

function extractImports(content: string): { line: number; path: string; fullLine: string }[] {
  const lines = content.split('\n');
  const imports: { line: number; path: string; fullLine: string }[] = [];
  lines.forEach((l, idx) => {
    const fromMatch = l.match(/from\s+['"]([^'"]+)['"]/);
    if (fromMatch) {
      imports.push({ line: idx + 1, path: fromMatch[1], fullLine: l.trim() });
      return;
    }
    const requireMatch = l.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      imports.push({ line: idx + 1, path: requireMatch[1], fullLine: l.trim() });
    }
  });
  return imports;
}

// 1. Checar Domain
const domainFiles = walkTsFiles(join(SRC, 'Domain'));
for (const file of domainFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  const imps = extractImports(content);

  for (const imp of imps) {
    if (imp.path.startsWith('@nestjs')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Domain não pode importar pacotes @nestjs/*' });
    }
    if (imp.path.startsWith('@prisma') || imp.path.includes('prisma')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Domain não pode importar Prisma' });
    }
    if (imp.path.includes('Application') || imp.path.includes('/Application')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Domain não pode depender de Application' });
    }
    if (imp.path.includes('Infrastructure') || imp.path.includes('/Infrastructure')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Domain não pode depender de Infrastructure' });
    }
    if (imp.path.includes('Presentation') || imp.path.includes('/Presentation')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Domain não pode depender de Presentation' });
    }
  }
}

// 2. Checar Application
const httpDecoratorsRegex = /@(Controller|Get|Post|Put|Patch|Delete|Options|Head|Body|Query|Param|Headers|Req|Res|Next|Session)\b/;
const appFiles = walkTsFiles(join(SRC, 'Application'));
for (const file of appFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  const imps = extractImports(content);

  for (const imp of imps) {
    if (imp.path.includes('Presentation') || imp.path.includes('/Presentation')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Application não pode depender de Presentation' });
    }
    if (imp.path.startsWith('@prisma') || imp.path.includes('src/generated/prisma')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Application não pode depender diretamente do Prisma Client' });
    }
    if (imp.path.includes('Infrastructure/database/prisma') || imp.path.includes('.prisma.repository')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Application não pode depender de implementações concretas de Infrastructure' });
    }
    if (imp.path.includes('express')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Application não pode importar Express/HTTP' });
    }
  }

  // Checar se usa decorators HTTP do NestJS em UseCases/DTOs
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (httpDecoratorsRegex.test(l)) {
      errors.push({ file: rel, line: idx + 1, importPath: l.trim(), rule: 'Application não deve conter decorators HTTP (ex.: @Controller, @Get, @Body)' });
    }
  });
}

// 3. Checar Infrastructure
const infraFiles = walkTsFiles(join(SRC, 'Infrastructure'));
for (const file of infraFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  const imps = extractImports(content);

  for (const imp of imps) {
    if (imp.path.includes('Presentation') || imp.path.includes('/Presentation')) {
      errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Infrastructure não pode depender de Presentation' });
    }
  }
}

// 4. Checar Presentation
const presFiles = walkTsFiles(join(SRC, 'Presentation'));
for (const file of presFiles) {
  const rel = relative(ROOT, file);
  const isHealthController = rel.includes('health.controller.ts');
  const content = readFileSync(file, 'utf8');
  const imps = extractImports(content);

  for (const imp of imps) {
    // Controllers comuns não devem injetar PrismaService diretamente
    if (rel.includes('.controller.ts') && !isHealthController) {
      if (imp.path.includes('prisma.service') || imp.path.includes('.prisma.repository')) {
        errors.push({ file: rel, line: imp.line, importPath: imp.path, rule: 'Controllers não devem acessar Prisma diretamente (chame Use Cases)' });
      }
    }
  }
}

// Relatório
console.log('====================================================');
console.log(' GestCorp Auto — Validação de Camadas (Architecture)');
console.log('====================================================');
console.log(`✓ Domain boundaries:        ${domainFiles.length} arquivos analisados`);
console.log(`✓ Application boundaries:   ${appFiles.length} arquivos analisados`);
console.log(`✓ Infrastructure isolation: ${infraFiles.length} arquivos analisados`);
console.log(`✓ Presentation boundaries:  ${presFiles.length} arquivos analisados`);
console.log('ℹ Exceção permitida:        health.controller.ts -> PrismaService (probe)');

if (warnings.length > 0) {
  console.log('\n[AVISOS]');
  for (const w of warnings) {
    console.log(`  ⚠ ${w.file}:${w.line} -> ${w.rule} (${w.importPath})`);
  }
}

if (errors.length > 0) {
  console.log('\n[ERROS DE FRONTEIRA ARQUITETURAL]');
  for (const err of errors) {
    console.log(`  ✗ ${err.file}:${err.line} -> ${err.rule}`);
    console.log(`    Import: ${err.importPath}`);
  }
  console.log('====================================================');
  console.log(`Status: FALHA (${errors.length} erro(s), ${warnings.length} aviso(s))`);
  process.exit(1);
} else {
  console.log('====================================================');
  console.log(`Status: SUCESSO (0 erros, ${warnings.length} avisos)`);
  process.exit(0);
}
