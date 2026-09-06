import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Script de seed dos usuários administradores iniciais do GestCorp Auto V1:
// 1. joao.dantas
// 2. vinicius.salvador
// Senhas hasheadas com bcrypt antes de salvar, com suporte a variáveis de ambiente (.env).
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

    // Configuração dos usuários a partir de variáveis de ambiente (sem senhas hardcoded)
    const usuariosConfig = [
      {
        nome: 'João Dantas',
        username: process.env.SEED_USER_JOAO || 'joao.dantas',
        senhaPura: process.env.SEED_PASSWORD_JOAO,
        emailPadrao: 'joao.dantas@gestcorp.com.br',
        role: 'ADMIN',
      },
      {
        nome: 'Vinicius Salvador',
        username: process.env.SEED_USER_VINICIUS || 'vinicius.salvador',
        senhaPura: process.env.SEED_PASSWORD_VINICIUS,
        emailPadrao: 'vinicius.salvador@gestcorp.com.br',
        role: 'ADMIN',
      },
    ];

    for (const config of usuariosConfig) {
      if (!config.senhaPura) {
        throw new Error(
          `Variável de senha não configurada para ${config.username}. Defina SEED_PASSWORD_JOAO e SEED_PASSWORD_VINICIUS no .env.`,
        );
      }
      const senhaHash = await bcrypt.hash(config.senhaPura, 10);

      // 1. Busca por username ou por email legado
      const usuarioExistente = await prisma.usuario.findFirst({
        where: {
          OR: [
            { username: config.username },
            { email: config.emailPadrao },
          ],
        },
      });

      if (usuarioExistente) {
        // Atualiza usuário existente garantindo hash atualizado, username e role
        const atualizado = await prisma.usuario.update({
          where: { id: usuarioExistente.id },
          data: {
            nome: config.nome,
            username: config.username,
            email: usuarioExistente.email || config.emailPadrao,
            senhaHash,
            ativo: true,
            role: config.role,
          },
        });
        console.log(`✓ Usuário atualizado: ${atualizado.nome} (username: ${atualizado.username}, role: ${atualizado.role})`);
      } else {
        // Cria novo usuário
        const criado = await prisma.usuario.create({
          data: {
            negocioId: tenantId,
            nome: config.nome,
            username: config.username,
            email: config.emailPadrao,
            senhaHash,
            ativo: true,
            role: config.role,
          },
        });
        console.log(`✓ Usuário criado: ${criado.nome} (username: ${criado.username}, role: ${criado.role})`);
      }
    }

    console.log('--- Seed finalizado com sucesso! ---');
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error('❌ Erro durante execução do seed:', error);
  process.exit(1);
});
