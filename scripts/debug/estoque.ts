// Depuração do módulo estoque interno (controle interno de insumos).
import { EstoqueInterno } from "../../src/Domain/estoque_interno/estoque_interno";
import { mostrar } from "./_utils";

export function executarEstoque(): void {
  const estoque = EstoqueInterno.criar({
    negocioId: "neg-123",
    produtoId: "prod-1",
    unidadeMedida: "UNIDADE",
    quantidadeInicial: 50,
    custoUnitarioAproximado: 4.5,
    estoqueMinimo: 5,
  });

  mostrar("Estoque interno criado", {
    id: estoque.id,
    produtoId: estoque.produtoId,
    quantidadeAtual: estoque.quantidadeAtual,
    unidadeMedida: estoque.unidadeMedida,
    custoUnitarioAproximado: estoque.custoUnitarioAproximado,
    estoqueMinimo: estoque.estoqueMinimo,
  });

  // Entrada de reposição
  estoque.adicionarEntrada(20, "Compra de reposição");

  // Saída para uso interno (consumo em um serviço)
  estoque.registrarSaidaInterna(5, "Polimento técnico");

  // Perda por avaria
  estoque.registrarPerda(2, "Embalagem danificada");

  // Ajuste de contagem
  estoque.ajustarQuantidade(60, "Contagem de inventário");

  mostrar("Estoque após movimentações", {
    quantidadeAtual: estoque.quantidadeAtual,
    totalMovimentacoes: estoque.movimentacoes.length,
  });

  mostrar("Histórico de movimentações", estoque.movimentacoes.map((m) => ({
    tipo: m.tipo,
    quantidade: m.quantidade,
    anterior: m.quantidadeAnterior,
    nova: m.quantidadeNova,
    motivo: m.motivo,
  })));
}
