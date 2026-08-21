// Configuração central do Prisma 7 (CLI).
// Prisma 7 não carrega .env automaticamente — por isso o import do dotenv
// precisa vir ANTES de importar o helper `env` de prisma/config.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
