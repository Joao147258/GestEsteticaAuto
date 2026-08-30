import {
  EstoqueInternoError,
  UnidadeMedida,
  converterQuantidade,
} from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { ConfirmarConsumoInsumosItemOSInput } from "../dtos/confirmar-consumo-insumos-item-os.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { ConsumosInsumoServicoRepository } from "../../catalogo/repositories/consumos-insumo-servico.repository";
import { EstoqueInternoRepository } from "../../estoque_interno/repositories/estoque-interno.repository";
import { ProdutosRepository } from "../../catalogo/repositories/produtos.repository";

export type ItemConsumoRealizado = {
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
};

export type ItemConsumoInsuficiente = {
  produtoId: string;
  motivo: string;
};

export type AlertaEstoqueMinimo = {
  produtoId: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
};

// Resultado da confirmação da baixa: o que foi baixado, o que não pôde
// (saldo insuficiente), alertas de estoque mínimo e o custo estimado
// (estimativa gerencial, não custo contábil).
export type ResultadoConfirmacaoConsumoItemOS = {
  realizados: ItemConsumoRealizado[];
  insuficientes: ItemConsumoInsuficiente[];
  alertasEstoqueMinimo: AlertaEstoqueMinimo[];
  custoEstimado: number;
  possuiCustosDesconhecidos: boolean;
};

// Efetiva a baixa de insumos de um item da OS: resolve o consumo configurado
// para o serviço, converte a unidade para a do estoque, solicita a baixa ao
// domínio (EstoqueInterno.registrarSaidaInterna) e persiste o estoque alterado.
// Não baixa estoque automaticamente por criar a OS — a confirmação é explícita.
export class ConfirmarConsumoInsumosItemOSUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
    private readonly consumosRepository: ConsumosInsumoServicoRepository,
    private readonly estoquesRepository: EstoqueInternoRepository,
    private readonly produtosRepository: ProdutosRepository,
  ) {}

  async execute(
    input: ConfirmarConsumoInsumosItemOSInput,
  ): Promise<ResultadoConfirmacaoConsumoItemOS> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );
    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    const item = ordemServico.itens.find((atual) => atual.id === input.itemId);
    if (!item) {
      throw new NotFoundError("Item da ordem de serviço não encontrado.");
    }

    const resultado: ResultadoConfirmacaoConsumoItemOS = {
      realizados: [],
      insuficientes: [],
      alertasEstoqueMinimo: [],
      custoEstimado: 0,
      possuiCustosDesconhecidos: false,
    };

    if (!item.servicoId) {
      return resultado;
    }

    const consumos = await this.consumosRepository.listarPorServico(
      input.negocioId,
      item.servicoId,
    );

    for (const consumo of consumos) {
      const estoque = await this.estoquesRepository.buscarPorProduto(
        input.negocioId,
        consumo.produtoId,
      );
      const produto = await this.produtosRepository.buscarPorId(
        input.negocioId,
        consumo.produtoId,
      );

      // Quantidade e unidade de referência para custo e baixa: o estoque é a
      // fonte primária; sem estoque, usa a unidade do produto (fallback).
      let quantidadeEmUnidadeDeReferencia: number;
      let unidadeDeReferencia: UnidadeMedida;
      if (estoque) {
        quantidadeEmUnidadeDeReferencia = converterQuantidade(
          consumo.quantidade,
          consumo.unidadeMedida,
          estoque.unidadeMedida,
        );
        unidadeDeReferencia = estoque.unidadeMedida;
      } else if (produto) {
        quantidadeEmUnidadeDeReferencia = converterQuantidade(
          consumo.quantidade,
          consumo.unidadeMedida,
          produto.unidadeMedida,
        );
        unidadeDeReferencia = produto.unidadeMedida;
      } else {
        quantidadeEmUnidadeDeReferencia = consumo.quantidade;
        unidadeDeReferencia = consumo.unidadeMedida;
      }

      // Custo unitário: custoUnitarioAproximado do estoque como primeira
      // fonte, custoReferencia do produto como fallback.
      const custoUnitario =
        estoque?.custoUnitarioAproximado ??
        produto?.custoReferencia ??
        null;
      if (custoUnitario == null) {
        resultado.possuiCustosDesconhecidos = true;
      } else {
        resultado.custoEstimado +=
          quantidadeEmUnidadeDeReferencia * custoUnitario;
      }

      if (!estoque) {
        resultado.insuficientes.push({
          produtoId: consumo.produtoId,
          motivo: "Estoque interno não encontrado para o produto.",
        });
        continue;
      }

      // A fonte da verdade do saldo é o domínio: registrarSaidaInterna valida
      // saldo negativo e lança EstoqueInternoError quando insuficiente.
      try {
        estoque.registrarSaidaInterna(
          quantidadeEmUnidadeDeReferencia,
          "Consumo em ordem de serviço",
          input.ordemServicoId,
          "ORDEM_SERVICO",
        );
      } catch (erro) {
        if (erro instanceof EstoqueInternoError) {
          resultado.insuficientes.push({
            produtoId: consumo.produtoId,
            motivo: erro.message,
          });
          continue;
        }
        throw erro;
      }

      await this.estoquesRepository.salvar(estoque);

      resultado.realizados.push({
        produtoId: consumo.produtoId,
        quantidade: quantidadeEmUnidadeDeReferencia,
        unidadeMedida: unidadeDeReferencia,
      });

      // Estoque mínimo é ALERTA (não bloqueio) nesta primeira versão.
      if (
        estoque.estoqueMinimo != null &&
        estoque.quantidadeAtual < estoque.estoqueMinimo
      ) {
        resultado.alertasEstoqueMinimo.push({
          produtoId: consumo.produtoId,
          quantidadeAtual: estoque.quantidadeAtual,
          estoqueMinimo: estoque.estoqueMinimo,
        });
      }
    }

    return resultado;
  }
}
