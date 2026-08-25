// Erro base do domínio de estoque de venda.
export class EstoqueVendaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EstoqueVendaError";
  }
}
