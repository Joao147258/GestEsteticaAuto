import { Veiculo } from "../../../../Domain";
import type { Veiculo as PrismaVeiculo } from "../../../../generated/prisma/client";

// PrismaVeiculoMapper — ponte entre a tabela Veiculo (Prisma) e a entidade
// Veiculo (Domain). Traduz campos e normaliza null/undefined. NÃO valida
// formato de placa nem regra de negócio (isso é da Application/Domain).
export class PrismaVeiculoMapper {
  // Banco → Domínio, via reconstituir (sem revalidar, sem novo id).
  // O histórico de alterações (alteracoes) vem vazio: na V1 o histórico é
  // interno ao domínio e não persiste em tabela própria.
  static toDomain(raw: PrismaVeiculo): Veiculo {
    return Veiculo.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      clienteId: raw.clienteId,
      placa: raw.placa ?? null,
      marca: raw.marca ?? null,
      modelo: raw.modelo ?? null,
      anoFabricacao: raw.anoFabricacao ?? null,
      anoModelo: raw.anoModelo ?? null,
      cor: raw.cor ?? null,
      chassi: raw.chassi ?? null,
      renavam: raw.renavam ?? null,
      quilometragem: raw.quilometragem ?? null,
      observacoes: raw.observacoes ?? null,
      status: raw.status === "INATIVO" ? "INATIVO" : "ATIVO",
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  // Domínio → Banco. undefined/null do domínio viram null no banco (campos
  // opcionais ficam explícitos no schema).
  static toPrisma(veiculo: Veiculo) {
    return {
      id: veiculo.id,
      negocioId: veiculo.negocioId,
      clienteId: veiculo.clienteId,
      placa: veiculo.placa ?? null,
      marca: veiculo.marca ?? null,
      modelo: veiculo.modelo ?? null,
      anoFabricacao: veiculo.anoFabricacao ?? null,
      anoModelo: veiculo.anoModelo ?? null,
      cor: veiculo.cor ?? null,
      chassi: veiculo.chassi ?? null,
      renavam: veiculo.renavam ?? null,
      quilometragem: veiculo.quilometragem ?? null,
      observacoes: veiculo.observacoes ?? null,
      status: veiculo.status,
      criadoEm: veiculo.criadoEm,
      atualizadoEm: veiculo.atualizadoEm,
    };
  }
}
