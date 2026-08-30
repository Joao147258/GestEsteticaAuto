import { Veiculo } from "../../../Domain";

// Contrato de persistência de veículos que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class VeiculosRepository {
  abstract salvar(veiculo: Veiculo): Promise<void>;

  abstract buscarPorId(
    negocioId: string,
    veiculoId: string,
  ): Promise<Veiculo | null>;

  // Usado para validar duplicidade de placa dentro do negócio.
  abstract buscarPorPlaca(
    negocioId: string,
    placa: string,
  ): Promise<Veiculo | null>;

  abstract listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Veiculo[]>;

  abstract remover(negocioId: string, veiculoId: string): Promise<void>;
}
