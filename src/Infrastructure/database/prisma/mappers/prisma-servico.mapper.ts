import { Servico } from "../../../../Domain";
import type { Servico as PrismaServico } from "../../../../generated/prisma/client";

// PrismaServicoMapper — ponte entre a tabela Servico (Prisma) e a entidade
// Servico (Domain). Traduz campos e normaliza null/undefined. NÃO calcula
// preço nem valida inativação (regras da Application/Domain).
export class PrismaServicoMapper {
  // Banco → Domínio, via reconstituir (sem revalidar, sem novo id).
  // precoBase é Decimal no banco e number no domínio; se vier null (dado
  // legado), assume 0 defensivamente — a aplicação sempre grava um número.
  static toDomain(raw: PrismaServico): Servico {
    return Servico.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      nome: raw.nome,
      descricao: raw.descricao ?? null,
      categoriaId: raw.categoriaServicoId ?? null,
      precoBase: Number(raw.precoBase ?? 0),
      duracaoEstimadaMinutos: raw.duracaoMinutos ?? null,
      status: raw.status === "INATIVO" ? "INATIVO" : "ATIVO",
      observacoes: raw.observacoes ?? null,
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  // Domínio → Banco. Mapeia explicitamente os nomes divergentes:
  // categoriaId ↔ categoriaServicoId e duracaoEstimadaMinutos ↔ duracaoMinutos
  // (decisão: manter os nomes atuais do banco, sem renomear colunas).
  static toPrisma(servico: Servico) {
    return {
      id: servico.id,
      negocioId: servico.negocioId,
      categoriaServicoId: servico.categoriaId ?? null,
      nome: servico.nome,
      descricao: servico.descricao ?? null,
      precoBase: servico.precoBase,
      duracaoMinutos: servico.duracaoEstimadaMinutos ?? null,
      observacoes: servico.observacoes ?? null,
      status: servico.status,
      criadoEm: servico.criadoEm,
      atualizadoEm: servico.atualizadoEm,
    };
  }
}
