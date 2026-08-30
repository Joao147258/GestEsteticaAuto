// Configuração central do Prisma 7 (CLI).
// Prisma 7 não carrega .env automaticamente — por isso o import do dotenv
// precisa vir ANTES de importar o helper `env` de prisma/config.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // URL real vem do .env (local) ou da variável de ambiente (deploy).
    // `prisma generate` não conecta ao banco — aceita placeholder para
    // builds sem DATABASE_URL (ex.: container do Coolify).
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
