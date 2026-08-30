# GestEsteticaAuto

> Sistema de gestão para pequenas estéticas automotivas

## Objetivo

O projeto gerencia o fluxo operacional de uma estética automotiva.

## Escopo da V1 — usuário único

A V1 é **operacional de usuário único** para uma estética automotiva: clientes,
veículos, catálogo, orçamentos, ordem de serviço, insumos, financeiro básico e
painel de gestão.

- **Congelados na V1** (não desenvolver; não remover; manter `negocioId`):
  `usuarios`, `auth`, `negocio` como módulo SaaS completo.
- **Mantidos no backlog** (não prioritários para a V1 inicial):
  `integracoes`, `estoque_venda`.
- **Ordem de prioridade**: operacao → veiculos → comercial (ajuste pontual) →
  financeiro mínimo → dashboard → negocio básico → auth simples (apenas antes
  de produção) → integracoes → estoque_venda → usuarios/multiusuário → negocio
  SaaS completo.

Regra completa: `docs/domain/backlog/prioridades-v1.md` (docs locais, não
versionados).
