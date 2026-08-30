import { Cliente } from "../../../../Domain";
import type { Cliente as PrismaCliente } from "../../../../generated/prisma/client";

// PrismaClienteMapper — ponte entre a tabela Cliente (Prisma) e a entidade
// Cliente (Domain). Responsabilidade exclusiva: traduzir campos e normalizar
// null/undefined. NÃO contém regra de negócio (nenhuma validação de CPF,
// telefone ou status mora aqui).
export class PrismaClienteMapper {
  // Banco → Domínio. Usa Cliente.reconstituir (sem revalidar e sem gerar
  // novo id). As listas de composição (contatos, endereços, preferências,
  // tags, anexos) vêm vazias: na V1 o contrato do repositório só persiste os
  // dados principais do cliente; as tabelas filhas ficam para uma etapa de
  // composição.
  static toDomain(raw: PrismaCliente): Cliente {
    return Cliente.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      nome: raw.nome,
      tipo: raw.tipoPessoa,
      documento: raw.cpfCnpj ?? null,
      email: raw.email ?? null,
      telefone: raw.telefone ?? null,
      status: raw.status === "INATIVO" ? "INATIVO" : "ATIVO",
      observacoes: raw.observacoes ?? null,
      origemId: raw.origemId ?? null,
      contatos: [],
      enderecos: [],
      preferencias: [],
      tags: [],
      anexos: [],
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  // Domínio → Banco. Para upsert: create/update recebem o mesmo objeto de
  // escalares. Campos opcionais do domínio (null/undefined) viram null no
  // banco — decisão do guia para manter o schema explícito.
  static toPrisma(cliente: Cliente) {
    return {
      id: cliente.id,
      negocioId: cliente.negocioId,
      nome: cliente.nome,
      tipoPessoa: cliente.tipo,
      cpfCnpj: cliente.documento ?? null,
      email: cliente.email ?? null,
      telefone: cliente.telefone ?? null,
      status: cliente.status,
      observacoes: cliente.observacoes ?? null,
      origemId: cliente.origemId ?? null,
      criadoEm: cliente.criadoEm,
      atualizadoEm: cliente.atualizadoEm,
    };
  }
}
