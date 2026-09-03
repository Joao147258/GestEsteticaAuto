# AGENTS.md — API GestCorp Auto

Este diretório contém a API/backend NestJS do GestCorp Auto.

Siga as instruções da raiz:

@../ai-instructions/gestcorp-auto.md
@../ai-instructions/nomenclatura-dominio.md
@../ai-instructions/arquitetura-camadas.md
@../ai-instructions/fluxo-desenvolvimento.md
@../ai-instructions/regras-seguranca.md
@../ai-instructions/tratativas-erros.md

## Regras específicas da API

- Domain deve ser TypeScript puro.
- Application deve conter use cases, DTOs de entrada e contratos.
- Infrastructure deve conter Prisma, mappers e implementações.
- Presentation deve conter controllers, modules, DTOs HTTP, presenters e services HTTP.
- Não acessar Prisma diretamente em Presentation.
- Não colocar regra de negócio pesada em controller.
- Não misturar DTO de entrada da Application com DTO HTTP sem necessidade.
- Não criar campos sem conferir Domain, Application, Prisma e testes.
- Não usar nomes em inglês para domínio já definido em português.
