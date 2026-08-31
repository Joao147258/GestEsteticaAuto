# Erro 500 na listagem de orçamentos — Dependency Injection dos Use Cases Comerciais

> Erro ocorrido durante a integração do módulo de Orçamentos no portal admin
> (2026-08-30). Pasta de tratamento de erros do projeto GestCorp Auto.
> Cada erro tem: sintoma, causa raiz, correção aplicada e como diagnosticar de
> novo.

---

## Contexto

O endpoint:

```txt
GET /admin/orcamentos?negocioId=gestcorp-auto-demo
```

retornava erro 500 em produção, mesmo com:

```txt
API online
banco conectado
migrations aplicadas
tabela Orcamento existente
schema sincronizado
Prisma Client gerado
```

## Sintoma

O frontend exibia erro ao listar orçamentos e a API retornava:

```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor."
}
```

## Diagnóstico

O `ApplicationExceptionFilter` estava escondendo o stack trace — o formato
padronizado de erro transforma qualquer exceção inesperada em
`500 Erro interno do servidor`, sem vazar o detalhe interno.

Foi necessário adicionar log temporário controlado no filter para capturar a
causa real.

Stack encontrado:

```txt
TypeError: Cannot read properties of undefined (reading 'listarPorNegocio')
    at ListarOrcamentosUseCase.executar
    at OrcamentosController.listar
```

## Causa raiz

Os use cases comerciais estavam sem:

```ts
@Injectable()
```

Por isso, o NestJS instanciava os use cases sem injetar corretamente os
repositórios.

Consequência:

```txt
this.orcamentosRepository === undefined
```

## Arquivos afetados

Use cases corrigidos:

```txt
AbrirOrcamentoUseCase
AdicionarItemOrcamentoUseCase
AprovarOrcamentoUseCase
AtualizarObservacoesOrcamentoUseCase
BuscarOrcamentoPorIdUseCase
CancelarOrcamentoUseCase
CriarOrcamentoUseCase
ListarOrcamentosUseCase
RecusarOrcamentoUseCase
RemoverItemOrcamentoUseCase
```

## Correção aplicada

Adicionado:

```ts
import { Injectable } from "@nestjs/common";
```

e:

```ts
@Injectable()
```

nos 10 use cases comerciais.

O log temporário do `ApplicationExceptionFilter` foi removido após o
diagnóstico.

## Validações executadas

```txt
tsc --noEmit
lint nos arquivos alterados
testes comerciais
build
curl /health
curl /admin/orcamentos?negocioId=gestcorp-auto-demo
teste no frontend
```

## Resultado

A listagem deixou de retornar 500 e passou a carregar corretamente os
orçamentos reais.

## Aprendizado

Regra de diagnóstico definida:

```txt
Stack trace primeiro.
Hipótese depois.
Correção só com causa confirmada.
```

Evitar criar várias scheduled tasks, scripts longos ou testes combinatórios
sem antes tentar obter o stack real do erro.

## Regra para próximos erros

Quando um erro 500 for mascarado pelo filter global:

```txt
1. Reproduzir com curl.
2. Verificar logs.
3. Se não houver stack, adicionar log temporário controlado no filter.
4. Reproduzir uma vez.
5. Capturar o stack.
6. Remover o log temporário.
7. Corrigir a causa apontada.
```
