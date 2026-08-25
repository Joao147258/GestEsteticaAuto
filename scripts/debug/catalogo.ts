// Depuração do módulo catálogo (Produto, Servico, Pacote e TabelaPreco).
import { Produto } from "../../src/Domain/catalogo/produto";
import { Servico } from "../../src/Domain/catalogo/servico";
import { PacoteServico } from "../../src/Domain/catalogo/pacote_servico";
import { TabelaPreco } from "../../src/Domain/catalogo/tabela_preco";
import { mostrar } from "./_utils";

export function executarCatalogo(): void {
  const produto = Produto.criar({
    negocioId: "neg-123",
    nome: "  Cera automotiva premium  ",
    descricao: "Cera de carnaúba",
    tipoUso: "AMBOS",
    unidadeMedida: "CAIXA",
    custoReferencia: 45.5,
    precoVendaSugerido: 89.9,
    observacoes: "Usar em cabine climatizada",
  });

  mostrar("Produto criado", {
    id: produto.id,
    nome: produto.nome,
    tipoUso: produto.tipoUso,
    unidadeMedida: produto.unidadeMedida,
    custoReferencia: produto.custoReferencia,
    precoVendaSugerido: produto.precoVendaSugerido,
    status: produto.status,
  });

  produto.atualizarPrecoVendaSugerido(99.9, "func-1");
  produto.inativar("func-1");

  mostrar("Produto após alterações", {
    nome: produto.nome,
    precoVendaSugerido: produto.precoVendaSugerido,
    status: produto.status,
    alteracoes: produto.alteracoes.length,
  });

  const servico = Servico.criar({
    negocioId: "neg-123",
    nome: "Polimento técnico",
    precoBase: 250,
    duracaoEstimadaMinutos: 120,
  });

  mostrar("Serviço criado", {
    id: servico.id,
    nome: servico.nome,
    precoBase: servico.precoBase,
    duracaoEstimadaMinutos: servico.duracaoEstimadaMinutos,
    status: servico.status,
  });

  // Pacote com itens (referência + quantidade)
  const pacote = PacoteServico.criar({
    negocioId: "neg-123",
    nome: "Pacote completo interno",
    precoPacote: 550,
  });
  pacote.adicionarItem({ servicoId: servico.id, descricao: "Polimento técnico", quantidade: 1 });

  mostrar("Pacote criado", {
    id: pacote.id,
    nome: pacote.nome,
    precoPacote: pacote.precoPacote,
    itens: pacote.itens.map((i) => ({
      servicoId: i.servicoId,
      descricao: i.descricao,
      quantidade: i.quantidade,
    })),
  });

  // Tabela de preço com itens por referência
  const tabela = TabelaPreco.criar({
    negocioId: "neg-123",
    nome: "Tabela promocional",
  });
  tabela.adicionarItem({
    referenciaId: servico.id,
    tipoReferencia: "SERVICO",
    valor: 220,
  });

  mostrar("Tabela criada", {
    id: tabela.id,
    nome: tabela.nome,
    ativa: tabela.ativa,
    itens: tabela.itens.map((i) => ({
      referenciaId: i.referenciaId,
      tipoReferencia: i.tipoReferencia,
      valor: i.valor,
    })),
  });
}
