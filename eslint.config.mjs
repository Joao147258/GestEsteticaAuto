// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'src/generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prettier/prettier': 'off',
    },
  },
  // Boundary Enforcement — Clean Architecture (GestCorp Auto)
  {
    files: ['src/Domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@nestjs/**'],
              message: 'Domain puro: proibido importar pacotes @nestjs/*.',
            },
            {
              group: ['@prisma/*', '@prisma/**', '**/generated/prisma/**'],
              message: 'Domain puro: proibido importar Prisma.',
            },
            {
              group: ['**/Application/**', 'src/Application/**'],
              message: 'Domain puro: proibido importar Application.',
            },
            {
              group: ['**/Infrastructure/**', 'src/Infrastructure/**'],
              message: 'Domain puro: proibido importar Infrastructure.',
            },
            {
              group: ['**/Presentation/**', 'src/Presentation/**'],
              message: 'Domain puro: proibido importar Presentation.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/Application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/Presentation/**', 'src/Presentation/**'],
              message: 'Application não pode depender de Presentation.',
            },
            {
              group: ['@prisma/*', '@prisma/**', '**/generated/prisma/**'],
              message: 'Application não pode depender diretamente do Prisma Client.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/Infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/Presentation/**', 'src/Presentation/**'],
              message: 'Infrastructure não pode depender de Presentation.',
            },
          ],
        },
      ],
    },
  },
);
