# GestEsteticaAuto

Sistema de gestão para pequenas estéticas automotivas.

## Sobre o projeto

O **GestEsteticaAuto** é uma plataforma pensada para organizar a rotina operacional de uma estética automotiva, centralizando as principais etapas do atendimento em um único fluxo.

A proposta é facilitar o controle do negócio desde o cadastro do cliente até a execução do serviço, ajudando a acompanhar veículos, orçamentos, ordens de serviço, consumo de insumos e informações financeiras básicas.

## Propósito

Pequenas estéticas automotivas muitas vezes controlam sua operação por mensagens, planilhas, anotações ou ferramentas genéricas. Com o tempo, isso dificulta a visualização do que está em orçamento, em execução, concluído ou pendente de pagamento.

O objetivo do GestEsteticaAuto é trazer mais clareza para esse processo, oferecendo uma base simples, organizada e evolutiva para a gestão diária.

## Filosofia do projeto

O projeto nasce com foco em resolver primeiro o fluxo real da operação.

Antes de pensar em recursos avançados, integrações complexas ou múltiplos perfis de usuário, a prioridade é garantir que o sistema represente bem o dia a dia de uma estética automotiva.

A primeira versão busca responder perguntas essenciais como:

- Quais clientes estão cadastrados?
- Quais veículos estão vinculados a cada cliente?
- Quais serviços estão disponíveis no catálogo?
- Quais orçamentos foram criados?
- Quais ordens de serviço estão abertas ou em andamento?
- Quais insumos foram consumidos?
- Quais valores estão previstos, recebidos ou pendentes?
- Como está a visão geral da operação?

## Escopo inicial

A primeira versão do sistema é voltada para uma operação simples e centralizada, com foco em uma estética automotiva utilizando a plataforma internamente.

O escopo inicial contempla:

- gestão de clientes;
- gestão de veículos;
- catálogo de serviços;
- criação e acompanhamento de orçamentos;
- geração e controle de ordens de serviço;
- controle de insumos internos;
- financeiro básico;
- painel de gestão.

## Fluxo principal

O sistema é organizado em torno do seguinte fluxo:

```text
Cliente
  ↓
Veículo
  ↓
Orçamento
  ↓
Ordem de Serviço
  ↓
Execução
  ↓
Consumo de Insumos
  ↓
Financeiro
  ↓
Painel de Gestão
```

Essa estrutura permite acompanhar a jornada do atendimento de ponta a ponta, mantendo as informações conectadas e evitando que cada etapa fique isolada.

## Visão do produto

O GestEsteticaAuto foi pensado para crescer de forma gradual.

A base inicial prioriza o controle operacional. A partir dela, o sistema pode evoluir para recursos como integrações externas, automações, controle comercial mais avançado, estoque de venda, múltiplos usuários e gestão mais ampla do negócio.

A ideia é construir primeiro uma plataforma útil, prática e fiel à rotina real da operação, para depois expandir com segurança.

## Status

Projeto em desenvolvimento.

A estrutura principal está sendo construída com foco na organização do domínio, dos casos de uso e da base da API, preparando o sistema para futuramente receber uma interface administrativa completa.
