import type { Servico } from "../../../Domain";
import { Orcamento } from "../../../Domain/comercial";
import type { CriarOrcamentoDTO } from "../dtos/CriarOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { ClienteNaoEncontradoError } from "../errors/ClienteNaoEncontradoError";
import { ServicoNaoEncontradoError } from "../errors/ServicoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { ClientesRepository } from "../../clientes/repositories/clientes.repository";
import { ServicosRepository } from "../../catalogo/repositories/servicos.repository";

// CriarOrcamentoUseCase — orquestra a abertura de um orçamento comercial.
// A Application apenas valida as referências (cliente e serviços existirem
// no negócio) e delega a criação da entidade ao domínio; o cálculo do total
// é do próprio Orcamento (nunca recebido ou recalculado aqui).
//
// Pendência: a validação de existência do veículo fica de fora até o
// VeiculosRepository expor um método de busca (hoje o contrato está vazio).
export class CriarOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
    private readonly clientesRepository: ClientesRepository,
    private readonly servicosRepository: ServicosRepository,
  ) {}

  async executar(input: CriarOrcamentoDTO): Promise<OrcamentoOutputDTO> {
    // 1. Cliente precisa existir no negócio — a API nunca abre orçamento
    //    para um cliente desconhecido ou de outro negócio.
    const cliente = await this.clientesRepository.buscarPorId(
      input.negocioId,
      input.clienteId,
    );
    if (!cliente) {
      throw new ClienteNaoEncontradoError(
        `Cliente ${input.clienteId} não encontrado no negócio ${input.negocioId}.`,
      );
    }

    // 2. Cada serviço do pedido precisa existir no catálogo do negócio.
    //    Guardamos o serviço ao lado do item de entrada para montar depois —
    //    a descrição do item vem do nome do serviço (snapshot da proposta).
    const itensComServico: {
      itemInput: CriarOrcamentoDTO["itens"][number];
      servico: Servico;
    }[] = [];

    for (const itemInput of input.itens) {
      const servico = await this.servicosRepository.buscarPorId(
        input.negocioId,
        itemInput.servicoId,
      );
      if (!servico) {
        throw new ServicoNaoEncontradoError(
          `Serviço ${itemInput.servicoId} não encontrado no negócio ${input.negocioId}.`,
        );
      }
      itensComServico.push({ itemInput, servico });
    }

    // 3. Cria a entidade via factory do domínio — nasce como RASCUNHO, sem
    //    itens e com valores zerados (o total só existe depois dos itens).
    const orcamento = Orcamento.criar({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      veiculoId: input.veiculoId,
      observacoes: input.observacoes ?? null,
      validoAte: input.validadeEm ?? null,
    });

    // 4. Adiciona cada item com os dados negociados. O domínio recalcula
    //    subtotal e valorTotal a cada adição — nada é calculado aqui.
    for (const { itemInput, servico } of itensComServico) {
      orcamento.adicionarItem({
        tipo: "SERVICO",
        referenciaId: servico.id,
        descricao: servico.nome,
        quantidade: itemInput.quantidade,
        valorUnitario: itemInput.valorUnitario,
        observacoes: itemInput.observacao ?? null,
      });
    }

    // 5. Persiste o agregado e devolve a projeção de saída (mapper puro).
    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
