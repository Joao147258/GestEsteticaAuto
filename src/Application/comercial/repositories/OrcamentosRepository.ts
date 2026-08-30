import { Orcamento, StatusOrcamento } from "../../../Domain/comercial";

export abstract class OrcamentosRepository {
    abstract salvar(orcamento: Orcamento): Promise<void>;

    abstract buscarPorId(
        negocioId: string,
        orcamentoId: string
    ): Promise<Orcamento | null>;

    abstract listarPorNegocio(params: {
        negocioId: string;
        clienteId?: string;
        veiculoId?: string;
        status?: StatusOrcamento;
        dataInicio?: Date;
        dataFim?: Date;
        busca?: string;
        pagina?: number;
        limite?: number;
    }): Promise<Orcamento[]>
    abstract remover(negocioId: string, orcamentoId: string): Promise<void>;
}
