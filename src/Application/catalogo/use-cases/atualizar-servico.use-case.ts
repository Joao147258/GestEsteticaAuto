import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { AtualizarServicoInput } from "../dtos/atualizar-servico.input";
import { ServicosRepository } from "../repositories/servicos.repository";

// Altera somente os campos enviados de um serviço existente.
// As mudanças são aplicadas na entidade do domínio e salvas via contrato.
export class AtualizarServicoUseCase {
    constructor(private readonly servicosRepository: ServicosRepository) { }

    async execute(input: AtualizarServicoInput): Promise<void> {
        const servico = await this.servicosRepository.buscarPorId(
            input.negocioId,
            input.servicoId,
        );

        if (!servico) {
            // Se o serviço não for encontrado, lança um erro de não encontrado.
            throw new NotFoundError("Serviço não encontrado.");
        }
        if (input.nome !== undefined) {
            //
            servico.atualizarNome(input.nome);
        }
        
        if (input.descricao !== undefined) {
            servico.atualizarDescricao(input.descricao);
        }
        if (input.categoriaId !== undefined) {
            servico.alterarCategoria(input.categoriaId);
        }
        if (input.precoBase !== undefined) {
            servico.alterarPrecoBase(input.precoBase);
        }
        if (input.duracaoEstimadaMinutos !== undefined) {
            servico.alterarDuracaoEstimada(input.duracaoEstimadaMinutos);
        }
        if (input.observacoes !== undefined) {
            servico.atualizarObservacoes(input.observacoes);
        }
        // Salva as alterações no repositório.
        await this.servicosRepository.salvar(servico);
    }
}
