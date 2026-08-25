// Erro base do domínio de estoque interno.
export class EstoqueInternoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EstoqueInternoError";
  }
}
