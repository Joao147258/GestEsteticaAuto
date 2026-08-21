# GestEsteticaAuto

> Sistema de gestão para pequenas estéticas automotivas com uma experiência
> operacional centrada em linguagem natural, permitindo que o profissional
> utilize tanto interfaces tradicionais quanto o ChatGPT para operar e
> acompanhar o negócio.

## Objetivo

O projeto gerencia o fluxo operacional de uma estética automotiva:

- clientes;
- veículos;
- serviços;
- orçamentos;
- ordens de serviço;
- agenda;
- financeiro.

## Filosofia

```
Usuário expressa intenção
        ↓
Interface interpreta
        ↓
Application coordena
        ↓
Domain valida
        ↓
Infrastructure executa/persiste
```

> A IA é uma interface do sistema, não a responsável pelas regras de negócio.

## Stack inicial

- Node.js
- TypeScript
- NestJS
- Prisma 7
- PostgreSQL
- Jest

## Arquitetura

```
Presentation
      ↓
Application
      ↓
Domain
      ↓
Infrastructure
```

## Status

Em desenvolvimento. Atualmente na fase de construção do core/backend.

## Execução local

```bash
npm install          # instala as dependências
npm run start:dev    # executa em modo desenvolvimento (watch)
npm run build        # compila o projeto
npm test             # roda os testes unitários
npm run test:e2e     # roda os testes end-to-end
```

Prisma:

```bash
npx prisma generate  # regenera o cliente após alterar o schema
npx prisma validate  # valida o schema sem tocar no banco
```

> **Endpoint de diagnóstico (temporário):** `GET /prisma/health` valida a
> injeção/instância do Prisma via `SELECT 1` (sem depender de tabelas). É
> infraestrutura de diagnóstico e deve ser removido/isolado em produção.

## Documentação interna

Decisões de produto, roadmap, estratégia SaaS e arquitetura detalhada ficam
em documentação interna do projeto (fora deste repositório).
