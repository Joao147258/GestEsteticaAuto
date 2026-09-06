import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Script de seed para inicialização da V1 com os 2 administradores fixos:
// 1. joao.dantas (João Dantas)
// 2. vinicius.salvador (Vinicius Salvador)
// Ambos vinculados ao tenant 'gestcorp-auto-demo'.
async function seed() {
  console.log('--- Iniciando Seed de Usuários Administradores GestCorp Auto ---');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada no ambiente.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const tenantId = 'gestcorp-auto-demo';

    // 1. Garante a existência do Negócio (tenant)
    await prisma.negocio.upsert({
      where: { id: tenantId },
      create: {
        id: tenantId,
        nome: 'GestCorp Auto Demo',
        ativo: true,
      },
      update: {
        ativo: true,
      },
    });
    console.log(`✓ Tenant verificado: ${tenantId}`);

    // 2. Administrador 1: João Dantas
    const userJoaoIdentificador =
      process.env.GESTCORP_USER_JOAO || 'joao.dantas@gestcorp.com.br';
    const passJoao = process.env.GESTCORP_PASSWORD_JOAO || 'Admin@123456';
    const hashJoao = await bcrypt.hash(passJoao, 10);

    const userJoao = await prisma.usuario.upsert({
      where: {
        negocioId_email: {
          negocioId: tenantId,
          email: userJoaoIdentificador,
        },
      },
      create: {
        negocioId: tenantId,
        nome: 'João Dantas',
        email: userJoaoIdentificador,
        senhaHash: hashJoao,
        ativo: true,
      },
      update: {
        nome: 'João Dantas',
        senhaHash: hashJoao,
        ativo: true,
      },
    });
    console.log(`✓ Usuário administrador 1 configurado: ${userJoao.nome} (${userJoao.email})`);

    // 3. Administrador 2: Vinicius Salvador
    const userViniciusIdentificador =
      process.env.GESTCORP_USER_VINICIUS || 'vinicius.salvador@gestcorp.com.br';
    const passVinicius = process.env.GESTCORP_PASSWORD_VINICIUS || 'Admin@123456';
    const hashVinicius = await bcrypt.hash(passVinicius, 10);

    const userVinicius = await prisma.usuario.upsert({
      where: {
        negocioId_email: {
          negocioId: tenantId,
          email: userViniciusIdentificador,
        },
      },
      create: {
        negocioId: tenantId,
        nome: 'Vinicius Salvador',
        email: userViniciusIdentificador,
        senhaHash: hashVinicius,
        ativo: true,
      },
      update: {
        nome: 'Vinicius Salvador',
        senhaHash: hashVinicius,
        ativo: true,
      },
    });
    console.log(`✓ Usuário administrador 2 configurado: ${userVinicius.nome} (${userVinicius.email})`);

    console.log('--- Seed finalizado com sucesso! ---');
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error('❌ Erro durante execução do seed:', error);
  process.exit(1);
});
