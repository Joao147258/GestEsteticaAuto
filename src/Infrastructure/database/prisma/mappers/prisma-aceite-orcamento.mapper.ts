import {
  AceiteOrcamentoProps,
  CanalAceiteOrcamento,
  StatusAceiteOrcamento,
} from "../../../../Domain/comercial";
import type { AceiteOrcamento as PrismaAceiteOrcamento } from "../../../../generated/prisma/client";

// PrismaAceiteOrcamentoMapper — converte AceiteOrcamento entre Prisma e
// Domain. NÃO apaga histórico: cada aceite é um registro de tentativa.
export class PrismaAceiteOrcamentoMapper {
  static toDomain(raw: PrismaAceiteOrcamento): AceiteOrcamentoProps {
    return {
      id: raw.id,
      negocioId: raw.negocioId,
      orcamentoId: raw.orcamentoId,
      clienteId: raw.clienteId,
      status: PrismaAceiteOrcamentoMapper.toDomainStatus(raw.status),
      canal: raw.canal as CanalAceiteOrcamento | null | undefined,
      aceitoEm: raw.aceitoEm ?? null,
      recusadoEm: raw.recusadoEm ?? null,
      observacoes: raw.observacoes ?? null,
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    };
  }

  static toPrisma(aceite: AceiteOrcamentoProps) {
    return {
      id: aceite.id,
      negocioId: aceite.negocioId,
      orcamentoId: aceite.orcamentoId,
      clienteId: aceite.clienteId,
      status: aceite.status,
      canal: aceite.canal ?? null,
      aceitoEm: aceite.aceitoEm ?? null,
      recusadoEm: aceite.recusadoEm ?? null,
      observacoes: aceite.observacoes ?? null,
      criadoEm: aceite.criadoEm,
      atualizadoEm: aceite.atualizadoEm,
    };
  }

  // Status vem como String no banco; mapeia para o union do domínio com
  // fallback PENDENTE para dados fora do esperado.
  private static toDomainStatus(status: string): StatusAceiteOrcamento {
    const valores: StatusAceiteOrcamento[] = [
      "PENDENTE",
      "ACEITO",
      "RECUSADO",
      "CANCELADO",
    ];
    return valores.includes(status as StatusAceiteOrcamento)
      ? (status as StatusAceiteOrcamento)
      : "PENDENTE";
  }
}
