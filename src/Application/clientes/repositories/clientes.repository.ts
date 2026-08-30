import { Cliente } from "../../../Domain";

export abstract class ClientesRepository {
    abstract salvar(cliente: Cliente): Promise<void>;

    abstract buscarPorId(
        negocioId: string,
        clienteId: string,
    ): Promise<Cliente | null>;

    abstract buscarPorDocumento(
        negocioId: string,
        documento: string,
    ): Promise<Cliente | null>;

    abstract listarPorNegocio(params: {
        negocioId: string;
        busca?: string;
        pagina?: number;
        limite?: number;
    }): Promise<Cliente[]>;

    abstract remover(
        negocioId: string,
        clienteId: string,
    ): Promise<void>;
}